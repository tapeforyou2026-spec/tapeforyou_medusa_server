import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"

// GET /store/blog?limit=10&offset=0&category=tips
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const limit = Number(req.query.limit) || 10
  const offset = Number(req.query.offset) || 0
  const category = req.query.category as string | undefined

  const blogService = req.scope.resolve(BLOG_MODULE)

  const filters: Record<string, unknown> = { is_published: true }
  if (category) filters.category = category

  const [posts, count] = await blogService.listAndCountBlogPosts(filters, {
    take: limit,
    skip: offset,
    order: { published_at: "DESC" },
  })

  res.json({ posts, count, limit, offset })
}
