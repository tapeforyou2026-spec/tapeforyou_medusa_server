import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"

// GET /store/blog/:slug
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params
  const blogService = req.scope.resolve(BLOG_MODULE)

  const [post] = await blogService.listBlogPosts({ slug, is_published: true })

  if (!post) {
    return res.status(404).json({ message: "Blog post not found" })
  }

  res.json({ post })
}
