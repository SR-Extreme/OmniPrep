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
    const base = 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset';

    switch (difficulty) {
        case 'EASY':
            return `${base} bg-emerald-500/10 text-emerald-400 ring-emerald-500/30`;
        case 'MEDIUM':
            return `${base} bg-amber-500/10 text-amber-400 ring-amber-500/30`;
        case 'HARD':
            return `${base} bg-rose-500/10 text-rose-400 ring-rose-500/30`;
    }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{children}</h2>
}

function CodeBlock({ value }: { value: string }) {
    return (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
            <code>{value}</code>
        </pre>
    );
}

function ExampleCard({ example, index }: { example: Example; index: number }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="mb-3 text-sm font-medium text-white">Example {index + 1}</p>
            <div className='space-y-3'>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Input</p>
                    <CodeBlock value={example.input} />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Output</p>
                    <CodeBlock value={example.output} />
                </div>
                {example.explanation && (
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Explanation</p>
                        <p className="mt-1 text-sm text-slate-300">{example.explanation}</p>
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

        //cleanup code
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
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
                Loading…
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-slate-950'>
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-lg font-bold tracking-tight text-white">
                            OmniPrep
                        </Link>
                        <nav className="hidden items-center gap-3 sm:flex">
                            <Link href="/problems" className="text-sm font-medium text-slate-300 hover:text-white">
                                Problems
                            </Link>
                            <span className="text-sm text-slate-600">/</span>
                            <span className="text-sm font-medium text-emerald-400">Solve</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <p className="hidden text-sm text-slate-400 md:block">
                                {user.name}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => logout()}
                            disabled={authLoading}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-60"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-6">
                {isProblemLoading ? (
                    <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 px-6 py-16 text-slate-400">
                        Loading problem…
                    </div>
                ) : problemError ? (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-5 text-rose-300">
                        <p className="font-semibold">Couldn&apos;t load this problem</p>
                        <p className="mt-1 text-sm">{problemError}</p>
                        <div className="mt-4">
                            <Link
                                href="/problems"
                                className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
                            >
                                Back to problems
                            </Link>
                        </div>
                    </div>
                ) : problem ? (
                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* Left: Problem panel */}
                        <section className="rounded-xl border border-slate-800 bg-slate-900">
                            <div className="border-b border-slate-800 px-5 py-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-xl font-semibold text-white">{problem.title}</h1>
                                    <span className={difficultyPill(problem.difficulty)}>
                                        {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
                                    </span>
                                </div>
                                {problem.topics.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {problem.topics.map((t) => (
                                            <span key={t} className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex border-b border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('problem')}
                                    className={[
                                        'flex-1 px-4 py-2 text-sm font-medium transition',
                                        activeTab === 'problem'
                                            ? 'bg-slate-950 text-emerald-300'
                                            : 'text-slate-300 hover:text-white',
                                    ].join(' ')}
                                >
                                    Problem
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('results')}
                                    className={[
                                        'flex-1 px-4 py-2 text-sm font-medium transition',
                                        activeTab === 'results'
                                            ? 'bg-slate-950 text-emerald-300'
                                            : 'text-slate-300 hover:text-white',
                                    ].join(' ')}
                                >
                                    Results
                                </button>
                            </div>
                            <div className="space-y-6 px-5 py-5">
                                {activeTab === 'problem' ? (
                                    <>
                                        <div>
                                            <SectionTitle>Description</SectionTitle>
                                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                                                {problem.description}
                                            </p>
                                        </div>
                                        {problem.constraints && (
                                            <div>
                                                <SectionTitle>Constraints</SectionTitle>
                                                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
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
                                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                                                    {problem.hints.map((h, idx) => (
                                                        <li key={idx}>{h}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                                            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                                                <p className="font-semibold text-slate-300">Time limit</p>
                                                <p className="mt-1">{problem.timeLimitMs} ms</p>
                                            </div>
                                            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                                                <p className="font-semibold text-slate-300">Memory limit</p>
                                                <p className="mt-1">{problem.memoryLimitKb} KB</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {runError && (
                                            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                                                {runError}
                                            </div>
                                        )}
                                        {!lastSubmission ? (
                                            <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-10 text-center text-sm text-slate-400">
                                                Run or submit to see results here.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                                Status
                                                            </p>
                                                            <p className="mt-1 text-base font-semibold text-white">
                                                                {lastSubmission.status}
                                                            </p>
                                                        </div>
                                                        {stats && (
                                                            <div className="text-right">
                                                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                                                    Tests
                                                                </p>
                                                                <p className="mt-1 text-base font-semibold text-white">
                                                                    {stats.passed}/{stats.total} ({stats.pct}%)
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 text-xs text-slate-400">
                                                        {lastSubmission.isSampleRun ? 'Sample run (visible tests only)' : 'Full submission'}
                                                    </div>
                                                </div>
                                                {lastSubmission.compileOutput && (
                                                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Compile output
                                                        </p>
                                                        <pre className="mt-2 overflow-x-auto text-xs text-slate-200">
                                                            {lastSubmission.compileOutput}
                                                        </pre>
                                                    </div>
                                                )}
                                                {lastSubmission.stderr && (
                                                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Stderr
                                                        </p>
                                                        <pre className="mt-2 overflow-x-auto text-xs text-slate-200">
                                                            {lastSubmission.stderr}
                                                        </pre>
                                                    </div>
                                                )}
                                                {lastSubmission.stdout && (
                                                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Stdout
                                                        </p>
                                                        <pre className="mt-2 overflow-x-auto text-xs text-slate-200">
                                                            {lastSubmission.stdout}
                                                        </pre>
                                                    </div>
                                                )}
                                                {lastSubmission.testResults && lastSubmission.testResults.length > 0 && (
                                                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Test results
                                                        </p>
                                                        <ul className="mt-3 space-y-2">
                                                            {lastSubmission.testResults.map((row, idx) => (
                                                                <li
                                                                    key={`${row.testCaseId}-${idx}`}
                                                                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={[
                                                                                'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                                                                                row.status === 'PASSED'
                                                                                    ? 'bg-emerald-500/10 text-emerald-300'
                                                                                    : 'bg-rose-500/10 text-rose-300',
                                                                            ].join(' ')}
                                                                        >
                                                                            {row.status}
                                                                        </span>
                                                                        <span className="text-xs text-slate-400">
                                                                            {row.testCaseId}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
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
                                                        <p className="mt-3 text-xs text-slate-500">
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

                        {/* Right: Editor + actions */}
                        <section className="rounded-xl border border-slate-800 bg-slate-900">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-white">Editor</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value as ProgrammingLanguage)}
                                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
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
                                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isRunning ? 'Running…' : 'Run'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => run(false)}
                                        disabled={isRunning}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isRunning ? 'Submitting…' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <MonacoEditor
                                    value={editorValue}
                                    onChange={setEditorValue}
                                    language={language}
                                    height="520px"
                                />
                                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-400">
                                    <p className="font-semibold text-slate-300">I/O protocol</p>
                                    <p className="mt-1">
                                        Input is a single JSON object on stdin. Output must be a single JSON value.
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>
                ) : null}
            </main>
        </div>
    )
}

