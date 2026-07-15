'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
    createMockInterview,
    listMyMockInterviews,
    startMockInterview,
} from '@/lib/api/mock-interview';
import { useAuthStore } from '@/store/authStore';
import {
    getSectionLabel,
    type MockInterviewListItem,
    type MockInterviewStatus,
} from '@/types/mock-interview';

const PAGE_SIZE = 20;

function statusBadge(status: MockInterviewStatus): {
    label: string;
    className: string;
} {
    switch (status) {
        case 'NOT_STARTED':
            return {
                label: 'Not started',
                className: 'bg-zinc-100 text-zinc-600 ring-zinc-500/15',
            };
        case 'IN_PROGRESS':
            return {
                label: 'In progress',
                className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            };
        case 'AWAITING_FINAL_SUBMIT':
            return {
                label: 'Awaiting Final Submit',
                className: 'bg-amber-50 text-amber-800 ring-amber-600/20',
            };
        case 'COMPLETED':
            return {
                label: 'Completed',
                className: 'bg-sky-50 text-sky-800 ring-sky-600/20',
            };
        default:
            return {
                label: status,
                className: 'bg-zinc-100 text-zinc-600 ring-zinc-500/15',
            };
    }
}

function actionLabel(status: MockInterviewStatus): string {
    switch (status) {
        case 'NOT_STARTED':
            return 'Start';
        case 'IN_PROGRESS':
            return 'Resume';
        case 'AWAITING_FINAL_SUBMIT':
            return 'Finalize';
        case 'COMPLETED':
            return 'View report';
        default:
            return 'Open';
    }
}

export default function MockInterviewPage() {
    const router = useRouter();
    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [interviews, setInterviews] = useState<MockInterviewListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [openingId, setOpeningId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setHydrated(true);
    }, []);

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

    async function handleCreate() {
        if (!accessToken) {
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
            setError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to start mock interview',
            );
            setIsCreating(false);
        }
    }

    async function handleOpen(interview: MockInterviewListItem) {
        if (!accessToken) {
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
            setError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to open mock interview',
            );
            setOpeningId(null);
        }
    }

    if (!hydrated || !accessToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <header className="nav-header">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3.5">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                        <Link href="/" className="flex shrink-0 items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                                O
                            </span>
                            <span className="hidden text-base font-semibold tracking-tight text-zinc-900 sm:inline">
                                OmniPrep
                            </span>
                        </Link>
                        <nav className="flex min-w-0 items-center gap-2 text-sm">
                            <span className="font-medium text-emerald-700">
                                Mock Interview
                            </span>
                        </nav>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        {user ? (
                            <p className="hidden text-sm text-zinc-500 md:block">
                                {user.name}
                            </p>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => void logout()}
                            disabled={authLoading}
                            className="btn-secondary !py-2"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
                <section className="card p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-2xl">
                            <p className="section-label">Full mock</p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                                Timed interview
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                                Three sequential sections — DSA, System Design, then
                                Behavioral. One hour per section. You cannot go back after
                                submitting a section. Evaluations run after each section
                                submit; the final hiring band and study plan come after the
                                interview.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn-primary"
                            disabled={isCreating}
                            onClick={() => void handleCreate()}
                        >
                            {isCreating ? 'Starting…' : 'Start new interview'}
                        </button>
                    </div>
                </section>

                {error ? (
                    <div
                        className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                        role="alert"
                    >
                        {error}
                    </div>
                ) : null}

                <section className="card overflow-hidden">
                    <div className="border-b border-zinc-200 px-5 py-4 sm:px-6">
                        <h2 className="text-base font-semibold text-zinc-900">
                            Your interviews
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            {total} total
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-zinc-500">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                            Loading…
                        </div>
                    ) : interviews.length === 0 ? (
                        <div className="px-5 py-16 text-center text-sm text-zinc-500 sm:px-6">
                            No mock interviews yet. Start one to begin.
                        </div>
                    ) : (
                        <ul className="divide-y divide-zinc-100">
                            {interviews.map((interview) => {
                                const badge = statusBadge(interview.status);
                                const busy = openingId === interview.id;

                                return (
                                    <li
                                        key={interview.id}
                                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-medium text-zinc-900">
                                                    Interview
                                                </p>
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.className}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Section:{' '}
                                                {getSectionLabel(interview.currentSection)}
                                                {' · '}
                                                Created{' '}
                                                {new Date(
                                                    interview.createdAt,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-secondary !py-2"
                                            disabled={busy}
                                            onClick={() => void handleOpen(interview)}
                                        >
                                            {busy
                                                ? 'Opening…'
                                                : actionLabel(interview.status)}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {totalPages > 1 ? (
                        <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 sm:px-6">
                            <button
                                type="button"
                                className="btn-ghost"
                                disabled={page <= 1 || isLoading}
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            >
                                Previous
                            </button>
                            <p className="text-xs text-zinc-500">
                                Page {page} of {totalPages}
                            </p>
                            <button
                                type="button"
                                className="btn-ghost"
                                disabled={page >= totalPages || isLoading}
                                onClick={() =>
                                    setPage((prev) => Math.min(totalPages, prev + 1))
                                }
                            >
                                Next
                            </button>
                        </div>
                    ) : null}
                </section>
            </main>
        </div>
    );
}