import { prisma } from "../../lib/prisma.js";

export function getProductsByShopId(shop: string) {
  return prisma.product.findMany({
    where: {
      shopId: shop,
    },
    include: {
      variants: true,
    },
  });
}

export async function getProductsInLocationForComponent(locationId: string, componentId: string) {
  const queryResult = await prisma.variantsInLocations.findMany({
    where: {
      externalLocationId: locationId,
      AND: {
        variant: {
          components: {
            some: {
              componentId,
            },
          },
        },
      },
    },
    include: {
      variant: {
        include: {
          components: {
            where: { componentId },
            select: {
              componentsPerVariant: true,
              component: { select: { id: true, locations: { where: { externalLocationId: locationId } } } },
            },
          },
        },
      },
    },
  });
  console.log(queryResult);
  return {
    location: {
      externalId: locationId,
    },
    component: {
      internalId: componentId,
      inStock: queryResult[0].variant.components[0].component.locations[0].inStock,
    },
    variants: queryResult.map((variant) => ({
      variantInLocationId: variant.id,
      componentsInEach: variant.variant.components[0].componentsPerVariant,
      inStock: variant.inStock,
      name: variant.variant.name,
      externalInventoryId: variant.variant.externalInventoryId,
    })),
  };
}

type GetProductsInLocationParams = { shop: string; locationId: string };
export async function getProductsInLocation({ shop, locationId }: GetProductsInLocationParams) {
  return await prisma.variantsInLocations.findMany({
    where: { externalLocationId: locationId, shopId: shop },
    include: { variant: true },
  });
}
