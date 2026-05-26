-- CreateEnum
CREATE TYPE "DonorVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "verificationStatus" "DonorVerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- CreateIndex
CREATE INDEX "Donor_verificationStatus_idx" ON "Donor"("verificationStatus");
