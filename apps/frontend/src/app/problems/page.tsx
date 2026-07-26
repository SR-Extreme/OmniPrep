'use client';

import { Code2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { PracticePageHero } from '@/components/practice/PracticePageHero';
import {
    PracticeAuthLoading,
    PracticeEmptyState,
    PracticeErrorAlert,
    PracticeFilterCard,
    PracticeListHeader,
    PracticeListItem,
    PracticeLoadingState,
    PracticePageShell,
    PracticePagination,
    TopicTag,
} from '@/components/practice/PracticeListShell';
import { listProblems } from '@/lib/api/problems';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { DIFFICULTIES, type Difficulty, type ListProblemsQuery, type ProblemListItem } from '@/types/dsa';

const PAGE_SIZE = 20;

const HIGHLIGHTS = [
    'Curated interview-style problems across arrays, trees, graphs, and DP',
    'Run sample tests and submit full solutions with instant judge feedback',
    'Filter by difficulty, topic, and search to build a focused practice loop',
] as const;

type AppliedFilters = Pick<ListProblemsQuery, 'difficulty' | 'topic' | 'search'>;

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

function formatAcceptance(rate: number | null): string {
    if (rate == null) {
        return 'N/A';
    }

    return `${rate.toFixed(2)}%`;
}

export default function ProblemsPage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();

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
        return <PracticeAuthLoading />;
    }

    return (
        <PracticePageShell>
            <PracticePageHero
                eyebrow="DSA practice"
                title="Problem set"
                description="Practice interview-style data structures and algorithms with sample runs, full submissions, and instant judge feedback—so you know exactly where you stand."
                highlights={HIGHLIGHTS}
                imageSrc="/illustrations/dsa.png"
                imageAlt="DSA practice illustration"
                icon={Code2}
            />

            <PracticeFilterCard>
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
                            placeholder="e.g. Array"
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
                        <button type="submit" className="btn-primary !rounded-xl">
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
            </PracticeFilterCard>

            <section className="space-y-4 border-t border-zinc-200/80 pt-8 sm:pt-10">
                <PracticeListHeader
                    title="Problems"
                    subtitle={`${total} problem${total === 1 ? '' : 's'} · Open any problem to code and submit`}
                    isLoading={isLoading}
                />

                {error ? <PracticeErrorAlert message={error} /> : null}

                {isLoading && problems.length === 0 ? (
                    <PracticeLoadingState label="Loading problems…" />
                ) : !isLoading && problems.length === 0 && !error ? (
                    <PracticeEmptyState
                        title="No problems found"
                        description="Try adjusting your filters or search query."
                    />
                ) : (
                    <ul className="grid grid-cols-1 gap-3 sm:gap-4">
                        {problems.map((problem, index) => (
                            <PracticeListItem
                                key={problem.id}
                                href={`/problems/${problem.slug}`}
                                title={problem.title}
                                subtitle={problem.slug}
                                icon={Code2}
                                index={index}
                                badge={
                                    <span className={difficultyBadgeClass(problem.difficulty)}>
                                        {problem.difficulty.charAt(0) +
                                            problem.difficulty.slice(1).toLowerCase()}
                                    </span>
                                }
                                meta={
                                    <>
                                        <span className="text-xs text-zinc-500">
                                            Acceptance{' '}
                                            <span className="font-medium text-zinc-800">
                                                {formatAcceptance(problem.acceptanceRate)}
                                            </span>
                                        </span>
                                        {problem.topics.slice(0, 3).map((tag) => (
                                            <TopicTag key={tag}>{tag}</TopicTag>
                                        ))}
                                        {problem.topics.length > 3 ? (
                                            <span className="text-xs text-zinc-400">
                                                +{problem.topics.length - 3}
                                            </span>
                                        ) : null}
                                    </>
                                }
                            />
                        ))}
                    </ul>
                )}

                <PracticePagination
                    page={page}
                    totalPages={totalPages}
                    isLoading={isLoading}
                    onPageChange={setPage}
                />
            </section>
        </PracticePageShell>
    );
}
