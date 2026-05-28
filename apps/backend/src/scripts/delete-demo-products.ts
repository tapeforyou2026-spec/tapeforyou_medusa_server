import { MedusaContainer } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function deleteDemoProducts({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve("logger")
  const productModule = container.resolve(Modules.PRODUCT)

  // Only delete products that are NOT tape products (no tape-related handle)
  const tapeHandles = [
    "bopp-packaging-tape-48mm-65m",
    "masking-tape-24mm-20m",
    "double-sided-tape-18mm-5m",
    "foam-tape-24mm-2m",
    "brown-packaging-tape-48mm-65m",
    "cello-tape-12mm-66m",
    "duct-tape-48mm-10m",
  ]

  const allProducts = await productModule.listProducts({}, { select: ["id", "handle", "title"] })

  const toDelete = allProducts.filter((p) => !tapeHandles.includes(p.handle))

  if (toDelete.length === 0) {
    logger.info("No demo products to delete.")
    return
  }

  for (const p of toDelete) {
    logger.info(`Deleting demo product: ${p.title} (${p.handle})`)
    await productModule.deleteProducts([p.id])
  }

  logger.info(`✅ Deleted ${toDelete.length} demo product(s).`)
}
