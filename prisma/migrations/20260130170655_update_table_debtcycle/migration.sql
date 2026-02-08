/*
  Warnings:

  - A unique constraint covering the columns `[userId,isPaid]` on the table `DebtCycle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DebtCycle_userId_isPaid_key" ON "DebtCycle"("userId", "isPaid");
