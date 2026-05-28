import { model } from "@medusajs/framework/utils"

const AnalyticsEvent = model.define("analytics_event", {
  id: model.id().primaryKey(),
  event_type: model.text(),
  product_id: model.text().nullable(),
  customer_id: model.text().nullable(),
  session_id: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default AnalyticsEvent
