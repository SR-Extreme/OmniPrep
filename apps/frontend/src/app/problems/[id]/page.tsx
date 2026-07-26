'use client'

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, isFreeAiReportLimitError } from '@/lib/api/client';
import { getDSAEvaluation, requestDSAEvaluation, type ComplexityAnalysis, type DSAEvaluationDetail } from '@/lib/api/evaluations';
import { getProblem } from '@/lib/api/problems';
import { createSubmission, getSubmission, listMySubmissions } from '@/lib/api/submissions';
import {
    practiceDraftKey,
    readPracticeDraft,
    writePracticeDraft,
} from '@/lib/practice-drafts';
import { MonacoEditor } from '@/components/MonacoEditor';
import { PremiumRequiredModal } from '@/components/PremiumRequiredModal';
import { RevealSection } from '@/components/RevealSection';
import { SubmissionResultView } from '@/components/dsa/SubmissionResultView';
import { useAuthStore } from '@/store/authStore';
import {
    PROGRAMMING_LANGUAGES,
    type Example,
    type ProgrammingLanguage,
    type ProblemDetail,
    type SubmissionDetail,
    type SubmissionListItem,
} from '@/types/dsa';

type LeftTab = 'problem' | 'results' | 'submissions';

interface DsaPracticeDraft {
    language: ProgrammingLanguage;
    codeByLang: Record<ProgrammingLanguage, string>;
    activeTab: LeftTab;
    lastSubmissionId: string | null;
    updatedAt: number;
}

const DSA_DRAFT_DEBOUNCE_MS = 400;

function difficultyPill(difficulty: ProblemDetail['difficulty']): string {
    switch (difficulty) {
        case 'EASY':
            return 'badge-easy';
        case 'MEDIUM':
            return 'badge-medium';
        case 'HARD':
            return 'badge-hard';
    }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="section-label">{children}</h2>;
}

function CodeBlock({ value }: { value: string }) {
    return (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-800">
            <code>{value}</code>
        </pre>
    );
}

