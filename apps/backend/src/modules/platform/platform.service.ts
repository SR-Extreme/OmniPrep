import { prisma } from '../../config/db.js';

export interface PlatformStats {
    totalUsers: number;
    totalDsaQuestions: number;
    totalSystemDesignQuestions: number;
    totalInterviewsTaken: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
    const [
        totalUsers,
        totalDsaQuestions,
        totalSystemDesignQuestions,
        totalInterviewsTaken,
    ] = await Promise.all([
        prisma.user.count({
            where: { role: 'CANDIDATE' },
        }),
        prisma.problem.count({
            where: { isPublished: true },
        }),
        prisma.systemDesignQuestion.count({
            where: { isPublished: true },
        }),
        prisma.mockInterview.count(),
    ]);

    return {
        totalUsers,
        totalDsaQuestions,
        totalSystemDesignQuestions,
        totalInterviewsTaken,
    };
}
