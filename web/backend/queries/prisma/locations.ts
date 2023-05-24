import { prisma } from "../../lib/prisma.js";

export function getProductsInLocation({ locationId, componentId }: GetProductsInLocationParams) {
  return prisma.location.findUnique({
    where: { externalId: locationId },
    include: {
      variants: {
        where: { variant: { components: { some: { componentId } } } },
        select: {
          variant: {
            select: {
              name: true,
              locations: { where: { externalLocationId: locationId }, select: { inStock: true } },
              product: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}
//
type GetProductsInLocationParams = {
  locationId: string;
  componentId: string;
};
