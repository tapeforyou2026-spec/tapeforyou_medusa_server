import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { REVIEW_MODULE } from "../../../modules/review"

const createReviewSchema = z.object({
  product_id: z.string().min(1),
  author_name: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(2000),
})

// GET /store/reviews?product_id=prod_xxx&limit=20&offset=0
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { product_id } = req.query
  const limit = Number(req.query.limit) || 20
  const offset = Number(req.query.offset) || 0

  const reviewService = req.scope.resolve(REVIEW_MODULE)

  const filters: Record<string, unknown> = { is_approved: true }
  if (product_id) filters.product_id = product_id

  const [reviews, count] = await reviewService.listAndCountReviews(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  // Compute average rating
  const allReviews = await reviewService.listReviews({ product_id, is_approved: true })
  const avg =
    allReviews.length > 0
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : 0

  res.json({ reviews, count, average_rating: Math.round(avg * 10) / 10, limit, offset })
}

// POST /store/reviews — auth required (see middlewares.ts)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = createReviewSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: "invalid_data",
      message: parsed.error.issues[0].message,
    })
  }

  const reviewService = req.scope.resolve(REVIEW_MODULE)

  const review = await reviewService.createReviews({
    ...parsed.data,
    customer_id: (req as any).auth_context?.actor_id || null,
    is_approved: false,
  })

  res.status(201).json({ review })
}
