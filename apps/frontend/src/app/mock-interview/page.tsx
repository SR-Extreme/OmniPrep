'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MockInterviewHero } from '@/components/mock-interview/MockInterviewHero';
import { MockInterviewList } from '@/components/mock-interview/MockInterviewList';
import {
    MockInterviewStats,
    type MockInterviewStatsData,
} from '@/components/mock-interview/MockInterviewStats';
import { PracticeAuthGate } from '@/components/practice/PracticeListShell';
import { PremiumRequiredModal } from '@/components/PremiumRequiredModal';
import { ApiError } from '@/lib/api/client';
import {
    createMockInterview,
    listMyMockInterviews,
    startMockInterview,
} from '@/lib/api/mock-interview';
import { getProfile } from '@/lib/api/profile';
import { useAuthStore } from '@/store/authStore';
import type { MockInterviewListItem } from '@/types/mock-interview';

const PAGE_SIZE = 20;
const STATS_PAGE_SIZE = 50;

const EMPTY_STATS: MockInterviewStatsData = {
    totalInterviews: 0,
    completed: 0,
    averageScore: null,
};

function isPremiumRequiredError(err: unknown): boolean {
    return (
        err instanceof ApiError &&
        err.status === 403 &&
        /premium/i.test(err.message)
    );
}

async function loadInterviewStats(
    accessToken: string,
): Promise<MockInterviewStatsData> {
    const [profile, firstPage] = await Promise.all([
        getProfile(accessToken),
        listMyMockInterviews(accessToken, { page: 1, limit: STATS_PAGE_SIZE }),
    ]);

    let completed = firstPage.interviews.filter(
        (interview) => interview.status === 'COMPLETED',
    ).length;

    const totalPages = firstPage.pagination.totalPages;
    if (totalPages > 1) {
        const remaining = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
                listMyMockInterviews(accessToken, {
                    page: index + 2,
                    limit: STATS_PAGE_SIZE,
                }),
            ),
        );
        for (const pageResult of remaining) {
            completed += pageResult.interviews.filter(
                (interview) => interview.status === 'COMPLETED',
            ).length;
        }
    }

    const totalInterviews = firstPage.pagination.total;
    const averageScore = profile.averageInterviewScore;

    return {
        totalInterviews,
        completed,
        averageScore,
    };
}

export default function MockInterviewPage() {
    const router = useRouter();
    const { user, accessToken, isReady: hydrated } = useAuthStore();

    const [interviews, setInterviews] = useState<MockInterviewListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<MockInterviewStatsData>(EMPTY_STATS);
    const [statsLoading, setStatsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [openingId, setOpeningId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [premiumModalOpen, setPremiumModalOpen] = useState(false);


    useEffect(() => {
        if (!hydrated) {
            return;
        }
        if (!accessToken) {
            router.replace('/login');
        }
    }, [hydrated, accessToken, router]);

    useEffect(() => {
        if (!hydrated || !accessToken) {
            return;
        }

        let cancelled = false;

        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await listMyMockInterviews(accessToken as string, {
                    page,
                    limit: PAGE_SIZE,
                });
                if (cancelled) {
                    return;
                }
                setInterviews(result.interviews);
                setTotalPages(result.pagination.totalPages);
                setTotal(result.pagination.total);
            } catch (err) {
                if (cancelled) {
                    return;
                }
                setError(
                    err instanceof ApiError
                        ? err.message
                        : 'Failed to load mock interviews',
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, page]);

    useEffect(() => {
        if (!hydrated || !accessToken) {
            return;
        }

        let cancelled = false;

        async function loadStats() {
            setStatsLoading(true);
            try {
                const result = await loadInterviewStats(accessToken as string);
                if (!cancelled) {
                    setStats(result);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setStats(EMPTY_STATS);
                }
            } finally {
                if (!cancelled) {
                    setStatsLoading(false);
                }
            }
        }

        void loadStats();
        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken]);

    async function handleCreate() {
        if (!accessToken) {
            return;
        }

        if (!user?.isPremium) {
            setPremiumModalOpen(true);
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const created = await createMockInterview(accessToken);
            const started = await startMockInterview(
                accessToken,
                created.interview.id,
            );
            router.push(`/mock-interview/${started.interview.id}`);
        } catch (err) {
            if (isPremiumRequiredError(err)) {
                setPremiumModalOpen(true);
            } else {
                setError(
                    err instanceof ApiError
                        ? err.message
                        : 'Failed to start mock interview',
                );
            }
            setIsCreating(false);
        }
    }

    async function handleOpen(interview: MockInterviewListItem) {
        if (!accessToken) {
            return;
        }

        if (interview.status === 'NOT_STARTED' && !user?.isPremium) {
            setPremiumModalOpen(true);
            return;
        }

        setOpeningId(interview.id);
        setError(null);

        try {
            if (interview.status === 'NOT_STARTED') {
                const started = await startMockInterview(accessToken, interview.id);
                router.push(`/mock-interview/${started.interview.id}`);
                return;
            }
            router.push(`/mock-interview/${interview.id}`);
        } catch (err) {
            if (isPremiumRequiredError(err)) {
                setPremiumModalOpen(true);
            } else {
                setError(
                    err instanceof ApiError
                        ? err.message
                        : 'Failed to open mock interview',
                );
            }
            setOpeningId(null);
        }
    }

    if (!hydrated || !accessToken) {
        return <PracticeAuthGate hydrated={hydrated} />;
    }

    return (
        <div className="overflow-x-hidden bg-zinc-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-[calc(100svh-5rem)] flex-col justify-center py-4 sm:py-5 lg:min-h-[calc(100svh-5.5rem)] lg:py-6">
                    <MockInterviewHero
                        isCreating={isCreating}
                        isPremium={Boolean(user?.isPremium)}
                        onStart={() => void handleCreate()}
                    />
                </div>

                {error ? (
                    <div
                        className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                        role="alert"
                    >
                        {error}
                    </div>
                ) : null}

                <div className="border-t border-zinc-200/80 py-8 sm:py-10">
                    <MockInterviewStats stats={stats} isLoading={statsLoading} />
                </div>

                <div className="border-t border-zinc-200/80 pb-12 pt-8 sm:pb-16 sm:pt-10">
                    <MockInterviewList
                        interviews={interviews}
                        total={total}
                        page={page}
                        totalPages={totalPages}
                        isLoading={isLoading}
                        openingId={openingId}
                        onOpen={(interview) => void handleOpen(interview)}
                        onPageChange={setPage}
                    />
                </div>
            </div>

            <PremiumRequiredModal
                open={premiumModalOpen}
                onOpenChange={setPremiumModalOpen}
            />
        </div>
    );
}
