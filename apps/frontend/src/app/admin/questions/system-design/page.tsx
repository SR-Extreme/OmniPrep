'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QuestionListCard } from '@/components/admin/QuestionListCard';
import { Button } from '@/components/ui/button';
import {
    deleteAdminSystemDesignQuestion,
    listAdminSystemDesignQuestions,
    publishAdminSystemDesignQuestion,
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { AdminQuestionListItem, QuestionListStatus } from '@/types/admin';

const PAGE_SIZE = 20;

function parseStatus(value: string | null): QuestionListStatus {
    return value === 'draft' ? 'draft' : 'published';
}

export default function AdminSystemDesignQuestionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();

    const status = parseStatus(searchParams.get('status'));
    const [hydrated, setHydrated] = useState(false);
    const [questions, setQuestions] = useState<AdminQuestionListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [busyAction, setBusyAction] = useState<'publish' | 'delete' | null>(null);

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) {
            return;
        }
        if (!accessToken) {
            router.replace('/login');
            return;
        }
        if (user && user.role !== 'ADMIN') {
            router.replace('/');
        }
    }, [hydrated, accessToken, user, router]);

    useEffect(() => {
        setPage(1);
    }, [status]);

    useEffect(() => {
        if (!hydrated || !accessToken || user?.role !== 'ADMIN') {
            return;
        }

        let cancelled = false;

        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await listAdminSystemDesignQuestions(
                    accessToken as string,
                    { status, page, limit: PAGE_SIZE },
                );

                if (cancelled) {
                    return;
                }

                setQuestions(result.questions);
                setTotalPages(result.pagination.totalPages);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load system design questions',
                    );
                }
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
    }, [hydrated, accessToken, user, status, page]);

    function setStatus(next: QuestionListStatus) {
        router.replace(`/admin/questions/system-design?status=${next}`);
    }

    async function handlePublish(question: AdminQuestionListItem) {
        if (!accessToken) {
            return;
        }

        setBusyId(question.id);
        setBusyAction('publish');
        setError(null);

        try {
            await publishAdminSystemDesignQuestion(accessToken, question.id, {
                isPublished: true,
            });
            setQuestions((current) => current.filter((row) => row.id !== question.id));
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : 'Failed to publish question',
            );
        } finally {
            setBusyId(null);
            setBusyAction(null);
        }
    }

    async function handleDelete(question: AdminQuestionListItem) {
        if (!accessToken) {
            return;
        }

        setBusyId(question.id);
        setBusyAction('delete');
        setError(null);

        try {
            await deleteAdminSystemDesignQuestion(accessToken, question.id);
            setQuestions((current) => current.filter((row) => row.id !== question.id));
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : 'Failed to delete question',
            );
        } finally {
            setBusyId(null);
            setBusyAction(null);
        }
    }

    if (!hydrated || !accessToken || !user || user.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                Loading…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <header className="nav-header">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                                O
                            </span>
                            <span className="text-base font-semibold tracking-tight text-zinc-900">
                                OmniPrep
                            </span>
                        </Link>
                        <nav className="hidden items-center gap-1 sm:flex">
                            <Link
                                href="/admin/questions"
                                className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                            >
                                Questions
                            </Link>
                            <span className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900">
                                System Design
                            </span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/create/system-design"
                            className="btn-primary !py-2"
                        >
                            Create SD
                        </Link>
                        <button
                            type="button"
                            onClick={() => logout()}
                            disabled={authLoading}
                            className="btn-secondary !py-2"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[220px_1fr]">
                <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-3 shadow-soft">
                    <p className="section-label px-2 pb-2">Status</p>
                    <div className="space-y-1">
                        {(['published', 'draft'] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setStatus(value)}
                                className={cn(
                                    'w-full rounded-md px-3 py-2 text-left text-sm font-medium capitalize',
                                    status === value
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'text-zinc-600 hover:bg-zinc-50',
                                )}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="space-y-4">
                    <div>
                        <p className="section-label">System Design questions</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 capitalize">
                            {status}
                        </h1>
                    </div>

                    {error ? (
                        <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </p>
                    ) : null}

                    {isLoading ? (
                        <p className="text-sm text-zinc-500">Loading questions…</p>
                    ) : questions.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
                            No {status} system design questions yet.
                        </p>
                    ) : (
                        questions.map((question) => (
                            <QuestionListCard
                                key={question.id}
                                question={question}
                                mode={status}
                                onEdit={
                                    status === 'draft'
                                        ? (q) =>
                                              router.push(
                                                  `/admin/create/system-design?id=${encodeURIComponent(q.id)}`,
                                              )
                                        : undefined
                                }
                                onPublish={
                                    status === 'draft' ? handlePublish : undefined
                                }
                                onDelete={handleDelete}
                                isPublishing={
                                    busyId === question.id && busyAction === 'publish'
                                }
                                isDeleting={
                                    busyId === question.id && busyAction === 'delete'
                                }
                            />
                        ))
                    )}

                    {totalPages > 1 ? (
                        <div className="flex items-center justify-between pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={page <= 1 || isLoading}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Previous
                            </Button>
                            <p className="text-sm text-zinc-500">
                                Page {page} of {totalPages}
                            </p>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={page >= totalPages || isLoading}
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                            >
                                Next
                            </Button>
                        </div>
                    ) : null}
                </section>
            </main>
        </div>
    );
}