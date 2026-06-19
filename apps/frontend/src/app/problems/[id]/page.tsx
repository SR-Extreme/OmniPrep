'use client'

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { getProblem } from '@/lib/api/problems';
import { createSubmission } from '@/lib/api/submissions';
import { MonacoEditor } from '@/components/MonacoEditor';
import { useAuthStore } from '@/store/authStore';
import {
    PROGRAMMING_LANGUAGES,
    type Example,
    type ProgrammingLanguage,
    type ProblemDetail,
    type SubmissionDetail,
} from '@/types/dsa';

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

export default function ProblemSolverPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();

    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();

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

    const [activeTab, setActiveTab] = useState<'problem' | 'results'>('problem');

    const [isRunning, setIsRunning] = useState(false);
    const [runError, setRunError] = useState<string | null>(null);
    const [lastSubmission, setLastSubmission] = useState<SubmissionDetail | null>(null);

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

        async function load() {
            setIsProblemLoading(true);
            setProblemError(null);

            try {
                const id = params?.id;
                if (!id) {
                    throw new Error('Missing problem id');
                }
                const res = await getProblem(accessToken as string, id);

                if (cancelled) return;

                setProblem(res.problem);

                const starter = res.problem.starterCode;

                setCodeByLang({
                    CPP: starter?.cpp ?? '',
                    JAVA: starter?.java ?? '',
                    PYTHON: starter?.python ?? '',
                });
            } catch (err) {
                if (cancelled) return;
                const message = err instanceof ApiError ? err.message : "Failed to load problem";
                setProblemError(message);
            } finally {
                if (!cancelled) setIsProblemLoading(false);
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, params?.id]);

    const editorValue = codeByLang[language];

    const stats = useMemo(() => {
        if (!lastSubmission) return null;
        const passed = lastSubmission.passedTests;
        const total = lastSubmission.totalTests;
        const pct = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
        return { passed, total, pct };
    }, [lastSubmission]);

    function setEditorValue(next: string) {
        setCodeByLang((prev) => ({ ...prev, [language]: next }));
    }

    async function run(isSampleRun: boolean) {
        if (!accessToken || !problem) return;

        setIsRunning(true);
        setRunError(null);
        setLastSubmission(null);

        try {
            const res = await createSubmission(accessToken, {
                problemId: problem.id,
                language,
                sourceCode: codeByLang[language],
                isSampleRun,
            });

            setLastSubmission(res.submission);
            setActiveTab('results');
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Submission failed';
            setRunError(message);
        } finally {
            setIsRunning(false);
        }
    }

    if (!hydrated || !accessToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                    Loading…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <header className="nav-header">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                        <Link href="/" className="flex shrink-0 items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                                O
                            </span>
                            <span className="hidden text-base font-semibold tracking-tight text-zinc-900 sm:inline">
                                OmniPrep
                            </span>
                        </Link>
                        <nav className="flex min-w-0 items-center gap-2 text-sm">
                            <Link href="/problems" className="shrink-0 font-medium text-zinc-600 transition hover:text-zinc-900">
                                Problems
                            </Link>
                            <span className="text-zinc-300">/</span>
                            <span className="truncate font-medium text-emerald-700">
                                {problem?.title ?? 'Solve'}
                            </span>
                        </nav>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        {user && (
                            <p className="hidden text-sm text-zinc-500 md:block">
                                {user.name}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => logout()}
                            disabled={authLoading}
                            className="btn-secondary !py-2"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-6">
                {isProblemLoading ? (
                    <div className="card flex items-center justify-center gap-2 px-6 py-20 text-zinc-500">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                        Loading problem…
                    </div>
                ) : problemError ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
                        <p className="font-medium">Couldn&apos;t load this problem</p>
                        <p className="mt-1 text-sm">{problemError}</p>
                        <div className="mt-4">
                            <Link href="/problems" className="btn-secondary">
                                Back to problems
                            </Link>
                        </div>
                    </div>
                ) : problem ? (
                    <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
                        <section className="card overflow-hidden">
                            <div className="border-b border-zinc-200 px-5 py-4">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-lg font-semibold text-zinc-900">{problem.title}</h1>
                                    <span className={difficultyPill(problem.difficulty)}>
                                        {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
                                    </span>
                                </div>
                                {problem.topics.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {problem.topics.map((t) => (
                                            <span
                                                key={t}
                                                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex border-b border-zinc-200 bg-zinc-50/50">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('problem')}
                                    className={[
                                        'flex-1 border-b-2 px-4 py-2.5 text-sm font-medium transition duration-150',
                                        activeTab === 'problem'
                                            ? 'border-emerald-600 bg-white text-emerald-700'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-800',
                                    ].join(' ')}
                                >
                                    Problem
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('results')}
                                    className={[
                                        'flex-1 border-b-2 px-4 py-2.5 text-sm font-medium transition duration-150',
                                        activeTab === 'results'
                                            ? 'border-emerald-600 bg-white text-emerald-700'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-800',
                                    ].join(' ')}
                                >
                                    Results
                                </button>
                            </div>
                            <div className="max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-5 py-5">
                                {activeTab === 'problem' ? (
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
                                        {problem.hints && problem.hints.length > 0 && (
                                            <div>
                                                <SectionTitle>Hints</SectionTitle>
                                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                                                    {problem.hints.map((h, idx) => (
                                                        <li key={idx}>{h}</li>
                                                    ))}
                                                </ul>
                                            </div>
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
                                ) : (
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
                                                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="section-label">Status</p>
                                                            <p className="mt-1 text-base font-semibold text-zinc-900">
                                                                {lastSubmission.status}
                                                            </p>
                                                        </div>
                                                        {stats && (
                                                            <div className="text-right">
                                                                <p className="section-label">Tests</p>
                                                                <p className="mt-1 text-base font-semibold text-zinc-900">
                                                                    {stats.passed}/{stats.total} ({stats.pct}%)
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 text-xs text-zinc-500">
                                                        {lastSubmission.isSampleRun ? 'Sample run (visible tests only)' : 'Full submission'}
                                                    </div>
                                                </div>
                                                {lastSubmission.compileOutput && (
                                                    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                                        <p className="section-label mb-2">Compile output</p>
                                                        <pre className="overflow-x-auto font-mono text-xs text-zinc-800">
                                                            {lastSubmission.compileOutput}
                                                        </pre>
                                                    </div>
                                                )}
                                                {lastSubmission.stderr && (
                                                    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                                        <p className="section-label mb-2">Stderr</p>
                                                        <pre className="overflow-x-auto font-mono text-xs text-zinc-800">
                                                            {lastSubmission.stderr}
                                                        </pre>
                                                    </div>
                                                )}
                                                {lastSubmission.stdout && (
                                                    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                                        <p className="section-label mb-2">Stdout</p>
                                                        <pre className="overflow-x-auto font-mono text-xs text-zinc-800">
                                                            {lastSubmission.stdout}
                                                        </pre>
                                                    </div>
                                                )}
                                                {lastSubmission.testResults && lastSubmission.testResults.length > 0 && (
                                                    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                                        <p className="section-label mb-3">Test results</p>
                                                        <ul className="space-y-2">
                                                            {lastSubmission.testResults.map((row, idx) => (
                                                                <li
                                                                    key={`${row.testCaseId}-${idx}`}
                                                                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={[
                                                                                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                                                                row.status === 'PASSED'
                                                                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                                                                    : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
                                                                            ].join(' ')}
                                                                        >
                                                                            {row.status}
                                                                        </span>
                                                                        <span className="text-xs text-zinc-400">
                                                                            {row.testCaseId}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                                        {row.executionTimeMs != null && (
                                                                            <span>{Math.round(row.executionTimeMs)} ms</span>
                                                                        )}
                                                                        {row.memoryKb != null && (
                                                                            <span>{row.memoryKb} KB</span>
                                                                        )}
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <p className="mt-3 text-xs text-zinc-400">
                                                            Hidden test case I/O is redacted by design.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="card overflow-hidden">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3.5">
                                <p className="text-sm font-medium text-zinc-900">Editor</p>
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
                                        Input is a single JSON object on stdin. Output must be a single JSON value.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
