import { MedusaService } from "@medusajs/framework/utils"
import BlogPost from "./models/post"

class BlogModuleService extends MedusaService({
  BlogPost,
}) {}

export default BlogModuleService
