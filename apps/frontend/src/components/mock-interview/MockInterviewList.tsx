'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CalendarClock, Layers } from 'lucide-react';
import {
    getSectionLabel,
    type MockInterviewListItem,
    type MockInterviewStatus,
} from '@/types/mock-interview';

function statusBadge(status: MockInterviewStatus): {
    label: string;
    className: string;
} {
    switch (status) {
        case 'NOT_STARTED':
            return {
                label: 'Not started',
                className: 'bg-zinc-100 text-zinc-600 ring-zinc-500/15',
            };
        case 'IN_PROGRESS':
            return {
                label: 'In progress',
                className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            };
        case 'AWAITING_FINAL_SUBMIT':
            return {
                label: 'Awaiting Final Submit',
                className: 'bg-amber-50 text-amber-800 ring-amber-600/20',
            };
        case 'COMPLETED':
            return {
                label: 'Completed',
                className: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
            };
        default:
            return {
                label: status,
                className: 'bg-zinc-100 text-zinc-600 ring-zinc-500/15',
            };
    }
}

function actionLabel(status: MockInterviewStatus): string {
    switch (status) {
        case 'NOT_STARTED':
            return 'Start';
        case 'IN_PROGRESS':
            return 'Resume';
        case 'AWAITING_FINAL_SUBMIT':
            return 'Finalize';
        case 'COMPLETED':
            return 'View report';
        default:
            return 'Open';
    }
}

export interface MockInterviewListProps {
    interviews: MockInterviewListItem[];
    total: number;
    page: number;
    totalPages: number;
    isLoading: boolean;
    openingId: string | null;
    onOpen: (interview: MockInterviewListItem) => void;
    onPageChange: (page: number) => void;
}

export function MockInterviewList({
    interviews,
    total,
    page,
    totalPages,
    isLoading,
    openingId,
    onOpen,
    onPageChange,
}: MockInterviewListProps) {
    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                        Your Interviews
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {total} total · Continue where you left off or review completed reports
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-sm text-zinc-500 shadow-soft">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                    Loading…
                </div>
            ) : interviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-16 text-center shadow-soft">
                    <p className="text-sm font-medium text-zinc-700">
                        No mock interviews yet
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                        Start one above to begin your full interview loop.
                    </p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 gap-3 sm:gap-4">
                    {interviews.map((interview, index) => {
                        const badge = statusBadge(interview.status);
                        const busy = openingId === interview.id;

                        return (
                            <motion.li
                                key={interview.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.04 }}
                                whileHover={{ y: -2 }}
                                className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft transition hover:border-emerald-200 hover:shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5"
                            >
                                <div className="min-w-0 flex items-start gap-3 sm:gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                                        <Layers className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-zinc-900 sm:text-base">
                                                Interview
                                            </p>
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.className}`}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                                            <span className="inline-flex items-center gap-1">
                                                <Layers className="h-3 w-3 text-emerald-600" />
                                                Section:{' '}
                                                {getSectionLabel(interview.currentSection)}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarClock className="h-3 w-3 text-emerald-600" />
                                                {new Date(
                                                    interview.createdAt,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => onOpen(interview)}
                                    className="inline-flex items-center justify-center gap-2 self-stretch rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-soft transition group-hover:border-emerald-300 group-hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 sm:self-auto"
                                >
                                    {busy ? 'Opening…' : actionLabel(interview.status)}
                                    <ArrowRight
                                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                                        aria-hidden="true"
                                    />
                                </button>
                            </motion.li>
                        );
                    })}
                </ul>
            )}

            {totalPages > 1 ? (
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
            ) : null}
        </section>
    );
}
