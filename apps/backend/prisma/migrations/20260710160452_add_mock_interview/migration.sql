-- CreateEnum
CREATE TYPE "MockInterviewStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'AWAITING_FINAL_SUBMIT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MockInterviewSection" AS ENUM ('DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL');

-- CreateTable
CREATE TABLE "MockInterview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MockInterviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "currentSection" "MockInterviewSection" NOT NULL DEFAULT 'DSA',
    "startTime" TIMESTAMP(3),
    "dsaStartedAt" TIMESTAMP(3),
    "dsaSubmittedAt" TIMESTAMP(3),
    "systemDesignStartedAt" TIMESTAMP(3),
    "systemDesignSubmittedAt" TIMESTAMP(3),
    "behavioralStartedAt" TIMESTAMP(3),
    "behavioralSubmittedAt" TIMESTAMP(3),
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterviewDsaProblem" (
    "id" TEXT NOT NULL,
    "mockInterviewId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "submissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockInterviewDsaProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterviewSystemDesign" (
    "id" TEXT NOT NULL,
    "mockInterviewId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "submissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockInterviewSystemDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterviewBehavioral" (
    "id" TEXT NOT NULL,
    "mockInterviewId" TEXT NOT NULL,
    "roleName" TEXT,
    "questionId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockInterviewBehavioral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterviewStudyPlan" (
    "id" TEXT NOT NULL,
    "mockInterviewId" TEXT NOT NULL,
    "days" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockInterviewStudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MockInterview_userId_idx" ON "MockInterview"("userId");

-- CreateIndex
CREATE INDEX "MockInterview_status_idx" ON "MockInterview"("status");

-- CreateIndex
CREATE INDEX "MockInterview_userId_status_idx" ON "MockInterview"("userId", "status");

-- CreateIndex
CREATE INDEX "MockInterview_createdAt_idx" ON "MockInterview"("createdAt");

-- CreateIndex
CREATE INDEX "MockInterviewDsaProblem_mockInterviewId_idx" ON "MockInterviewDsaProblem"("mockInterviewId");

-- CreateIndex
CREATE INDEX "MockInterviewDsaProblem_problemId_idx" ON "MockInterviewDsaProblem"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewDsaProblem_mockInterviewId_slotIndex_key" ON "MockInterviewDsaProblem"("mockInterviewId", "slotIndex");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewDsaProblem_mockInterviewId_problemId_key" ON "MockInterviewDsaProblem"("mockInterviewId", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewSystemDesign_mockInterviewId_key" ON "MockInterviewSystemDesign"("mockInterviewId");

-- CreateIndex
CREATE INDEX "MockInterviewSystemDesign_questionId_idx" ON "MockInterviewSystemDesign"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewBehavioral_mockInterviewId_key" ON "MockInterviewBehavioral"("mockInterviewId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewBehavioral_sessionId_key" ON "MockInterviewBehavioral"("sessionId");

-- CreateIndex
CREATE INDEX "MockInterviewBehavioral_questionId_idx" ON "MockInterviewBehavioral"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewStudyPlan_mockInterviewId_key" ON "MockInterviewStudyPlan"("mockInterviewId");

-- CreateIndex
CREATE INDEX "MockInterviewStudyPlan_mockInterviewId_idx" ON "MockInterviewStudyPlan"("mockInterviewId");

-- AddForeignKey
ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewDsaProblem" ADD CONSTRAINT "MockInterviewDsaProblem_mockInterviewId_fkey" FOREIGN KEY ("mockInterviewId") REFERENCES "MockInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewDsaProblem" ADD CONSTRAINT "MockInterviewDsaProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewSystemDesign" ADD CONSTRAINT "MockInterviewSystemDesign_mockInterviewId_fkey" FOREIGN KEY ("mockInterviewId") REFERENCES "MockInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewSystemDesign" ADD CONSTRAINT "MockInterviewSystemDesign_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SystemDesignQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewBehavioral" ADD CONSTRAINT "MockInterviewBehavioral_mockInterviewId_fkey" FOREIGN KEY ("mockInterviewId") REFERENCES "MockInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewBehavioral" ADD CONSTRAINT "MockInterviewBehavioral_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BehavioralQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewBehavioral" ADD CONSTRAINT "MockInterviewBehavioral_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BehavioralSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewStudyPlan" ADD CONSTRAINT "MockInterviewStudyPlan_mockInterviewId_fkey" FOREIGN KEY ("mockInterviewId") REFERENCES "MockInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
