-- CreateTable
CREATE TABLE "DSAEvaluation" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "correctnessScore" INTEGER NOT NULL,
    "efficiencyScore" INTEGER NOT NULL,
    "codeQualityScore" INTEGER NOT NULL,
    "explanationScore" INTEGER NOT NULL,
    "complexityAnalysis" JSONB NOT NULL,
    "followUpQuestions" JSONB NOT NULL,
    "feedback" TEXT NOT NULL,
    "suggestions" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DSAEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DSAEvaluation_submissionId_key" ON "DSAEvaluation"("submissionId");

-- CreateIndex
CREATE INDEX "DSAEvaluation_userId_idx" ON "DSAEvaluation"("userId");

-- CreateIndex
CREATE INDEX "DSAEvaluation_problemId_idx" ON "DSAEvaluation"("problemId");

-- CreateIndex
CREATE INDEX "DSAEvaluation_userId_problemId_idx" ON "DSAEvaluation"("userId", "problemId");

-- AddForeignKey
ALTER TABLE "DSAEvaluation" ADD CONSTRAINT "DSAEvaluation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DSAEvaluation" ADD CONSTRAINT "DSAEvaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DSAEvaluation" ADD CONSTRAINT "DSAEvaluation_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
