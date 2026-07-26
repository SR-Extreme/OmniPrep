'use client';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, isFreeAiReportLimitError } from '@/lib/api/client';
import {
    createSystemDesignSubmission,
    generateSystemDesignFollowUps,
    getSystemDesignEvaluation,
    getSystemDesignQuestion,
    getSystemDesignSubmission,
    listMySystemDesignSubmissions,
    requestSystemDesignEvaluation,
    submitSystemDesignFollowUpAnswers,
} from '@/lib/api/system-design';
import {
    clearPracticeDraft,
    practiceDraftKey,
    readPracticeDraft,
    writePracticeDraft,
} from '@/lib/practice-drafts';
import { PremiumRequiredModal } from '@/components/PremiumRequiredModal';
import { PracticeAuthGate } from '@/components/practice/PracticeListShell';
import { RevealSection } from '@/components/RevealSection';
import { SystemDesignSubmissionView } from '@/components/system-design/SystemDesignSubmissionView';
import { SystemDesignEvaluationReport } from '@/components/system-design/SystemDesignEvaluationReport';
import { FieldError } from '@/components/ui/FieldError';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import {
    validateDiagramFile,
    validateFollowUpAnswer,
    validateSystemDesignInitialContent,
    validateTextAnswer,
} from '@/lib/validation/fields';
import { useAuthStore } from '@/store/authStore';
import type {
    EvaluationMetric,
    SystemDesignEvaluationDetail,
    SystemDesignQuestionDetail,
    SystemDesignSubmissionDetail,
    SystemDesignSubmissionListItem,
} from '@/types/system-design';

type LeftTab = 'question' | 'submissions';
type ExpandedPanel = 'submission' | 'report';
type SystemDesignField =
    | 'textAnswer'
    | 'diagram'
    | 'followUpAnswer1'
    | 'followUpAnswer2';

interface SystemDesignPracticeDraft {
    textAnswer: string;
    followUpAnswer1: string;
    followUpAnswer2: string;
    updatedAt: number;
}

