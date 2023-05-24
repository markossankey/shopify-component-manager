/*
  Warnings:

  - A unique constraint covering the columns `[componentId,locationId,shopId]` on the table `ComponentsInLocations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[componentId,variantId,shopId]` on the table `ComponentsInVariants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[variantId,locationId,shopId]` on the table `VariantsInLocations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ComponentsInLocations_componentId_locationId_shopId_key" ON "ComponentsInLocations"("componentId", "locationId", "shopId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentsInVariants_componentId_variantId_shopId_key" ON "ComponentsInVariants"("componentId", "variantId", "shopId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantsInLocations_variantId_locationId_shopId_key" ON "VariantsInLocations"("variantId", "locationId", "shopId");
