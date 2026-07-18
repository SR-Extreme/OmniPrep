-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'SIX_MONTHS', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "MockInterviewStudyPlan" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedTaskKeys" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "completionPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

UPDATE "MockInterviewStudyPlan" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

ALTER TABLE "MockInterviewStudyPlan" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "publishedAt" TIMESTAMP(3);

UPDATE "Problem" SET "publishedAt" = "createdAt" WHERE "isPublished" = true;

-- AlterTable
ALTER TABLE "SystemDesignQuestion" ADD COLUMN     "publishedAt" TIMESTAMP(3);

UPDATE "SystemDesignQuestion" SET "publishedAt" = "createdAt" WHERE "isPublished" = true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "averageInterviewScore" DOUBLE PRECISION,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneNo" TEXT,
ADD COLUMN     "premiumFrom" TIMESTAMP(3),
ADD COLUMN     "premiumTill" TIMESTAMP(3),
ADD COLUMN     "recentLogin" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSessionId_key" ON "Subscription"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripePaymentIntentId_key" ON "Subscription"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX "Subscription_createdAt_idx" ON "Subscription"("createdAt");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "Subscription_expiresAt_idx" ON "Subscription"("expiresAt");

-- CreateIndex
CREATE INDEX "MockInterviewStudyPlan_completionPercent_idx" ON "MockInterviewStudyPlan"("completionPercent");

-- CreateIndex
CREATE INDEX "Problem_publishedAt_idx" ON "Problem"("publishedAt");

-- CreateIndex
CREATE INDEX "SystemDesignQuestion_publishedAt_idx" ON "SystemDesignQuestion"("publishedAt");

-- CreateIndex
CREATE INDEX "User_isPremium_idx" ON "User"("isPremium");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
