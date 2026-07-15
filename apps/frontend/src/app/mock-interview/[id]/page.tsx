'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
    finalizeMockInterview,
    generateMockInterviewStudyPlan,
    getMockInterview,
    getMockInterviewReport,
    getMockInterviewStudyPlan,
    startMockInterview,
} from '@/lib/api/mock-interview';
import { BehavioralSectionWorkspace } from '@/components/BehavioralSectionWorkspace';
import { DsaSectionWorkspace } from '@/components/DsaSectionWorkspace';
import { HiringRecommendation } from '@/components/HiringRecommendation';
import {
    MockInterviewSidebar,
    type MockWorkspaceSelection,
} from '@/components/MockInterviewSidebar';
import { MockInterviewReport } from '@/components/MockInterviewReport';
import { SectionTimer } from '@/components/SectionTimer';
import { StudyPlanPanel } from '@/components/StudyPlanPanel';
import { SystemDesignSectionWorkspace } from '@/components/SystemDesignSectionWorkspace';
import { useAuthStore } from '@/store/authStore';
import {
    getSectionLabel,
    type MockInterviewReportDetail,
    type MockInterviewSessionDetail,
    type MockInterviewStudyPlanDetail,
} from '@/types/mock-interview';

const POLL_MS = 30_000;

function defaultSelection(
    interview: MockInterviewSessionDetail,
): MockWorkspaceSelection {
    if (interview.currentSection === 'DSA') {
        const first = interview.dsaProblems[0];
        return { section: 'DSA', slotIndex: first?.slotIndex ?? 0 };
    }
    if (interview.currentSection === 'SYSTEM_DESIGN') {
        return { section: 'SYSTEM_DESIGN' };
    }
    return { section: 'BEHAVIORAL' };
}

