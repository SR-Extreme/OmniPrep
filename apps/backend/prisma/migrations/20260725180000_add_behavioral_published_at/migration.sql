-- AlterTable
ALTER TABLE "BehavioralQuestion" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- Backfill published questions
UPDATE "BehavioralQuestion" SET "publishedAt" = "createdAt" WHERE "isPublished" = true;

-- CreateIndex
CREATE INDEX "BehavioralQuestion_publishedAt_idx" ON "BehavioralQuestion"("publishedAt");
