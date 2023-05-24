/*
  Warnings:

  - A unique constraint covering the columns `[externalId,shopId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId,shopId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId,externalInventoryId,shopId]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Location_externalId_shopId_key" ON "Location"("externalId", "shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_externalId_shopId_key" ON "Product"("externalId", "shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_externalId_externalInventoryId_shopId_key" ON "Variant"("externalId", "externalInventoryId", "shopId");
