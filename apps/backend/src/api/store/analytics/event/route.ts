import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { ANALYTICS_MODULE } from "../../../../modules/analytics"

const eventSchema = z.object({
  event_type: z.string().min(1).max(100),
  product_id: z.string().optional(),
  session_id: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// POST /store/analytics/event
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = eventSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: "invalid_data",
      message: parsed.error.issues[0].message,
    })
  }

  const analyticsService = req.scope.resolve(ANALYTICS_MODULE)

  await analyticsService.createAnalyticsEvents({
    event_type: parsed.data.event_type,
    product_id: parsed.data.product_id || null,
    customer_id: (req as any).auth_context?.actor_id || null,
    session_id: parsed.data.session_id || null,
    metadata: parsed.data.metadata || null,
  })

  res.json({ success: true })
}
