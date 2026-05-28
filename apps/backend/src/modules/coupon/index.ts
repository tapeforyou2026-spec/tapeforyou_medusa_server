import { Module } from "@medusajs/framework/utils"
import CouponModuleService from "./service"

export const COUPON_MODULE = "coupon"

export default Module(COUPON_MODULE, {
  service: CouponModuleService,
})
