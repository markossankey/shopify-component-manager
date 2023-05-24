import { CustomError } from "../../lib/customError.js";
import { prisma } from "../../lib/prisma.js";
import { ShopifyInventoryLevels, ShopifyLocations, ShopifyProducts, ShopifyVariant } from "../shopify/index.js";

export async function writeShopifyProductsWithNestedVariants({
  session,
  products,
}: {
  session: any;
  products: ShopifyProducts;
}) {
  try {
    return await prisma.$transaction(
      products.map((product) =>
        prisma.product.create({
          data: {
            shopId: session.shop,
            name: product.title ?? "no name provided",
            externalId: `${product.id}` ?? "no id provided",
            variants: {
              create: product.variants?.map((variant: ShopifyVariant) => ({
                shopId: session.shop,
                name: variant.title ?? "no name provided",
                externalId: `${variant.id}` ?? "no id provided",
                externalInventoryId: `${variant.inventory_item_id}` ?? "no inventory item id provided",
                locations: {
                  create: variant.inventoryLevels.map((inventoryLevel: ShopifyInventoryLevels[number]) => ({
                    shopId: session.shop,
                    inStock: inventoryLevel.available,
                    location: {
                      connectOrCreate: {
                        create: {
                          externalId: `${inventoryLevel.location_id}` ?? "no location id provided",
                          name: inventoryLevel.locationName ?? "no location name provided",
                        },
                        where: {
                          externalId: `${inventoryLevel.location_id}` ?? "no location id provided",
                        },
                      },
                    },
                  })), // todo add locations inventory info to products then update here
                },
              })),
            },
          },
        })
      )
    );
  } catch (e) {
    console.log(e);
    throw e;
    // throw new CustomError({
    //   err: e,
    //   fnName: "writeShopifyProductsWithNestedVariants",
    //   message: `Error writing products to Prisma (see writeShopifyProductsWithNestedVariants fn))`,
    //   status: 500,
    //   userMessage: "Error writing Products",
    // });
  }
}

export async function writeShopifyProductsToPrisma({ session, products }: { session: any; products: ShopifyProducts }) {
  try {
    return await prisma.product.createMany({
      data: products.map((product) => {
        return {
          shopId: session.shop,
          name: product.title ?? "no name provided",
          externalId: `${product.id}` ?? "no id provided",
        };
      }),
      skipDuplicates: true,
    });
  } catch (error) {
    throw new CustomError({
      err: error,
      fnName: "writeShopifyProductsToPrisma",
      message: `Error writing products to Prisma (see writeShopifyProductsToPrisma fn))`,
      status: 500,
      userMessage: "Error writing Products",
    });
  }
}

export async function writeShopifyLocationsToPrisma({ session, locations }: { session: any; locations: ShopifyLocations }) {
  try {
    return await prisma.location.createMany({
      data: locations.map((location) => {
        return {
          shopId: session.shop,
          name: location.name ?? "no name provided",
          externalId: `${location.id}` ?? "no id provided",
        };
      }),
      skipDuplicates: true,
    });
  } catch (error) {
    throw new CustomError({
      err: error,
      fnName: "writeShopifyLocationsToPrisma",
      message: `Error writing locations to Prisma (see writeShopifyLocationsToPrisma fn))`,
      status: 500,
      userMessage: "Error writing Locations",
    });
  }
}

type writeInitialShopDataProps = {
  session: any;
  products: ShopifyProducts;
  locations: ShopifyLocations;
  variants: ShopifyVariant[];
  inventories: ({ variant_id: number } & ShopifyInventoryLevels[number])[];
};
export async function writeInitialShopData({
  session,
  products,
  locations,
  variants,
  inventories,
}: writeInitialShopDataProps) {
  return prisma.$transaction([
    prisma.product.createMany({
      data: products.map((product) => ({
        shopId: session.shop,
        name: product.title ?? "no name provided",
        externalId: `${product.id}` ?? "no id provided",
      })),
      skipDuplicates: true,
    }),
    prisma.location.createMany({
      data: locations.map((location) => ({
        shopId: session.shop,
        name: location.name ?? "no name provided",
        externalId: `${location.id}` ?? "no id provided",
      })),
      skipDuplicates: true,
    }),
    prisma.variant.createMany({
      data: variants.map((variant) => ({
        shopId: session.shop,
        name: variant.title ?? "no name provided",
        externalProductId: `${variant.product_id}` ?? "no product id provided",
        externalId: `${variant.id}` ?? "no id provided",
        externalInventoryId: `${variant.inventory_item_id}` ?? "no inventory item id provided",
      })),
      skipDuplicates: true,
    }),
    prisma.variantsInLocations.createMany({
      data: inventories.map((inventory) => ({
        shopId: session.shop,
        externalVariantId: `${inventory.variant_id}`,
        externalLocationId: `${inventory.location_id}`,
        inStock: inventory.available ?? 0,
      })),
      skipDuplicates: true,
    }),
  ]);
}
