import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// GET /store/custom/featured-products
// Returns products tagged "featured" or in "featured" collection
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productModule = req.scope.resolve(Modules.PRODUCT)

  const limit = Number(req.query.limit) || 8

  const products = await productModule.listProducts(
    {},
    {
      select: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "description",
        "metadata",
      ],
      relations: ["variants", "variants.prices", "images", "categories", "tags"],
      take: limit,
      order: { created_at: "DESC" },
    }
  )

  // Filter by metadata.isFeatured or return latest products as featured fallback
  const featured = products.filter((p) => p.metadata?.isFeatured === true)
  const result = featured.length > 0 ? featured : products.slice(0, limit)

  res.json({ products: result, count: result.length })
}
