import shopify from "../../lib/shopify.js";

export type ShopifyLocationsReturnType = ReturnType<typeof getLocationsFromShopify>;
export type ShopifyProductsReturnType = ReturnType<typeof getProductsFromShopify>;
export type ShopifyInventoryLevelsReturnType = ReturnType<typeof getInventoryLevelsFromShopify>;

export type ShopifyVariant = { inventory_item_id: number; title: string; [key: string]: any };
export type ShopifyLocations = Awaited<ShopifyLocationsReturnType>;
export type ShopifyProducts = Awaited<ShopifyProductsReturnType>;
export type ShopifyInventoryLevels = Awaited<ShopifyInventoryLevelsReturnType>;

// TODO need to figure out hwo to get session type -- maybe copy from shopify-app-session-storage-sqlite?
export async function getLocationsFromShopify({ session }: { session: any }) {
  const response = await shopify.api.rest.Location.all({
    session: session,
  });

  return response.data;
}

export async function getProductsFromShopify({ session }: { session: any }) {
  const response = await shopify.api.rest.Product.all({
    session: session,
  });

  return response.data;
}

export async function getInventoryLevelsFromShopify({
  session,
  inventoryIds,
}: {
  session: any;
  inventoryIds: string | number | string[] | number[];
}) {
  let formattedInventoryIds = Array.isArray(inventoryIds) ? inventoryIds.join(",") : inventoryIds;

  const response = await shopify.api.rest.InventoryLevel.all({
    session: session,
    inventory_item_ids: formattedInventoryIds,
  });

  return response.data;
}

export function getVariantsFromShopifyProducts({ products }: { products: ShopifyProducts }): ShopifyVariant[] {
  return products.flatMap((product) =>
    product.variants?.filter(
      (v: Record<string, string>) => Object.hasOwn(v, "inventory_item_id") && Object.hasOwn(v, "title")
    )
  );
}

export async function updateInventoryLevelInShopify({
  session,
  locationId,
  inventoryItemId,
  available,
}: {
  session: any;
  locationId: string | number;
  inventoryItemId: string | number;
  available: number;
}) {
  const inventoryLevel = new shopify.api.rest.InventoryLevel({ session });

  return await inventoryLevel.set({
    location_id: locationId,
    inventory_item_id: inventoryItemId,
    available,
  });
}

export async function getInventoryLevelFromShopify({
  locationId,
  session,
  inventoryItemId,
}: {
  locationId: string | number;
  session: any;
  inventoryItemId: string | number;
}) {
  const inventoryLevel = new shopify.api.rest.InventoryLevel({ session });

  return await inventoryLevel.get({
    location_id: locationId,
    inventory_item_id: inventoryItemId,
  });
}
