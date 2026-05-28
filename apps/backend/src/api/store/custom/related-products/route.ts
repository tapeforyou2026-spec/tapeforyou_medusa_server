import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// GET /store/custom/related-products?product_id=prod_xxx&limit=4
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const product_id = req.query.product_id as string
  const limit = Number(req.query.limit) || 4

  const productModule = req.scope.resolve(Modules.PRODUCT)

  // Fetch the source product to get its category
  let categoryIds: string[] = []
  if (product_id) {
    try {
      const [source] = await productModule.listProducts(
        { id: product_id },
        { relations: ["categories"] }
      )
      categoryIds = source?.categories?.map((c) => c.id) || []
    } catch {
      // Continue without category filter
    }
  }

  const [allProducts] = await productModule.listAndCountProducts(
    {},
    {
      select: ["id", "title", "handle", "thumbnail", "description", "metadata"],
      relations: ["variants", "variants.prices", "images", "categories"],
      take: 20,
    }
  )

  // Prefer same-category products, exclude the source product
  const sameCat = allProducts.filter(
    (p) =>
      p.id !== product_id &&
      p.categories?.some((c) => categoryIds.includes(c.id))
  )

  const result = sameCat.length >= limit
    ? sameCat.slice(0, limit)
    : [
        ...sameCat,
        ...allProducts
          .filter((p) => p.id !== product_id && !sameCat.includes(p))
          .slice(0, limit - sameCat.length),
      ]

  res.json({ products: result, count: result.length })
}
