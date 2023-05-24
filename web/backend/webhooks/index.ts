import { DeliveryMethod } from "@shopify/shopify-api";
import { WebhookHandlersParam } from "@shopify/shopify-app-express";
import { getProductsInLocation } from "../queries/prisma/products.js";
import requiredWebhooks from "./gdpr.js";

export default {
  ...requiredWebhooks,

  /**
   * This webhook is invoked when a customers inventory level changes.
   */
  INVENTORY_LEVELS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      const locationId = `${payload.location_id}`;
      const inventoryItemId = `${payload.inventory_item_id}`;
      const newAmount = payload.available;

      const { inventory_item_id, location_id, available } = payload;
      if (!inventory_item_id || !location_id || !available) throw new Error("Missing required fields");

      const productsInLocation = await getProductsInLocation({ locationId, shop });
      const product = productsInLocation.find((p) => p.variant.externalInventoryId === inventoryItemId);

      if (!product || newAmount === product.inStock) {
        console.log("No product found or no change in stock");
        return;
      }

      console.log("Product found, updating stock");
      //todo update stock

      console.dir(product, { depth: null });
    },
  },
} as WebhookHandlersParam;
