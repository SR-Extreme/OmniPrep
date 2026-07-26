'use client';

import { motion } from 'framer-motion';
import { ArrowRight, SearchX, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function PracticePageShell({ children }: { children: ReactNode }) {
    return (
        <div className="overflow-x-hidden bg-zinc-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-8 py-8 sm:space-y-10 sm:py-10 lg:py-12">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function PracticeAuthLoading() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center bg-zinc-50 text-zinc-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
        </div>
    );
}

/** Hydrating → spinner. Logged out / redirecting → blank (no loading flash). */
export function PracticeAuthGate({ hydrated }: { hydrated: boolean }) {
    if (!hydrated) {
        return <PracticeAuthLoading />;
    }
    return null;
}

export function PracticeFilterCard({ children }: { children: ReactNode }) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-4">
                <h2 className="text-sm font-semibold text-zinc-900">Filters</h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                    Narrow the list to match what you want to practice next.
                </p>
            </div>
            {children}
        </section>
    );
}

export function PracticeErrorAlert({ message }: { message: string }) {
    return (
        <div
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
        >
            {message}
        </div>
    );
}

export function PracticeListHeader({
    title,
    subtitle,
    isLoading,
}: {
    title: string;
    subtitle: string;
    isLoading?: boolean;
}) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
            </div>
            {isLoading ? (
                <p className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                    Loading…
                </p>
            ) : null}
        </div>
    );
}

export function PracticeLoadingState({ label = 'Loading…' }: { label?: string }) {
    return (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-sm text-zinc-500 shadow-soft">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            {label}
        </div>
    );
}

export function PracticeEmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-16 text-center shadow-soft">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400">
                <SearchX className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-zinc-700">{title}</p>
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
    );
}

export function PracticePagination({
    page,
    totalPages,
    isLoading,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-soft sm:px-5">
            <button
                type="button"
                className="btn-ghost"
                disabled={page <= 1 || isLoading}
                onClick={() => onPageChange(Math.max(1, page - 1))}
            >
                Previous
            </button>
            <p className="text-xs text-zinc-500">
                Page {page} of {totalPages}
            </p>
            <button
                type="button"
                className="btn-ghost"
                disabled={page >= totalPages || isLoading}
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
                Next
            </button>
        </div>
    );
}

export interface PracticeListItemProps {
    href: string;
    title: string;
    subtitle?: string;
    meta?: ReactNode;
    badge?: ReactNode;
    icon: LucideIcon;
    index?: number;
}

export function PracticeListItem({
    href,
    title,
    subtitle,
    meta,
    badge,
    icon: Icon,
    index = 0,
}: PracticeListItemProps) {
    return (
        <motion.li
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            whileHover={{ y: -2 }}
        >
            <Link
                href={href}
                className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft transition hover:border-emerald-200 hover:shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-zinc-900 group-hover:text-emerald-700 sm:text-base">
                                {title}
                            </h3>
                            {badge}
                        </div>
                        {subtitle ? (
                            <p className="mt-1 truncate text-xs text-zinc-500 sm:text-sm">
                                {subtitle}
                            </p>
                        ) : null}
                        {meta ? (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {meta}
                            </div>
                        ) : null}
                    </div>
                </div>

                <span className="inline-flex items-center justify-center gap-2 self-stretch rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-soft transition group-hover:border-emerald-300 group-hover:text-emerald-700 hover:bg-emerald-50 sm:self-auto">
                    Open
                    <ArrowRight
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                </span>
            </Link>
        </motion.li>
    );
}

export function TopicTag({ children }: { children: ReactNode }) {
    return (
        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
            {children}
        </span>
    );
}
