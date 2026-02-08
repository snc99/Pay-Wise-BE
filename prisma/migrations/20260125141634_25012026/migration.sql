/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Debt` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Debt` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Debt` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to drop the column `debtId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `remaining` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cycleId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cycleId` to the `Debt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cycleId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_debtId_fkey";

-- AlterTable
ALTER TABLE "Debt" DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "cycleId" TEXT NOT NULL,
ADD COLUMN     "note" TEXT,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "debtId",
DROP COLUMN "remaining",
DROP COLUMN "updatedAt",
ADD COLUMN     "cycleId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "Admin";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "DebtCycle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "total" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "DebtCycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_cycleId_key" ON "Payment"("cycleId");

-- AddForeignKey
ALTER TABLE "DebtCycle" ADD CONSTRAINT "DebtCycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "DebtCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "DebtCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
