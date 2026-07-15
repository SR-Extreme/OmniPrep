'use client';

import { useEffect, useMemo, useState } from 'react';
import { MonacoEditor } from '@/components/MonacoEditor';
import { ApiError } from '@/lib/api/client';
import {
    linkMockDsaSubmission,
    submitMockSection,
} from '@/lib/api/mock-interview';
import { getProblem } from '@/lib/api/problems';
import { createSubmission } from '@/lib/api/submissions';
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
    const [problem, setProblem] = useState<ProblemDetail | null>(null);
    const [isProblemLoading, setIsProblemLoading] = useState(true);
    const [problemError, setProblemError] = useState<string | null>(null);

    const [language, setLanguage] = useState<ProgrammingLanguage>('PYTHON');
    const [codeByLang, setCodeByLang] = useState<Record<ProgrammingLanguage, string>>({
        CPP: '',
        JAVA: '',
        PYTHON: '',
    });

    const [activeTab, setActiveTab] = useState<'problem' | 'results'>('problem');
    const [isRunning, setIsRunning] = useState(false);
    const [runError, setRunError] = useState<string | null>(null);
    const [lastSubmission, setLastSubmission] = useState<SubmissionDetail | null>(null);

    const [isSubmittingSection, setIsSubmittingSection] = useState(false);
    const [sectionError, setSectionError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setIsProblemLoading(true);
            setProblemError(null);
            setLastSubmission(null);
            setRunError(null);
            setActiveTab('problem');

            try {
                const res = await getProblem(accessToken, slot.problemId);
                if (cancelled) {
                    return;
                }

                setProblem(res.problem);
                const starter = res.problem.starterCode;
                setCodeByLang({
                    CPP: starter?.cpp ?? '',
                    JAVA: starter?.java ?? '',
                    PYTHON: starter?.python ?? '',
                });
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
                }
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [accessToken, slot.problemId, slot.slotIndex]);

    const stats = useMemo(() => {
        if (!lastSubmission) {
            return null;
        }
        const passed = lastSubmission.passedTests;
        const total = lastSubmission.totalTests;
        const pct = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
        return { passed, total, pct };
    }, [lastSubmission]);

    function setEditorValue(next: string) {
        setCodeByLang((prev) => ({ ...prev, [language]: next }));
    }

    async function run(isSampleRun: boolean) {
        if (!problem || readOnly) {
            return;
        }

        setIsRunning(true);
        setRunError(null);
        setLastSubmission(null);
        setSectionError(null);

        try {
            const res = await createSubmission(accessToken, {
                problemId: problem.id,
                language,
                sourceCode: codeByLang[language],
                isSampleRun,
            });

            setLastSubmission(res.submission);
            setActiveTab('results');

            if (!isSampleRun) {
                const linked = await linkMockDsaSubmission(
                    accessToken,
                    interviewId,
                    slot.slotIndex,
                    { submissionId: res.submission.id },
                );
                onInterviewChange(linked.interview);
            }
        } catch (err) {
            setRunError(err instanceof ApiError ? err.message : 'Submission failed');
        } finally {
            setIsRunning(false);
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
                                {!lastSubmission ? (
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
                                                        {lastSubmission.status}
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
                                                {lastSubmission.isSampleRun
                                                    ? 'Sample run (visible tests only)'
                                                    : 'Full submission — will be used if this is your latest for the section'}
                                            </p>
                                        </div>
                                        {lastSubmission.compileOutput ? (
                                            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                                <p className="section-label mb-2">Compile output</p>
                                                <pre className="overflow-x-auto font-mono text-xs text-zinc-800">
                                                    {lastSubmission.compileOutput}
                                                </pre>
                                            </div>
                                        ) : null}
                                        {lastSubmission.stderr ? (
                                            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                                <p className="section-label mb-2">Stderr</p>
                                                <pre className="overflow-x-auto font-mono text-xs text-zinc-800">
                                                    {lastSubmission.stderr}
                                                </pre>
                                            </div>
                                        ) : null}
                                        {lastSubmission.testResults &&
                                            lastSubmission.testResults.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="section-label">Test results</p>
                                                {lastSubmission.testResults.map((result) => (
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
                            disabled={readOnly || isRunning}
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
                                disabled={readOnly || isRunning}
                                onClick={() => void run(true)}
                            >
                                {isRunning ? 'Running…' : 'Run'}
                            </button>
                            <button
                                type="button"
                                className="btn-primary !py-2"
                                disabled={readOnly || isRunning}
                                onClick={() => void run(false)}
                            >
                                {isRunning ? 'Submitting…' : 'Submit'}
                            </button>
                        </div>
                    </div>
                    <div className="min-h-0 flex-1 p-3">
                        <MonacoEditor
                            value={codeByLang[language]}
                            onChange={setEditorValue}
                            language={language}
                            readOnly={readOnly}
                            height="100%"
                            className="h-full min-h-[420px]"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}