const SD_DRAFT_DEBOUNCE_MS = 400;

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
    const { errors, touch, clear, setMany } = useFieldErrors<SystemDesignField>();

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
    const [premiumModalOpen, setPremiumModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<LeftTab>('question');
    const [mySubmissions, setMySubmissions] = useState<SystemDesignSubmissionListItem[]>([]);
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);
    const [submissionsError, setSubmissionsError] = useState<string | null>(null);
    const [submissionsLoadedFor, setSubmissionsLoadedFor] = useState<string | null>(null);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel | null>(null);
    const [expandedDetail, setExpandedDetail] = useState<SystemDesignSubmissionDetail | null>(null);
    const [expandedReport, setExpandedReport] = useState<SystemDesignEvaluationDetail | null>(null);
    const [isExpandedLoading, setIsExpandedLoading] = useState(false);
    const [expandedError, setExpandedError] = useState<string | null>(null);

    const resumeReadyRef = useRef(false);
    const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const canStartNewAttempt =
        submission != null && followUpAnswers != null;

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
        resumeReadyRef.current = false;

        async function loadQuestion() {
            setIsQuestionLoading(true);
            setQuestionError(null);
            setSubmission(null);
            setDiagramFile(null);
            setAiReviewVisible(false);
            setAiReview(null);
            setAiReviewError(null);
            setActiveTab('question');
            setMySubmissions([]);
            setSubmissionsLoadedFor(null);
            setExpandedId(null);
            setExpandedPanel(null);
            setExpandedDetail(null);
            setExpandedReport(null);

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

                const draftKey = practiceDraftKey('system-design', res.question.id);
                const draft = readPracticeDraft<SystemDesignPracticeDraft>(draftKey);

                let resumed = false;

                try {
                    const history = await listMySystemDesignSubmissions(
                        accessToken as string,
                        { questionId: res.question.id, limit: 50 },
                    );
                    if (cancelled) return;

                    setMySubmissions(history.submissions);
                    setSubmissionsLoadedFor(res.question.id);

                    // Prefer incomplete attempt; otherwise latest overall.
                    const incomplete =
                        history.submissions.find((s) => !s.hasFollowUpAnswers) ??
                        history.submissions[0] ??
                        null;

                    if (incomplete) {
                        const detail = await getSystemDesignSubmission(
                            accessToken as string,
                            incomplete.id,
                        );
                        if (cancelled) return;

                        setSubmission(detail.submission);
                        setTextAnswer(detail.submission.textAnswer ?? '');

                        if (detail.submission.followUpAnswers) {
                            setFollowUpAnswer1(detail.submission.followUpAnswers[0] ?? '');
                            setFollowUpAnswer2(detail.submission.followUpAnswers[1] ?? '');
                        } else if (draft) {
                            setFollowUpAnswer1(draft.followUpAnswer1 ?? '');
                            setFollowUpAnswer2(draft.followUpAnswer2 ?? '');
                        }

                        if (incomplete.hasEvaluation) {
                            try {
                                const evalRes = await getSystemDesignEvaluation(
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
                                // No report yet.
                            }
                        }

                        resumed = true;
                    }
                } catch {
                    // Best-effort resume.
                }

                if (!resumed) {
                    setTextAnswer(draft?.textAnswer ?? '');
                    setFollowUpAnswer1(draft?.followUpAnswer1 ?? '');
                    setFollowUpAnswer2(draft?.followUpAnswer2 ?? '');
                }
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
                    resumeReadyRef.current = true;
                }
            }
        }

        void loadQuestion();

        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, params?.id]);

    useEffect(() => {
        if (!question || !resumeReadyRef.current) return;
        if (submission?.followUpAnswers) return;

        if (draftTimerRef.current) {
            clearTimeout(draftTimerRef.current);
        }

        const persist = () => {
            const draft: SystemDesignPracticeDraft = {
                textAnswer: submission ? (submission.textAnswer ?? '') : textAnswer,
                followUpAnswer1,
                followUpAnswer2,
                updatedAt: Date.now(),
            };
            writePracticeDraft(practiceDraftKey('system-design', question.id), draft);
        };

        draftTimerRef.current = setTimeout(persist, SD_DRAFT_DEBOUNCE_MS);

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
    }, [question, submission, textAnswer, followUpAnswer1, followUpAnswer2]);

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

    const loadSubmissions = useCallback(
        async (questionId: string, force = false) => {
            if (!accessToken) return;
            if (!force && submissionsLoadedFor === questionId) return;

            setIsSubmissionsLoading(true);
            setSubmissionsError(null);

            try {
                const res = await listMySystemDesignSubmissions(accessToken, {
                    questionId,
                    limit: 50,
                });
                setMySubmissions(res.submissions);
                setSubmissionsLoadedFor(questionId);
            } catch (err) {
                setSubmissionsError(
                    err instanceof ApiError ? err.message : 'Failed to load submissions',
                );
            } finally {
                setIsSubmissionsLoading(false);
            }
        },
        [accessToken, submissionsLoadedFor],
    );

    useEffect(() => {
        if (activeTab !== 'submissions' || !question) return;
        void loadSubmissions(question.id);
    }, [activeTab, question, loadSubmissions]);

    function handleStartNewAttempt() {
        if (!question) return;
        setSubmission(null);
        setTextAnswer('');
        setDiagramFile(null);
        setFollowUpAnswer1('');
        setFollowUpAnswer2('');
        resetAiReviewState();
        clear();
        clearPracticeDraft(practiceDraftKey('system-design', question.id));
    }

    //initial diagram/text answer to get initial submission
    async function handleInitialSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!accessToken || !question) {
            return;
        }

        const contentErr = validateSystemDesignInitialContent(textAnswer, diagramFile);
        const textErr = validateTextAnswer(textAnswer);
        const diagramErr = validateDiagramFile(diagramFile);
        const next: Partial<Record<SystemDesignField, string>> = {};
        if (textErr) {
            next.textAnswer = textErr;
        } else if (contentErr && !diagramErr) {
            next.textAnswer = contentErr;
        }
        if (diagramErr) {
            next.diagram = diagramErr;
        }
        setMany(next);
        if (Object.keys(next).length > 0 || contentErr) {
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
            clear();
            setSubmissionsLoadedFor(null);
            resetExpandedState();
            writePracticeDraft(practiceDraftKey('system-design', question.id), {
                textAnswer: res.submission.textAnswer ?? '',
                followUpAnswer1: '',
                followUpAnswer2: '',
                updatedAt: Date.now(),
            } satisfies SystemDesignPracticeDraft);
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
            setSubmissionsLoadedFor(null);
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

        const next: Partial<Record<SystemDesignField, string>> = {};
        const fu1Err = validateFollowUpAnswer(followUpAnswer1, 1);
        const fu2Err = validateFollowUpAnswer(followUpAnswer2, 2);
        if (fu1Err) next.followUpAnswer1 = fu1Err;
        if (fu2Err) next.followUpAnswer2 = fu2Err;
        setMany(next);
        if (Object.keys(next).length > 0) {
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
            clear('followUpAnswer1');
            clear('followUpAnswer2');
            if (question) {
                clearPracticeDraft(practiceDraftKey('system-design', question.id));
                setSubmissionsLoadedFor(null);
            }
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
                setMySubmissions((prev) =>
                    prev.map((s) =>
                        s.id === submission.id ? { ...s, hasEvaluation: true } : s,
                    ),
                );
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
            setMySubmissions((prev) =>
                prev.map((s) =>
                    s.id === submission.id ? { ...s, hasEvaluation: true } : s,
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

    async function handleViewSubmission(item: SystemDesignSubmissionListItem) {
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
            const res = await getSystemDesignSubmission(accessToken, item.id);
            setExpandedDetail(res.submission);
        } catch (err) {
            setExpandedDetail(null);
            setExpandedError(err instanceof ApiError ? err.message : 'Failed to load submission');
        } finally {
            setIsExpandedLoading(false);
        }
    }

    async function handleViewOrGenerateReport(item: SystemDesignSubmissionListItem) {
        if (!accessToken) return;

        if (expandedId === item.id && expandedPanel === 'report' && item.hasEvaluation) {
            resetExpandedState();
            return;
        }

        if (!item.hasFollowUpAnswers && !item.hasEvaluation) {
            setExpandedId(item.id);
            setExpandedPanel('report');
            setExpandedDetail(null);
            setExpandedReport(null);
            setExpandedError('Complete follow-up answers before generating a report.');
            setIsExpandedLoading(false);
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
                const existing = await getSystemDesignEvaluation(accessToken, item.id);
                if (existing.status === 'completed' && existing.evaluation) {
                    setExpandedReport(existing.evaluation);
                    return;
                }
            }

            const initial = await requestSystemDesignEvaluation(accessToken, item.id);

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

            const evaluation = await pollForSystemDesignEvaluation(
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
        return <PracticeAuthGate hydrated={hydrated} />;
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

                        {/* Left panel: Question | Submissions */}
                        <section className="card overflow-hidden shadow-elevated">
                            <div className="border-b border-zinc-200 px-5 py-4 sm:px-6">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                                        {question.title}
                                    </h1>
                                    <span className={difficultyPill(question.difficulty)}>
                                        {question.difficulty.charAt(0) +
                                            question.difficulty.slice(1).toLowerCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex border-b border-zinc-200 bg-zinc-50/50">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('question')}
                                    className={[
                                        'flex-1 border-b-2 px-3 py-2.5 text-sm font-medium transition duration-150',
                                        activeTab === 'question'
                                            ? 'border-emerald-600 bg-white text-emerald-700'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-800',
                                    ].join(' ')}
                                >
                                    Question
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('submissions')}
                                    className={[
                                        'flex-1 border-b-2 px-3 py-2.5 text-sm font-medium transition duration-150',
                                        activeTab === 'submissions'
                                            ? 'border-emerald-600 bg-white text-emerald-700'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-800',
                                    ].join(' ')}
                                >
                                    Submissions
                                </button>
                            </div>
                            <div className="max-h-[calc(100vh-220px)] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                                {activeTab === 'question' && (
                                    <>
                                        <div className="prose prose-sm max-w-none text-zinc-700">
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {question.description}
                                            </p>
                                        </div>
                                        <div className="space-y-5">
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
                                                <RevealSection title="Topics" count={question.topics.length}>
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
                                                </RevealSection>
                                            )}
                                            {question.hints.length > 0 && (
                                                <RevealSection title="Hints" count={question.hints.length}>
                                                    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
                                                        {question.hints.map((hint, idx) => (
                                                            <li key={`${hint}-${idx}`}>{hint}</li>
                                                        ))}
                                                    </ul>
                                                </RevealSection>
                                            )}
                                        </div>
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
                                                No submissions yet. Submit an answer to see history here.
                                            </div>
                                        ) : (
                                            <ul className="space-y-3">
                                                {mySubmissions.map((item) => {
                                                    const isOpen = expandedId === item.id;
                                                    const submittedAt = new Date(
                                                        item.createdAt,
                                                    ).toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    });
                                                    const stageLabel = item.hasFollowUpAnswers
                                                        ? 'Complete'
                                                        : item.hasFollowUpQuestions
                                                          ? 'Follow-ups pending'
                                                          : 'Initial answer';

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
                                                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                                                    item.hasFollowUpAnswers
                                                                                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                                                        : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                                                                }`}
                                                                            >
                                                                                {stageLabel}
                                                                            </span>
                                                                            {item.hasTextAnswer && (
                                                                                <span className="text-xs text-zinc-500">
                                                                                    Text
                                                                                </span>
                                                                            )}
                                                                            {item.hasDiagram && (
                                                                                <span className="text-xs text-zinc-500">
                                                                                    Diagram
                                                                                </span>
                                                                            )}
                                                                            {item.hasEvaluation && (
                                                                                <span className="text-xs text-zinc-400">
                                                                                    Reviewed
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-zinc-500">
                                                                            {submittedAt}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                void handleViewSubmission(item)
                                                                            }
                                                                            className="btn-secondary !py-1.5 !text-xs"
                                                                        >
                                                                            {isOpen &&
                                                                            expandedPanel === 'submission'
                                                                                ? 'Hide submission'
                                                                                : 'View submission'}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                void handleViewOrGenerateReport(
                                                                                    item,
                                                                                )
                                                                            }
                                                                            className="btn-primary !py-1.5 !text-xs"
                                                                        >
                                                                            {isOpen &&
                                                                            expandedPanel === 'report' &&
                                                                            item.hasEvaluation
                                                                                ? 'Hide report'
                                                                                : item.hasEvaluation
                                                                                  ? 'View report'
                                                                                  : isOpen &&
                                                                                      expandedPanel ===
                                                                                          'report' &&
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
                                                                            <SystemDesignSubmissionView
                                                                                submission={expandedDetail}
                                                                            />
                                                                        )}
                                                                    {!isExpandedLoading &&
                                                                        !expandedError &&
                                                                        expandedPanel === 'report' &&
                                                                        expandedReport && (
                                                                            <SystemDesignEvaluationReport
                                                                                evaluation={expandedReport}
                                                                                metrics={
                                                                                    question.evaluationMetrics
                                                                                }
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
                                <form
                                    onSubmit={handleInitialSubmit}
                                    noValidate
                                    className="card space-y-4 p-5 shadow-elevated sm:p-6"
                                >
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
                                            onChange={(e) => {
                                                setTextAnswer(e.target.value);
                                                clear('textAnswer');
                                            }}
                                            onBlur={() =>
                                                touch('textAnswer', validateTextAnswer(textAnswer))
                                            }
                                            rows={12}
                                            placeholder="Describe your high-level design, APIs, data model, scaling approach…"
                                            aria-invalid={Boolean(errors.textAnswer)}
                                            aria-describedby={
                                                errors.textAnswer ? 'text-answer-error' : undefined
                                            }
                                            className="input-base mt-1.5 min-h-[220px] resize-y font-mono text-sm"
                                        />
                                        <FieldError id="text-answer-error" message={errors.textAnswer} />
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
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] ?? null;
                                                setDiagramFile(file);
                                                touch('diagram', validateDiagramFile(file));
                                                clear('textAnswer');
                                            }}
                                            onBlur={() =>
                                                touch('diagram', validateDiagramFile(diagramFile))
                                            }
                                            aria-invalid={Boolean(errors.diagram)}
                                            aria-describedby={
                                                errors.diagram ? 'diagram-error' : undefined
                                            }
                                            className="mt-1.5 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
                                        />
                                        {diagramFile && (
                                            <p className="mt-2 text-xs text-zinc-500">
                                                Selected: {diagramFile.name}
                                            </p>
                                        )}
                                        <FieldError id="diagram-error" message={errors.diagram} />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !hasInitialAnswer}
                                        className="btn-primary w-full sm:w-auto"
                                    >
                                        {isSubmitting ? 'Submitting…' : 'Submit answer'}
                                    </button>
                                </form>
                            ) : !followUpQuestions ? (
                                <div className="card space-y-4 p-5 shadow-elevated sm:p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-base font-semibold text-zinc-900">
                                                Submitted answer
                                            </h2>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Submission ID: {submission.id}
                                            </p>
                                        </div>
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
                            ) : null}

                            {/*UI for followUp question , answers area , whether answered or not , and generate aiReview button*/}
                            {followUpQuestions && (
                                <div className="card space-y-4 p-5 shadow-elevated sm:p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-base font-semibold text-zinc-900">
                                                Follow-up round
                                            </h2>
                                            <p className="mt-1 text-sm text-zinc-500">
                                                Answer both interviewer follow-up questions.
                                            </p>
                                        </div>
                                        {canStartNewAttempt ? (
                                            <button
                                                type="button"
                                                onClick={handleStartNewAttempt}
                                                className="btn-secondary !py-1.5 !text-xs"
                                            >
                                                Start new attempt
                                            </button>
                                        ) : null}
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
                                        <form
                                            onSubmit={handleSubmitFollowUps}
                                            noValidate
                                            className="space-y-4"
                                        >
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
                                                    onChange={(e) => {
                                                        setFollowUpAnswer1(e.target.value);
                                                        clear('followUpAnswer1');
                                                    }}
                                                    onBlur={() =>
                                                        touch(
                                                            'followUpAnswer1',
                                                            validateFollowUpAnswer(followUpAnswer1, 1),
                                                        )
                                                    }
                                                    rows={5}
                                                    aria-invalid={Boolean(errors.followUpAnswer1)}
                                                    aria-describedby={
                                                        errors.followUpAnswer1
                                                            ? 'follow-up-1-error'
                                                            : undefined
                                                    }
                                                    className="input-base mt-1.5 min-h-[120px] resize-y text-sm"
                                                />
                                                <FieldError
                                                    id="follow-up-1-error"
                                                    message={errors.followUpAnswer1}
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
                                                    onChange={(e) => {
                                                        setFollowUpAnswer2(e.target.value);
                                                        clear('followUpAnswer2');
                                                    }}
                                                    onBlur={() =>
                                                        touch(
                                                            'followUpAnswer2',
                                                            validateFollowUpAnswer(followUpAnswer2, 2),
                                                        )
                                                    }
                                                    rows={5}
                                                    aria-invalid={Boolean(errors.followUpAnswer2)}
                                                    aria-describedby={
                                                        errors.followUpAnswer2
                                                            ? 'follow-up-2-error'
                                                            : undefined
                                                    }
                                                    className="input-base mt-1.5 min-h-[120px] resize-y text-sm"
                                                />
                                                <FieldError
                                                    id="follow-up-2-error"
                                                    message={errors.followUpAnswer2}
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
                                            {followUpQuestions.map((q, idx) => (
                                                <div
                                                    key={idx}
                                                    className="rounded-md border border-zinc-200 bg-zinc-50 p-4"
                                                >
                                                    <p className="section-label mb-2">
                                                        Q{idx + 1}
                                                    </p>
                                                    <p className="text-sm text-zinc-800">{q}</p>
                                                    <p className="section-label mb-2 mt-3">
                                                        Answer {idx + 1}
                                                    </p>
                                                    <p className="whitespace-pre-wrap text-sm text-zinc-700">
                                                        {followUpAnswers?.[idx] ?? ''}
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
            <PremiumRequiredModal
                open={premiumModalOpen}
                onOpenChange={setPremiumModalOpen}
                title="Free AI report used"
                description="Free users get one AI report for System Design. Upgrade to Premium for unlimited AI reviews across all practice sections."
            />
        </div>
    );
}