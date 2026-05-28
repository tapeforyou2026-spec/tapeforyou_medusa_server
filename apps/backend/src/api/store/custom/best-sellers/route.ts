import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// GET /store/custom/best-sellers
// Returns products with metadata.isBestSeller = true
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
      take: limit * 3,
      order: { created_at: "DESC" },
    }
  )

  const bestSellers = products.filter((p) => p.metadata?.isBestSeller === true)
  const result = bestSellers.length > 0 ? bestSellers.slice(0, limit) : products.slice(0, limit)

  res.json({ products: result, count: result.length })
}