function ExampleCard({ example, index }: { example: Example; index: number }) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
            <p className="mb-3 text-sm font-medium text-zinc-900">Example {index + 1}</p>
            <div className="space-y-3">
                <div>
                    <p className="section-label mb-1.5">Input</p>
                    <CodeBlock value={example.input} />
                </div>
                <div>
                    <p className="section-label mb-1.5">Output</p>
                    <CodeBlock value={example.output} />
                </div>
                {example.explanation && (
                    <div>
                        <p className="section-label mb-1.5">Explanation</p>
                        <p className="text-sm leading-relaxed text-zinc-600">{example.explanation}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function getScoreTier(score: number): {
    label: string;
    color: string;
    bg: string;
    ring: string;
    bar: string;
} {
    if (score >= 85) {
        return {
            label: 'Excellent',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            ring: 'ring-emerald-200',
            bar: 'bg-emerald-500',
        };
    }
    if (score >= 70) {
        return {
            label: 'Good',
            color: 'text-sky-700',
            bg: 'bg-sky-50',
            ring: 'ring-sky-200',
            bar: 'bg-sky-500',
        };
    }
    if (score >= 50) {
        return {
            label: 'Fair',
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            ring: 'ring-amber-200',
            bar: 'bg-amber-500',
        };
    }
    return {
        label: 'Needs Work',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        ring: 'ring-rose-200',
        bar: 'bg-rose-500',
    };
}

function ScoreBar({ label, score }: { label: string; score: number }) {
    const tier = getScoreTier(score);

    return (
        <div className="rounded-lg border border-zinc-100 bg-white px-3.5 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-700">{label}</span>
                <span className="text-sm font-semibold tabular-nums text-zinc-900">{score}<span className="font-normal text-zinc-400">/100</span></span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${tier.bar}`}
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
            </div>
        </div>
    );
}

function ComplexityMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border border-zinc-100 bg-white px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
            <p className="mt-1 font-mono text-sm font-medium text-zinc-900">{value}</p>
        </div>
    );
}

function ComplexityCard({ analysis }: { analysis: ComplexityAnalysis }) {
    return (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Your Solution</p>
                    <ComplexityMetric label="Time" value={analysis.detected.time} />
                    <ComplexityMetric label="Space" value={analysis.detected.space} />
                </div>
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Optimal Target</p>
                    <ComplexityMetric label="Time" value={analysis.optimal.time} />
                    <ComplexityMetric label="Space" value={analysis.optimal.space} />
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200/80 pt-4">
                {analysis.isOptimal ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Optimal complexity
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Room for improvement
                    </span>
                )}
            </div>
            {analysis.notes && (
                <p className="ai-report-body border-l-2 border-zinc-200 pl-3.5 text-zinc-600">{analysis.notes}</p>
            )}
        </div>
    );
}

function ReportSection({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <div className="mb-3">
                <h3 className="text-sm font-semibold tracking-tight text-zinc-900">{title}</h3>
                {subtitle && (
                    <p className="mt-0.5 text-xs font-normal leading-relaxed text-zinc-500">{subtitle}</p>
                )}
            </div>
            {children}
        </section>
    );
}

function AIEvaluationReport({ evaluation }: { evaluation: DSAEvaluationDetail }) {
    const tier = getScoreTier(evaluation.overallScore);
    const reviewedAt = new Date(evaluation.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-card">
            <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 via-white to-emerald-50/40 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                            AI Interview Report
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Reviewed {reviewedAt}
                            {evaluation.model && (
                                <span className="text-zinc-400"> · {evaluation.model}</span>
                            )}
                        </p>
                    </div>
                    <div
                        className={`flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-full ring-4 ${tier.bg} ${tier.ring}`}
                    >
                        <span className="text-2xl font-bold tabular-nums leading-none text-zinc-900">
                            {evaluation.overallScore}
                        </span>
                        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                            / 100
                        </span>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tier.bg} ${tier.color} ring-1 ring-inset ${tier.ring}`}
                    >
                        {tier.label}
                    </span>
                    <span className="text-xs text-zinc-500">Overall performance rating</span>
                </div>
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-6">
                <ReportSection title="Score Breakdown" subtitle="How your submission performed across key dimensions.">
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        <ScoreBar label="Correctness" score={evaluation.correctnessScore} />
                        <ScoreBar label="Efficiency" score={evaluation.efficiencyScore} />
                        <ScoreBar label="Code Quality" score={evaluation.codeQualityScore} />
                        <ScoreBar label="Explanation" score={evaluation.explanationScore} />
                    </div>
                </ReportSection>

                <ReportSection title="Time & Space Complexity" subtitle="Your approach compared to the optimal solution.">
                    <ComplexityCard analysis={evaluation.complexityAnalysis} />
                </ReportSection>

                <ReportSection title="Interviewer Feedback" subtitle="A summary of strengths and areas to refine.">
                    <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 px-4 py-4">
                        <p className="ai-report-feedback">{evaluation.feedback}</p>
                    </div>
                </ReportSection>

                {evaluation.suggestions.length > 0 && (
                    <ReportSection title="Actionable Suggestions" subtitle="Concrete steps to improve your solution.">
                        <ul className="space-y-2.5">
                            {evaluation.suggestions.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex gap-3 rounded-lg border border-zinc-100 bg-white px-3.5 py-3 shadow-sm"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700">
                                        {idx + 1}
                                    </span>
                                    <span className="ai-report-list-item">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </ReportSection>
                )}

                {evaluation.followUpQuestions.length > 0 && (
                    <ReportSection
                        title="Follow-up Questions"
                        subtitle="Questions an interviewer might ask you next."
                    >
                        <ol className="space-y-2.5">
                            {evaluation.followUpQuestions.map((question, idx) => (
                                <li
                                    key={idx}
                                    className="flex gap-3 rounded-lg border border-zinc-100 bg-gradient-to-r from-white to-zinc-50/80 px-3.5 py-3"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-bold text-white">
                                        Q{idx + 1}
                                    </span>
                                    <span className="ai-report-list-item text-zinc-800">{question}</span>
                                </li>
                            ))}
                        </ol>
                    </ReportSection>
                )}
            </div>
        </div>
    );
}

const AI_POLL_INTERVAL_MS = 2000;
const AI_POLL_MAX_ATTEMPTS = 60;

async function pollForEvaluation(
    accessToken: string,
    submissionId: string,
    isCancelled: () => boolean,
): Promise<DSAEvaluationDetail> {
    for (let attempt = 0; attempt < AI_POLL_MAX_ATTEMPTS; attempt += 1) {
        if (isCancelled()) {
            throw new Error('AI review cancelled');
        }

        await new Promise((resolve) => setTimeout(resolve, AI_POLL_INTERVAL_MS));

        if (isCancelled()) {
            throw new Error('AI review cancelled');
        }

        const result = await getDSAEvaluation(accessToken, submissionId);

        if (result.status === 'completed' && result.evaluation) {
            return result.evaluation;
        }

        if (result.status === 'failed') {
            throw new Error('AI evaluation failed. Please try again.');
        }
    }

    throw new Error('AI evaluation timed out. Please try again.');
}

function statusPill(status: SubmissionListItem['status']): string {
    if (status === 'ACCEPTED') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    }
    if (status === 'PENDING' || status === 'RUNNING') {
        return 'bg-sky-50 text-sky-700 ring-sky-600/20';
    }
    return 'bg-rose-50 text-rose-700 ring-rose-600/20';
}

type ExpandedPanel = 'submission' | 'report';

export default function ProblemSolverPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();

    const { accessToken } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);

    const [problem, setProblem] = useState<ProblemDetail | null>(null);
    const [problemError, setProblemError] = useState<string | null>(null);
    const [isProblemLoading, setIsProblemLoading] = useState(true);

    const [language, setLanguage] = useState<ProgrammingLanguage>('PYTHON');
    const [codeByLang, setCodeByLang] = useState<Record<ProgrammingLanguage, string>>({
        CPP: '',
        JAVA: '',
        PYTHON: '',
    });

    const [activeTab, setActiveTab] = useState<LeftTab>('problem');

    const [isRunning, setIsRunning] = useState(false);
    const [runError, setRunError] = useState<string | null>(null);
    const [lastSubmission, setLastSubmission] = useState<SubmissionDetail | null>(null);

    const [aiReviewVisible, setAiReviewVisible] = useState(false);
    const [aiReview, setAiReview] = useState<DSAEvaluationDetail | null>(null);
    const [isAiReviewLoading, setIsAiReviewLoading] = useState(false);
    const [aiReviewError, setAiReviewError] = useState<string | null>(null);

    const [mySubmissions, setMySubmissions] = useState<SubmissionListItem[]>([]);
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);
    const [submissionsError, setSubmissionsError] = useState<string | null>(null);
    const [submissionsLoadedFor, setSubmissionsLoadedFor] = useState<string | null>(null);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel | null>(null);
    const [expandedDetail, setExpandedDetail] = useState<SubmissionDetail | null>(null);
    const [expandedReport, setExpandedReport] = useState<DSAEvaluationDetail | null>(null);
    const [isExpandedLoading, setIsExpandedLoading] = useState(false);
    const [expandedError, setExpandedError] = useState<string | null>(null);
    const [premiumModalOpen, setPremiumModalOpen] = useState(false);

    const resumeReadyRef = useRef(false);
    const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;

        if (!accessToken) {
            router.replace('/login');
        }
    }, [hydrated, accessToken, router]);

    useEffect(() => {
        if (!hydrated || !accessToken) return;

        let cancelled = false;
        resumeReadyRef.current = false;

        async function load() {
            setIsProblemLoading(true);
            setProblemError(null);
            setLastSubmission(null);
            resetAiReviewState();

            try {
                const id = params?.id;
                if (!id) {
                    throw new Error('Missing problem id');
                }
                const res = await getProblem(accessToken as string, id);

                if (cancelled) return;

                setProblem(res.problem);

                const starter = {
                    CPP: res.problem.starterCode?.cpp ?? '',
                    JAVA: res.problem.starterCode?.java ?? '',
                    PYTHON: res.problem.starterCode?.python ?? '',
                };

                const draftKey = practiceDraftKey('dsa', res.problem.id);
                const draft = readPracticeDraft<DsaPracticeDraft>(draftKey);

                let nextCode = starter;
                let nextLanguage: ProgrammingLanguage = 'PYTHON';
                let nextTab: LeftTab = 'problem';
                let resumeSubmissionId: string | null = draft?.lastSubmissionId ?? null;

                if (draft?.codeByLang) {
                    nextCode = {
                        CPP: draft.codeByLang.CPP ?? starter.CPP,
                        JAVA: draft.codeByLang.JAVA ?? starter.JAVA,
                        PYTHON: draft.codeByLang.PYTHON ?? starter.PYTHON,
                    };
                    if (PROGRAMMING_LANGUAGES.includes(draft.language)) {
                        nextLanguage = draft.language;
                    }
                    if (
                        draft.activeTab === 'problem' ||
                        draft.activeTab === 'results' ||
                        draft.activeTab === 'submissions'
                    ) {
                        nextTab = draft.activeTab;
                    }
                }

                try {
                    const history = await listMySubmissions(accessToken as string, {
                        problemId: res.problem.id,
                        limit: 20,
                    });
                    if (cancelled) return;

                    const fullSubs = history.submissions.filter((s) => !s.isSampleRun);
                    setMySubmissions(fullSubs);
                    setSubmissionsLoadedFor(res.problem.id);

                    const latest = history.submissions[0] ?? null;
                    if (!resumeSubmissionId && latest) {
                        resumeSubmissionId = latest.id;
                    }

                    if (!draft?.codeByLang && latest) {
                        const latestDetail = await getSubmission(
                            accessToken as string,
                            latest.id,
                        );
                        if (cancelled) return;
                        nextLanguage = latestDetail.submission.language;
                        nextCode = {
                            ...starter,
                            [latestDetail.submission.language]:
                                latestDetail.submission.sourceCode,
                        };
                        setLastSubmission(latestDetail.submission);
                        if (nextTab === 'problem' && !latestDetail.submission.isSampleRun) {
                            nextTab = 'results';
                        }
                        resumeSubmissionId = latestDetail.submission.id;
                    } else if (resumeSubmissionId) {
                        const detail = await getSubmission(
                            accessToken as string,
                            resumeSubmissionId,
                        );
                        if (cancelled) return;
                        setLastSubmission(detail.submission);

                        if (
                            detail.submission.status === 'ACCEPTED' ||
                            !detail.submission.isSampleRun
                        ) {
                            try {
                                const evalRes = await getDSAEvaluation(
                                    accessToken as string,
                                    detail.submission.id,
                                );
                                if (
                                    !cancelled &&
                                    evalRes.status === 'completed' &&
                                    evalRes.evaluation
                                ) {
                                    setAiReview(evalRes.evaluation);
                                    setAiReviewVisible(true);
                                }
                            } catch {
                                // No report yet — fine.
                            }
                        }
                    }
                } catch {
                    // History restore is best-effort; problem + draft still load.
                }

                if (cancelled) return;

                setCodeByLang(nextCode);
                setLanguage(nextLanguage);
                setActiveTab(nextTab);
            } catch (err) {
                if (cancelled) return;
                const message = err instanceof ApiError ? err.message : 'Failed to load problem';
                setProblemError(message);
            } finally {
                if (!cancelled) {
                    setIsProblemLoading(false);
                    resumeReadyRef.current = true;
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
        // resetAiReviewState is stable enough via inline; intentionally omit
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated, accessToken, params?.id]);

    useEffect(() => {
        if (!problem || !resumeReadyRef.current) return;

        if (draftTimerRef.current) {
            clearTimeout(draftTimerRef.current);
        }

        const persist = () => {
            const draft: DsaPracticeDraft = {
                language,
                codeByLang,
                activeTab,
                lastSubmissionId: lastSubmission?.id ?? null,
                updatedAt: Date.now(),
            };
            writePracticeDraft(practiceDraftKey('dsa', problem.id), draft);
        };

        draftTimerRef.current = setTimeout(persist, DSA_DRAFT_DEBOUNCE_MS);

        const onHide = () => {
            if (document.visibilityState === 'hidden') {
                persist();
            }
        };
        document.addEventListener('visibilitychange', onHide);
        window.addEventListener('pagehide', persist);

        return () => {
            if (draftTimerRef.current) {
                clearTimeout(draftTimerRef.current);
            }
            document.removeEventListener('visibilitychange', onHide);
            window.removeEventListener('pagehide', persist);
        };
    }, [problem, language, codeByLang, activeTab, lastSubmission]);

    const loadSubmissions = useCallback(async (problemId: string, force = false) => {
        if (!accessToken) return;
        if (!force && submissionsLoadedFor === problemId) return;

        setIsSubmissionsLoading(true);
        setSubmissionsError(null);

        try {
            const res = await listMySubmissions(accessToken, {
                problemId,
                limit: 50,
            });
            setMySubmissions(res.submissions.filter((s) => !s.isSampleRun));
            setSubmissionsLoadedFor(problemId);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Failed to load submissions';
            setSubmissionsError(message);
        } finally {
            setIsSubmissionsLoading(false);
        }
    }, [accessToken, submissionsLoadedFor]);

    useEffect(() => {
        if (activeTab !== 'submissions' || !problem) return;
        void loadSubmissions(problem.id);
    }, [activeTab, problem, loadSubmissions]);

    const editorValue = codeByLang[language];

    function resetAiReviewState() {
        setAiReviewVisible(false);
        setAiReview(null);
        setAiReviewError(null);
        setIsAiReviewLoading(false);
    }

    function resetExpandedState() {
        setExpandedId(null);
        setExpandedPanel(null);
        setExpandedDetail(null);
        setExpandedReport(null);
        setIsExpandedLoading(false);
        setExpandedError(null);
    }

    function setEditorValue(next: string) {
        setCodeByLang((prev) => ({ ...prev, [language]: next }));
    }

    async function run(isSampleRun: boolean) {
        if (!accessToken || !problem) return;

        setIsRunning(true);
        setRunError(null);
        setLastSubmission(null);
        resetAiReviewState();

        try {
            const res = await createSubmission(accessToken, {
                problemId: problem.id,
                language,
                sourceCode: codeByLang[language],
                isSampleRun,
            });

            setLastSubmission(res.submission);
            setActiveTab('results');

            writePracticeDraft(practiceDraftKey('dsa', problem.id), {
                language,
                codeByLang,
                activeTab: 'results',
                lastSubmissionId: res.submission.id,
                updatedAt: Date.now(),
            } satisfies DsaPracticeDraft);

            if (!isSampleRun) {
                setSubmissionsLoadedFor(null);
                resetExpandedState();
            }
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Submission failed';
            setRunError(message);
        } finally {
            setIsRunning(false);
        }
    }

    async function handleGenerateAiReview() {
        if (!accessToken || !lastSubmission || lastSubmission.isSampleRun) return;

        let cancelled = false;
        const isCancelled = () => cancelled;

        setAiReviewVisible(true);
        setIsAiReviewLoading(true);
        setAiReviewError(null);
        setAiReview(null);

        try {
            const initial = await requestDSAEvaluation(accessToken, lastSubmission.id);

            if (initial.status === 'completed' && initial.evaluation) {
                setAiReview(initial.evaluation);
                setMySubmissions((prev) =>
                    prev.map((s) =>
                        s.id === lastSubmission.id ? { ...s, hasEvaluation: true } : s,
                    ),
                );
                return;
            }

            if (initial.status === 'failed') {
                throw new Error('AI evaluation failed. Please try again.');
            }

            const evaluation = await pollForEvaluation(
                accessToken,
                lastSubmission.id,
                isCancelled,
            );
            setAiReview(evaluation);
            setMySubmissions((prev) =>
                prev.map((s) =>
                    s.id === lastSubmission.id ? { ...s, hasEvaluation: true } : s,
                ),
            );
        } catch (err) {
            if (isFreeAiReportLimitError(err)) {
                setAiReviewVisible(false);
                setPremiumModalOpen(true);
                return;
            }
            const message = err instanceof ApiError ? err.message : 'AI review failed';
            setAiReviewError(message);
        } finally {
            cancelled = true;
            setIsAiReviewLoading(false);
        }
    }

    async function handleViewSubmission(item: SubmissionListItem) {
        if (!accessToken) return;

        if (expandedId === item.id && expandedPanel === 'submission') {
            resetExpandedState();
            return;
        }

        setExpandedId(item.id);
        setExpandedPanel('submission');
        setExpandedReport(null);
        setExpandedError(null);
        setIsExpandedLoading(true);

        try {
            const res = await getSubmission(accessToken, item.id);
            setExpandedDetail(res.submission);
        } catch (err) {
            setExpandedDetail(null);
            setExpandedError(err instanceof ApiError ? err.message : 'Failed to load submission');
        } finally {
            setIsExpandedLoading(false);
        }
    }

    async function handleViewOrGenerateReport(item: SubmissionListItem) {
        if (!accessToken) return;

        if (expandedId === item.id && expandedPanel === 'report' && item.hasEvaluation) {
            resetExpandedState();
            return;
        }

        setExpandedId(item.id);
        setExpandedPanel('report');
        setExpandedDetail(null);
        setExpandedError(null);
        setIsExpandedLoading(true);
        setExpandedReport(null);

        let cancelled = false;

        try {
            if (item.hasEvaluation) {
                const existing = await getDSAEvaluation(accessToken, item.id);
                if (existing.status === 'completed' && existing.evaluation) {
                    setExpandedReport(existing.evaluation);
                    return;
                }
            }

            const initial = await requestDSAEvaluation(accessToken, item.id);

            if (initial.status === 'completed' && initial.evaluation) {
                setExpandedReport(initial.evaluation);
                setMySubmissions((prev) =>
                    prev.map((s) => (s.id === item.id ? { ...s, hasEvaluation: true } : s)),
                );
                return;
            }

            if (initial.status === 'failed') {
                throw new Error('AI evaluation failed. Please try again.');
            }

            const evaluation = await pollForEvaluation(
                accessToken,
                item.id,
                () => cancelled,
            );
            if (cancelled) return;
            setExpandedReport(evaluation);
            setMySubmissions((prev) =>
                prev.map((s) => (s.id === item.id ? { ...s, hasEvaluation: true } : s)),
            );
        } catch (err) {
            if (cancelled) return;
            if (isFreeAiReportLimitError(err)) {
                resetExpandedState();
                setPremiumModalOpen(true);
                return;
            }
            setExpandedError(err instanceof ApiError ? err.message : 'Failed to load report');
        } finally {
            cancelled = true;
            setIsExpandedLoading(false);
        }
    }

    if (!hydrated || !accessToken) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center bg-zinc-50 text-zinc-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            </div>
        );
    }

    const tabButtonClass = (tab: LeftTab) =>
        [
            'flex-1 border-b-2 px-3 py-2.5 text-sm font-medium transition duration-150',
            activeTab === tab
                ? 'border-emerald-600 bg-white text-emerald-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800',
        ].join(' ');

    return (
        <div className="min-h-screen overflow-x-hidden bg-zinc-50">
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {isProblemLoading ? (
                    <div className="card flex items-center justify-center gap-2 px-6 py-20 text-sm text-zinc-500">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                        Loading problem…
                    </div>
                ) : problemError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
                        <p className="font-medium">Couldn&apos;t load this problem</p>
                        <p className="mt-1 text-sm">{problemError}</p>
                        <div className="mt-4">
                            <Link href="/problems" className="btn-secondary !rounded-xl">
                                Back to problems
                            </Link>
                        </div>
                    </div>
                ) : problem ? (
                    <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
                        <section className="card overflow-hidden shadow-elevated">
                            <div className="border-b border-zinc-200 px-5 py-4">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">{problem.title}</h1>
                                    <span className={difficultyPill(problem.difficulty)}>
                                        {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex border-b border-zinc-200 bg-zinc-50/50">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('problem')}
                                    className={tabButtonClass('problem')}
                                >
                                    Problem
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('results')}
                                    className={tabButtonClass('results')}
                                >
                                    Results
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('submissions')}
                                    className={tabButtonClass('submissions')}
                                >
                                    Submissions
                                </button>
                            </div>
                            <div className="max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-5 py-5">
                                {activeTab === 'problem' && (
                                    <>
                                        <div>
                                            <SectionTitle>Description</SectionTitle>
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                                                {problem.description}
                                            </p>
                                        </div>
                                        {problem.constraints && (
                                            <div>
                                                <SectionTitle>Constraints</SectionTitle>
                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                                                    {problem.constraints}
                                                </p>
                                            </div>
                                        )}
                                        {problem.examples && problem.examples.length > 0 && (
                                            <div>
                                                <SectionTitle>Examples</SectionTitle>
                                                <div className="mt-3 space-y-3">
                                                    {problem.examples.map((ex, idx) => (
                                                        <ExampleCard key={idx} example={ex} index={idx} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {problem.topics.length > 0 && (
                                            <RevealSection title="Topics" count={problem.topics.length}>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {problem.topics.map((t) => (
                                                        <span
                                                            key={t}
                                                            className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </RevealSection>
                                        )}
                                        {problem.hints && problem.hints.length > 0 && (
                                            <RevealSection title="Hints" count={problem.hints.length}>
                                                <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
                                                    {problem.hints.map((h, idx) => (
                                                        <li key={idx}>{h}</li>
                                                    ))}
                                                </ul>
                                            </RevealSection>
                                        )}
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                                                <p className="font-medium text-zinc-700">Time limit</p>
                                                <p className="mt-1 text-zinc-500">{problem.timeLimitMs} ms</p>
                                            </div>
                                            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                                                <p className="font-medium text-zinc-700">Memory limit</p>
                                                <p className="mt-1 text-zinc-500">{problem.memoryLimitKb} KB</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'results' && (
                                    <>
                                        {runError && (
                                            <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                                {runError}
                                            </div>
                                        )}
                                        {!lastSubmission ? (
                                            <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
                                                Run or submit to see results here.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <SubmissionResultView submission={lastSubmission} />

                                                {!lastSubmission.isSampleRun && (
                                                    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold tracking-tight text-zinc-900">AI Review</p>
                                                                <p className="mt-1 text-xs font-normal leading-relaxed text-zinc-500">
                                                                    Get structured feedback on approach, complexity, and code quality.
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleGenerateAiReview()}
                                                                disabled={isAiReviewLoading}
                                                                className="btn-primary !py-2"
                                                            >
                                                                {isAiReviewLoading ? 'Generating…' : 'Generate AI Review'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {aiReviewVisible && (
                                                    <div className="mt-4">
                                                        {isAiReviewLoading && (
                                                            <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 px-6 py-10 text-center">
                                                                <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-zinc-800">Analyzing your submission</p>
                                                                    <p className="mt-1 text-xs text-zinc-500">This usually takes a few seconds…</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {aiReviewError && (
                                                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                                                {aiReviewError}
                                                            </div>
                                                        )}
                                                        {aiReview && !isAiReviewLoading && (
                                                            <AIEvaluationReport evaluation={aiReview} />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'submissions' && (
                                    <div className="space-y-4">
                                        {submissionsError && (
                                            <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                                {submissionsError}
                                            </div>
                                        )}

                                        {isSubmissionsLoading && mySubmissions.length === 0 ? (
                                            <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                                                Loading submissions…
                                            </div>
                                        ) : mySubmissions.length === 0 ? (
                                            <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
                                                No submissions yet. Submit a solution to see history here.
                                            </div>
                                        ) : (
                                            <ul className="space-y-3">
                                                {mySubmissions.map((item) => {
                                                    const isOpen = expandedId === item.id;
                                                    const submittedAt = new Date(item.createdAt).toLocaleString(
                                                        undefined,
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        },
                                                    );

                                                    return (
                                                        <li
                                                            key={item.id}
                                                            className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
                                                        >
                                                            <div className="px-4 py-3.5">
                                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span
                                                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusPill(item.status)}`}
                                                                            >
                                                                                {item.status}
                                                                            </span>
                                                                            <span className="text-xs text-zinc-500">
                                                                                {item.language}
                                                                            </span>
                                                                            <span className="text-xs text-zinc-400">
                                                                                {item.passedTests}/{item.totalTests} tests
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-zinc-500">{submittedAt}</p>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => void handleViewSubmission(item)}
                                                                            className="btn-secondary !py-1.5 !text-xs"
                                                                        >
                                                                            {isOpen && expandedPanel === 'submission'
                                                                                ? 'Hide submission'
                                                                                : 'View submission'}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => void handleViewOrGenerateReport(item)}
                                                                            className="btn-primary !py-1.5 !text-xs"
                                                                        >
                                                                            {isOpen &&
                                                                            expandedPanel === 'report' &&
                                                                            item.hasEvaluation
                                                                                ? 'Hide report'
                                                                                : item.hasEvaluation
                                                                                    ? 'View report'
                                                                                    : isOpen &&
                                                                                        expandedPanel === 'report' &&
                                                                                        isExpandedLoading
                                                                                        ? 'Generating…'
                                                                                        : 'Generate report'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {isOpen && (
                                                                <div className="border-t border-zinc-100 bg-zinc-50/60 px-4 py-4">
                                                                    {isExpandedLoading && (
                                                                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                                                                            <span className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
                                                                            <p className="text-sm text-zinc-600">
                                                                                {expandedPanel === 'report'
                                                                                    ? 'Loading report…'
                                                                                    : 'Loading submission…'}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    {expandedError && !isExpandedLoading && (
                                                                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                                                                            {expandedError}
                                                                        </div>
                                                                    )}
                                                                    {!isExpandedLoading &&
                                                                        !expandedError &&
                                                                        expandedPanel === 'submission' &&
                                                                        expandedDetail && (
                                                                            <SubmissionResultView
                                                                                submission={expandedDetail}
                                                                                showSourceCode
                                                                            />
                                                                        )}
                                                                    {!isExpandedLoading &&
                                                                        !expandedError &&
                                                                        expandedPanel === 'report' &&
                                                                        expandedReport && (
                                                                            <AIEvaluationReport
                                                                                evaluation={expandedReport}
                                                                            />
                                                                        )}
                                                                </div>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="card overflow-hidden shadow-elevated">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3.5">
                                <p className="text-sm font-semibold text-zinc-900">Code editor</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value as ProgrammingLanguage)}
                                        className="select-base !w-auto !py-2"
                                    >
                                        {PROGRAMMING_LANGUAGES.map((lang) => (
                                            <option key={lang} value={lang}>
                                                {lang}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => run(true)}
                                        disabled={isRunning}
                                        className="btn-secondary !py-2"
                                    >
                                        {isRunning ? 'Running…' : 'Run'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => run(false)}
                                        disabled={isRunning}
                                        className="btn-primary !py-2"
                                    >
                                        {isRunning ? 'Submitting…' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5">
                                <MonacoEditor
                                    value={editorValue}
                                    onChange={setEditorValue}
                                    language={language}
                                    height="520px"
                                />
                                <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
                                    <p className="font-medium text-zinc-700">I/O protocol</p>
                                    <p className="mt-1 leading-relaxed">
                                        Input follows the format described in the problem statement. Output must conform to the expected output format.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : null}
            </main>
            <PremiumRequiredModal
                open={premiumModalOpen}
                onOpenChange={setPremiumModalOpen}
                title="Free AI report used"
                description="Free users get one AI report for DSA. Upgrade to Premium for unlimited AI reviews across all practice sections."
            />
        </div>
    );
}
