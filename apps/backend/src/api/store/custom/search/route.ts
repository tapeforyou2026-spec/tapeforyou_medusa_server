import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// GET /store/custom/search?q=bopp&limit=20&offset=0
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const q = (req.query.q as string) || ""
  const limit = Number(req.query.limit) || 20
  const offset = Number(req.query.offset) || 0

  if (!q.trim()) {
    return res.json({ products: [], count: 0, query: q })
  }

  const productModule = req.scope.resolve(Modules.PRODUCT)

  const [products, count] = await productModule.listAndCountProducts(
    { title: { $ilike: `%${q}%` } },
    {
      select: ["id", "title", "handle", "thumbnail", "description"],
      relations: ["variants", "images", "categories"],
      take: limit,
      skip: offset,
    }
  )

  res.json({ products, count, query: q, limit, offset })
}
