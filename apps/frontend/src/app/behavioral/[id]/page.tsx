'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, isFreeAiReportLimitError, resolveActionErrorMessage } from '@/lib/api/client';
import {
    createBehavioralSession,
    generateNextBehavioralQuestion,
    getBehavioralEvaluation,
    getBehavioralQuestion,
    getBehavioralSession,
    listMyBehavioralSessions,
    requestBehavioralEvaluation,
    submitBehavioralCandidateQuestions,
    submitBehavioralTurnAnswer,
} from '@/lib/api/behavioral';
import {
    clearPracticeDraft,
    practiceDraftKey,
    readPracticeDraft,
    writePracticeDraft,
} from '@/lib/practice-drafts';
import { PremiumRequiredModal } from '@/components/PremiumRequiredModal';
import { BehavioralSubmissionView } from '@/components/behavioral/BehavioralSubmissionView';
import { BehavioralEvaluationReport } from '@/components/behavioral/BehavioralEvaluationReport';
import { PracticeAuthGate } from '@/components/practice/PracticeListShell';
import { ActionErrorAlert } from '@/components/ui/ActionErrorAlert';
import { FieldError } from '@/components/ui/FieldError';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import {
    validateAnswer,
    validateCandidateQuestions,
    validatePdfFile,
} from '@/lib/validation/fields';
import { useAuthStore } from '@/store/authStore';
import type { Difficulty } from '@/types/dsa';
import {
    BEHAVIORAL_PHASE_TYPES,
    getPhaseAtIndex,
    isAiQuestionPhase,
    type BehavioralEvaluationDetail,
    type BehavioralPhaseType,
    type BehavioralQuestionDetail,
    type BehavioralSessionDetail,
    type BehavioralSessionListItem,
    type BehavioralTurnDetail,
} from '@/types/behavioral';

type ExpandedPanel = 'submission' | 'report';
type BehavioralField = 'resume' | 'answerDraft' | 'candidateQuestionsDraft';

interface BehavioralAnswerDraft {
    turnId: string | null;
    answerDraft: string;
    candidateQuestionsDraft: string;
    updatedAt: number;
}

const BEHAVIORAL_DRAFT_DEBOUNCE_MS = 400;

const AI_POLL_INTERVAL_MS = 2000;
const AI_POLL_MAX_ATTEMPTS = 60;

function difficultyPill(difficulty: Difficulty): string {
    switch (difficulty) {
        case 'EASY':
            return 'badge-easy';
        case 'MEDIUM':
            return 'badge-medium';
        case 'HARD':
            return 'badge-hard';
    }
}

async function pollForBehavioralEvaluation(
    accessToken: string,
    sessionId: string,
    isCancelled: () => boolean,
): Promise<BehavioralEvaluationDetail> {
    for (let attempt = 0; attempt < AI_POLL_MAX_ATTEMPTS; attempt += 1) {
        if (isCancelled()) throw new Error('AI review cancelled');

        await new Promise((r) => setTimeout(r, AI_POLL_INTERVAL_MS));

        if (isCancelled()) throw new Error('AI review cancelled');

        const result = await getBehavioralEvaluation(accessToken, sessionId);

        if (result.status === 'completed' && result.evaluation) return result.evaluation;
        if (result.status === 'failed') throw new Error('AI evaluation failed. Please try again.');
    }

    throw new Error('AI evaluation timed out. Please try again.');
}

function getUnansweredTurn(turns: BehavioralTurnDetail[]): BehavioralTurnDetail | undefined {
    return turns.find((t) => !t.candidateAnswerText?.trim());
}

function getPhaseTurns(turns: BehavioralTurnDetail[], phaseType: BehavioralPhaseType) {
    return turns.filter((t) => t.phaseType === phaseType);
}

function phaseLabel(type: BehavioralPhaseType): string {
    return type
        .split('_')
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');
}

