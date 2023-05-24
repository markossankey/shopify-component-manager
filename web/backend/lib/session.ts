import { Session } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import _ from "lodash";
import { writeInitialShopData } from "../queries/prisma/writeShopifyToPrisma.js";
import {
  ShopifyInventoryLevels,
  getInventoryLevelsFromShopify,
  getLocationsFromShopify,
  getProductsFromShopify,
  getVariantsFromShopifyProducts,
} from "../queries/shopify/index.js";
import { CustomError } from "./customError.js";
import { prisma } from "./prisma.js";

export class PrismaSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    const { id, shop, accessToken = "", scope = "", isOnline, state } = session;
    const storedSession = await prisma.shop.upsert({
      where: { externalId: id },
      update: { isFirstLogin: false },
      create: { externalId: id, shop, accessToken, scope, isOnline, state },
    });
    if (!storedSession) return false;
    if (storedSession.isFirstLogin) this.syncNewShop(session);
    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const shop = await prisma.shop.findUnique({
        where: { externalId: id },
        select: { externalId: true, shop: true, accessToken: true, scope: true, isOnline: true, state: true },
      });

      if (!shop) return undefined;

      const session = _.omit({ ...shop, id: shop.externalId }, "externalId");
      return shop ? new Session(session) : undefined;
    } catch (error) {
      throw new CustomError({
        message: "Error loading session",
        userMessage: "Error loading session",
        status: 500,
        err: error,
        fnName: "PrismaSessionStorage-loadSession",
      });
    }
  }
  async deleteSession(id: string): Promise<boolean> {
    const deletedShop = await prisma.shop.delete({ where: { externalId: id } });
    return deletedShop ? true : false;
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    const deletedShops = await prisma.shop.deleteMany({ where: { externalId: { in: ids } } });
    return deletedShops ? true : false;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const shops = await prisma.shop.findMany({ where: { shop } });
    return shops.map((shop) => {
      const session = _.omit({ ...shop, id: shop.externalId }, "externalId");

      return new Session(session);
    });
  }

  private async syncNewShop(session: Session) {
    console.log("\nsyncing new shop");
    const shopifyProducts = await getProductsFromShopify({ session });
    const shopifyVariants = getVariantsFromShopifyProducts({ products: shopifyProducts });
    const inventoryIds = shopifyVariants.map((variant) => variant.inventory_item_id);

    const [shopifyLocations, shopifyInventoryLevels] = await Promise.all([
      getLocationsFromShopify({ session }),
      getInventoryLevelsFromShopify({ session, inventoryIds }),
    ]);

    shopifyInventoryLevels.forEach((inventoryLevel) => {
      const variant = shopifyVariants.find((variant) => variant.inventory_item_id === inventoryLevel.inventory_item_id);
      if (variant) inventoryLevel.variant_id = variant.id;
    });

    const updates = writeInitialShopData({
      products: shopifyProducts,
      variants: shopifyVariants,
      locations: shopifyLocations,
      inventories: shopifyInventoryLevels as ({ variant_id: number } & ShopifyInventoryLevels[number])[],
      session,
    });

    console.log("syncing new shop complete\n");
    return updates;
  }
}
