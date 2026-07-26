'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MonacoEditor } from '@/components/MonacoEditor';
import { FieldError } from '@/components/ui/FieldError';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { ApiError } from '@/lib/api/client';
import {
    linkMockDsaSubmission,
    submitMockSection,
} from '@/lib/api/mock-interview';
import { getProblem } from '@/lib/api/problems';
import { createSubmission, getSubmission } from '@/lib/api/submissions';
import {
    practiceDraftKey,
    readPracticeDraft,
    writePracticeDraft,
} from '@/lib/practice-drafts';
import { validateSourceCode } from '@/lib/validation/fields';
import {
    PROGRAMMING_LANGUAGES,
    type Example,
    type ProgrammingLanguage,
    type ProblemDetail,
    type SubmissionDetail,
} from '@/types/dsa';
import {
    DSA_SECTION_SUBMISSION_NOTE,
    type MockInterviewDsaSlotDetail,
    type MockInterviewSessionDetail,
} from '@/types/mock-interview';

export interface DsaSectionWorkspaceProps {
    accessToken: string;
    interviewId: string;
    slot: MockInterviewDsaSlotDetail;
    readOnly?: boolean;
    onInterviewChange: (interview: MockInterviewSessionDetail) => void;
}

type DsaWorkspaceField = 'sourceCode';
type LeftTab = 'problem' | 'results';

interface DsaMockDraft {
    problemId: string;
    language: ProgrammingLanguage;
    codeByLang: Record<ProgrammingLanguage, string>;
    activeTab: LeftTab;
    lastSubmissionId: string | null;
    updatedAt: number;
}

const DSA_DRAFT_DEBOUNCE_MS = 400;

function mockDsaDraftKey(interviewId: string, slotIndex: number, problemId: string) {
    return practiceDraftKey('dsa', interviewId, `slot-${slotIndex}:${problemId}`);
}

function submissionBelongsToProblem(
    submission: SubmissionDetail,
    problemId: string,
): boolean {
    return submission.problemId === problemId;
}

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
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-800">
            <code>{value}</code>
        </pre>
    );
}