export default function MockInterviewSessionPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [interview, setInterview] = useState<MockInterviewSessionDetail | null>(
        null,
    );
    const [selection, setSelection] = useState<MockWorkspaceSelection | null>(null);
    const [report, setReport] = useState<MockInterviewReportDetail | null>(null);
    const [studyPlan, setStudyPlan] = useState<MockInterviewStudyPlanDetail | null>(
        null,
    );

    const [pageError, setPageError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshingReport, setIsRefreshingReport] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [planError, setPlanError] = useState<string | null>(null);

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

    const refreshInterview = useCallback(async () => {
        if (!accessToken || !params?.id) {
            return;
        }

        const res = await getMockInterview(accessToken, params.id);
        setInterview(res.interview);
        setSelection((prev) => {
            if (!prev || prev.section !== res.interview.currentSection) {
                return defaultSelection(res.interview);
            }
            return prev;
        });
        return res.interview;
    }, [accessToken, params?.id]);

    const refreshReport = useCallback(async () => {
        if (!accessToken || !params?.id) {
            return;
        }

        setIsRefreshingReport(true);
        setPageError(null);

        try {
            const res = await getMockInterviewReport(accessToken, params.id);
            setReport(res.report);
        } catch (err) {
            setPageError(
                err instanceof ApiError ? err.message : 'Failed to load report',
            );
        } finally {
            setIsRefreshingReport(false);
        }
    }, [accessToken, params?.id]);

    const refreshStudyPlan = useCallback(async () => {
        if (!accessToken || !params?.id) {
            return;
        }

        setIsLoadingPlan(true);
        setPlanError(null);

        try {
            const res = await getMockInterviewStudyPlan(accessToken, params.id);
            setStudyPlan(res.studyPlan);
        } catch (err) {
            setPlanError(
                err instanceof ApiError ? err.message : 'Failed to load study plan',
            );
        } finally {
            setIsLoadingPlan(false);
        }
    }, [accessToken, params?.id]);

    useEffect(() => {
        if (!hydrated || !accessToken || !params?.id) {
            return;
        }

        let cancelled = false;

        async function load() {
            setIsLoading(true);
            setPageError(null);

            try {
                let session = (await getMockInterview(accessToken as string, params.id))
                    .interview;

                if (session.status === 'NOT_STARTED') {
                    session = (
                        await startMockInterview(accessToken as string, params.id)
                    ).interview;
                }

                if (cancelled) {
                    return;
                }

                setInterview(session);
                setSelection(defaultSelection(session));

                if (session.status === 'COMPLETED') {
                    const [reportRes, planRes] = await Promise.all([
                        getMockInterviewReport(accessToken as string, params.id),
                        getMockInterviewStudyPlan(accessToken as string, params.id),
                    ]);
                    if (cancelled) {
                        return;
                    }
                    setReport(reportRes.report);
                    setStudyPlan(planRes.studyPlan);
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }
                setPageError(
                    err instanceof ApiError
                        ? err.message
                        : 'Failed to load mock interview',
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, params?.id]);

    useEffect(() => {
        if (!interview || interview.status !== 'IN_PROGRESS') {
            return;
        }

        const intervalId = window.setInterval(() => {
            void refreshInterview().catch(() => {
                // Keep UI alive; next poll retries.
            });
        }, POLL_MS);

        return () => window.clearInterval(intervalId);
    }, [interview?.status, refreshInterview]);

    const behavioralStartedAt = useMemo(() => {
        return (
            interview?.sections.find((row) => row.section === 'BEHAVIORAL')
                ?.startedAt ?? null
        );
    }, [interview]);

    const activeDsaSlot = useMemo(() => {
        if (!interview || selection?.section !== 'DSA') {
            return null;
        }
        return (
            interview.dsaProblems.find(
                (slot) => slot.slotIndex === selection.slotIndex,
            ) ?? null
        );
    }, [interview, selection]);

    async function handleFinalize() {
        if (!accessToken || !params?.id) {
            return;
        }

        setIsFinalizing(true);
        setPageError(null);

        try {
            const res = await finalizeMockInterview(accessToken, params.id);
            setInterview(res.interview);
            await refreshReport();
            await refreshStudyPlan();
        } catch (err) {
            setPageError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to finalize mock interview',
            );
        } finally {
            setIsFinalizing(false);
        }
    }

    async function handleGenerateStudyPlan() {
        if (!accessToken || !params?.id) {
            return;
        }

        setIsGeneratingPlan(true);
        setPlanError(null);

        try {
            const res = await generateMockInterviewStudyPlan(
                accessToken,
                params.id,
            );
            setStudyPlan(res.studyPlan);
        } catch (err) {
            setPlanError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to generate study plan',
            );
        } finally {
            setIsGeneratingPlan(false);
        }
    }

    if (!hydrated || !accessToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50">
            <header className="nav-header">
                <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <Link href="/" className="flex shrink-0 items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                                O
                            </span>
                            <span className="hidden text-base font-semibold tracking-tight text-zinc-900 sm:inline">
                                OmniPrep
                            </span>
                        </Link>
                        <nav className="flex min-w-0 items-center gap-2 text-sm">
                            <Link
                                href="/mock-interview"
                                className="shrink-0 font-medium text-zinc-600 transition hover:text-zinc-900"
                            >
                                Mock Interview
                            </Link>
                            <span className="text-zinc-300">/</span>
                            <span className="truncate font-medium text-emerald-700">
                                {interview
                                    ? getSectionLabel(interview.currentSection)
                                    : 'Session'}
                            </span>
                        </nav>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        {user ? (
                            <p className="hidden text-sm text-zinc-500 md:block">
                                {user.name}
                            </p>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => void logout()}
                            disabled={authLoading}
                            className="btn-secondary !py-2"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            {isLoading ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-zinc-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                    Loading interview…
                </div>
            ) : pageError && !interview ? (
                <div className="mx-auto max-w-lg px-6 py-16">
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
                        <p className="font-medium">Couldn&apos;t load this interview</p>
                        <p className="mt-1 text-sm">{pageError}</p>
                        <Link href="/mock-interview" className="btn-secondary mt-4 inline-flex">
                            Back to mock interviews
                        </Link>
                    </div>
                </div>
            ) : interview?.status === 'COMPLETED' && report ? (
                <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8 sm:px-6">
                    {pageError ? (
                        <div
                            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                            role="alert"
                        >
                            {pageError}
                        </div>
                    ) : null}

                    <HiringRecommendation
                        overallScore={report.overallScore}
                        onGenerateStudyPlan={() => void handleGenerateStudyPlan()}
                        isGeneratingStudyPlan={isGeneratingPlan}
                    />

                    <MockInterviewReport
                        report={report}
                        onRefresh={() => void refreshReport()}
                        isRefreshing={isRefreshingReport}
                    />

                    <StudyPlanPanel
                        studyPlan={studyPlan}
                        isLoading={isLoadingPlan}
                        error={planError}
                        onGenerate={() => void handleGenerateStudyPlan()}
                        isGenerating={isGeneratingPlan}
                    />
                </main>
            ) : interview?.status === 'AWAITING_FINAL_SUBMIT' ? (
                <main className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
                    {pageError ? (
                        <div
                            className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                            role="alert"
                        >
                            {pageError}
                        </div>
                    ) : null}
                    <section className="card p-6 text-center">
                        <p className="section-label">All sections submitted</p>
                        <h1 className="mt-2 text-xl font-semibold text-zinc-900">
                            Finalize your interview
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                            Section evaluations may still be running in the background.
                            Finalize to unlock your hiring recommendation, full report, and
                            study plan.
                        </p>
                        <button
                            type="button"
                            className="btn-primary mt-6"
                            disabled={isFinalizing}
                            onClick={() => void handleFinalize()}
                        >
                            {isFinalizing ? 'Finalizing…' : 'Finalize interview'}
                        </button>
                    </section>
                </main>
            ) : interview && selection ? (
                <div className="mx-auto flex w-full max-w-[1600px] flex-1 min-h-0">
                    <div className="hidden w-72 shrink-0 lg:block xl:w-80">
                        <div className="sticky top-[57px] h-[calc(100vh-57px)]">
                            <MockInterviewSidebar
                                interview={interview}
                                selection={selection}
                                onSelect={setSelection}
                            />
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
                            <div className="lg:hidden">
                                <select
                                    className="select-base !w-auto !py-2"
                                    value={
                                        selection.section === 'DSA'
                                            ? `DSA:${selection.slotIndex}`
                                            : selection.section
                                    }
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        if (value.startsWith('DSA:')) {
                                            setSelection({
                                                section: 'DSA',
                                                slotIndex: Number(value.slice(4)),
                                            });
                                            return;
                                        }
                                        if (value === 'SYSTEM_DESIGN') {
                                            setSelection({ section: 'SYSTEM_DESIGN' });
                                            return;
                                        }
                                        setSelection({ section: 'BEHAVIORAL' });
                                    }}
                                >
                                    {interview.dsaProblems.map((slot) => (
                                        <option
                                            key={slot.id}
                                            value={`DSA:${slot.slotIndex}`}
                                            disabled={interview.currentSection !== 'DSA'}
                                        >
                                            DSA · Problem {slot.slotIndex + 1}
                                        </option>
                                    ))}
                                    <option
                                        value="SYSTEM_DESIGN"
                                        disabled={
                                            interview.currentSection !== 'SYSTEM_DESIGN'
                                        }
                                    >
                                        System Design
                                    </option>
                                    <option
                                        value="BEHAVIORAL"
                                        disabled={interview.currentSection !== 'BEHAVIORAL'}
                                    >
                                        Behavioral
                                    </option>
                                </select>
                            </div>
                            <div className="ml-auto">
                                <SectionTimer
                                    key={interview.currentSection}
                                    label={getSectionLabel(interview.currentSection)}
                                    remainingMs={interview.activeSectionRemainingMs}
                                    onExpire={() => {
                                        void refreshInterview().catch(() => undefined);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                            {pageError ? (
                                <div
                                    className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                                    role="alert"
                                >
                                    {pageError}
                                </div>
                            ) : null}

                            {selection.section === 'DSA' && activeDsaSlot ? (
                                <DsaSectionWorkspace
                                    accessToken={accessToken}
                                    interviewId={interview.id}
                                    slot={activeDsaSlot}
                                    readOnly={interview.currentSection !== 'DSA'}
                                    onInterviewChange={(next) => {
                                        setInterview(next);
                                        setSelection((prev) =>
                                            prev && prev.section === next.currentSection
                                                ? prev
                                                : defaultSelection(next),
                                        );
                                    }}
                                />
                            ) : null}

                            {selection.section === 'SYSTEM_DESIGN' &&
                            interview.systemDesign ? (
                                <SystemDesignSectionWorkspace
                                    accessToken={accessToken}
                                    interviewId={interview.id}
                                    assignment={interview.systemDesign}
                                    readOnly={
                                        interview.currentSection !== 'SYSTEM_DESIGN'
                                    }
                                    onInterviewChange={(next) => {
                                        setInterview(next);
                                        setSelection((prev) =>
                                            prev && prev.section === next.currentSection
                                                ? prev
                                                : defaultSelection(next),
                                        );
                                    }}
                                />
                            ) : null}

                            {selection.section === 'BEHAVIORAL' &&
                            interview.behavioral ? (
                                <BehavioralSectionWorkspace
                                    accessToken={accessToken}
                                    interviewId={interview.id}
                                    assignment={interview.behavioral}
                                    behavioralStartedAt={behavioralStartedAt}
                                    readOnly={interview.currentSection !== 'BEHAVIORAL'}
                                    onInterviewChange={(next) => {
                                        setInterview(next);
                                        setSelection((prev) =>
                                            prev && prev.section === next.currentSection
                                                ? prev
                                                : defaultSelection(next),
                                        );
                                    }}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
