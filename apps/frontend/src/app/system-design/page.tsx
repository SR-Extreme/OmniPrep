'use client';

import { Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { PracticePageHero } from '@/components/practice/PracticePageHero';
import {
    PracticeAuthGate,
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
import { TopicMultiSelect } from '@/components/TopicMultiSelect';
import { FieldError } from '@/components/ui/FieldError';
import { ApiError } from '@/lib/api/client';
import { listSystemDesignQuestions } from '@/lib/api/system-design';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { validateSearchQuery } from '@/lib/validation/fields';
import { useAuthStore } from '@/store/authStore';
import { DIFFICULTIES, type Difficulty } from '@/types/dsa';
import type {
    ListSystemDesignQuestionsQuery,
    SystemDesignQuestionListItem,
} from '@/types/system-design';

const PAGE_SIZE = 20;

const HIGHLIGHTS = [
    'Practice scalable architectures, databases, caching, and distributed systems',
    'Answer structured prompts and refine designs with AI follow-up questions',
    'Filter by difficulty and topic to target the systems you need most',
] as const;

type AppliedFilters = Pick<ListSystemDesignQuestionsQuery, 'difficulty' | 'topics' | 'search'>;

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
    const { accessToken, isReady: hydrated } = useAuthStore();
    const [questions, setQuestions] = useState<SystemDesignQuestionListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
    const { errors, touch, clear } = useFieldErrors<'search'>();

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
                setAvailableTopics(result.filterOptions.topics);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                const message =
                    err instanceof ApiError
                        ? err.message
                        : 'Failed to load system design questions';
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

        const searchErr = validateSearchQuery(search);
        touch('search', searchErr);
        if (searchErr) {
            return;
        }

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
        clear('search');
        setAppliedFilters({});
        setPage(1);
    }

    if (!hydrated || !accessToken) {
        return <PracticeAuthGate hydrated={hydrated} />;
    }

    return (
        <PracticePageShell>
            <PracticePageHero
                eyebrow="System design"
                title="System design challenges"
                description="Practice real-world system design interview questions covering scalable architectures, databases, caching, load balancing, and distributed systems—with structured prompts and AI follow-ups."
                highlights={HIGHLIGHTS}
                imageSrc="/illustrations/system-design.png"
                imageAlt="System design illustration"
                icon={Network}
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
                    <TopicMultiSelect
                        topics={availableTopics}
                        selected={selectedTopics}
                        onChange={setSelectedTopics}
                    />
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
                            onChange={(e) => {
                                setSearch(e.target.value);
                                clear('search');
                            }}
                            onBlur={() => touch('search', validateSearchQuery(search))}
                            placeholder="Search by title or slug"
                            aria-invalid={Boolean(errors.search)}
                            className="input-base mt-1.5"
                        />
                        <FieldError message={errors.search} />
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
                    title="Questions"
                    subtitle={`${total} question${total === 1 ? '' : 's'} · Open a prompt to design and submit`}
                    isLoading={isLoading}
                />

                {error ? <PracticeErrorAlert message={error} /> : null}

                {isLoading && questions.length === 0 ? (
                    <PracticeLoadingState label="Loading questions…" />
                ) : !isLoading && questions.length === 0 && !error ? (
                    <PracticeEmptyState
                        title="No questions found"
                        description="Try adjusting your filters or search query."
                    />
                ) : (
                    <ul className="grid grid-cols-1 gap-3 sm:gap-4">
                        {questions.map((question, index) => (
                            <PracticeListItem
                                key={question.id}
                                href={`/system-design/${question.slug}`}
                                title={question.title}
                                subtitle={question.slug}
                                icon={Network}
                                index={index}
                                badge={
                                    <span className={difficultyBadgeClass(question.difficulty)}>
                                        {question.difficulty.charAt(0) +
                                            question.difficulty.slice(1).toLowerCase()}
                                    </span>
                                }
                                meta={
                                    question.topics.length > 0 ? (
                                        <>
                                            {question.topics.slice(0, 3).map((tag) => (
                                                <TopicTag key={tag}>{tag}</TopicTag>
                                            ))}
                                            {question.topics.length > 3 ? (
                                                <span className="text-xs text-zinc-400">
                                                    +{question.topics.length - 3}
                                                </span>
                                            ) : null}
                                        </>
                                    ) : undefined
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
