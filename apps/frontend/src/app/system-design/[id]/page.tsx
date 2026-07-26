'use client';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
    createSystemDesignSubmission,
    generateSystemDesignFollowUps,
    getSystemDesignEvaluation,
    getSystemDesignQuestion,
    requestSystemDesignEvaluation,
    submitSystemDesignFollowUpAnswers,
} from '@/lib/api/system-design';
import { useAuthStore } from '@/store/authStore';
import type {
    EvaluationMetric,
    SystemDesignEvaluationDetail,
    SystemDesignQuestionDetail,
    SystemDesignSubmissionDetail,
} from '@/types/system-design';

const AI_POLL_INTERVAL_MS = 2000;
const AI_POLL_MAX_ATTEMPTS = 60;

function difficultyPill(difficulty: SystemDesignQuestionDetail['difficulty']): string {
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
                <span className="text-sm font-semibold tabular-nums text-zinc-900">
                    {score}
                    <span className="font-normal text-zinc-400">/100</span>
                </span>
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
                    <p className="mt-0.5 text-xs font-normal leading-relaxed text-zinc-500">
                        {subtitle}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}

//This shows the AI evaluation report
function SystemDesignEvaluationReport({
    evaluation,
    metrics,
}: {
    evaluation: SystemDesignEvaluationDetail;
    metrics: EvaluationMetric[];
}) {
    const tier = getScoreTier(evaluation.overallScore);
    const reviewedAt = new Date(evaluation.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-card">
            <div className={`border-b border-zinc-200 px-5 py-5 sm:px-6 ${tier.bg}`}>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            AI Review
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className={`text-4xl font-bold tabular-nums ${tier.color}`}>
                                {evaluation.overallScore}
                            </span>
                            <span className="text-sm font-medium text-zinc-500">/ 100</span>
                        </div>
                        <p className={`mt-1 text-sm font-semibold ${tier.color}`}>{tier.label}</p>
                    </div>
                    <p className="text-xs text-zinc-500">Reviewed {reviewedAt}</p>
                </div>
            </div>
            <div className="space-y-6 p-5 sm:p-6">
                <ReportSection title="Rubric scores" subtitle="Weighted metrics from the question rubric.">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {metrics.map((metric) => (
                            <ScoreBar
                                key={metric.id}
                                label={metric.title}
                                score={evaluation.metricScores[metric.id] ?? 0}
                            />
                        ))}
                    </div>
                </ReportSection>
                <ReportSection title="Feedback">
                    <p className="ai-report-body rounded-lg border border-zinc-100 bg-zinc-50/60 px-4 py-3.5 text-zinc-700">
                        {evaluation.feedback}
                    </p>
                </ReportSection>
                {evaluation.strengths.length > 0 && (
                    <ReportSection title="Strengths">
                        <ul className="space-y-2">
                            {evaluation.strengths.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="ai-report-list-item rounded-lg border border-emerald-100 bg-emerald-50/50 px-3.5 py-2.5 text-emerald-900"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </ReportSection>
                )}
                {evaluation.weaknesses.length > 0 && (
                    <ReportSection title="Areas to improve">
                        <ul className="space-y-2">
                            {evaluation.weaknesses.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="ai-report-list-item rounded-lg border border-amber-100 bg-amber-50/50 px-3.5 py-2.5 text-amber-900"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </ReportSection>
                )}
                {evaluation.suggestions.length > 0 && (
                    <ReportSection title="Suggestions">
                        <ul className="space-y-2">
                            {evaluation.suggestions.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="ai-report-list-item rounded-lg border border-zinc-100 bg-white px-3.5 py-2.5 text-zinc-800"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </ReportSection>
                )}
                {evaluation.followUpQuestions.length > 0 && (
                    <ReportSection
                        title="Follow-up questions"
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

async function pollForSystemDesignEvaluation(
    accessToken: string,
    submissionId: string,
    isCancelled: () => boolean,
): Promise<SystemDesignEvaluationDetail> {
    for (let attempt = 0; attempt < AI_POLL_MAX_ATTEMPTS; attempt += 1) {

        if (isCancelled()) {
            throw new Error('AI review cancelled');
        }

        await new Promise((resolve) => setTimeout(resolve, AI_POLL_INTERVAL_MS));

        if (isCancelled()) {
            throw new Error('AI review cancelled');
        }

        const result = await getSystemDesignEvaluation(accessToken, submissionId);

        if (result.status === 'completed' && result.evaluation) {
            return result.evaluation;
        }
        if (result.status === 'failed') {
            throw new Error('AI evaluation failed. Please try again.');
        }
    }

    throw new Error('AI evaluation timed out. Please try again.');
}

export default function SystemDesignPracticePage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();

    const { accessToken } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [question, setQuestion] = useState<SystemDesignQuestionDetail | null>(null);
    const [questionError, setQuestionError] = useState<string | null>(null);
    const [isQuestionLoading, setIsQuestionLoading] = useState(true);
    const [textAnswer, setTextAnswer] = useState('');
    const [diagramFile, setDiagramFile] = useState<File | null>(null);
    const [submission, setSubmission] = useState<SystemDesignSubmissionDetail | null>(null);
    const [followUpAnswer1, setFollowUpAnswer1] = useState('');
    const [followUpAnswer2, setFollowUpAnswer2] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingFollowUps, setIsGeneratingFollowUps] = useState(false);
    const [isSubmittingFollowUps, setIsSubmittingFollowUps] = useState(false);
    const [aiReviewVisible, setAiReviewVisible] = useState(false);
    const [aiReview, setAiReview] = useState<SystemDesignEvaluationDetail | null>(null);
    const [isAiReviewLoading, setIsAiReviewLoading] = useState(false);
    const [aiReviewError, setAiReviewError] = useState<string | null>(null);

    const hasInitialAnswer = useMemo(() => {
        if (submission) {
            const hasText =
                submission.textAnswer != null && submission.textAnswer.trim().length > 0;
            const hasDiagram = submission.diagramUrl != null;
            return hasText || hasDiagram;
        }
        const hasText = textAnswer.trim().length > 0;
        return hasText || diagramFile != null;
    }, [submission, textAnswer, diagramFile]);

    const followUpQuestions = submission?.followUpQuestions ?? null;
    const followUpAnswers = submission?.followUpAnswers ?? null;
    const canGenerateFollowUps = submission != null && followUpQuestions == null;

    const canSubmitFollowUps =
        followUpQuestions != null &&
        followUpAnswers == null &&
        followUpAnswer1.trim().length > 0 &&
        followUpAnswer2.trim().length > 0;

    const canRequestAiReview =
        submission != null && followUpQuestions != null && followUpAnswers != null;

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

    //for loading question
    useEffect(() => {
        if (!hydrated || !accessToken) {
            return;
        }

        let cancelled = false;

        async function loadQuestion() {
            setIsQuestionLoading(true);
            setQuestionError(null);

            try {
                const id = params?.id;
                if (!id) {
                    throw new Error('Missing question id');
                }
                const res = await getSystemDesignQuestion(accessToken as string, id);
                if (cancelled) {
                    return;
                }
                setQuestion(res.question);
            } catch (err) {
                if (cancelled) {
                    return;
                }
                const message =
                    err instanceof ApiError ? err.message : 'Failed to load system design question';
                setQuestionError(message);
            } finally {
                if (!cancelled) {
                    setIsQuestionLoading(false);
                }
            }
        }

        void loadQuestion();

        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, params?.id]);

    useEffect(() => {
        if (submission?.followUpAnswers) {
            setFollowUpAnswer1(submission.followUpAnswers[0] ?? '');
            setFollowUpAnswer2(submission.followUpAnswers[1] ?? '');
        }
    }, [submission]);

    function resetAiReviewState() {
        setAiReviewVisible(false);
        setAiReview(null);
        setAiReviewError(null);
        setIsAiReviewLoading(false);
    }

    //initial diagram/text answer to get initial submission
    async function handleInitialSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!accessToken || !question) {
            return;
        }

        if (!hasInitialAnswer) {
            setActionError('Provide a text answer, a diagram, or both.');
            return;
        }

        setIsSubmitting(true);
        setActionError(null);
        resetAiReviewState();

        try {
            const res = await createSystemDesignSubmission(accessToken, {
                questionId: question.id,
                textAnswer: textAnswer.trim() || undefined,
                diagram: diagramFile ?? undefined,
            });

            setSubmission(res.submission);
            setTextAnswer(res.submission.textAnswer ?? '');
            setDiagramFile(null);
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : 'Failed to submit system design answer';
            setActionError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleGenerateFollowUps() {
        if (!accessToken || !submission) {
            return;
        }

        setIsGeneratingFollowUps(true);
        setActionError(null);
        resetAiReviewState();
        try {
            const res = await generateSystemDesignFollowUps(accessToken, submission.id);
            setSubmission(res.submission);
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : 'Failed to generate follow-up questions';
            setActionError(message);
        } finally {
            setIsGeneratingFollowUps(false);
        }
    }

    async function handleSubmitFollowUps(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!accessToken || !submission) {
            return;
        }

        setIsSubmittingFollowUps(true);
        setActionError(null);
        resetAiReviewState();

        try {
            const res = await submitSystemDesignFollowUpAnswers(accessToken, submission.id, {
                answers: [followUpAnswer1.trim(), followUpAnswer2.trim()],
            });
            setSubmission(res.submission);
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : 'Failed to submit follow-up answers';
            setActionError(message);
        } finally {
            setIsSubmittingFollowUps(false);
        }
    }

    async function handleGenerateAiReview() {
        if (!accessToken || !submission || !canRequestAiReview) {
            return;
        }

        let cancelled = false;

        const isCancelled = () => cancelled;

        setAiReviewVisible(true);
        setIsAiReviewLoading(true);
        setAiReviewError(null);
        setAiReview(null);

        try {
            const initial = await requestSystemDesignEvaluation(accessToken, submission.id);
            if (initial.status === 'completed' && initial.evaluation) {
                setAiReview(initial.evaluation);
                return;
            }
            if (initial.status === 'failed') {
                throw new Error('AI evaluation failed. Please try again.');
            }
            const evaluation = await pollForSystemDesignEvaluation(
                accessToken,
                submission.id,
                isCancelled,
            );
            setAiReview(evaluation);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'AI review failed';
            setAiReviewError(message);
        } finally {
            cancelled = true;
            setIsAiReviewLoading(false);
        }
    }

    if (!hydrated || !accessToken) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center bg-zinc-50 text-zinc-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-zinc-50">
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

                {isQuestionLoading && (
                    <div className="card flex items-center justify-center gap-2 px-6 py-20 text-sm text-zinc-500">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                        Loading question…
                    </div>
                )}

                {questionError && (
                    <div
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                        role="alert"
                    >
                        {questionError}
                    </div>
                )}

                {question && !isQuestionLoading && (
                    <div className="grid gap-6 lg:grid-cols-2">

                        {/*question details*/
                        /*Left Panel*/}
                        <section className="card p-5 shadow-elevated sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                                    {question.title}
                                </h1>
                                <span className={difficultyPill(question.difficulty)}>
                                    {question.difficulty.charAt(0) +
                                        question.difficulty.slice(1).toLowerCase()}
                                </span>
                            </div>
                            <div className="prose prose-sm max-w-none text-zinc-700">
                                <p className="whitespace-pre-wrap leading-relaxed">
                                    {question.description}
                                </p>
                            </div>
                            <div className="mt-6 space-y-5">
                                <div>
                                    <SectionTitle>Functional requirements</SectionTitle>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                                        {question.requirements.functional.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <SectionTitle>Non-functional requirements</SectionTitle>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                                        {question.requirements.nonFunctional.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <SectionTitle>Deliverables</SectionTitle>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                                        {question.deliverables.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                {question.constraints.length > 0 && (
                                    <div>
                                        <SectionTitle>Constraints</SectionTitle>
                                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                                            {question.constraints.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {question.scaleFactors.length > 0 && (
                                    <div>
                                        <SectionTitle>Scale factors</SectionTitle>
                                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                                            {question.scaleFactors.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {question.topics.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {question.topics.map((topic) => (
                                            <span
                                                key={topic}
                                                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/*right panel*/}
                        <section className="space-y-6">
                            {actionError && (
                                <div
                                    className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                                    role="alert"
                                >
                                    {actionError}
                                </div>
                            )}

                            {/*based on submission how right panel looks*/}
                            {!submission ? (
                                <form onSubmit={handleInitialSubmit} className="card space-y-4 p-5 shadow-elevated sm:p-6">
                                    <div>
                                        <h2 className="text-base font-semibold text-zinc-900">
                                            Your answer
                                        </h2>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            Submit text, a diagram, or both.
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="textAnswer"
                                            className="block text-sm font-medium text-zinc-700"
                                        >
                                            Text answer
                                        </label>
                                        <textarea
                                            id="textAnswer"
                                            value={textAnswer}
                                            onChange={(e) => setTextAnswer(e.target.value)}
                                            rows={12}
                                            placeholder="Describe your high-level design, APIs, data model, scaling approach…"
                                            className="input-base mt-1.5 min-h-[220px] resize-y font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="diagram"
                                            className="block text-sm font-medium text-zinc-700"
                                        >
                                            Diagram
                                        </label>
                                        <input
                                            id="diagram"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setDiagramFile(e.target.files?.[0] ?? null)
                                            }
                                            className="mt-1.5 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
                                        />
                                        {diagramFile && (
                                            <p className="mt-2 text-xs text-zinc-500">
                                                Selected: {diagramFile.name}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !hasInitialAnswer}
                                        className="btn-primary w-full sm:w-auto"
                                    >
                                        {isSubmitting ? 'Submitting…' : 'Submit answer'}
                                    </button>
                                </form>
                            ) : (
                                <div className="card space-y-4 p-5 shadow-elevated sm:p-6">
                                    <div>
                                        <h2 className="text-base font-semibold text-zinc-900">
                                            Submitted answer
                                        </h2>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            Submission ID: {submission.id}
                                        </p>
                                    </div>
                                    {submission.textAnswer && (
                                        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                            <p className="section-label mb-2">Text</p>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                                                {submission.textAnswer}
                                            </p>
                                        </div>
                                    )}
                                    {submission.diagramUrl && (
                                        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                            <p className="section-label mb-2">Diagram</p>
                                            <img
                                                src={submission.diagramUrl}
                                                alt="Submitted system design diagram"
                                                className="max-h-80 w-full rounded-md border border-zinc-200 object-contain bg-white"
                                            />
                                        </div>
                                    )}
                                    {canGenerateFollowUps && (
                                        <button
                                            type="button"
                                            onClick={() => void handleGenerateFollowUps()}
                                            disabled={isGeneratingFollowUps}
                                            className="btn-primary"
                                        >
                                            {isGeneratingFollowUps
                                                ? 'Generating…'
                                                : 'Generate Follow Ups'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/*UI for followUp question , answers area , whether answered or not , and generate aiReview button*/}
                            {followUpQuestions && (
                                <div className="card space-y-4 p-5 shadow-elevated sm:p-6">
                                    <div>
                                        <h2 className="text-base font-semibold text-zinc-900">
                                            Follow-up round
                                        </h2>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            Answer both interviewer follow-up questions.
                                        </p>
                                    </div>
                                    <ol className="space-y-3">
                                        {followUpQuestions.map((q, idx) => (
                                            <li
                                                key={idx}
                                                className="rounded-lg border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-sm text-zinc-800"
                                            >
                                                <span className="font-medium text-zinc-500">
                                                    Q{idx + 1}.{' '}
                                                </span>
                                                {q}
                                            </li>
                                        ))}
                                    </ol>

                                    {!followUpAnswers ? (
                                        <form onSubmit={handleSubmitFollowUps} className="space-y-4">
                                            <div>
                                                <label
                                                    htmlFor="followUpAnswer1"
                                                    className="block text-sm font-medium text-zinc-700"
                                                >
                                                    Answer 1
                                                </label>
                                                <textarea
                                                    id="followUpAnswer1"
                                                    value={followUpAnswer1}
                                                    onChange={(e) => setFollowUpAnswer1(e.target.value)}
                                                    rows={5}
                                                    className="input-base mt-1.5 min-h-[120px] resize-y text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="followUpAnswer2"
                                                    className="block text-sm font-medium text-zinc-700"
                                                >
                                                    Answer 2
                                                </label>
                                                <textarea
                                                    id="followUpAnswer2"
                                                    value={followUpAnswer2}
                                                    onChange={(e) => setFollowUpAnswer2(e.target.value)}
                                                    rows={5}
                                                    className="input-base mt-1.5 min-h-[120px] resize-y text-sm"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingFollowUps || !canSubmitFollowUps}
                                                className="btn-primary"
                                            >
                                                {isSubmittingFollowUps
                                                    ? 'Submitting…'
                                                    : 'Submit follow-up answers'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="space-y-3">
                                            {followUpAnswers.map((answer, idx) => (
                                                <div
                                                    key={idx}
                                                    className="rounded-md border border-zinc-200 bg-zinc-50 p-4"
                                                >
                                                    <p className="section-label mb-2">
                                                        Answer {idx + 1}
                                                    </p>
                                                    <p className="whitespace-pre-wrap text-sm text-green-700">
                                                        <b>Submitted</b>
                                                    </p>
                                                </div>
                                            ))}

                                            {canRequestAiReview && !aiReviewVisible && (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleGenerateAiReview()}
                                                    className="btn-primary"
                                                >
                                                    Generate AI Review
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/*showing AI review result UI*/}
                            {aiReviewVisible && (
                                <div className="space-y-4">
                                    {isAiReviewLoading && (
                                        <div className="card flex items-center gap-3 px-5 py-8 text-sm text-zinc-500">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                                            Generating AI review…
                                        </div>
                                    )}
                                    {aiReviewError && (
                                        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                            {aiReviewError}
                                        </div>
                                    )}
                                    {aiReview && question && (
                                        <SystemDesignEvaluationReport
                                            evaluation={aiReview}
                                            metrics={question.evaluationMetrics}
                                        />
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}