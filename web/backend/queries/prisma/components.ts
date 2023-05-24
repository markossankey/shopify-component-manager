import { prisma } from "../../lib/prisma.js";

export function createComponent({ shop, name }: CreateComponentParams) {
  return prisma.component.create({
    data: { name, shopId: shop },
    include: { locations: true, variants: true },
  });
}

export function getComponents(shop: string) {
  return prisma.component.findMany({
    where: { shopId: shop },
  });
}

export function getComponent(id: string) {
  return prisma.component.findUnique({
    where: { id },
    include: { locations: true, variants: true },
  });
}

export function upsertComponentLocation({
  componentId,
  locationId,
  shop,
  inStock,
}: {
  componentId: string;
  locationId: string;
  inStock: number;
  shop: string;
}) {
  return prisma.componentsInLocations.upsert({
    where: { componentId_externalLocationId_shopId: { componentId, externalLocationId: locationId, shopId: shop } },
    create: { componentId, externalLocationId: locationId, inStock, shopId: shop },
    update: { inStock },
  });
}

type CreateComponentParams = {
  shop: string;
  name: string;
};
