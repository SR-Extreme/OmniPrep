-- AlterTable
ALTER TABLE "SystemDesignQuestion" ADD COLUMN     "scaleFactors" TEXT[] DEFAULT ARRAY[]::TEXT[];
