'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import {
    AdminQuestionFilters,
    type AdminBehavioralFilters,
} from '@/components/admin/AdminQuestionFilters';
import { QuestionListCard } from '@/components/admin/QuestionListCard';
import { AdminStatusFilter } from '@/components/admin/AdminStatusFilter';
import {
    AdminEmptyState,
    AdminErrorAlert,
    AdminInlineLoading,
    AdminLoading,
    AdminPageHeader,
    AdminPageShell,
} from '@/components/admin/AdminPageShell';
import { Button } from '@/components/ui/button';
import {
    deleteAdminBehavioralQuestion,
    listAdminBehavioralQuestions,
    publishAdminBehavioralQuestion,
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import type { AdminQuestionListItem, QuestionListStatus } from '@/types/admin';
import type { Difficulty } from '@/types/dsa';

const PAGE_SIZE = 20;

function parseStatus(value: string | null): QuestionListStatus {
    return value === 'draft' ? 'draft' : 'published';
}

export default function AdminBehavioralQuestionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, accessToken } = useAuthStore();

    const status = parseStatus(searchParams.get('status'));
    const [hydrated, setHydrated] = useState(false);
    const [questions, setQuestions] = useState<AdminQuestionListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [busyAction, setBusyAction] = useState<'publish' | 'delete' | null>(null);

    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
    const [search, setSearch] = useState('');
    const [companies, setCompanies] = useState<string[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [appliedFilters, setAppliedFilters] = useState<AdminBehavioralFilters>(
        {},
    );

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
                const result = await listAdminBehavioralQuestions(
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
                setCompanies(result.filterOptions?.companies ?? []);
                setRoles(result.filterOptions?.roles ?? []);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load behavioral questions',
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
        router.replace(`/admin/questions/behavioral?status=${next}`);
    }

    function handleFilterSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setAppliedFilters({
            company: company || undefined,
            role: role || undefined,
            difficulty: difficulty || undefined,
            search: search.trim() || undefined,
        });
        setPage(1);
    }

    function handleClearFilters() {
        setCompany('');
        setRole('');
        setDifficulty('');
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
            await publishAdminBehavioralQuestion(accessToken, question.id, {
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
            await deleteAdminBehavioralQuestion(accessToken, question.id);
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
        return <AdminLoading />;
    }

    return (
        <AdminPageShell>
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                <AdminStatusFilter status={status} onChange={setStatus} />

                <section className="space-y-4">
                    <AdminPageHeader
                        label="Behavioral questions"
                        title={status === 'published' ? 'Published' : 'Draft'}
                        description="Browse, edit, publish, or delete behavioral interview questions."
                    />

                    <AdminQuestionFilters
                        variant="behavioral"
                        company={company}
                        role={role}
                        difficulty={difficulty}
                        search={search}
                        companies={companies}
                        roles={roles}
                        onCompanyChange={setCompany}
                        onRoleChange={setRole}
                        onDifficultyChange={setDifficulty}
                        onSearchChange={setSearch}
                        onSubmit={handleFilterSubmit}
                        onClear={handleClearFilters}
                    />

                    {error ? <AdminErrorAlert message={error} /> : null}

                    {isLoading ? (
                        <AdminInlineLoading label="Loading questions…" />
                    ) : questions.length === 0 ? (
                        <AdminEmptyState
                            message={`No ${status} behavioral questions yet.`}
                        />
                    ) : (
                        questions.map((question) => (
                            <QuestionListCard
                                key={question.id}
                                question={question}
                                mode={status}
                                metricLabel="Sessions"
                                onEdit={
                                    status === 'draft'
                                        ? (q) =>
                                              router.push(
                                                  `/admin/create/behavioral?id=${encodeURIComponent(q.id)}`,
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
