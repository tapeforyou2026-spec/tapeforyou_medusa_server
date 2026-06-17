import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

const contactSchema = z.object({
  type: z.enum(["contact", "bulk"]).default("contact"),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5).max(2000),
  company: z.string().optional(),
  quantity: z.string().optional(),
})

// POST /store/contact
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = contactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: "invalid_data",
      message: parsed.error.issues[0].message,
    })
  }

  const { type, name, email, phone, message, company, quantity } = parsed.data

  // Log contact form submission — add Resend/email integration here when ready
  console.log(`[Contact] type=${type}`, { name, email, phone, company, quantity, message })

  res.json({ success: true, message: "Your message has been received. We will contact you shortly." })
}
