/*
  Warnings:

  - You are about to drop the column `productId` on the `Variant` table. All the data in the column will be lost.
  - Added the required column `externalProductId` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_productId_fkey";

-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "productId",
ADD COLUMN     "externalProductId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_externalProductId_fkey" FOREIGN KEY ("externalProductId") REFERENCES "Product"("externalId") ON DELETE CASCADE ON UPDATE CASCADE;
