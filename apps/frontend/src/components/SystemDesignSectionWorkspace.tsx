'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
    linkMockSystemDesignSubmission,
    submitMockSection,
} from '@/lib/api/mock-interview';
import {
    createSystemDesignSubmission,
    generateSystemDesignFollowUps,
    getSystemDesignQuestion,
    getSystemDesignSubmission,
    submitSystemDesignFollowUpAnswers,
} from '@/lib/api/system-design';
import type {
    SystemDesignQuestionDetail,
    SystemDesignSubmissionDetail,
} from '@/types/system-design';
import {
    SYSTEM_DESIGN_SECTION_EVAL_NOTE,
    type MockInterviewSessionDetail,
    type MockInterviewSystemDesignDetail,
} from '@/types/mock-interview';

export interface SystemDesignSectionWorkspaceProps {
    accessToken: string;
    interviewId: string;
    assignment: MockInterviewSystemDesignDetail;
    readOnly?: boolean;
    onInterviewChange: (interview: MockInterviewSessionDetail) => void;
}

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

export function SystemDesignSectionWorkspace({
    accessToken,
    interviewId,
    assignment,
    readOnly = false,
    onInterviewChange,
}: SystemDesignSectionWorkspaceProps) {
    const [question, setQuestion] = useState<SystemDesignQuestionDetail | null>(null);
    const [isQuestionLoading, setIsQuestionLoading] = useState(true);
    const [questionError, setQuestionError] = useState<string | null>(null);

    const [submission, setSubmission] = useState<SystemDesignSubmissionDetail | null>(null);
    const [textAnswer, setTextAnswer] = useState('');
    const [diagramFile, setDiagramFile] = useState<File | null>(null);
    const [followUpAnswer1, setFollowUpAnswer1] = useState('');
    const [followUpAnswer2, setFollowUpAnswer2] = useState('');

    const [actionError, setActionError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingFollowUps, setIsGeneratingFollowUps] = useState(false);
    const [isSubmittingFollowUps, setIsSubmittingFollowUps] = useState(false);
    const [isSubmittingSection, setIsSubmittingSection] = useState(false);

    const hasInitialAnswer = textAnswer.trim().length > 0 || diagramFile != null;
    const followUpQuestions = submission?.followUpQuestions ?? null;
    const followUpAnswers = submission?.followUpAnswers ?? null;
    const canGenerateFollowUps =
        !readOnly && submission != null && followUpQuestions == null;
    const canSubmitFollowUps =
        !readOnly &&
        followUpQuestions != null &&
        followUpAnswers == null &&
        followUpAnswer1.trim().length > 0 &&
        followUpAnswer2.trim().length > 0;
    const canSubmitSection =
        !readOnly &&
        submission != null &&
        followUpQuestions != null &&
        followUpAnswers != null;

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setIsQuestionLoading(true);
            setQuestionError(null);
            setActionError(null);

            try {
                const questionRes = await getSystemDesignQuestion(
                    accessToken,
                    assignment.questionId,
                );
                if (cancelled) {
                    return;
                }

                setQuestion(questionRes.question);

                if (assignment.submissionId) {
                    const submissionRes = await getSystemDesignSubmission(
                        accessToken,
                        assignment.submissionId,
                    );
                    if (cancelled) {
                        return;
                    }

                    setSubmission(submissionRes.submission);
                    setTextAnswer(submissionRes.submission.textAnswer ?? '');
                    if (submissionRes.submission.followUpAnswers) {
                        setFollowUpAnswer1(submissionRes.submission.followUpAnswers[0] ?? '');
                        setFollowUpAnswer2(submissionRes.submission.followUpAnswers[1] ?? '');
                    }
                } else {
                    setSubmission(null);
                    setTextAnswer('');
                    setFollowUpAnswer1('');
                    setFollowUpAnswer2('');
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }
                setQuestionError(
                    err instanceof ApiError
                        ? err.message
                        : 'Failed to load system design question',
                );
            } finally {
                if (!cancelled) {
                    setIsQuestionLoading(false);
                }
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [accessToken, assignment.questionId, assignment.submissionId]);

    const topics = useMemo(() => question?.topics ?? [], [question]);

    async function handleInitialSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!question || readOnly || !hasInitialAnswer) {
            return;
        }

        setIsSubmitting(true);
        setActionError(null);

        try {
            const created = await createSystemDesignSubmission(accessToken, {
                questionId: question.id,
                textAnswer: textAnswer.trim() || undefined,
                diagram: diagramFile ?? undefined,
            });

            const linked = await linkMockSystemDesignSubmission(
                accessToken,
                interviewId,
                { submissionId: created.submission.id },
            );

            setSubmission(created.submission);
            setTextAnswer(created.submission.textAnswer ?? '');
            setDiagramFile(null);
            onInterviewChange(linked.interview);
        } catch (err) {
            setActionError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to submit system design answer',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleGenerateFollowUps() {
        if (!submission || readOnly) {
            return;
        }

        setIsGeneratingFollowUps(true);
        setActionError(null);

        try {
            const res = await generateSystemDesignFollowUps(accessToken, submission.id);
            setSubmission(res.submission);
        } catch (err) {
            setActionError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to generate follow-up questions',
            );
        } finally {
            setIsGeneratingFollowUps(false);
        }
    }

    async function handleSubmitFollowUps(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!submission || !canSubmitFollowUps) {
            return;
        }

        setIsSubmittingFollowUps(true);
        setActionError(null);

        try {
            const res = await submitSystemDesignFollowUpAnswers(
                accessToken,
                submission.id,
                { answers: [followUpAnswer1.trim(), followUpAnswer2.trim()] },
            );
            setSubmission(res.submission);
        } catch (err) {
            setActionError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to submit follow-up answers',
            );
        } finally {
            setIsSubmittingFollowUps(false);
        }
    }

    async function handleSubmitSection() {
        if (!canSubmitSection) {
            return;
        }

        setIsSubmittingSection(true);
        setActionError(null);

        try {
            const res = await submitMockSection(
                accessToken,
                interviewId,
                'SYSTEM_DESIGN',
            );
            onInterviewChange(res.interview);
        } catch (err) {
            setActionError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to submit system design section',
            );
        } finally {
            setIsSubmittingSection(false);
        }
    }

    if (isQuestionLoading) {
        return (
            <div className="card flex items-center justify-center gap-2 px-6 py-20 text-zinc-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                Loading question…
            </div>
        );
    }

    if (questionError || !question) {
        return (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
                <p className="font-medium">Couldn&apos;t load this question</p>
                <p className="mt-1 text-sm">{questionError ?? 'Unknown error'}</p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {SYSTEM_DESIGN_SECTION_EVAL_NOTE} Complete follow-ups before submitting the
                section.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="section-label">System design</p>
                    <h1 className="mt-1 text-lg font-semibold text-zinc-900">{question.title}</h1>
                </div>
                <button
                    type="button"
                    className="btn-primary"
                    disabled={!canSubmitSection || isSubmittingSection}
                    onClick={() => void handleSubmitSection()}
                >
                    {isSubmittingSection ? 'Submitting section…' : 'Submit Section'}
                </button>
            </div>

            {actionError ? (
                <div
                    className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    role="alert"
                >
                    {actionError}
                </div>
            ) : null}

            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
                <section className="card min-h-0 overflow-y-auto p-5 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2.5">
                        <span className={difficultyPill(question.difficulty)}>
                            {question.difficulty.charAt(0) +
                                question.difficulty.slice(1).toLowerCase()}
                        </span>
                        {topics.map((topic) => (
                            <span
                                key={topic}
                                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                        {question.description}
                    </p>

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
                        {question.constraints.length > 0 ? (
                            <div>
                                <SectionTitle>Constraints</SectionTitle>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                                    {question.constraints.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                </section>

                <section className="min-h-0 space-y-4 overflow-y-auto">
                    {!submission ? (
                        <form
                            onSubmit={handleInitialSubmit}
                            className="card space-y-4 p-5 sm:p-6"
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
                                    htmlFor="mock-sd-text"
                                    className="block text-sm font-medium text-zinc-700"
                                >
                                    Text answer
                                </label>
                                <textarea
                                    id="mock-sd-text"
                                    value={textAnswer}
                                    onChange={(event) => setTextAnswer(event.target.value)}
                                    rows={12}
                                    disabled={readOnly}
                                    placeholder="Describe your high-level design, APIs, data model, scaling approach…"
                                    className="input-base mt-1.5 min-h-[220px] resize-y font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="mock-sd-diagram"
                                    className="block text-sm font-medium text-zinc-700"
                                >
                                    Diagram
                                </label>
                                <input
                                    id="mock-sd-diagram"
                                    type="file"
                                    accept="image/*"
                                    disabled={readOnly}
                                    onChange={(event) =>
                                        setDiagramFile(event.target.files?.[0] ?? null)
                                    }
                                    className="mt-1.5 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
                                />
                                {diagramFile ? (
                                    <p className="mt-2 text-xs text-zinc-500">
                                        Selected: {diagramFile.name}
                                    </p>
                                ) : null}
                            </div>
                            <button
                                type="submit"
                                disabled={readOnly || isSubmitting || !hasInitialAnswer}
                                className="btn-primary"
                            >
                                {isSubmitting ? 'Submitting…' : 'Submit answer'}
                            </button>
                        </form>
                    ) : (
                        <div className="card space-y-4 p-5 sm:p-6">
                            <div>
                                <h2 className="text-base font-semibold text-zinc-900">
                                    Submitted answer
                                </h2>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Linked to this mock interview section.
                                </p>
                            </div>
                            {submission.textAnswer ? (
                                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                    <p className="section-label mb-2">Text</p>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                                        {submission.textAnswer}
                                    </p>
                                </div>
                            ) : null}
                            {submission.diagramUrl ? (
                                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                    <p className="section-label mb-2">Diagram</p>
                                    <img
                                        src={submission.diagramUrl}
                                        alt="Submitted system design diagram"
                                        className="max-h-80 w-full rounded-md border border-zinc-200 bg-white object-contain"
                                    />
                                </div>
                            ) : null}
                            {canGenerateFollowUps ? (
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
                            ) : null}
                        </div>
                    )}

                    {followUpQuestions ? (
                        <div className="card space-y-4 p-5 sm:p-6">
                            <div>
                                <h2 className="text-base font-semibold text-zinc-900">
                                    Follow-up round
                                </h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Answer both interviewer follow-up questions.
                                </p>
                            </div>
                            <ol className="space-y-3">
                                {followUpQuestions.map((questionText, index) => (
                                    <li
                                        key={index}
                                        className="rounded-lg border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-sm text-zinc-800"
                                    >
                                        <span className="font-medium text-zinc-500">
                                            Q{index + 1}.{' '}
                                        </span>
                                        {questionText}
                                    </li>
                                ))}
                            </ol>

                            {!followUpAnswers ? (
                                <form
                                    onSubmit={handleSubmitFollowUps}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="mock-sd-fu-1"
                                            className="block text-sm font-medium text-zinc-700"
                                        >
                                            Answer 1
                                        </label>
                                        <textarea
                                            id="mock-sd-fu-1"
                                            value={followUpAnswer1}
                                            onChange={(event) =>
                                                setFollowUpAnswer1(event.target.value)
                                            }
                                            rows={5}
                                            disabled={readOnly}
                                            className="input-base mt-1.5 min-h-[120px] resize-y text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="mock-sd-fu-2"
                                            className="block text-sm font-medium text-zinc-700"
                                        >
                                            Answer 2
                                        </label>
                                        <textarea
                                            id="mock-sd-fu-2"
                                            value={followUpAnswer2}
                                            onChange={(event) =>
                                                setFollowUpAnswer2(event.target.value)
                                            }
                                            rows={5}
                                            disabled={readOnly}
                                            className="input-base mt-1.5 min-h-[120px] resize-y text-sm"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!canSubmitFollowUps || isSubmittingFollowUps}
                                        className="btn-primary"
                                    >
                                        {isSubmittingFollowUps
                                            ? 'Submitting…'
                                            : 'Submit follow-up answers'}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    {followUpAnswers.map((answer, index) => (
                                        <div
                                            key={index}
                                            className="rounded-md border border-zinc-200 bg-zinc-50 p-4"
                                        >
                                            <p className="section-label mb-2">
                                                Answer {index + 1}
                                            </p>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                                                {answer}
                                            </p>
                                        </div>
                                    ))}
                                    <p className="text-sm text-emerald-700">
                                        Follow-ups complete. You can submit the section.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </section>
            </div>
        </div>
    );
}