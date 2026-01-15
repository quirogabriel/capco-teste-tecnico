/*
  Warnings:

  - You are about to drop the column `mp_payment_id` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[external_reference]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Payment_mp_payment_id_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "mp_payment_id",
ADD COLUMN     "external_reference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_external_reference_key" ON "Payment"("external_reference");
