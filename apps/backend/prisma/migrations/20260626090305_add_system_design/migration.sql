-- CreateTable
CREATE TABLE "SystemDesignQuestion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "deliverables" JSONB NOT NULL,
    "constraints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" "Difficulty" NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evaluationMetrics" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemDesignQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemDesignSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "textAnswer" TEXT,
    "diagramUrl" TEXT,
    "followUpQuestions" JSONB,
    "followUpAnswers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemDesignSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemDesignEvaluation" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "metricScores" JSONB NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "followUpQuestions" JSONB NOT NULL,
    "feedback" TEXT NOT NULL,
    "suggestions" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemDesignEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemDesignQuestion_slug_key" ON "SystemDesignQuestion"("slug");

-- CreateIndex
CREATE INDEX "SystemDesignQuestion_difficulty_idx" ON "SystemDesignQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "SystemDesignQuestion_isPublished_idx" ON "SystemDesignQuestion"("isPublished");

-- CreateIndex
CREATE INDEX "SystemDesignSubmission_userId_idx" ON "SystemDesignSubmission"("userId");

-- CreateIndex
CREATE INDEX "SystemDesignSubmission_questionId_idx" ON "SystemDesignSubmission"("questionId");

-- CreateIndex
CREATE INDEX "SystemDesignSubmission_userId_questionId_idx" ON "SystemDesignSubmission"("userId", "questionId");

-- CreateIndex
CREATE INDEX "SystemDesignSubmission_createdAt_idx" ON "SystemDesignSubmission"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemDesignEvaluation_submissionId_key" ON "SystemDesignEvaluation"("submissionId");

-- CreateIndex
CREATE INDEX "SystemDesignEvaluation_userId_idx" ON "SystemDesignEvaluation"("userId");

-- CreateIndex
CREATE INDEX "SystemDesignEvaluation_questionId_idx" ON "SystemDesignEvaluation"("questionId");

-- CreateIndex
CREATE INDEX "SystemDesignEvaluation_userId_questionId_idx" ON "SystemDesignEvaluation"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "SystemDesignSubmission" ADD CONSTRAINT "SystemDesignSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemDesignSubmission" ADD CONSTRAINT "SystemDesignSubmission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SystemDesignQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemDesignEvaluation" ADD CONSTRAINT "SystemDesignEvaluation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "SystemDesignSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemDesignEvaluation" ADD CONSTRAINT "SystemDesignEvaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemDesignEvaluation" ADD CONSTRAINT "SystemDesignEvaluation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SystemDesignQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
