import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  logger.info(`New customer registered: ${data.id}`)

  // Add welcome email here when RESEND_API_KEY is set:
  // const notificationModule = container.resolve("notification")
  // await notificationModule.sendWelcomeEmail(data.id)
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
