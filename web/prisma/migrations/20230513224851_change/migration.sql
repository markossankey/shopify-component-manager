/*
  Warnings:

  - You are about to drop the column `locationId` on the `ComponentsInLocations` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `ComponentsInVariants` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `VariantsInLocations` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `VariantsInLocations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[componentId,externalLocationId,shopId]` on the table `ComponentsInLocations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[componentId,externalVariantId,shopId]` on the table `ComponentsInVariants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalVariantId,externalLocationId,shopId]` on the table `VariantsInLocations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalLocationId` to the `ComponentsInLocations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalVariantId` to the `ComponentsInVariants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalLocationId` to the `VariantsInLocations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalVariantId` to the `VariantsInLocations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ComponentsInLocations" DROP CONSTRAINT "ComponentsInLocations_locationId_fkey";

-- DropForeignKey
ALTER TABLE "ComponentsInVariants" DROP CONSTRAINT "ComponentsInVariants_variantId_fkey";

-- DropForeignKey
ALTER TABLE "VariantsInLocations" DROP CONSTRAINT "VariantsInLocations_locationId_fkey";

-- DropForeignKey
ALTER TABLE "VariantsInLocations" DROP CONSTRAINT "VariantsInLocations_variantId_fkey";

-- DropIndex
DROP INDEX "ComponentsInLocations_componentId_locationId_shopId_key";

-- DropIndex
DROP INDEX "ComponentsInVariants_componentId_variantId_shopId_key";

-- DropIndex
DROP INDEX "VariantsInLocations_variantId_locationId_shopId_key";

-- AlterTable
ALTER TABLE "ComponentsInLocations" DROP COLUMN "locationId",
ADD COLUMN     "externalLocationId" TEXT NOT NULL,
ALTER COLUMN "inStock" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "ComponentsInVariants" DROP COLUMN "variantId",
ADD COLUMN     "externalVariantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VariantsInLocations" DROP COLUMN "locationId",
DROP COLUMN "variantId",
ADD COLUMN     "externalLocationId" TEXT NOT NULL,
ADD COLUMN     "externalVariantId" TEXT NOT NULL,
ALTER COLUMN "inStock" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "ComponentsInLocations_componentId_externalLocationId_shopId_key" ON "ComponentsInLocations"("componentId", "externalLocationId", "shopId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentsInVariants_componentId_externalVariantId_shopId_key" ON "ComponentsInVariants"("componentId", "externalVariantId", "shopId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantsInLocations_externalVariantId_externalLocationId_sh_key" ON "VariantsInLocations"("externalVariantId", "externalLocationId", "shopId");

-- AddForeignKey
ALTER TABLE "ComponentsInLocations" ADD CONSTRAINT "ComponentsInLocations_externalLocationId_fkey" FOREIGN KEY ("externalLocationId") REFERENCES "Location"("externalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantsInLocations" ADD CONSTRAINT "VariantsInLocations_externalVariantId_fkey" FOREIGN KEY ("externalVariantId") REFERENCES "Variant"("externalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantsInLocations" ADD CONSTRAINT "VariantsInLocations_externalLocationId_fkey" FOREIGN KEY ("externalLocationId") REFERENCES "Location"("externalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentsInVariants" ADD CONSTRAINT "ComponentsInVariants_externalVariantId_fkey" FOREIGN KEY ("externalVariantId") REFERENCES "Variant"("externalId") ON DELETE CASCADE ON UPDATE CASCADE;
