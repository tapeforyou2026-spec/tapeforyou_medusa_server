import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModule = container.resolve(Modules.ORDER)
  const logger = container.resolve("logger")

  try {
    const order = await orderModule.retrieveOrder(data.id, {
      relations: ["items", "shipping_address", "customer"],
    })

    logger.info(`Order placed: ${order.id} | Customer: ${order.email}`)

    // Add Resend email here when RESEND_API_KEY is set:
    // const notificationModule = container.resolve("notification")
    // await notificationModule.sendOrderConfirmation(order)
  } catch (err) {
    logger.error(`Failed to process order.placed event: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
