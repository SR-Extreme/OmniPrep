'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FieldError } from '@/components/ui/FieldError';
import { ActionErrorAlert } from '@/components/ui/ActionErrorAlert';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { resolveActionErrorMessage } from '@/lib/api/client';
import {
    generateNextBehavioralQuestion,
    getBehavioralQuestion,
    getBehavioralSession,
    submitBehavioralTurnAnswer,
} from '@/lib/api/behavioral';
import {
    createMockBehavioralSession,
    finalizeMockBehavioralSection,
    listMockBehavioralRoles,
    startMockBehavioralSection,
} from '@/lib/api/mock-interview';
import {
    clearPracticeDraft,
    practiceDraftKey,
    readPracticeDraft,
    writePracticeDraft,
} from '@/lib/practice-drafts';
import {
    validateAnswer,
    validateBehavioralRole,
    validatePdfFile,
} from '@/lib/validation/fields';
import {
    getPhaseAtIndex,
    isAiQuestionPhase,
    type BehavioralPhaseType,
    type BehavioralQuestionDetail,
    type BehavioralSessionDetail,
    type BehavioralTurnDetail,
} from '@/types/behavioral';
import {
    BEHAVIORAL_SECTION_EVAL_NOTE,
    type MockInterviewBehavioralDetail,
    type MockInterviewSessionDetail,
} from '@/types/mock-interview';

export interface BehavioralSectionWorkspaceProps {
    accessToken: string;
    interviewId: string;
    assignment: MockInterviewBehavioralDetail;
    behavioralStartedAt: string | null;
    readOnly?: boolean;
    onInterviewChange: (interview: MockInterviewSessionDetail) => void;
}

type BehavioralWorkspaceField = 'selectedRole' | 'resume' | 'answerDraft';

interface BehavioralMockDraft {
    turnId: string | null;
    answerDraft: string;
    updatedAt: number;
}

const BEHAVIORAL_DRAFT_DEBOUNCE_MS = 400;

function getUnansweredTurn(turns: BehavioralTurnDetail[]): BehavioralTurnDetail | undefined {
    return turns.find((turn) => !turn.candidateAnswerText?.trim());
}

function getPhaseTurns(turns: BehavioralTurnDetail[], phaseType: BehavioralPhaseType) {
    return turns.filter((turn) => turn.phaseType === phaseType);
}

function phaseLabel(type: BehavioralPhaseType): string {
    return type
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
}

