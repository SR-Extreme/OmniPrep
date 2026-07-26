'use client';

import { useState, type ReactNode } from 'react';
import { AIEvaluationReport } from '@/components/dsa/AIEvaluationReport';
import { BehavioralEvaluationReport } from '@/components/behavioral/BehavioralEvaluationReport';
import { SystemDesignEvaluationReport } from '@/components/system-design/SystemDesignEvaluationReport';
import {
    getSectionLabel,
    type MockInterviewEvalStatus,
    type MockInterviewReportDetail,
    type MockInterviewSection,
} from '@/types/mock-interview';

export interface MockInterviewReportProps {
    report: MockInterviewReportDetail;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    children?: ReactNode;
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function evalStatusDisplay(status: MockInterviewEvalStatus): {
    label: string;
    className: string;
} {
    switch (status) {
        case 'COMPLETED':
            return {
                label: 'Completed',
                className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            };
        case 'PENDING':
            return {
                label: 'Running...',
                className: 'bg-amber-50 text-amber-800 ring-amber-600/20',
            };
        case 'FAILED':
            return {
                label: 'Failed',
                className: 'bg-rose-50 text-rose-700 ring-rose-600/20',
            };
        case 'NO_SUBMISSION':
            return {
                label: 'No Submission',
                className: 'bg-zinc-100 text-zinc-600 ring-zinc-500/15',
            };
        case 'NOT_REQUESTED':
        default:
            return {
                label: 'Not Requested',
                className: 'bg-zinc-50 text-zinc-500 ring-zinc-400/15',
            };
    }
}

function scoreLabel(score: number | null): string {
    return score == null ? '—' : `${score}`;
}

function Collapsible({
    title,
    meta,
    badge,
    defaultOpen = false,
    children,
}: {
    title: string;
    meta?: string;
    badge?: { label: string; className: string };
    defaultOpen?: boolean;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left"
                aria-expanded={open}
            >
                <span
                    className={`text-zinc-400 transition ${open ? 'rotate-90' : ''}`}
                    aria-hidden
                >
                    ▸
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-zinc-900">{title}</span>
                    {meta ? (
                        <span className="mt-0.5 block text-xs text-zinc-500">{meta}</span>
                    ) : null}
                </span>
                {badge ? (
                    <span
                        className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.className}`}
                    >
                        {badge.label}
                    </span>
                ) : null}
            </button>
            {open ? (
                <div className="space-y-4 border-t border-zinc-100 px-4 py-4">{children}</div>
            ) : null}
        </div>
    );
}

function sectionEvalStatus(
    report: MockInterviewReportDetail,
    section: MockInterviewSection,
): MockInterviewEvalStatus {
    return (
        report.evaluationStatuses.find((row) => row.section === section)?.status ??
        'NOT_REQUESTED'
    );
}

function PendingOrEmptyState({
    status,
    message,
}: {
    status: MockInterviewEvalStatus;
    message?: string;
}) {
    const badge = evalStatusDisplay(status);
    return (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 px-4 py-8 text-center">
            <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badge.className}`}
            >
                {badge.label}
            </span>
            <p className="mt-3 text-sm text-zinc-500">
                {message ?? 'Evaluation is not available yet.'}
            </p>
        </div>
    );
}

export function MockInterviewReport({
    report,
    children,
}: MockInterviewReportProps) {
    const dsaStatus = sectionEvalStatus(report, 'DSA');
    const sdStatus = sectionEvalStatus(report, 'SYSTEM_DESIGN');
    const behavioralStatus = sectionEvalStatus(report, 'BEHAVIORAL');

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            <div className="card p-5 shadow-elevated sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="section-label">Mock interview report</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                            Overall score{' '}
                            <span className="tabular-nums text-emerald-700">
                                {scoreLabel(report.overallScore)}
                            </span>
                            {report.overallScore != null ? (
                                <span className="text-base font-medium text-zinc-400">
                                    {' '}
                                    / 100
                                </span>
                            ) : null}
                        </h1>
                        <p className="mt-2 text-sm text-zinc-500">
                            Total time {formatDuration(report.totalTimeTakenMs)} of{' '}
                            {formatDuration(report.totalTimeCapMs)}
                        </p>
                    </div>
                </div>

                {report.finalizedAt ? (
                    <p className="mt-4 text-sm text-emerald-700">
                        Finalized {new Date(report.finalizedAt).toLocaleString()}
                    </p>
                ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                {report.sections.map((section) => {
                    const status = sectionEvalStatus(report, section.section);
                    const badge = evalStatusDisplay(status);

                    return (
                        <div key={section.section} className="card p-4">
                            <p className="section-label">
                                {getSectionLabel(section.section)}
                            </p>
                            <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">
                                {scoreLabel(section.overallScore)}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                                {formatDuration(section.timeTakenMs)} /{' '}
                                {formatDuration(section.timeCapMs)}
                            </p>
                            <span
                                className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.className}`}
                            >
                                {badge.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-3">
                <Collapsible
                    title="DSA evaluation"
                    meta={`${report.dsaQuestionReports.length} problems`}
                    badge={evalStatusDisplay(dsaStatus)}
                    defaultOpen
                >
                    <div className="space-y-4">
                        {report.dsaQuestionReports.map((question) => {
                            const badge = evalStatusDisplay(question.evalStatus);
                            return (
                                <div
                                    key={`${question.slotIndex}-${question.problemId}`}
                                    className="space-y-3"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-zinc-900">
                                            Problem {question.slotIndex + 1}
                                        </p>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.className}`}
                                        >
                                            {badge.label}
                                        </span>
                                    </div>
                                    {question.evaluation ? (
                                        <AIEvaluationReport evaluation={question.evaluation} />
                                    ) : (
                                        <PendingOrEmptyState
                                            status={question.evalStatus}
                                            message={question.message}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Collapsible>

                <Collapsible
                    title="System design evaluation"
                    meta={
                        report.systemDesignReport
                            ? `Score ${report.systemDesignReport.overallScore}`
                            : undefined
                    }
                    badge={evalStatusDisplay(sdStatus)}
                >
                    {report.systemDesignReport?.evaluation ? (
                        <SystemDesignEvaluationReport
                            evaluation={report.systemDesignReport.evaluation}
                        />
                    ) : (
                        <PendingOrEmptyState
                            status={report.systemDesignReport?.evalStatus ?? sdStatus}
                            message={
                                report.systemDesignReport?.message ??
                                'No system design evaluation yet.'
                            }
                        />
                    )}
                </Collapsible>

                <Collapsible
                    title="Behavioral evaluation"
                    meta={
                        report.behavioralReport
                            ? `Score ${report.behavioralReport.overallScore}`
                            : undefined
                    }
                    badge={evalStatusDisplay(behavioralStatus)}
                >
                    {report.behavioralReport?.evaluation ? (
                        <BehavioralEvaluationReport
                            evaluation={report.behavioralReport.evaluation}
                        />
                    ) : (
                        <PendingOrEmptyState
                            status={report.behavioralReport?.evalStatus ?? behavioralStatus}
                            message={
                                report.behavioralReport?.message ??
                                'No behavioral evaluation yet.'
                            }
                        />
                    )}
                </Collapsible>
            </div>

            {children}
        </div>
    );
}
