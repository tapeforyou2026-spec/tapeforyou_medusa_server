import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"

const itemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  salePrice: z.number().nullable().optional(),
  image: z.string().optional().default(""),
  size: z.string().optional().default(""),
})

const checkoutSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6),
  paymentMethod: z.string().min(1),
  items: z.array(itemSchema).min(1),
  subtotal: z.number().positive(),
  shipping: z.number().min(0),
  total: z.number().positive(),
})

// POST /store/checkout/submit
// Receives the full cart + customer info from the custom frontend
// and creates a real Medusa order that appears in the admin dashboard.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = checkoutSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: "invalid_data",
      message: parsed.error.errors[0].message,
    })
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    pincode,
    paymentMethod,
    items,
    shipping,
    total,
  } = parsed.data

  const orderModule = req.scope.resolve(Modules.ORDER)
  const logger = req.scope.resolve("logger")

  try {
    const shippingAddress = {
      first_name: firstName,
      last_name: lastName,
      address_1: address,
      city,
      province: state,
      postal_code: pincode,
      country_code: "in",
      phone,
    }

    const lineItems = items.map((item) => ({
      title: item.name,
      subtitle: item.size || "",
      thumbnail: item.image || "",
      quantity: item.quantity,
      // Medusa stores prices in smallest unit (paise for INR: 1 ₹ = 100 paise)
      unit_price: Math.round((item.salePrice ?? item.price) * 100),
      metadata: { original_id: String(item.id) },
    }))

    const orderResult = await orderModule.createOrders({
      status: "pending",
      email,
      currency_code: "inr",
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      items: lineItems,
      metadata: {
        payment_method: paymentMethod,
        shipping_total: Math.round(shipping * 100),
        order_total: Math.round(total * 100),
        source: "custom_storefront",
      },
    })

    // createOrders may return array or single object depending on Medusa version
    const order = Array.isArray(orderResult) ? orderResult[0] : orderResult

    logger.info(`Order created: ${order.id} | Email: ${email} | Total: ₹${total}`)

    // Emit order.placed so subscribers (email, etc.) are triggered
    try {
      const eventBus = req.scope.resolve(Modules.EVENT_BUS)
      await eventBus.emit("order.placed", { id: order.id })
    } catch {
      // Event bus not critical — order is already created
    }

    return res.status(201).json({
      order: {
        id: order.id,
        display_id: (order as any).display_id ?? null,
        status: order.status,
        email: order.email,
        total,
      },
    })
  } catch (err: any) {
    logger.error(`Checkout failed: ${err.message}`)
    return res.status(500).json({
      type: "server_error",
      message: "Failed to create order. Please try again.",
    })
  }
}
