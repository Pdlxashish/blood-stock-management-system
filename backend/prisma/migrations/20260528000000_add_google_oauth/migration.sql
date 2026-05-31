-- Add Google OAuth support to User model
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;

-- Create index for faster Google ID lookups
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- Make password optional for OAuth users (allow empty string)
-- No schema change needed as password is already String type
