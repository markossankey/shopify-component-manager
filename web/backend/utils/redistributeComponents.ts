import { prisma } from "../lib/prisma.js";
import { getProductsInLocationForComponent } from "../queries/prisma/products.js";

/**
 * redistributes components in a location, componentsInLocations should be updated before calling this function
 */
export async function redistributeComponentInLocation(externalLocationId: string, componentId: string) {
  const { variants, component, location } = await getProductsInLocationForComponent(externalLocationId, componentId);
  const componentsPerIncrement = variants.reduce((acc: number, { componentsInEach }) => acc + componentsInEach, 0);
  const dividedEvenly = Math.floor(component.inStock / componentsPerIncrement);
  let leftOver = component.inStock % componentsPerIncrement;

  variants.forEach((variant) => (variant.inStock = dividedEvenly));
  variants.sort((a, b) => b.componentsInEach - a.componentsInEach);

  const smallestConsumableAmount = variants[variants.length - 1].componentsInEach;

  while (leftOver >= smallestConsumableAmount) {
    variants.forEach((variant) => {
      if (leftOver >= variant.componentsInEach) {
        variant.inStock++;
        leftOver -= variant.componentsInEach;
      }
    });
  }

  return await prisma.$transaction([
    ...variants.map((variant) =>
      prisma.variantsInLocations.update({
        where: { id: variant.variantInLocationId },
        data: { inStock: variant.inStock },
        include: { variant: { select: { externalInventoryId: true } } },
      })
    ),
  ]);
}
