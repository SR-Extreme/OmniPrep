"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { listProblems } from '@/lib/api/problems';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { DIFFICULTIES, type Difficulty, type ListProblemsQuery, type ProblemListItem } from '@/types/dsa';

const PAGE_SIZE = 20;

type AppliedFilters = Pick<ListProblemsQuery, 'difficulty' | 'topic' | 'search'>; //these 3 fields from LPQ will be new type for AF

function difficultyBadgeClass(difficulty: Difficulty): string {
    const base = 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset';

    switch (difficulty) {
        case 'EASY':
            return `${base} bg-emerald-500/10 text-emerald-400 ring-emerald-500/30`;
        case 'MEDIUM':
            return `${base} bg-amber-500/10 text-amber-400 ring-amber-500/30`;
        case 'HARD':
            return `${base} bg-rose-500/10 text-rose-400 ring-rose-500/30`;
    }
}

function formatAcceptance(rate: number | null): string {
    if (rate == null) {
        return '-';
    }

    return `${(rate * 100).toFixed(2)}%`;
}

export default function ProblemsPage() {
    const router = useRouter();
    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [problems, setProblems] = useState<ProblemListItem[]>([]);
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
    }, [hydrated, accessToken, router]);

    useEffect(() => {
        if (!hydrated || !accessToken) {
            return;
        }

        let cancelled = false;

        async function loadProblems() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await listProblems(accessToken as string, {
                    ...appliedFilters,
                    page,
                    limit: PAGE_SIZE,
                });

                if (cancelled) {
                    return;
                }

                setProblems(result.problems);
                setTotalPages(result.pagination.totalPages);
                setTotal(result.pagination.total);
            } catch (err) {
                if (cancelled) {
                    return;
                }
                const message = err instanceof ApiError ? err.message : 'Failed to load problems';
                setError(message);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadProblems();

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
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
                Loading…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-lg font-bold tracking-tight text-white">
                            OmniPrep
                        </Link>
                        <nav className="hidden sm:block">
                            <span className="text-sm font-medium text-emerald-400">
                                Problems
                            </span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <p className="hidden text-sm text-slate-400 md:block">
                                {user.name}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => logout()}
                            disabled={authLoading}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-60"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Problem Set
                    </h1>
                    <p className="mt-2 text-slate-400">
                        Practice DSA problems with sample runs and full submissions.
                    </p>
                </div>

                {/*Filter section*/}
                <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <form
                        onSubmit={handleFilterSubmit}
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                    >
                        <div>
                            <label
                                htmlFor="difficulty"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Difficulty
                            </label>
                            <select
                                id="difficulty"
                                value={difficulty}
                                onChange={(e) =>
                                    setDifficulty(e.target.value as Difficulty | '')
                                }
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
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
                                className="block text-sm font-medium text-slate-300"
                            >
                                Topic
                            </label>
                            <input
                                id="topic"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Array"
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label
                                htmlFor="search"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Search
                            </label>
                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title or slug"
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">
                            <button
                                type="submit"
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                            >
                                Apply filters
                            </button>
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </section>

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            {total} problem{total === 1 ? '' : 's'}
                        </p>
                        {isLoading && (
                            <p className="text-sm text-slate-500">Loading…</p>
                        )}
                    </div>

                    {error && (
                        <div
                            className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {!isLoading && problems.length === 0 && !error && (
                        <div className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-12 text-center">
                            <p className="text-lg font-medium text-white">No problems found</p>
                            <p className="mt-2 text-sm text-slate-400">
                                Try adjusting your filters or search query.
                            </p>
                        </div>
                    )}

                    {/*Problem list cards*/}
                    <ul className="space-y-3">
                        {problems.map((problem) => (
                            <li key={problem.id}>
                                <Link
                                    href={`/problems/${problem.slug}`}
                                    className="group block rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-500/40 hover:bg-slate-900/80"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="truncate text-lg font-semibold text-white group-hover:text-emerald-300">
                                                    {problem.title}
                                                </h2>
                                                <span className={difficultyBadgeClass(problem.difficulty)}>
                                                    {problem.difficulty.charAt(0) +
                                                        problem.difficulty.slice(1).toLowerCase()}
                                                </span>
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-500">
                                                {problem.slug}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center gap-4 text-sm">
                                            <span className="text-slate-400">
                                                Acceptance{' '}
                                                <span className="font-medium text-slate-200">
                                                    {formatAcceptance(problem.acceptanceRate)}
                                                </span>
                                            </span>
                                            {problem.topics.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {problem.topics.slice(0, 3).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {problem.topics.length > 3 && (
                                                        <span className="text-xs text-slate-500">
                                                            +{problem.topics.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/*page numbering*/}
                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1 || isLoading}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-slate-400">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages || isLoading}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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