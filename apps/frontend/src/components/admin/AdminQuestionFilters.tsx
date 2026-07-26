'use client';

import type { FormEvent } from 'react';
import { TopicMultiSelect } from '@/components/TopicMultiSelect';
import { Button } from '@/components/ui/button';
import { DIFFICULTIES, type Difficulty } from '@/types/dsa';

export type AdminTopicFilters = {
    difficulty?: Difficulty;
    topics?: string[];
    search?: string;
};

export type AdminBehavioralFilters = {
    company?: string;
    role?: string;
    difficulty?: Difficulty;
    search?: string;
};

type TopicFilterProps = {
    variant: 'topic';
    difficulty: Difficulty | '';
    selectedTopics: string[];
    availableTopics: string[];
    search: string;
    onDifficultyChange: (value: Difficulty | '') => void;
    onTopicsChange: (value: string[]) => void;
    onSearchChange: (value: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onClear: () => void;
    searchPlaceholder?: string;
};

type BehavioralFilterProps = {
    variant: 'behavioral';
    company: string;
    role: string;
    difficulty: Difficulty | '';
    search: string;
    companies: string[];
    roles: string[];
    onCompanyChange: (value: string) => void;
    onRoleChange: (value: string) => void;
    onDifficultyChange: (value: Difficulty | '') => void;
    onSearchChange: (value: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onClear: () => void;
};

type AdminQuestionFiltersProps = TopicFilterProps | BehavioralFilterProps;

export function AdminQuestionFilters(props: AdminQuestionFiltersProps) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft sm:p-5">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-zinc-900">Filters</h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                    Narrow the question list, same filters as the user practice pages.
                </p>
            </div>

            {props.variant === 'topic' ? (
                <form
                    onSubmit={props.onSubmit}
                    className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
                >
                    <div>
                        <label
                            htmlFor="admin-difficulty"
                            className="block text-sm font-medium text-zinc-700"
                        >
                            Difficulty
                        </label>
                        <select
                            id="admin-difficulty"
                            value={props.difficulty}
                            onChange={(e) =>
                                props.onDifficultyChange(
                                    e.target.value as Difficulty | '',
                                )
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
                        topics={props.availableTopics}
                        selected={props.selectedTopics}
                        onChange={props.onTopicsChange}
                    />
                    <div className="lg:col-span-2">
                        <label
                            htmlFor="admin-search"
                            className="block text-sm font-medium text-zinc-700"
                        >
                            Search
                        </label>
                        <input
                            id="admin-search"
                            value={props.search}
                            onChange={(e) => props.onSearchChange(e.target.value)}
                            placeholder={
                                props.searchPlaceholder ?? 'Title or slug'
                            }
                            className="input-base mt-1.5"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-4">
                        <Button type="submit" size="sm">
                            Apply filters
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={props.onClear}
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            ) : (
                <form
                    onSubmit={props.onSubmit}
                    className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
                >
                    <div>
                        <label
                            htmlFor="admin-company"
                            className="block text-sm font-medium text-zinc-700"
                        >
                            Company
                        </label>
                        <select
                            id="admin-company"
                            value={props.company}
                            onChange={(e) => props.onCompanyChange(e.target.value)}
                            className="select-base mt-1.5"
                        >
                            <option value="">All companies</option>
                            {props.companies.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="admin-role"
                            className="block text-sm font-medium text-zinc-700"
                        >
                            Role
                        </label>
                        <select
                            id="admin-role"
                            value={props.role}
                            onChange={(e) => props.onRoleChange(e.target.value)}
                            className="select-base mt-1.5"
                        >
                            <option value="">All roles</option>
                            {props.roles.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="admin-behavioral-difficulty"
                            className="block text-sm font-medium text-zinc-700"
                        >
                            Difficulty
                        </label>
                        <select
                            id="admin-behavioral-difficulty"
                            value={props.difficulty}
                            onChange={(e) =>
                                props.onDifficultyChange(
                                    e.target.value as Difficulty | '',
                                )
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
                            htmlFor="admin-behavioral-search"
                            className="block text-sm font-medium text-zinc-700"
                        >
                            Search
                        </label>
                        <input
                            id="admin-behavioral-search"
                            value={props.search}
                            onChange={(e) => props.onSearchChange(e.target.value)}
                            placeholder="Title, company, or role"
                            className="input-base mt-1.5"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-4">
                        <Button type="submit" size="sm">
                            Apply filters
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={props.onClear}
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            )}
        </section>
    );
}
