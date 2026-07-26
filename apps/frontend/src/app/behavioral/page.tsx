'use client';

import { MessagesSquare } from 'lucide-react';
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
} from '@/components/practice/PracticeListShell';
import { ApiError } from '@/lib/api/client';
import { listBehavioralQuestions } from '@/lib/api/behavioral';
import { useAuthStore } from '@/store/authStore';
import { DIFFICULTIES, type Difficulty } from '@/types/dsa';
import type {
    BehavioralQuestionListItem,
    ListBehavioralQuestionsQuery,
} from '@/types/behavioral';

const PAGE_SIZE = 20;

const HIGHLIGHTS = [
    'Company- and role-specific mocks with resume-aware AI questions',
    'Full interview flow with on-demand STAR-based review',
    'Filter by company, role, and difficulty to practice what matters',
] as const;

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
    const { accessToken } = useAuthStore();

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
        return <PracticeAuthLoading />;
    }

    return (
        <PracticePageShell>
            <PracticePageHero
                eyebrow="Behavioral"
                title="Behavioral interviews"
                description="Practice company- and role-specific behavioral mocks with resume-aware AI questions, a full interview flow, and on-demand STAR-based review—so your stories land clearly."
                highlights={HIGHLIGHTS}
                imageSrc="/illustrations/behavioral.png"
                imageAlt="Behavioral interview illustration"
                icon={MessagesSquare}
            />

            <PracticeFilterCard>
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
                    title="Interview prompts"
                    subtitle={`${total} question${total === 1 ? '' : 's'} · Start a session to practice and get reviewed`}
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
                                href={`/behavioral/${question.slug}`}
                                title={question.title}
                                subtitle={`${question.companyName} · ${question.roleName}`}
                                icon={MessagesSquare}
                                index={index}
                                badge={
                                    <span className={difficultyBadgeClass(question.difficulty)}>
                                        {question.difficulty.charAt(0) +
                                            question.difficulty.slice(1).toLowerCase()}
                                    </span>
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
