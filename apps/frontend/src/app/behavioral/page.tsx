"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { listBehavioralQuestions } from '@/lib/api/behavioral';
import { useAuthStore } from '@/store/authStore';
import { DIFFICULTIES, type Difficulty } from '@/types/dsa';
import type {
    BehavioralQuestionListItem,
    ListBehavioralQuestionsQuery,
} from '@/types/behavioral';

const PAGE_SIZE = 20;

type AppliedFilters = Pick<
    ListBehavioralQuestionsQuery,
    'company' | 'role' | 'difficulty' | 'search'
>;

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

export default function BehavioralPage() {
    const router = useRouter();
    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [questions, setQuestions] = useState<BehavioralQuestionListItem[]>([]);
    const [companies, setCompanies] = useState<string[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
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
        async function loadQuestions() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await listBehavioralQuestions(accessToken as string, {
                    ...appliedFilters,
                    page,
                    limit: PAGE_SIZE,
                });
                if (cancelled) {
                    return;
                }

                setQuestions(result.questions);
                setCompanies(result.filterOptions.companies);
                setRoles(result.filterOptions.roles);
                setTotalPages(result.pagination.totalPages);
                setTotal(result.pagination.total);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                const message =
                    err instanceof ApiError
                        ? err.message
                        : 'Failed to load behavioral questions';

                setError(message);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadQuestions();

        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, page, appliedFilters]);

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
                                href="/problems"
                                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                            >
                                Problems
                            </Link>
                            <Link
                                href="/system-design"
                                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                            >
                                System Design
                            </Link>
                            <Link
                                href="/behavioral"
                                className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900"
                            >
                                Behavioral
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        {user && (
                            <p className="hidden text-sm text-zinc-500 md:block">
                                {user.name}
                            </p>
                        )}
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

            <main className="mx-auto max-w-6xl px-6 py-10">
                {/*introduction*/}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                        Behavioral interviews
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                        Practice company- and role-specific behavioral mock interviews with resume-aware AI questions and on-demand review.
                    </p>
                </div>

                {/*Filter Section*/}
                <section className="card mb-8 p-5 sm:p-6">
                    <form
                        onSubmit={handleFilterSubmit}
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                    >
                        <div>
                            <label
                                htmlFor="company"
                                className="block text-sm font-medium text-zinc-700"
                            >
                                Company
                            </label>
                            <select
                                id="company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="select-base mt-1.5"
                            >
                                <option value="">All companies</option>
                                {companies.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-zinc-700"
                            >
                                Role
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="select-base mt-1.5"
                            >
                                <option value="">All roles</option>
                                {roles.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                        <div className="md:col-span-2 lg:col-span-4">
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
                                placeholder="Search by title, company, or role"
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

                {/*display of questionList & pageSlider*/}
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
                    <ul className="space-y-2">
                        {questions.map((question) => (
                            <li key={question.id}>
                                <Link
                                    href={`/behavioral/${question.slug}`}
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
                                            <p className="mt-0.5 truncate text-sm text-zinc-500">
                                                {question.companyName} · {question.roleName}
                                            </p>
                                            <p className="mt-0.5 truncate text-sm text-zinc-400">
                                                {question.slug}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
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
    );
}