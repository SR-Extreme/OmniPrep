import { prisma } from '../../config/db.js';
import { getUserPremiumStatus } from '../../middleware/premium.middleware.js';
import type { AdminUserListItem } from '../../types/admin.types.js';
import type { ListAdminUsersQuery } from './admin.validation.js';

export class AdminUsersError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'FORBIDDEN'
            | 'INVALID_STATE',
    ) {
        super(message);
        this.name = 'AdminUsersError';
    }
}

export interface AdminUserListResult {
    users: AdminUserListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AdminProfileResponse {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phoneNo: string | null;
    createdAt: Date;
    recentLogin: Date | null;
}

export async function listAdminUsers(
    query: ListAdminUsersQuery,
): Promise<AdminUserListResult> {
    const search = query.search?.trim();

    const where = {
        role: 'CANDIDATE' as const,
        ...(search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }
            : {}),
    };

    const [total, rows] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isPremium: true,
                premiumTill: true,
                averageInterviewScore: true,
                createdAt: true,
                recentLogin: true,
            },
            // Premium users first, then free then by date
            orderBy: [
                { isPremium: 'desc' },
                { createdAt: 'desc' },
            ],
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        }),
    ]);

    const now = Date.now();

    return {
        users: rows.map((row) => {
            const isPremiumActive =
                row.isPremium
                && row.premiumTill != null
                && row.premiumTill.getTime() > now;

            return {
                id: row.id,
                name: row.name,
                email: row.email,
                image: row.image,
                isPremium: isPremiumActive,
                averageInterviewScore: row.averageInterviewScore,
                createdAt: row.createdAt,
                recentLogin: row.recentLogin,
            };
        }),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / query.limit)),
        },
    };
}

export async function getAdminProfile(
    adminUserId: string,
): Promise<AdminProfileResponse> {
    const user = await prisma.user.findUnique({
        where: { id: adminUserId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            phoneNo: true,
            createdAt: true,
            recentLogin: true,
        },
    });

    if (!user || user.role !== 'ADMIN') {
        throw new AdminUsersError('Admin profile not found', 'NOT_FOUND');
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        phoneNo: user.phoneNo,
        createdAt: user.createdAt,
        recentLogin: user.recentLogin,
    };
}

export async function deleteAdminUser(
    actorAdminId: string,
    targetUserId: string,
): Promise<void> {
    if (actorAdminId === targetUserId) {
        throw new AdminUsersError(
            'You cannot delete your own account',
            'FORBIDDEN',
        );
    }

    const target = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, role: true },
    });

    if (!target) {
        throw new AdminUsersError('User not found', 'NOT_FOUND');
    }

    if (target.role === 'ADMIN') {
        throw new AdminUsersError(
            'Admin accounts cannot be deleted from user management',
            'FORBIDDEN',
        );
    }

    await prisma.user.delete({
        where: { id: targetUserId },
    });
}