import type { Role } from '@prisma/client';
import { prisma } from '../config/db.js';
import { getUserPremiumStatus } from '../middleware/premium.middleware.js';

export type FreeAiReportSection = 'dsa' | 'system-design' | 'behavioral';

const SECTION_LABEL: Record<FreeAiReportSection, string> = {
    dsa: 'DSA',
    'system-design': 'System Design',
    behavioral: 'Behavioral',
};

export const FREE_AI_REPORT_LIMIT_CODE = 'FREE_AI_REPORT_LIMIT' as const;

export class FreeAiReportLimitError extends Error {
    readonly code = FREE_AI_REPORT_LIMIT_CODE;

    constructor(section: FreeAiReportSection) {
        super(
            `You've used your free AI report for ${SECTION_LABEL[section]}. Upgrade to Premium for unlimited AI reviews.`,
        );
        this.name = 'FreeAiReportLimitError';
    }
}

async function countSectionAiReports(
    userId: string,
    section: FreeAiReportSection,
): Promise<number> {
    switch (section) {
        case 'dsa':
            return prisma.dsaEvaluation.count({ where: { userId } });
        case 'system-design':
            return prisma.systemDesignEvaluation.count({ where: { userId } });
        case 'behavioral':
            return prisma.behavioralEvaluation.count({ where: { userId } });
    }
}

/**
 * Free users get 1 AI report per section (DSA / System Design / Behavioral).
 * Premium users and admins are unlimited. Call only when creating a *new*
 * evaluation (after the existing-evaluation short-circuit).
 */
export async function assertCanGenerateAiReport(
    userId: string,
    section: FreeAiReportSection,
    role?: Role,
): Promise<void> {
    if (role === 'ADMIN') {
        return;
    }

    const premium = await getUserPremiumStatus(userId);
    if (premium.isPremium) {
        return;
    }

    const used = await countSectionAiReports(userId, section);
    if (used >= 1) {
        throw new FreeAiReportLimitError(section);
    }
}
