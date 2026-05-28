import { model } from "@medusajs/framework/utils"

const Coupon = model.define("coupon", {
  id: model.id().primaryKey(),
  code: model.text(),
  type: model.enum(["percentage", "fixed"]),
  value: model.number(),
  min_order: model.number().default(0),
  max_uses: model.number().nullable(),
  used_count: model.number().default(0),
  expires_at: model.dateTime().nullable(),
  is_active: model.boolean().default(true),
})

export default Coupon
