import { model } from "@medusajs/framework/utils"

const BlogPost = model.define("blog_post", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text(),
  excerpt: model.text().nullable(),
  body: model.text().nullable(),
  cover_image: model.text().nullable(),
  author: model.text().nullable(),
  category: model.text().nullable(),
  tags: model.json().nullable(),
  is_published: model.boolean().default(false),
  published_at: model.dateTime().nullable(),
})

export default BlogPost
