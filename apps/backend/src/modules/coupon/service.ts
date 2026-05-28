import { MedusaService } from "@medusajs/framework/utils"
import Coupon from "./models/coupon"

class CouponModuleService extends MedusaService({
  Coupon,
}) {
  async validateCoupon(code: string, cartTotal: number) {
    const [coupon] = await this.listCoupons({ code })

    if (!coupon) {
      throw new Error("Coupon not found")
    }
    if (!coupon.is_active) {
      throw new Error("Coupon is inactive")
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new Error("Coupon has expired")
    }
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      throw new Error("Coupon usage limit reached")
    }
    if (cartTotal < coupon.min_order) {
      throw new Error(`Minimum order of ₹${coupon.min_order} required`)
    }

    const discount =
      coupon.type === "percentage"
        ? Math.round((cartTotal * coupon.value) / 100)
        : Math.min(coupon.value, cartTotal)

    return { coupon, discount, final_total: cartTotal - discount }
  }

  async incrementUsage(id: string) {
    const coupon = await this.retrieveCoupon(id)
    await this.updateCoupons({ id }, { used_count: coupon.used_count + 1 })
  }
}

export default CouponModuleService
