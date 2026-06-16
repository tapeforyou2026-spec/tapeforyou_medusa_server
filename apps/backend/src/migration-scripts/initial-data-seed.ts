import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  // ── Sales Channel ────────────────────────────────────────────────────────────
  logger.info("Checking sales channel...");
  const { data: existingSalesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });

  let defaultSalesChannel: any = existingSalesChannels[0];
  if (!defaultSalesChannel) {
    logger.info("Creating sales channel...");
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          { name: "Default Sales Channel", description: "Created by Medusa" },
        ],
      },
    });
    defaultSalesChannel = result[0] as any;
  } else {
    logger.info(`Sales channel already exists: ${defaultSalesChannel.name}`);
  }

  // ── Publishable API Key ──────────────────────────────────────────────────────
  logger.info("Checking API key...");
  const { data: existingApiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "type"],
  });
  const existingPubKey = existingApiKeys.find((k) => k.type === "publishable");

  if (!existingPubKey) {
    logger.info("Creating publishable API key...");
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          { title: "Default Publishable API Key", type: "publishable", created_by: "" },
        ],
      },
    });
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: result[0].id, add: [defaultSalesChannel.id] },
    });
  } else {
    logger.info("Publishable API key already exists, skipping.");
  }

  // ── Store ────────────────────────────────────────────────────────────────────
  logger.info("Checking store...");
  const { data: existingStores } = await query.graph({
    entity: "store",
    fields: ["id", "name"],
  });

  if (existingStores.length === 0) {
    logger.info("Creating store...");
    await createStoresWorkflow(container).run({
      input: {
        stores: [
          {
            name: "Default Store",
            supported_currencies: [
              { currency_code: "eur", is_default: true },
              { currency_code: "usd", is_default: false },
            ],
            default_sales_channel_id: defaultSalesChannel.id,
          },
        ],
      },
    });
  } else {
    logger.info("Store already exists, skipping.");
  }

  // ── Region ───────────────────────────────────────────────────────────────────
  logger.info("Checking regions...");
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });

  let region: any = existingRegions.find((r) => r.name === "Europe");
  if (!region) {
    logger.info("Seeding region data...");
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europe",
            currency_code: "eur",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0] as any;

    logger.info("Seeding tax regions...");
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
    logger.info("Finished seeding regions.");
  } else {
    logger.info("Europe region already exists, skipping.");
  }

  // ── Stock Location ───────────────────────────────────────────────────────────
  logger.info("Checking stock locations...");
  const { data: existingLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });

  let stockLocation: any = existingLocations[0];
  if (!stockLocation) {
    logger.info("Seeding stock location data...");
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "European Warehouse",
            address: { city: "Copenhagen", country_code: "DK", address_1: "" },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0] as any;

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });

    // ── Fulfillment Set ────────────────────────────────────────────────────────
    logger.info("Seeding fulfillment data...");
    const { data: shippingProfileResult } = await query.graph({
      entity: "shipping_profile",
      fields: ["id"],
    });
    const shippingProfile = shippingProfileResult[0];

    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "European Warehouse delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Europe",
          geo_zones: countries.map((country_code) => ({
            country_code,
            type: "country" as const,
          })),
        },
      ],
    });

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    });

    const shippingPrices = [
      { currency_code: "usd", amount: 10 },
      { currency_code: "eur", amount: 10 },
      ...(region ? [{ region_id: region.id, amount: 10 }] : []),
    ];

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: { label: "Standard", description: "Ship in 2-3 days.", code: "standard" },
          prices: shippingPrices,
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: { label: "Express", description: "Ship in 24 hours.", code: "express" },
          prices: shippingPrices,
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });
    logger.info("Finished seeding fulfillment data.");

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [defaultSalesChannel.id] },
    });
    logger.info("Finished seeding stock location data.");
  } else {
    logger.info("Stock location already exists, skipping fulfillment setup.");
  }

  // ── Inventory Levels ─────────────────────────────────────────────────────────
  logger.info("Checking inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  if (inventoryItems.length > 0 && stockLocation) {
    const { data: existingLevels } = await query.graph({
      entity: "inventory_level",
      fields: ["id", "inventory_item_id"],
    });
    const existingItemIds = new Set(existingLevels.map((l) => l.inventory_item_id));
    const newItems = inventoryItems.filter((item) => !existingItemIds.has(item.id));

    if (newItems.length > 0) {
      logger.info(`Seeding ${newItems.length} inventory levels...`);
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: newItems.map((item) => ({
            location_id: stockLocation.id,
            stocked_quantity: 1000000,
            inventory_item_id: item.id,
          })),
        },
      });
      logger.info("Finished seeding inventory levels.");
    } else {
      logger.info("All inventory levels already exist, skipping.");
    }
  }

  logger.info("✅ Initial data seed complete.");
}