function ExampleCard({ example, index }: { example: Example; index: number }) {
    return (
        <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-4">
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
                {example.explanation ? (
                    <div>
                        <p className="section-label mb-1.5">Explanation</p>
                        <p className="text-sm leading-relaxed text-zinc-600">
                            {example.explanation}
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export function DsaSectionWorkspace({
    accessToken,
    interviewId,
    slot,
    readOnly = false,
    onInterviewChange,
}: DsaSectionWorkspaceProps) {
    const { errors, touch, clear, setMany } = useFieldErrors<DsaWorkspaceField>();

    const [problem, setProblem] = useState<ProblemDetail | null>(null);
    const [isProblemLoading, setIsProblemLoading] = useState(true);
    const [problemError, setProblemError] = useState<string | null>(null);

    const [language, setLanguage] = useState<ProgrammingLanguage>('PYTHON');
    const [codeByLang, setCodeByLang] = useState<Record<ProgrammingLanguage, string>>({
        CPP: '',
        JAVA: '',
        PYTHON: '',
    });

    const [activeTab, setActiveTab] = useState<LeftTab>('problem');
    const [pendingAction, setPendingAction] = useState<'run' | 'submit' | null>(null);
    const [runError, setRunError] = useState<string | null>(null);
    const [lastSubmission, setLastSubmission] = useState<SubmissionDetail | null>(null);

    const [isSubmittingSection, setIsSubmittingSection] = useState(false);
    const [sectionError, setSectionError] = useState<string | null>(null);

    const resumeReadyRef = useRef(false);
    const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeProblemIdRef = useRef(slot.problemId);
    activeProblemIdRef.current = slot.problemId;

    useEffect(() => {
        let cancelled = false;
        resumeReadyRef.current = false;

        async function load() {
            setIsProblemLoading(true);
            setProblemError(null);
            setPendingAction(null);
            setLastSubmission(null);
            setRunError(null);
            setActiveTab('problem');

            try {
                const res = await getProblem(accessToken, slot.problemId);
                if (cancelled) {
                    return;
                }

                setProblem(res.problem);

                const starter = {
                    CPP: res.problem.starterCode?.cpp ?? '',
                    JAVA: res.problem.starterCode?.java ?? '',
                    PYTHON: res.problem.starterCode?.python ?? '',
                };

                const draftKey = mockDsaDraftKey(
                    interviewId,
                    slot.slotIndex,
                    slot.problemId,
                );
                const legacyDraftKey = practiceDraftKey(
                    'dsa',
                    interviewId,
                    `slot-${slot.slotIndex}`,
                );
                const draft =
                    readPracticeDraft<DsaMockDraft>(draftKey) ??
                    readPracticeDraft<DsaMockDraft>(legacyDraftKey);
                const draftForProblem =
                    draft && (!draft.problemId || draft.problemId === slot.problemId)
                        ? draft
                        : null;

                let nextCode = starter;
                let nextLanguage: ProgrammingLanguage = 'PYTHON';
                let nextTab: LeftTab = 'problem';
                let resumeSubmissionId: string | null = null;
                let nextSubmission: SubmissionDetail | null = null;

                if (draftForProblem?.codeByLang) {
                    nextCode = {
                        CPP: draftForProblem.codeByLang.CPP ?? starter.CPP,
                        JAVA: draftForProblem.codeByLang.JAVA ?? starter.JAVA,
                        PYTHON: draftForProblem.codeByLang.PYTHON ?? starter.PYTHON,
                    };
                    if (PROGRAMMING_LANGUAGES.includes(draftForProblem.language)) {
                        nextLanguage = draftForProblem.language;
                    }
                    if (
                        draftForProblem.activeTab === 'problem' ||
                        draftForProblem.activeTab === 'results'
                    ) {
                        nextTab = draftForProblem.activeTab;
                    }
                    resumeSubmissionId = draftForProblem.lastSubmissionId;
                }

                if (!resumeSubmissionId && slot.submissionId) {
                    resumeSubmissionId = slot.submissionId;
                }

                if (resumeSubmissionId) {
                    try {
                        const detail = await getSubmission(
                            accessToken,
                            resumeSubmissionId,
                        );
                        if (cancelled) {
                            return;
                        }
                        if (
                            submissionBelongsToProblem(
                                detail.submission,
                                slot.problemId,
                            )
                        ) {
                            nextSubmission = detail.submission;
                            if (!draftForProblem?.codeByLang) {
                                nextLanguage = detail.submission.language;
                                nextCode = {
                                    ...starter,
                                    [detail.submission.language]:
                                        detail.submission.sourceCode,
                                };
                            }
                            if (nextTab === 'problem' && !detail.submission.isSampleRun) {
                                nextTab = 'results';
                            }
                        }
                    } catch {
                        // Submission restore is best-effort; problem + draft still load.
                    }
                }

                if (cancelled) {
                    return;
                }

                setCodeByLang(nextCode);
                setLanguage(nextLanguage);
                setActiveTab(nextSubmission ? nextTab : 'problem');
                setLastSubmission(nextSubmission);
            } catch (err) {
                if (cancelled) {
                    return;
                }
                setProblemError(
                    err instanceof ApiError ? err.message : 'Failed to load problem',
                );
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
    }, [accessToken, interviewId, slot.problemId, slot.slotIndex, slot.submissionId]);

    useEffect(() => {
        if (!problem || !resumeReadyRef.current || readOnly) {
            return;
        }

        if (draftTimerRef.current) {
            clearTimeout(draftTimerRef.current);
        }

        const persist = () => {
            const scopedSubmission =
                lastSubmission &&
                submissionBelongsToProblem(lastSubmission, problem.id)
                    ? lastSubmission
                    : null;
            const draft: DsaMockDraft = {
                problemId: problem.id,
                language,
                codeByLang,
                activeTab,
                lastSubmissionId: scopedSubmission?.id ?? null,
                updatedAt: Date.now(),
            };
            writePracticeDraft(
                mockDsaDraftKey(interviewId, slot.slotIndex, problem.id),
                draft,
            );
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
    }, [
        problem,
        language,
        codeByLang,
        activeTab,
        lastSubmission,
        interviewId,
        slot.slotIndex,
        readOnly,
    ]);

    const scopedSubmission = useMemo(() => {
        if (!problem || !lastSubmission) {
            return null;
        }
        return submissionBelongsToProblem(lastSubmission, problem.id)
            ? lastSubmission
            : null;
    }, [problem, lastSubmission]);

    const stats = useMemo(() => {
        if (!scopedSubmission) {
            return null;
        }
        const passed = scopedSubmission.passedTests;
        const total = scopedSubmission.totalTests;
        const pct = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
        return { passed, total, pct };
    }, [scopedSubmission]);

    function setEditorValue(next: string) {
        setCodeByLang((prev) => ({ ...prev, [language]: next }));
        clear('sourceCode');
    }

    async function run(isSampleRun: boolean) {
        if (!problem || readOnly || pendingAction) {
            return;
        }

        const codeErr = validateSourceCode(codeByLang[language]);
        setMany(codeErr ? { sourceCode: codeErr } : {});
        if (codeErr) {
            return;
        }

        const problemId = problem.id;
        const slotIndex = slot.slotIndex;
        const selectedLanguage = language;
        const codeSnapshot = { ...codeByLang };
        const sourceCode = codeByLang[language];

        setPendingAction(isSampleRun ? 'run' : 'submit');
        setRunError(null);
        setLastSubmission(null);
        setSectionError(null);

        try {
            const res = await createSubmission(accessToken, {
                problemId,
                language: selectedLanguage,
                sourceCode,
                isSampleRun,
            });

            writePracticeDraft(
                mockDsaDraftKey(interviewId, slotIndex, problemId),
                {
                    problemId,
                    language: selectedLanguage,
                    codeByLang: codeSnapshot,
                    activeTab: 'results',
                    lastSubmissionId: res.submission.id,
                    updatedAt: Date.now(),
                } satisfies DsaMockDraft,
            );

            if (!isSampleRun) {
                const linked = await linkMockDsaSubmission(
                    accessToken,
                    interviewId,
                    slotIndex,
                    { submissionId: res.submission.id },
                );
                onInterviewChange(linked.interview);
            }

            // Only apply results if this workspace is still on the same problem.
            if (activeProblemIdRef.current === problemId) {
                setLastSubmission(res.submission);
                setActiveTab('results');
                clear('sourceCode');
            }
        } catch (err) {
            if (activeProblemIdRef.current === problemId) {
                setRunError(err instanceof ApiError ? err.message : 'Submission failed');
            }
        } finally {
            if (activeProblemIdRef.current === problemId) {
                setPendingAction(null);
            }
        }
    }

    async function handleSubmitSection() {
        if (readOnly) {
            return;
        }

        setIsSubmittingSection(true);
        setSectionError(null);

        try {
            const res = await submitMockSection(accessToken, interviewId, 'DSA');
            onInterviewChange(res.interview);
        } catch (err) {
            setSectionError(
                err instanceof ApiError ? err.message : 'Failed to submit DSA section',
            );
        } finally {
            setIsSubmittingSection(false);
        }
    }

    if (isProblemLoading) {
        return (
            <div className="card flex items-center justify-center gap-2 px-6 py-20 text-zinc-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                Loading problem…
            </div>
        );
    }

    if (problemError || !problem) {
        return (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
                <p className="font-medium">Couldn&apos;t load this problem</p>
                <p className="mt-1 text-sm">{problemError ?? 'Unknown error'}</p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {DSA_SECTION_SUBMISSION_NOTE} AI review runs after you submit the section.
            </div>

            {sectionError ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {sectionError}
                </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="section-label">DSA slot {slot.slotIndex + 1}</p>
                    <h1 className="mt-1 text-lg font-semibold text-zinc-900">{problem.title}</h1>
                </div>
                <button
                    type="button"
                    className="btn-primary"
                    disabled={readOnly || isSubmittingSection}
                    onClick={() => void handleSubmitSection()}
                >
                    {isSubmittingSection ? 'Submitting section…' : 'Submit Section'}
                </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
                <section className="card flex min-h-0 flex-col overflow-hidden">
                    <div className="border-b border-zinc-200 px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className={difficultyPill(problem.difficulty)}>
                                {problem.difficulty.charAt(0) +
                                    problem.difficulty.slice(1).toLowerCase()}
                            </span>
                            {problem.topics.map((topic) => (
                                <span
                                    key={topic}
                                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex border-b border-zinc-200 bg-zinc-50/50">
                        {(['problem', 'results'] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={[
                                    'flex-1 border-b-2 px-4 py-2.5 text-sm font-medium transition',
                                    activeTab === tab
                                        ? 'border-emerald-600 bg-white text-emerald-700'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-800',
                                ].join(' ')}
                            >
                                {tab === 'problem' ? 'Problem' : 'Results'}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                        {activeTab === 'problem' ? (
                            <>
                                <div>
                                    <SectionTitle>Description</SectionTitle>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                                        {problem.description}
                                    </p>
                                </div>
                                {problem.constraints ? (
                                    <div>
                                        <SectionTitle>Constraints</SectionTitle>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                                            {problem.constraints}
                                        </p>
                                    </div>
                                ) : null}
                                {problem.examples && problem.examples.length > 0 ? (
                                    <div>
                                        <SectionTitle>Examples</SectionTitle>
                                        <div className="mt-3 space-y-3">
                                            {problem.examples.map((example, index) => (
                                                <ExampleCard
                                                    key={index}
                                                    example={example}
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <>
                                {runError ? (
                                    <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                        {runError}
                                    </div>
                                ) : null}
                                {!scopedSubmission ? (
                                    <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
                                        Run or submit to see results here.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="section-label">Status</p>
                                                    <p className="mt-1 text-base font-semibold text-zinc-900">
                                                        {scopedSubmission.status}
                                                    </p>
                                                </div>
                                                {stats ? (
                                                    <div className="text-right">
                                                        <p className="section-label">Tests</p>
                                                        <p className="mt-1 text-base font-semibold text-zinc-900">
                                                            {stats.passed}/{stats.total} ({stats.pct}
                                                            %)
                                                        </p>
                                                    </div>
                                                ) : null}
                                            </div>
                                            <p className="mt-3 text-xs text-zinc-500">
                                                {scopedSubmission.isSampleRun
                                                    ? 'Sample run (visible tests only)'
                                                    : 'Full submission — will be used if this is your latest for the section'}
                                            </p>
                                        </div>
                                        {scopedSubmission.compileOutput ? (
                                            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                                <p className="section-label mb-2">Compile output</p>
                                                <pre className="overflow-x-auto font-mono text-xs text-zinc-800">
                                                    {scopedSubmission.compileOutput}
                                                </pre>
                                            </div>
                                        ) : null}
                                        {scopedSubmission.stderr ? (
                                            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                                <p className="section-label mb-2">Stderr</p>
                                                <pre className="overflow-x-auto font-mono text-xs text-zinc-800">
                                                    {scopedSubmission.stderr}
                                                </pre>
                                            </div>
                                        ) : null}
                                        {scopedSubmission.testResults &&
                                            scopedSubmission.testResults.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="section-label">Test results</p>
                                                {scopedSubmission.testResults.map((result) => (
                                                    <div
                                                        key={result.testCaseId}
                                                        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs"
                                                    >
                                                        <p className="font-medium text-zinc-800">
                                                            {result.status}
                                                        </p>
                                                        {result.input != null ? (
                                                            <p className="mt-1 text-zinc-500">
                                                                Input: {result.input}
                                                            </p>
                                                        ) : null}
                                                        {result.expectedOutput != null ? (
                                                            <p className="text-zinc-500">
                                                                Expected: {result.expectedOutput}
                                                            </p>
                                                        ) : null}
                                                        {result.actualOutput != null ? (
                                                            <p className="text-zinc-500">
                                                                Actual: {result.actualOutput}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <section className="card flex min-h-0 flex-col overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
                        <select
                            className="select-base !w-auto !py-2"
                            value={language}
                            disabled={readOnly || pendingAction !== null}
                            onChange={(event) =>
                                setLanguage(event.target.value as ProgrammingLanguage)
                            }
                        >
                            {PROGRAMMING_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="btn-secondary !py-2"
                                disabled={readOnly || pendingAction !== null}
                                onClick={() => void run(true)}
                            >
                                {pendingAction === 'run' ? 'Running…' : 'Run'}
                            </button>
                            <button
                                type="button"
                                className="btn-primary !py-2"
                                disabled={readOnly || pendingAction !== null}
                                onClick={() => void run(false)}
                            >
                                {pendingAction === 'submit' ? 'Submitting…' : 'Submit'}
                            </button>
                        </div>
                    </div>
                    <div className="min-h-0 flex-1 p-3">
                        <MonacoEditor
                            value={codeByLang[language]}
                            onChange={setEditorValue}
                            onBlur={() =>
                                touch(
                                    'sourceCode',
                                    validateSourceCode(codeByLang[language]),
                                )
                            }
                            language={language}
                            readOnly={readOnly}
                            height="100%"
                            className="h-full min-h-[420px]"
                        />
                        <FieldError id="mock-dsa-source-error" message={errors.sourceCode} />
                    </div>
                </section>
            </div>
        </div>
    );
}