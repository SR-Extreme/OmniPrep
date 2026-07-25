"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { listSystemDesignQuestions } from '@/lib/api/system-design';
import { useAuthStore } from '@/store/authStore';
import { DIFFICULTIES, type Difficulty } from '@/types/dsa';
import type {
    ListSystemDesignQuestionsQuery,
    SystemDesignQuestionListItem,
} from '@/types/system-design';

const PAGE_SIZE = 20;

type AppliedFilters = Pick<ListSystemDesignQuestionsQuery, 'difficulty' | 'topic' | 'search'>;

function difficultyBadgeClass(difficulty: Difficulty): string {
    switch (difficulty) {
        case 'EASY':
            return 'badge-easy';
        case 'MEDIUM':
            return 'badge-medium';
        case 'HARD':
            return 'badge-hard';
    }
}

export default function SystemDesignPage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [questions, setQuestions] = useState<SystemDesignQuestionListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
    const [topic, setTopic] = useState('');
    const [search, setSearch] = useState('');
    const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});

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
    }, [hydrated, accessToken, router])

    useEffect(() => {
        if (!hydrated || !accessToken) {
            return;
        }

        let cancelled = false;

        async function loadQuestions() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await listSystemDesignQuestions(accessToken as string, {
                    ...appliedFilters,
                    page,
                    limit: PAGE_SIZE,
                });

                if (cancelled) {
                    return;
                }

                setQuestions(result.questions);
                setTotalPages(result.pagination.totalPages);
                setTotal(result.pagination.total);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                const message = err instanceof ApiError ? err.message : 'Failed to load system design questions';
                setError(message);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadQuestions();

        //return is immediately called if another effect runs or the component unmounts
        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, page, appliedFilters]);

    function handleFilterSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setAppliedFilters({
            difficulty: difficulty || undefined,
            topic: topic.trim() || undefined,
            search: search.trim() || undefined,
        });
        setPage(1);
    }

    function handleClearFilters() {
        setDifficulty('');
        setTopic('');
        setSearch('');
        setAppliedFilters({});
        setPage(1);
    }

    if (!hydrated || !accessToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                    Loading…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <main className="mx-auto max-w-6xl px-6 py-10">
                {/*Heading for SD*/}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                        System design
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                        Practice structured system design prompts with follow-up Q&amp;A and AI review.
                    </p>
                </div>

                {/*filters for selecting specific range of SD questions*/}
                <section className="card mb-8 p-5 sm:p-6">
                    <form
                        onSubmit={handleFilterSubmit}
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                    >
                        <div>
                            <label
                                htmlFor="difficulty"
                                className="block text-sm font-medium text-zinc-700"
                            >
                                Difficulty
                            </label>
                            <select
                                id="difficulty"
                                value={difficulty}
                                onChange={(e) =>
                                    setDifficulty(e.target.value as Difficulty | '')
                                }
                                className="select-base mt-1.5"
                            >
                                <option value="">All levels</option>
                                {DIFFICULTIES.map((level) => (
                                    <option key={level} value={level}>
                                        {level.charAt(0) + level.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="topic"
                                className="block text-sm font-medium text-zinc-700"
                            >
                                Topic
                            </label>
                            <input
                                id="topic"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Caching"
                                className="input-base mt-1.5"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label
                                htmlFor="search"
                                className="block text-sm font-medium text-zinc-700"
                            >
                                Search
                            </label>
                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title or slug"
                                className="input-base mt-1.5"
                            />
                        </div>
                        <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">
                            <button type="submit" className="btn-primary">
                                Apply filters
                            </button>
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="btn-secondary"
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </section>

                {/*questions list frontend and page slider UI*/}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-zinc-500">
                            {total} question{total === 1 ? '' : 's'}
                        </p>
                        {isLoading && (
                            <p className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                                Loading…
                            </p>
                        )}
                    </div>

                    {error && (
                        <div
                            className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {!isLoading && questions.length === 0 && !error && (
                        <div className="card px-6 py-14 text-center">
                            <p className="text-base font-medium text-zinc-900">No questions found</p>
                            <p className="mt-2 text-sm text-zinc-500">
                                Try adjusting your filters or search query.
                            </p>
                        </div>
                    )}

                    {/*question list*/}
                    <ul className="space-y-2">
                        {questions.map((question) => (
                            <li key={question.id}>
                                <Link
                                    href={`/system-design/${question.slug}`}
                                    className="group block rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-soft transition duration-150 hover:border-emerald-300 hover:shadow-card"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <h2 className="truncate text-base font-medium text-zinc-900 group-hover:text-emerald-700">
                                                    {question.title}
                                                </h2>
                                                <span className={difficultyBadgeClass(question.difficulty)}>
                                                    {question.difficulty.charAt(0) +
                                                        question.difficulty.slice(1).toLowerCase()}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-sm text-zinc-400">
                                                {question.slug}
                                            </p>
                                        </div>
                                        {question.topics.length > 0 && (
                                            <div className="flex shrink-0 flex-wrap gap-1.5">
                                                {question.topics.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {question.topics.length > 3 && (
                                                    <span className="text-xs text-zinc-400">
                                                        +{question.topics.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/*page number slider*/}
                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1 || isLoading}
                                className="btn-secondary"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-zinc-500">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages || isLoading}
                                className="btn-secondary"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

