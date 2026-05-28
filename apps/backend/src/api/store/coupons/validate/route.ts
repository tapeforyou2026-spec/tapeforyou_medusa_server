import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { COUPON_MODULE } from "../../../../modules/coupon"

const validateSchema = z.object({
  code: z.string().min(1),
  cart_total: z.number().positive(),
})

// POST /store/coupons/validate
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = validateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: "invalid_data",
      message: parsed.error.errors[0].message,
    })
  }

  const couponService = req.scope.resolve(COUPON_MODULE)

  try {
    const result = await couponService.validateCoupon(
      parsed.data.code,
      parsed.data.cart_total
    )
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ type: "invalid_coupon", message: err.message })
  }
}
