/**
 * Seed script — populates Medusa with Tapes For You product catalog (INR prices).
 *
 * Run: npx medusa exec ./src/scripts/seed-tape-products.ts
 *
 * Prerequisites: initial-data-seed must have run first (creates sales channel + shipping profile).
 */

import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function seedTapeProducts({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // ── Ensure INR region exists ────────────────────────────────────────────────
  logger.info("Checking for India region...")
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  })

  let indiaRegion = existingRegions.find((r) => r.currency_code === "inr")

  if (!indiaRegion) {
    logger.info("Creating India region (INR)...")
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "in", provider_id: "tp_system" }],
    })

    const { result: regions } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "India",
            currency_code: "inr",
            countries: ["in"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    indiaRegion = regions[0]
    logger.info(`India region created: ${indiaRegion.id}`)
  }

  // ── Get default sales channel ───────────────────────────────────────────────
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const defaultSalesChannel = salesChannels[0]
  if (!defaultSalesChannel) {
    throw new Error("No sales channel found. Run initial-data-seed first.")
  }

  // ── Get default shipping profile ────────────────────────────────────────────
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile) {
    throw new Error("No shipping profile found. Run initial-data-seed first.")
  }

  // ── Create product categories ───────────────────────────────────────────────
  logger.info("Creating tape product categories...")
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Packing Tapes", handle: "packing-tapes", is_active: true },
        { name: "Masking Tapes", handle: "masking-tapes", is_active: true },
        { name: "Double Sided Tapes", handle: "double-sided-tapes", is_active: true },
        { name: "Foam Tapes", handle: "foam-tapes", is_active: true },
        { name: "Specialty Tapes", handle: "specialty-tapes", is_active: true },
      ],
    },
  })

  const cat = (name: string) =>
    categoryResult.find((c) => c.name === name)!.id

  const inrPrice = (amount: number) => ({
    amount,
    currency_code: "inr",
    region_id: indiaRegion!.id,
  })

  // ── Create products ─────────────────────────────────────────────────────────
  logger.info("Seeding tape products...")

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "BOPP Packaging Tape",
          handle: "bopp-packaging-tape-48mm-65m",
          description:
            "Premium BOPP packaging tape with strong adhesion. Crystal clear finish, moisture resistant, and tear-resistant. Ideal for sealing cartons, boxes, and packages.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [cat("Packing Tapes")],
          images: [
            { url: "https://placehold.co/600x600/DFF4F2/0B8B87?text=BOPP+Tape" },
          ],
          options: [{ title: "Size", values: ["48mm x 65m", "72mm x 65m", "24mm x 65m"] }],
          variants: [
            {
              title: "48mm x 65m",
              sku: "TPE-BOPP-48-65",
              options: { Size: "48mm x 65m" },
              prices: [inrPrice(12900)],
              inventory_quantity: 500,
            },
            {
              title: "72mm x 65m",
              sku: "TPE-BOPP-72-65",
              options: { Size: "72mm x 65m" },
              prices: [inrPrice(18900)],
              inventory_quantity: 200,
            },
            {
              title: "24mm x 65m",
              sku: "TPE-BOPP-24-65",
              options: { Size: "24mm x 65m" },
              prices: [inrPrice(8900)],
              inventory_quantity: 300,
            },
          ],
          metadata: {
            isBestSeller: true,
            isFeatured: true,
            isNew: false,
            rating: 4.5,
            reviewCount: 128,
          },
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Masking Tape",
          handle: "masking-tape-24mm-20m",
          description:
            "Professional grade paper masking tape for clean and precise paint lines. Easy to apply and remove without leaving residue.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [cat("Masking Tapes")],
          images: [
            { url: "https://placehold.co/600x600/FFF8E1/B8860B?text=Masking+Tape" },
          ],
          options: [{ title: "Size", values: ["24mm x 20m", "36mm x 20m", "48mm x 20m"] }],
          variants: [
            {
              title: "24mm x 20m",
              sku: "TPE-MSK-24-20",
              options: { Size: "24mm x 20m" },
              prices: [inrPrice(8900)],
              inventory_quantity: 300,
            },
            {
              title: "36mm x 20m",
              sku: "TPE-MSK-36-20",
              options: { Size: "36mm x 20m" },
              prices: [inrPrice(10900)],
              inventory_quantity: 200,
            },
          ],
          metadata: {
            isBestSeller: true,
            isFeatured: true,
            isNew: false,
            rating: 4.3,
            reviewCount: 89,
          },
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Double Sided Tape",
          handle: "double-sided-tape-18mm-5m",
          description:
            "High-tack double sided adhesive tape for strong bonding on both sides. Ideal for mounting posters, photos, and lightweight objects.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [cat("Double Sided Tapes")],
          images: [
            { url: "https://placehold.co/600x600/FCE4EC/C62828?text=Double+Sided" },
          ],
          options: [{ title: "Size", values: ["18mm x 5m", "24mm x 10m"] }],
          variants: [
            {
              title: "18mm x 5m",
              sku: "TPE-DS-18-5",
              options: { Size: "18mm x 5m" },
              prices: [inrPrice(14900)],
              inventory_quantity: 250,
            },
            {
              title: "24mm x 10m",
              sku: "TPE-DS-24-10",
              options: { Size: "24mm x 10m" },
              prices: [inrPrice(22900)],
              inventory_quantity: 150,
            },
          ],
          metadata: {
            isBestSeller: true,
            isFeatured: true,
            isNew: false,
            rating: 4.4,
            reviewCount: 67,
          },
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Foam Tape",
          handle: "foam-tape-24mm-2m",
          description:
            "Self-adhesive foam tape with excellent sealing and cushioning properties. Perfect for weatherstripping, gap filling, and vibration dampening.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [cat("Foam Tapes")],
          images: [
            { url: "https://placehold.co/600x600/E8EAF6/3949AB?text=Foam+Tape" },
          ],
          options: [{ title: "Size", values: ["24mm x 2m", "48mm x 2m"] }],
          variants: [
            {
              title: "24mm x 2m",
              sku: "TPE-FM-24-2",
              options: { Size: "24mm x 2m" },
              prices: [inrPrice(15900)],
              inventory_quantity: 180,
            },
            {
              title: "48mm x 2m",
              sku: "TPE-FM-48-2",
              options: { Size: "48mm x 2m" },
              prices: [inrPrice(24900)],
              inventory_quantity: 120,
            },
          ],
          metadata: {
            isBestSeller: true,
            isFeatured: true,
            isNew: false,
            rating: 4.6,
            reviewCount: 54,
          },
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Brown Packaging Tape",
          handle: "brown-packaging-tape-48mm-65m",
          description:
            "Heavy-duty brown packaging tape for all carton sealing needs. High tensile strength for extra secure packaging.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [cat("Packing Tapes")],
          images: [
            { url: "https://placehold.co/600x600/EFEBE9/4E342E?text=Brown+Tape" },
          ],
          options: [{ title: "Size", values: ["48mm x 65m"] }],
          variants: [
            {
              title: "48mm x 65m",
              sku: "TPE-BRN-48-65",
              options: { Size: "48mm x 65m" },
              prices: [inrPrice(11900)],
              inventory_quantity: 400,
            },
          ],
          metadata: {
            isBestSeller: false,
            isFeatured: true,
            isNew: false,
            rating: 4.2,
            reviewCount: 45,
          },
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Cello Tape",
          handle: "cello-tape-12mm-66m",
          description:
            "Classic transparent cello tape for everyday use. Perfect for gift wrapping, office stationery, sealing envelopes, and light packing.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [cat("Packing Tapes")],
          images: [
            { url: "https://placehold.co/600x600/F0F9FF/0B8B87?text=Cello+Tape" },
          ],
          options: [{ title: "Size", values: ["12mm x 66m", "18mm x 66m"] }],
          variants: [
            {
              title: "12mm x 66m",
              sku: "TPE-CELL-12-66",
              options: { Size: "12mm x 66m" },
              prices: [inrPrice(5900)],
              inventory_quantity: 600,
            },
            {
              title: "18mm x 66m",
              sku: "TPE-CELL-18-66",
              options: { Size: "18mm x 66m" },
              prices: [inrPrice(7900)],
              inventory_quantity: 400,
            },
          ],
          metadata: {
            isBestSeller: false,
            isFeatured: false,
            isNew: true,
            rating: 4.1,
            reviewCount: 32,
          },
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Duct Tape",
          handle: "duct-tape-48mm-10m",
          description:
            "Heavy-duty cloth duct tape with strong waterproof adhesive. Versatile tape for repairs, bundling, and general maintenance.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [cat("Specialty Tapes")],
          images: [
            { url: "https://placehold.co/600x600/ECEFF1/607D8B?text=Duct+Tape" },
          ],
          options: [{ title: "Size", values: ["48mm x 10m", "48mm x 25m"] }],
          variants: [
            {
              title: "48mm x 10m",
              sku: "TPE-DCT-48-10",
              options: { Size: "48mm x 10m" },
              prices: [inrPrice(29900)],
              inventory_quantity: 120,
            },
            {
              title: "48mm x 25m",
              sku: "TPE-DCT-48-25",
              options: { Size: "48mm x 25m" },
              prices: [inrPrice(59900)],
              inventory_quantity: 80,
            },
          ],
          metadata: {
            isBestSeller: false,
            isFeatured: false,
            isNew: true,
            rating: 4.5,
            reviewCount: 23,
          },
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  })

  logger.info("✅ Tape products seeded successfully!")
  logger.info("Run 'npx medusa exec ./src/scripts/seed-tape-products.ts' again only if you need to re-seed.")
}