export default function BehavioralPracticePage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { accessToken } = useAuthStore();
    const { errors, touch, clear, setMany } = useFieldErrors<BehavioralField>();

    const [hydrated, setHydrated] = useState(false);
    const [question, setQuestion] = useState<BehavioralQuestionDetail | null>(null);
    const [questionError, setQuestionError] = useState<string | null>(null);
    const [isQuestionLoading, setIsQuestionLoading] = useState(true);

    const [session, setSession] = useState<BehavioralSessionDetail | null>(null);
    const [historySessions, setHistorySessions] = useState<BehavioralSessionListItem[]>([]);

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [answerDraft, setAnswerDraft] = useState('');
    const [candidateQuestionsDraft, setCandidateQuestionsDraft] = useState('');

    const [actionError, setActionError] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);

    const [aiReviewVisible, setAiReviewVisible] = useState(false);
    const [aiReview, setAiReview] = useState<BehavioralEvaluationDetail | null>(null);
    const [isAiReviewLoading, setIsAiReviewLoading] = useState(false);
    const [aiReviewError, setAiReviewError] = useState<string | null>(null);
    const [premiumModalOpen, setPremiumModalOpen] = useState(false);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel | null>(null);
    const [expandedDetail, setExpandedDetail] = useState<BehavioralSessionDetail | null>(null);
    const [expandedReport, setExpandedReport] = useState<BehavioralEvaluationDetail | null>(null);
    const [isExpandedLoading, setIsExpandedLoading] = useState(false);
    const [expandedError, setExpandedError] = useState<string | null>(null);

    const resumeReadyRef = useRef(false);
    const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const introPhase = question?.phases[0];
    const wrapUpPhase = question?.phases.find((p) => p.type === 'WRAP_UP');

    const currentPhase = useMemo(() => {
        if (!question || !session) return null;
        return getPhaseAtIndex(question.phases, session.currentPhaseIndex);
    }, [question, session]);

    const unansweredTurn = useMemo(
        () => (session ? getUnansweredTurn(session.turns) : undefined),
        [session],
    );

    const canRequestNextQuestion = useMemo(() => {
        if (!session || !question || session.status !== 'IN_PROGRESS' || !currentPhase) return false;
        if (!isAiQuestionPhase(currentPhase.type)) return false;
        if (unansweredTurn) return false;

        const phaseTurns = getPhaseTurns(session.turns, currentPhase.type);
        return phaseTurns.length < currentPhase.totalQuestions;
    }, [session, question, currentPhase, unansweredTurn]);

    const isInterviewComplete = session?.status === 'COMPLETED';
    const inProgressSession = useMemo(
        () => historySessions.find((s) => s.status === 'IN_PROGRESS') ?? null,
        [historySessions],
    );

    useEffect(() => setHydrated(true), []);

    useEffect(() => {
        if (!hydrated) return;
        if (!accessToken) router.replace('/login');
    }, [hydrated, accessToken, router]);

    useEffect(() => {
        if (!hydrated || !accessToken || !params?.id) return;

        let cancelled = false;
        resumeReadyRef.current = false;

        async function load() {
            setIsQuestionLoading(true);
            setQuestionError(null);

            try {
                const qRes = await getBehavioralQuestion(accessToken as string, params.id);

                if (cancelled) return;
                setQuestion(qRes.question);

                const histRes = await listMyBehavioralSessions(accessToken as string, {
                    questionId: qRes.question.id,
                    limit: 20,
                });

                if (cancelled) return;
                setHistorySessions(histRes.sessions);

                // Newest first from API — take the latest in-progress session.
                const inProgress = histRes.sessions.find((s) => s.status === 'IN_PROGRESS');
                if (inProgress) {
                    const sRes = await getBehavioralSession(accessToken as string, inProgress.id);

                    if (cancelled) return;
                    setSession(sRes.session);

                    const draft = readPracticeDraft<BehavioralAnswerDraft>(
                        practiceDraftKey('behavioral', sRes.session.id),
                    );
                    const openTurn = getUnansweredTurn(sRes.session.turns);
                    if (draft) {
                        if (
                            openTurn &&
                            draft.turnId === openTurn.id &&
                            draft.answerDraft
                        ) {
                            setAnswerDraft(draft.answerDraft);
                        }
                        if (draft.candidateQuestionsDraft) {
                            setCandidateQuestionsDraft(draft.candidateQuestionsDraft);
                        }
                    }
                }
            } catch (err) {
                if (cancelled) return;
                setQuestionError(err instanceof ApiError ? err.message : 'Failed to load question');
            } finally {
                if (!cancelled) {
                    setIsQuestionLoading(false);
                    resumeReadyRef.current = true;
                }
            }
        }

        void load();
        return () => { cancelled = true; };
    }, [hydrated, accessToken, params?.id]);

    useEffect(() => {
        if (!session || !resumeReadyRef.current || session.status !== 'IN_PROGRESS') return;

        if (draftTimerRef.current) {
            clearTimeout(draftTimerRef.current);
        }

        const persist = () => {
            const draft: BehavioralAnswerDraft = {
                turnId: unansweredTurn?.id ?? null,
                answerDraft,
                candidateQuestionsDraft,
                updatedAt: Date.now(),
            };
            writePracticeDraft(practiceDraftKey('behavioral', session.id), draft);
        };

        draftTimerRef.current = setTimeout(persist, BEHAVIORAL_DRAFT_DEBOUNCE_MS);

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
    }, [session, unansweredTurn?.id, answerDraft, candidateQuestionsDraft]);

    useEffect(() => {
        if (!session || !unansweredTurn) return;

        const draft = readPracticeDraft<BehavioralAnswerDraft>(
            practiceDraftKey('behavioral', session.id),
        );
        if (draft?.turnId === unansweredTurn.id && draft.answerDraft) {
            setAnswerDraft(draft.answerDraft);
        } else {
            setAnswerDraft('');
        }
    }, [session?.id, unansweredTurn?.id]);

    async function refreshHistory(questionId: string) {
        if (!accessToken) return;

        const histRes = await listMyBehavioralSessions(accessToken, { questionId, limit: 20 });
        setHistorySessions(histRes.sessions);
    }

    async function resumeInProgressSession() {
        if (!accessToken || !inProgressSession) return;

        setIsBusy(true);
        setActionError(null);
        resetAiReview();

        try {
            const sRes = await getBehavioralSession(accessToken, inProgressSession.id);
            setSession(sRes.session);

            const draft = readPracticeDraft<BehavioralAnswerDraft>(
                practiceDraftKey('behavioral', sRes.session.id),
            );
            const openTurn = getUnansweredTurn(sRes.session.turns);
            if (draft) {
                if (openTurn && draft.turnId === openTurn.id && draft.answerDraft) {
                    setAnswerDraft(draft.answerDraft);
                }
                if (draft.candidateQuestionsDraft) {
                    setCandidateQuestionsDraft(draft.candidateQuestionsDraft);
                }
            }
        } catch (err) {
            setActionError(resolveActionErrorMessage(err, 'Failed to resume interview'));
        } finally {
            setIsBusy(false);
        }
    }

    async function handleBeginInterview(e: FormEvent) {
        e.preventDefault();

        if (!accessToken || !question) return;

        if (inProgressSession) {
            await resumeInProgressSession();
            return;
        }

        const resumeErr = validatePdfFile(resumeFile);
        setMany(resumeErr ? { resume: resumeErr } : {});
        if (resumeErr || !resumeFile) return;

        setIsBusy(true);
        setActionError(null);
        resetAiReview();

        try {
            const res = await createBehavioralSession(accessToken, {
                questionId: question.id,
                resume: resumeFile,
            });
            setSession(res.session);
            setResumeFile(null);
            clear('resume');
            await refreshHistory(question.id);
        } catch (err) {
            setActionError(resolveActionErrorMessage(err, 'Failed to start interview'));
        } finally {
            setIsBusy(false);
        }
    }

    async function handleNextQuestion() {
        if (!accessToken || !session) return;

        setIsBusy(true);
        setActionError(null);

        try {
            const res = await generateNextBehavioralQuestion(accessToken, session.id);
            setSession(res.session);
        } catch (err) {
            setActionError(resolveActionErrorMessage(err, 'Failed to generate question'));
        } finally {
            setIsBusy(false);
        }
    }

    async function handleSubmitAnswer(e: FormEvent) {
        e.preventDefault();

        if (!accessToken || !session || !unansweredTurn) return;

        const answerErr = validateAnswer(answerDraft);
        setMany(answerErr ? { answerDraft: answerErr } : {});
        if (answerErr) return;

        setIsBusy(true);
        setActionError(null);

        try {
            const res = await submitBehavioralTurnAnswer(accessToken, session.id, unansweredTurn.id, {
                answer: answerDraft.trim(),
            });

            setSession(res.session);
            setAnswerDraft('');
            clear('answerDraft');
            clearPracticeDraft(practiceDraftKey('behavioral', session.id));
        } catch (err) {
            setActionError(resolveActionErrorMessage(err, 'Failed to submit answer'));
        } finally {
            setIsBusy(false);
        }
    }

    async function handleSubmitCandidateQuestions(e: FormEvent) {
        e.preventDefault();

        if (!accessToken || !session) return;

        const questionsErr = validateCandidateQuestions(candidateQuestionsDraft);
        setMany(questionsErr ? { candidateQuestionsDraft: questionsErr } : {});
        if (questionsErr) return;

        setIsBusy(true);
        setActionError(null);

        try {
            const res = await submitBehavioralCandidateQuestions(accessToken, session.id, {
                questions: candidateQuestionsDraft.trim(),
            });

            setSession(res.session);
            setCandidateQuestionsDraft('');
            clear('candidateQuestionsDraft');
            clearPracticeDraft(practiceDraftKey('behavioral', session.id));
            if (question) await refreshHistory(question.id);
        } catch (err) {
            setActionError(resolveActionErrorMessage(err, 'Failed to submit questions'));
        } finally {
            setIsBusy(false);
        }
    }

    function resetAiReview() {
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

    async function handleGenerateAiReview() {
        if (!accessToken || !session || !isInterviewComplete) return;

        let cancelled = false;
        setAiReviewVisible(true);
        setIsAiReviewLoading(true);
        setAiReviewError(null);
        setAiReview(null);

        try {
            const initial = await requestBehavioralEvaluation(accessToken, session.id);

            if (initial.status === 'completed' && initial.evaluation) {
                setAiReview(initial.evaluation);
                setHistorySessions((prev) =>
                    prev.map((s) =>
                        s.id === session.id ? { ...s, hasEvaluation: true } : s,
                    ),
                );
                return;
            }

            if (initial.status === 'failed') throw new Error('AI evaluation failed.');

            const evaluation = await pollForBehavioralEvaluation(
                accessToken,
                session.id,
                () => cancelled,
            );
            setAiReview(evaluation);
            setHistorySessions((prev) =>
                prev.map((s) =>
                    s.id === session.id ? { ...s, hasEvaluation: true } : s,
                ),
            );
        } catch (err) {
            if (isFreeAiReportLimitError(err)) {
                setAiReviewVisible(false);
                setPremiumModalOpen(true);
                return;
            }
            setAiReviewError(err instanceof ApiError ? err.message : 'AI review failed');
        } finally {
            cancelled = true;
            setIsAiReviewLoading(false);
        }
    }

    async function handleViewSubmission(item: BehavioralSessionListItem) {
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
            const res = await getBehavioralSession(accessToken, item.id);
            setExpandedDetail(res.session);
        } catch (err) {
            setExpandedDetail(null);
            setExpandedError(err instanceof ApiError ? err.message : 'Failed to load submission');
        } finally {
            setIsExpandedLoading(false);
        }
    }

    async function handleViewOrGenerateReport(item: BehavioralSessionListItem) {
        if (!accessToken) return;

        if (expandedId === item.id && expandedPanel === 'report' && item.hasEvaluation) {
            resetExpandedState();
            return;
        }

        if (item.status !== 'COMPLETED' && !item.hasEvaluation) {
            setExpandedId(item.id);
            setExpandedPanel('report');
            setExpandedDetail(null);
            setExpandedReport(null);
            setExpandedError('Complete the interview before generating a report.');
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
                const existing = await getBehavioralEvaluation(accessToken, item.id);
                if (existing.status === 'completed' && existing.evaluation) {
                    setExpandedReport(existing.evaluation);
                    return;
                }
            }

            const initial = await requestBehavioralEvaluation(accessToken, item.id);

            if (initial.status === 'completed' && initial.evaluation) {
                setExpandedReport(initial.evaluation);
                setHistorySessions((prev) =>
                    prev.map((s) => (s.id === item.id ? { ...s, hasEvaluation: true } : s)),
                );
                return;
            }

            if (initial.status === 'failed') {
                throw new Error('AI evaluation failed. Please try again.');
            }

            const evaluation = await pollForBehavioralEvaluation(
                accessToken,
                item.id,
                () => cancelled,
            );
            if (cancelled) return;
            setExpandedReport(evaluation);
            setHistorySessions((prev) =>
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

    function handleStartFresh() {
        if (inProgressSession) {
            void resumeInProgressSession();
            return;
        }

        setSession(null);
        setAnswerDraft('');
        setCandidateQuestionsDraft('');
        resetAiReview();
        setActionError(null);
    }

    if (!hydrated || !accessToken) {
        return <PracticeAuthGate hydrated={hydrated} />;
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-zinc-50">
            <main className="mx-[10%] space-y-6 py-6 sm:space-y-8 sm:py-8">
                {isQuestionLoading && (
                    <div className="card flex items-center justify-center gap-2 px-6 py-16 text-sm text-zinc-500">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                        Loading interview…
                    </div>
                )}
                {questionError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                        {questionError}
                    </div>
                )}

                {question && !isQuestionLoading && (
                    <>
                        {/* Question */}
                        <section className="card p-5 shadow-elevated sm:p-6">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{question.title}</h1>
                                <span className={difficultyPill(question.difficulty)}>
                                    {question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-500">
                                {question.companyName} · {question.roleName}
                            </p>
                            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                                {question.description}
                            </p>
                            {session && (
                                <div className="mt-6 flex flex-wrap gap-1.5">
                                    {BEHAVIORAL_PHASE_TYPES.map((type, idx) => (
                                        <span
                                            key={type}
                                            className={`rounded-md px-2 py-0.5 text-xs ${idx === session.currentPhaseIndex
                                                ? 'bg-emerald-100 font-medium text-emerald-800'
                                                : idx < session.currentPhaseIndex
                                                    ? 'bg-zinc-100 text-zinc-500'
                                                    : 'border border-zinc-200 text-zinc-400'
                                                }`}
                                        >
                                            {phaseLabel(type)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>

                        {actionError && <ActionErrorAlert message={actionError} />}

                        {/* Live interview flow */}
                        <section className="card p-5 shadow-elevated sm:p-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="text-base font-semibold text-zinc-900">Interview</h2>
                                {session && session.status === 'COMPLETED' && !inProgressSession && (
                                    <button type="button" onClick={handleStartFresh} className="text-xs text-zinc-500 hover:text-zinc-800">
                                        Start new interview
                                    </button>
                                )}
                            </div>

                            {!session ? (
                                <div className="space-y-4">
                                    {inProgressSession ? (
                                        <div className="space-y-3">
                                            <p className="text-sm text-zinc-600">
                                                You have an interview in progress. Continue where you left off.
                                            </p>
                                            <button
                                                type="button"
                                                disabled={isBusy}
                                                onClick={() => void resumeInProgressSession()}
                                                className="btn-primary"
                                            >
                                                {isBusy ? 'Resuming…' : 'Continue interview'}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                    {introPhase && (
                                        <p className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-4 py-3.5 text-sm leading-relaxed text-zinc-700">
                                            {typeof introPhase.content.statement === 'string'
                                                ? introPhase.content.statement
                                                : introPhase.description}
                                        </p>
                                    )}
                                    <form onSubmit={handleBeginInterview} noValidate className="space-y-4">
                                        <div>
                                            <label htmlFor="resume" className="block text-sm font-medium text-zinc-700">
                                                Resume (PDF, max 5 MB)
                                            </label>
                                            <input
                                                id="resume"
                                                type="file"
                                                accept="application/pdf,.pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    setResumeFile(file);
                                                    touch('resume', validatePdfFile(file));
                                                }}
                                                onBlur={() => touch('resume', validatePdfFile(resumeFile))}
                                                aria-invalid={Boolean(errors.resume)}
                                                aria-describedby={errors.resume ? 'resume-error' : undefined}
                                                className="mt-1.5 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                                            />
                                            <FieldError id="resume-error" message={errors.resume} />
                                        </div>
                                        <button type="submit" disabled={isBusy || !resumeFile} className="btn-primary">
                                            {isBusy ? 'Uploading…' : 'Upload resume & begin'}
                                        </button>
                                    </form>
                                        </>
                                    )}
                                </div>
                            ) : isInterviewComplete ? (
                                <div className="space-y-4">
                                    {wrapUpPhase && (
                                        <p className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3.5 text-sm text-zinc-700">
                                            {typeof wrapUpPhase.content.statement === 'string'
                                                ? wrapUpPhase.content.statement
                                                : wrapUpPhase.description}
                                        </p>
                                    )}
                                    <p className="text-sm text-zinc-500">Interview complete. Review your transcript below or generate an AI report.</p>
                                </div>
                            ) : currentPhase?.type === 'CANDIDATE_QUESTIONS' ? (
                                <form onSubmit={handleSubmitCandidateQuestions} noValidate className="space-y-4">
                                    <p className="text-sm text-zinc-600">
                                        {typeof currentPhase.content.prompt === 'string'
                                            ? currentPhase.content.prompt
                                            : currentPhase.description}
                                    </p>
                                    <div>
                                        <textarea
                                            value={candidateQuestionsDraft}
                                            onChange={(e) => {
                                                setCandidateQuestionsDraft(e.target.value);
                                                clear('candidateQuestionsDraft');
                                            }}
                                            onBlur={() =>
                                                touch(
                                                    'candidateQuestionsDraft',
                                                    validateCandidateQuestions(candidateQuestionsDraft),
                                                )
                                            }
                                            rows={6}
                                            placeholder="Ask your questions to the interviewer (all at once)…"
                                            aria-invalid={Boolean(errors.candidateQuestionsDraft)}
                                            aria-describedby={
                                                errors.candidateQuestionsDraft
                                                    ? 'candidate-questions-error'
                                                    : undefined
                                            }
                                            className="input-base min-h-[140px] resize-y text-sm"
                                        />
                                        <FieldError
                                            id="candidate-questions-error"
                                            message={errors.candidateQuestionsDraft}
                                        />
                                    </div>
                                    <button type="submit" disabled={isBusy || !candidateQuestionsDraft.trim()} className="btn-primary">
                                        {isBusy ? 'Submitting…' : 'Submit questions'}
                                    </button>
                                </form>
                            ) : unansweredTurn ? (
                                <form onSubmit={handleSubmitAnswer} noValidate className="space-y-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                        {phaseLabel(unansweredTurn.phaseType)}
                                        {unansweredTurn.isFollowUp ? ' · Follow-up' : ''}
                                    </p>
                                    <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
                                        {unansweredTurn.questionText}
                                    </p>
                                    <div>
                                        <textarea
                                            value={answerDraft}
                                            onChange={(e) => {
                                                setAnswerDraft(e.target.value);
                                                clear('answerDraft');
                                            }}
                                            onBlur={() => touch('answerDraft', validateAnswer(answerDraft))}
                                            rows={8}
                                            placeholder="Your answer…"
                                            aria-invalid={Boolean(errors.answerDraft)}
                                            aria-describedby={
                                                errors.answerDraft ? 'answer-draft-error' : undefined
                                            }
                                            className="input-base min-h-[160px] resize-y text-sm"
                                        />
                                        <FieldError id="answer-draft-error" message={errors.answerDraft} />
                                    </div>
                                    <button type="submit" disabled={isBusy || !answerDraft.trim()} className="btn-primary">
                                        {isBusy ? 'Submitting…' : 'Submit answer'}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    {currentPhase && (
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{currentPhase.title}</p>
                                            <p className="mt-1 text-sm text-zinc-500">{currentPhase.description}</p>
                                        </div>
                                    )}
                                    {canRequestNextQuestion && (
                                        <button type="button" onClick={() => void handleNextQuestion()} disabled={isBusy} className="btn-primary">
                                            {isBusy ? 'Generating…' : 'Next question'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {session && session.turns.length > 0 && (
                                <div className="mt-8 border-t border-zinc-100 pt-6">
                                    <h3 className="mb-3 text-sm font-semibold text-zinc-900">Transcript</h3>
                                    <ol className="space-y-4">
                                        {session.turns.map((turn) => (
                                            <li key={turn.id} className="rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3">
                                                <p className="text-xs font-medium text-zinc-500">
                                                    {phaseLabel(turn.phaseType)}
                                                    {turn.isFollowUp ? ' · Follow-up' : ''}
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-zinc-800">Q: {turn.questionText}</p>
                                                {turn.candidateAnswerText && (
                                                    <p className="mt-2 text-sm text-zinc-600">A: {turn.candidateAnswerText}</p>
                                                )}
                                                {turn.phaseType === "CANDIDATE_QUESTIONS" && (
                                                    <p className="mt-2 text-sm text-emerald-800">
                                                        Interviewer: {turn.interviewerReplyText}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </section>

                        {/* Result */}
                        <section className="card p-5 shadow-elevated sm:p-6">
                            <h2 className="mb-4 text-base font-semibold text-zinc-900">Result</h2>
                            {!isInterviewComplete ? (
                                <p className="text-sm text-zinc-500">Complete the full interview to unlock AI review.</p>
                            ) : (
                                <div className="space-y-4">
                                    {!aiReviewVisible && (
                                        <button type="button" onClick={() => void handleGenerateAiReview()} className="btn-primary">
                                            Generate AI review
                                        </button>
                                    )}
                                    {isAiReviewLoading && (
                                        <p className="flex items-center gap-2 text-sm text-zinc-500">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                                            Generating AI review…
                                        </p>
                                    )}
                                    {aiReviewError && (
                                        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                            {aiReviewError}
                                        </div>
                                    )}
                                    {aiReview && <BehavioralEvaluationReport evaluation={aiReview} />}
                                </div>
                            )}
                        </section>

                        {/* Submissions */}
                        <section className="card p-5 shadow-elevated sm:p-6">
                            <h2 className="mb-4 text-base font-semibold text-zinc-900">Submissions</h2>
                            {historySessions.length === 0 ? (
                                <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
                                    No past attempts yet. Complete an interview to see history here.
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {historySessions.map((item) => {
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
                                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                                        item.status === 'COMPLETED'
                                                                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                                            : 'bg-sky-50 text-sky-700 ring-sky-600/20'
                                                                    }`}
                                                                >
                                                                    {item.status === 'COMPLETED'
                                                                        ? 'COMPLETED'
                                                                        : 'IN PROGRESS'}
                                                                </span>
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
                                                                <BehavioralSubmissionView
                                                                    session={expandedDetail}
                                                                />
                                                            )}
                                                        {!isExpandedLoading &&
                                                            !expandedError &&
                                                            expandedPanel === 'report' &&
                                                            expandedReport && (
                                                                <BehavioralEvaluationReport
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
                        </section>
                    </>
                )}
            </main>

            <PremiumRequiredModal
                open={premiumModalOpen}
                onOpenChange={setPremiumModalOpen}
                title="Free AI report used"
                description="Free users get one AI report for Behavioral. Upgrade to Premium for unlimited AI reviews across all practice sections."
            />
        </div>
    );
}
