'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import {
    AdminQuestionFilters,
    type AdminTopicFilters,
} from '@/components/admin/AdminQuestionFilters';
import { QuestionListCard } from '@/components/admin/QuestionListCard';
import { AdminStatusFilter } from '@/components/admin/AdminStatusFilter';
import {
    AdminEmptyState,
    AdminErrorAlert,
    AdminInlineLoading,
    AdminAuthGate,
    AdminPageHeader,
    AdminPageShell,
} from '@/components/admin/AdminPageShell';
import { Button } from '@/components/ui/button';
import {
    deleteAdminSystemDesignQuestion,
    listAdminSystemDesignQuestions,
    publishAdminSystemDesignQuestion,
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import type { AdminQuestionListItem, QuestionListStatus } from '@/types/admin';
import type { Difficulty } from '@/types/dsa';

const PAGE_SIZE = 20;

function parseStatus(value: string | null): QuestionListStatus {
    return value === 'draft' ? 'draft' : 'published';
}

function AdminSystemDesignQuestionsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, accessToken, isReady: hydrated } = useAuthStore();

    const status = parseStatus(searchParams.get('status'));
    const [questions, setQuestions] = useState<AdminQuestionListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [busyAction, setBusyAction] = useState<'publish' | 'delete' | null>(null);

    const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [appliedFilters, setAppliedFilters] = useState<AdminTopicFilters>({});


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
                    {
                        status,
                        ...appliedFilters,
                        page,
                        limit: PAGE_SIZE,
                    },
                );

                if (cancelled) {
                    return;
                }

                setQuestions(result.questions);
                setTotalPages(result.pagination.totalPages);
                setAvailableTopics(result.filterOptions?.topics ?? []);
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
    }, [hydrated, accessToken, user, status, page, appliedFilters]);

    function setStatus(next: QuestionListStatus) {
        router.replace(`/admin/questions/system-design?status=${next}`);
    }

    function handleFilterSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setAppliedFilters({
            difficulty: difficulty || undefined,
            topics: selectedTopics.length > 0 ? selectedTopics : undefined,
            search: search.trim() || undefined,
        });
        setPage(1);
    }

    function handleClearFilters() {
        setDifficulty('');
        setSelectedTopics([]);
        setSearch('');
        setAppliedFilters({});
        setPage(1);
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
        return <AdminAuthGate hydrated={hydrated} />;
    }

    return (
        <AdminPageShell>
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                <AdminStatusFilter status={status} onChange={setStatus} />

                <section className="space-y-4">
                    <AdminPageHeader
                        label="System design questions"
                        title={status === 'published' ? 'Published' : 'Draft'}
                        description="Browse, edit, publish, or delete system design interview questions."
                    />

                    <AdminQuestionFilters
                        variant="topic"
                        difficulty={difficulty}
                        selectedTopics={selectedTopics}
                        availableTopics={availableTopics}
                        search={search}
                        onDifficultyChange={setDifficulty}
                        onTopicsChange={setSelectedTopics}
                        onSearchChange={setSearch}
                        onSubmit={handleFilterSubmit}
                        onClear={handleClearFilters}
                    />

                    {error ? <AdminErrorAlert message={error} /> : null}

                    {isLoading ? (
                        <AdminInlineLoading label="Loading questions…" />
                    ) : questions.length === 0 ? (
                        <AdminEmptyState
                            message={`No ${status} system design questions yet.`}
                        />
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
                        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-soft sm:px-5">
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
            </div>
        </AdminPageShell>
    );
}

export default function AdminSystemDesignQuestionsPage() {
    return (
        <Suspense fallback={<AdminAuthGate hydrated={false} />}>
            <AdminSystemDesignQuestionsPageContent />
        </Suspense>
    );
}
