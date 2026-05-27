-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "reverificationMessage" TEXT,
ADD COLUMN     "reverificationRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reverificationRequestedAt" TIMESTAMP(3);
