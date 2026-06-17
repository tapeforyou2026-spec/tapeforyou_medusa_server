import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { WISHLIST_MODULE } from "../../../modules/wishlist"

const addSchema = z.object({
  product_id: z.string().min(1),
  variant_id: z.string().optional(),
})

// GET /store/wishlist — auth required
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customer_id = (req as any).auth_context?.actor_id
  const wishlistService = req.scope.resolve(WISHLIST_MODULE)

  const items = await wishlistService.listWishlistItems({ customer_id })

  res.json({ wishlist: items })
}

// POST /store/wishlist — auth required
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customer_id = (req as any).auth_context?.actor_id

  const parsed = addSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: "invalid_data",
      message: parsed.error.issues[0].message,
    })
  }

  const wishlistService = req.scope.resolve(WISHLIST_MODULE)

  // Check for duplicate
  const existing = await wishlistService.listWishlistItems({
    customer_id,
    product_id: parsed.data.product_id,
  })

  if (existing.length > 0) {
    return res.status(409).json({ message: "Product already in wishlist" })
  }

  const item = await wishlistService.createWishlistItems({
    customer_id,
    product_id: parsed.data.product_id,
    variant_id: parsed.data.variant_id || null,
  })

  res.status(201).json({ item })
}

// DELETE /store/wishlist — auth required
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const customer_id = (req as any).auth_context?.actor_id
  const { product_id } = req.body as { product_id: string }

  const wishlistService = req.scope.resolve(WISHLIST_MODULE)

  const items = await wishlistService.listWishlistItems({ customer_id, product_id })
  if (items.length > 0) {
    await wishlistService.deleteWishlistItems(items.map((i) => i.id))
  }

  res.json({ success: true })
}