export function BehavioralSectionWorkspace({
    accessToken,
    interviewId,
    assignment,
    behavioralStartedAt,
    readOnly = false,
    onInterviewChange,
}: BehavioralSectionWorkspaceProps) {
    const { errors, touch, clear, setMany } = useFieldErrors<BehavioralWorkspaceField>();

    const [roles, setRoles] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState(assignment.roleName ?? '');
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const [question, setQuestion] = useState<BehavioralQuestionDetail | null>(null);
    const [session, setSession] = useState<BehavioralSessionDetail | null>(null);

    const [answerDraft, setAnswerDraft] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    const resumeReadyRef = useRef(false);
    const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const visiblePhases = useMemo(
        () =>
            (question?.phases ?? []).filter(
                (phase) => phase.type !== 'CANDIDATE_QUESTIONS',
            ),
        [question],
    );

    const currentPhase = useMemo(() => {
        if (!question || !session) {
            return null;
        }
        return getPhaseAtIndex(question.phases, session.currentPhaseIndex);
    }, [question, session]);

    const unansweredTurn = useMemo(
        () => (session ? getUnansweredTurn(session.turns) : undefined),
        [session],
    );

    const canRequestNextQuestion = useMemo(() => {
        if (!session || !question || session.status !== 'IN_PROGRESS' || !currentPhase) {
            return false;
        }
        if (!isAiQuestionPhase(currentPhase.type)) {
            return false;
        }
        if (unansweredTurn) {
            return false;
        }

        const phaseTurns = getPhaseTurns(session.turns, currentPhase.type);
        return phaseTurns.length < currentPhase.totalQuestions;
    }, [session, question, currentPhase, unansweredTurn]);

    const isInterviewComplete = session?.status === 'COMPLETED';
    const needsRole = !behavioralStartedAt || !assignment.roleName || !assignment.questionId;
    const needsResume = Boolean(behavioralStartedAt && assignment.questionId && !assignment.sessionId);

    useEffect(() => {
        let cancelled = false;
        resumeReadyRef.current = false;

        async function bootstrap() {
            setIsBootstrapping(true);
            setActionError(null);

            try {
                const rolesRes = await listMockBehavioralRoles(accessToken);
                if (cancelled) {
                    return;
                }
                setRoles(rolesRes.roles);

                if (assignment.roleName) {
                    setSelectedRole(assignment.roleName);
                }

                if (assignment.questionId) {
                    const questionRes = await getBehavioralQuestion(
                        accessToken,
                        assignment.questionId,
                    );
                    if (cancelled) {
                        return;
                    }
                    setQuestion(questionRes.question);
                } else {
                    setQuestion(null);
                }

                if (assignment.sessionId) {
                    const sessionRes = await getBehavioralSession(
                        accessToken,
                        assignment.sessionId,
                    );
                    if (cancelled) {
                        return;
                    }
                    setSession(sessionRes.session);

                    const draft = readPracticeDraft<BehavioralMockDraft>(
                        practiceDraftKey('behavioral', sessionRes.session.id),
                    );
                    const openTurn = getUnansweredTurn(sessionRes.session.turns);
                    if (
                        draft &&
                        openTurn &&
                        draft.turnId === openTurn.id &&
                        draft.answerDraft
                    ) {
                        setAnswerDraft(draft.answerDraft);
                    } else {
                        setAnswerDraft('');
                    }
                } else {
                    setSession(null);
                    setAnswerDraft('');
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }
                setActionError(
                    resolveActionErrorMessage(err, 'Failed to load behavioral section'),
                );
            } finally {
                if (!cancelled) {
                    setIsBootstrapping(false);
                    resumeReadyRef.current = true;
                }
            }
        }

        void bootstrap();
        return () => {
            cancelled = true;
        };
    }, [
        accessToken,
        assignment.roleName,
        assignment.questionId,
        assignment.sessionId,
        behavioralStartedAt,
    ]);

    useEffect(() => {
        if (!session || !resumeReadyRef.current || session.status !== 'IN_PROGRESS' || readOnly) {
            return;
        }

        if (draftTimerRef.current) {
            clearTimeout(draftTimerRef.current);
        }

        const persist = () => {
            const draft: BehavioralMockDraft = {
                turnId: unansweredTurn?.id ?? null,
                answerDraft,
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
    }, [session, unansweredTurn?.id, answerDraft, readOnly]);

    useEffect(() => {
        if (!session || !unansweredTurn) {
            return;
        }

        const draft = readPracticeDraft<BehavioralMockDraft>(
            practiceDraftKey('behavioral', session.id),
        );
        if (draft?.turnId === unansweredTurn.id && draft.answerDraft) {
            setAnswerDraft(draft.answerDraft);
        } else {
            setAnswerDraft('');
        }
    }, [session?.id, unansweredTurn?.id]);

    async function handleStartRole(event: FormEvent) {
        event.preventDefault();
        if (readOnly) {
            return;
        }

        const roleErr = validateBehavioralRole(selectedRole);
        setMany(roleErr ? { selectedRole: roleErr } : {});
        if (roleErr) {
            return;
        }

        setIsBusy(true);
        setActionError(null);

        try {
            const res = await startMockBehavioralSection(accessToken, interviewId, {
                roleName: selectedRole.trim(),
            });
            onInterviewChange(res.interview);
            clear('selectedRole');
        } catch (err) {
            setActionError(
                resolveActionErrorMessage(err, 'Failed to start behavioral section'),
            );
        } finally {
            setIsBusy(false);
        }
    }

    async function handleCreateSession(event: FormEvent) {
        event.preventDefault();
        if (readOnly) {
            return;
        }

        const resumeErr = validatePdfFile(resumeFile);
        setMany(resumeErr ? { resume: resumeErr } : {});
        if (resumeErr || !resumeFile) {
            return;
        }

        setIsBusy(true);
        setActionError(null);

        try {
            const res = await createMockBehavioralSession(
                accessToken,
                interviewId,
                resumeFile,
            );
            setSession(res.session);
            setResumeFile(null);
            clear('resume');
            onInterviewChange(res.interview);
        } catch (err) {
            setActionError(
                resolveActionErrorMessage(err, 'Failed to upload resume and begin'),
            );
        } finally {
            setIsBusy(false);
        }
    }

    async function handleNextQuestion() {
        if (!session || readOnly) {
            return;
        }

        setIsBusy(true);
        setActionError(null);

        try {
            const res = await generateNextBehavioralQuestion(accessToken, session.id);
            setSession(res.session);
        } catch (err) {
            setActionError(
                resolveActionErrorMessage(err, 'Failed to generate question'),
            );
        } finally {
            setIsBusy(false);
        }
    }

    async function handleSubmitAnswer(event: FormEvent) {
        event.preventDefault();
        if (!session || !unansweredTurn || readOnly) {
            return;
        }

        const answerErr = validateAnswer(answerDraft);
        setMany(answerErr ? { answerDraft: answerErr } : {});
        if (answerErr) {
            return;
        }

        setIsBusy(true);
        setActionError(null);

        try {
            const res = await submitBehavioralTurnAnswer(
                accessToken,
                session.id,
                unansweredTurn.id,
                { answer: answerDraft.trim() },
            );
            setSession(res.session);
            setAnswerDraft('');
            clear('answerDraft');
            clearPracticeDraft(practiceDraftKey('behavioral', session.id));
        } catch (err) {
            setActionError(
                resolveActionErrorMessage(err, 'Failed to submit answer'),
            );
        } finally {
            setIsBusy(false);
        }
    }

    async function handleSubmitSection() {
        if (readOnly || !isInterviewComplete) {
            return;
        }

        setIsBusy(true);
        setActionError(null);

        try {
            const res = await finalizeMockBehavioralSection(accessToken, interviewId);
            onInterviewChange(res.interview);
        } catch (err) {
            setActionError(
                resolveActionErrorMessage(err, 'Failed to submit behavioral section'),
            );
        } finally {
            setIsBusy(false);
        }
    }

    if (isBootstrapping) {
        return (
            <div className="card flex items-center justify-center gap-2 px-6 py-20 text-zinc-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                Loading behavioral section…
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-[90%] flex-col gap-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {BEHAVIORAL_SECTION_EVAL_NOTE} Candidate questions are skipped in mock
                interviews.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="section-label">Behavioral</p>
                    <h1 className="mt-1 text-lg font-semibold text-zinc-900">
                        {question?.title ??
                            (assignment.roleName
                                ? `${assignment.roleName} interview`
                                : 'Choose a role to begin')}
                    </h1>
                    {question ? (
                        <p className="mt-1 text-sm text-zinc-500">
                            {question.companyName} · {question.roleName}
                        </p>
                    ) : null}
                </div>
                <button
                    type="button"
                    className="btn-primary"
                    disabled={readOnly || isBusy || !isInterviewComplete}
                    onClick={() => void handleSubmitSection()}
                >
                    {isBusy && isInterviewComplete
                        ? 'Submitting section…'
                        : 'Submit Section'}
                </button>
            </div>

            {actionError ? <ActionErrorAlert message={actionError} /> : null}

            {question && session ? (
                <div className="flex flex-wrap gap-1.5">
                    {visiblePhases.map((phase) => {
                        const fullIndex = question.phases.findIndex(
                            (row) => row.type === phase.type,
                        );
                        const isCurrent = fullIndex === session.currentPhaseIndex;
                        const isDone = fullIndex < session.currentPhaseIndex;

                        return (
                            <span
                                key={phase.type}
                                className={`rounded-md px-2 py-0.5 text-xs ${isCurrent
                                    ? 'bg-emerald-100 font-medium text-emerald-800'
                                    : isDone
                                        ? 'bg-zinc-100 text-zinc-500'
                                        : 'border border-zinc-200 text-zinc-400'
                                    }`}
                            >
                                {phaseLabel(phase.type)}
                            </span>
                        );
                    })}
                </div>
            ) : null}

            <section className="card p-5 sm:p-6">
                {needsRole ? (
                    <form onSubmit={handleStartRole} noValidate className="space-y-4">
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900">
                                Select interview role
                            </h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                Starts the behavioral timer and assigns a matching question.
                            </p>
                        </div>
                        <div>
                            <label
                                htmlFor="mock-behavioral-role"
                                className="block text-sm font-medium text-zinc-700"
                            >
                                Role
                            </label>
                            <select
                                id="mock-behavioral-role"
                                className="select-base mt-1.5"
                                value={selectedRole}
                                disabled={readOnly || isBusy}
                                onChange={(event) => {
                                    setSelectedRole(event.target.value);
                                    clear('selectedRole');
                                }}
                                onBlur={() =>
                                    touch('selectedRole', validateBehavioralRole(selectedRole))
                                }
                                aria-invalid={Boolean(errors.selectedRole)}
                                aria-describedby={
                                    errors.selectedRole ? 'mock-behavioral-role-error' : undefined
                                }
                            >
                                <option value="">Select a role…</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                            <FieldError
                                id="mock-behavioral-role-error"
                                message={errors.selectedRole}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={readOnly || isBusy || !selectedRole}
                            className="btn-primary"
                        >
                            {isBusy ? 'Starting…' : 'Start behavioral section'}
                        </button>
                    </form>
                ) : needsResume ? (
                    <form onSubmit={handleCreateSession} noValidate className="space-y-4">
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900">
                                Upload resume
                            </h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                PDF only, max 5 MB. Same flow as standalone behavioral.
                            </p>
                        </div>
                        {question ? (
                            <p className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-4 py-3.5 text-sm leading-relaxed text-zinc-700">
                                {typeof question.phases[0]?.content.statement === 'string'
                                    ? question.phases[0].content.statement
                                    : question.phases[0]?.description}
                            </p>
                        ) : null}
                        <div>
                            <label
                                htmlFor="mock-behavioral-resume"
                                className="block text-sm font-medium text-zinc-700"
                            >
                                Resume (PDF)
                            </label>
                            <input
                                id="mock-behavioral-resume"
                                type="file"
                                accept="application/pdf,.pdf"
                                disabled={readOnly || isBusy}
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    setResumeFile(file);
                                    touch('resume', validatePdfFile(file));
                                }}
                                onBlur={() => touch('resume', validatePdfFile(resumeFile))}
                                aria-invalid={Boolean(errors.resume)}
                                aria-describedby={
                                    errors.resume ? 'mock-behavioral-resume-error' : undefined
                                }
                                className="mt-1.5 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                            />
                            <FieldError
                                id="mock-behavioral-resume-error"
                                message={errors.resume}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={readOnly || isBusy || !resumeFile}
                            className="btn-primary"
                        >
                            {isBusy ? 'Uploading…' : 'Upload resume & begin'}
                        </button>
                    </form>
                ) : session && isInterviewComplete ? (
                    <div className="space-y-3">
                        <h2 className="text-base font-semibold text-zinc-900">
                            Interview complete
                        </h2>
                        <p className="text-sm text-zinc-600">
                            Review the transcript below, then submit the section to start
                            evaluation.
                        </p>
                    </div>
                ) : session && unansweredTurn ? (
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
                                onChange={(event) => {
                                    setAnswerDraft(event.target.value);
                                    clear('answerDraft');
                                }}
                                onBlur={() => touch('answerDraft', validateAnswer(answerDraft))}
                                rows={8}
                                disabled={readOnly || isBusy}
                                placeholder="Your answer…"
                                aria-invalid={Boolean(errors.answerDraft)}
                                aria-describedby={
                                    errors.answerDraft ? 'mock-behavioral-answer-error' : undefined
                                }
                                className="input-base min-h-[160px] resize-y text-sm"
                            />
                            <FieldError
                                id="mock-behavioral-answer-error"
                                message={errors.answerDraft}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={readOnly || isBusy || !answerDraft.trim()}
                            className="btn-primary"
                        >
                            {isBusy ? 'Submitting…' : 'Submit answer'}
                        </button>
                    </form>
                ) : session ? (
                    <div className="space-y-4">
                        {currentPhase ? (
                            <div>
                                <p className="text-sm font-medium text-zinc-900">
                                    {currentPhase.title}
                                </p>
                                <p className="mt-1 text-sm text-zinc-500">
                                    {currentPhase.description}
                                </p>
                            </div>
                        ) : null}
                        {canRequestNextQuestion ? (
                            <button
                                type="button"
                                onClick={() => void handleNextQuestion()}
                                disabled={readOnly || isBusy}
                                className="btn-primary"
                            >
                                {isBusy ? 'Generating…' : 'Next question'}
                            </button>
                        ) : (
                            <p className="text-sm text-zinc-500">
                                Continue answering until the interview wraps up.
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-zinc-500">Preparing interview…</p>
                )}

                {session && session.turns.length > 0 ? (
                    <div className="mt-8 border-t border-zinc-100 pt-6">
                        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Transcript</h3>
                        <div className="max-h-80 overflow-y-auto rounded-xl border border-zinc-200 bg-white pr-1">
                            <ol className="space-y-3 p-3 sm:p-4">
                                {session.turns.map((turn) => (
                                    <li
                                        key={turn.id}
                                        className="rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3"
                                    >
                                        <p className="text-xs font-medium text-zinc-500">
                                            {phaseLabel(turn.phaseType)}
                                            {turn.isFollowUp ? ' · Follow-up' : ''}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-zinc-800">
                                            Q: {turn.questionText}
                                        </p>
                                        {turn.candidateAnswerText ? (
                                            <p className="mt-2 text-sm text-zinc-600">
                                                A: {turn.candidateAnswerText}
                                            </p>
                                        ) : null}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                ) : null}
            </section>
        </div>
    );
}