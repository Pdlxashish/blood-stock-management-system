/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "About" ALTER COLUMN "stats" SET DEFAULT '[{"label":"Active Donors","value":"500+"},{"label":"Partner Hospitals","value":"25+"},{"label":"Blood Units Collected","value":"3,000+"}]';

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
