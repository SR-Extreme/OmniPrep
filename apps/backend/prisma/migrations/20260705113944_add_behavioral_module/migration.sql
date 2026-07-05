-- CreateEnum
CREATE TYPE "BehavioralPhaseType" AS ENUM ('INTRODUCTION', 'ICE_BREAKER', 'RESUME_DEEP_DIVE', 'CORE_BEHAVIORAL', 'COMPANY_VALUES', 'CANDIDATE_QUESTIONS', 'WRAP_UP');

-- CreateEnum
CREATE TYPE "BehavioralSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "BehavioralQuestion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "phases" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BehavioralQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehavioralSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "resumeFileName" TEXT NOT NULL,
    "resumeMimeType" TEXT NOT NULL,
    "resumeText" TEXT NOT NULL,
    "currentPhaseIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "BehavioralSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BehavioralSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehavioralTurn" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "phaseType" "BehavioralPhaseType" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "questionIndexInPhase" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "candidateAnswerText" TEXT,
    "interviewerReplyText" TEXT,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "BehavioralTurn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehavioralEvaluation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "evaluationMetrics" JSONB NOT NULL,
    "strongestAnswer" JSONB NOT NULL,
    "weakestAnswer" JSONB NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "suggestions" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BehavioralEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BehavioralQuestion_slug_key" ON "BehavioralQuestion"("slug");

-- CreateIndex
CREATE INDEX "BehavioralQuestion_companyName_idx" ON "BehavioralQuestion"("companyName");

-- CreateIndex
CREATE INDEX "BehavioralQuestion_roleName_idx" ON "BehavioralQuestion"("roleName");

-- CreateIndex
CREATE INDEX "BehavioralQuestion_companyName_roleName_idx" ON "BehavioralQuestion"("companyName", "roleName");

-- CreateIndex
CREATE INDEX "BehavioralQuestion_difficulty_idx" ON "BehavioralQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "BehavioralQuestion_isPublished_idx" ON "BehavioralQuestion"("isPublished");

-- CreateIndex
CREATE INDEX "BehavioralSession_userId_idx" ON "BehavioralSession"("userId");

-- CreateIndex
CREATE INDEX "BehavioralSession_questionId_idx" ON "BehavioralSession"("questionId");

-- CreateIndex
CREATE INDEX "BehavioralSession_status_idx" ON "BehavioralSession"("status");

-- CreateIndex
CREATE INDEX "BehavioralSession_userId_questionId_idx" ON "BehavioralSession"("userId", "questionId");

-- CreateIndex
CREATE INDEX "BehavioralSession_createdAt_idx" ON "BehavioralSession"("createdAt");

-- CreateIndex
CREATE INDEX "BehavioralTurn_sessionId_idx" ON "BehavioralTurn"("sessionId");

-- CreateIndex
CREATE INDEX "BehavioralTurn_phaseType_idx" ON "BehavioralTurn"("phaseType");

-- CreateIndex
CREATE INDEX "BehavioralTurn_sessionId_phaseType_idx" ON "BehavioralTurn"("sessionId", "phaseType");

-- CreateIndex
CREATE UNIQUE INDEX "BehavioralTurn_sessionId_orderIndex_key" ON "BehavioralTurn"("sessionId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "BehavioralTurn_sessionId_phaseType_questionIndexInPhase_key" ON "BehavioralTurn"("sessionId", "phaseType", "questionIndexInPhase");

-- CreateIndex
CREATE UNIQUE INDEX "BehavioralEvaluation_sessionId_key" ON "BehavioralEvaluation"("sessionId");

-- CreateIndex
CREATE INDEX "BehavioralEvaluation_userId_idx" ON "BehavioralEvaluation"("userId");

-- CreateIndex
CREATE INDEX "BehavioralEvaluation_questionId_idx" ON "BehavioralEvaluation"("questionId");

-- CreateIndex
CREATE INDEX "BehavioralEvaluation_userId_questionId_idx" ON "BehavioralEvaluation"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "BehavioralSession" ADD CONSTRAINT "BehavioralSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehavioralSession" ADD CONSTRAINT "BehavioralSession_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BehavioralQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehavioralTurn" ADD CONSTRAINT "BehavioralTurn_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BehavioralSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehavioralEvaluation" ADD CONSTRAINT "BehavioralEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BehavioralSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehavioralEvaluation" ADD CONSTRAINT "BehavioralEvaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehavioralEvaluation" ADD CONSTRAINT "BehavioralEvaluation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BehavioralQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
