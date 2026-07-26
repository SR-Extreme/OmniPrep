'use client';

import type { SubmissionDetail, SubmissionTestResult } from '@/types/dsa';

function CodeBlock({ value }: { value: string }) {
    return (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-800">
            <code>{value}</code>
        </pre>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="section-label">{children}</p>;
}

function firstFailingCase(
    results: SubmissionTestResult[] | null,
): SubmissionTestResult | null {
    if (!results) return null;
    return results.find((row) => row.status === 'FAILED') ?? null;
}

function hasIoDetails(row: SubmissionTestResult): boolean {
    return (
        row.input != null ||
        row.expectedOutput != null ||
        row.actualOutput != null
    );
}

export function SubmissionResultView({
    submission,
    showSourceCode = false,
}: {
    submission: SubmissionDetail;
    showSourceCode?: boolean;
}) {
    const passed = submission.passedTests;
    const total = submission.totalTests;
    const pct = total > 0 ? ((passed / total) * 100).toFixed(2) : '0';
    const firstFail = firstFailingCase(submission.testResults);
    const isAccepted = submission.status === 'ACCEPTED';

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <SectionLabel>Status</SectionLabel>
                        <p className="mt-1 text-base font-semibold text-zinc-900">
                            {submission.status}
                        </p>
                    </div>
                    <div className="text-right">
                        <SectionLabel>Tests</SectionLabel>
                        <p className="mt-1 text-base font-semibold text-zinc-900">
                            {passed}/{total} ({pct}%)
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span>
                        {submission.isSampleRun
                            ? 'Sample run (visible tests only)'
                            : 'Full submission'}
                    </span>
                    <span>·</span>
                    <span>{submission.language}</span>
                    {submission.executionTimeMs != null && (
                        <>
                            <span>·</span>
                            <span>{Math.round(submission.executionTimeMs)} ms</span>
                        </>
                    )}
                    {submission.memoryKb != null && (
                        <>
                            <span>·</span>
                            <span>{submission.memoryKb} KB</span>
                        </>
                    )}
                </div>
            </div>

            {submission.compileOutput && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <SectionLabel>Compile output</SectionLabel>
                    <pre className="mt-2 overflow-x-auto font-mono text-xs text-zinc-800">
                        {submission.compileOutput}
                    </pre>
                </div>
            )}

            {submission.stderr && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <SectionLabel>Stderr</SectionLabel>
                    <pre className="mt-2 overflow-x-auto font-mono text-xs text-zinc-800">
                        {submission.stderr}
                    </pre>
                </div>
            )}

            {!isAccepted && submission.stdout && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <SectionLabel>Stdout</SectionLabel>
                    <pre className="mt-2 overflow-x-auto font-mono text-xs text-zinc-800">
                        {submission.stdout}
                    </pre>
                </div>
            )}

            {firstFail && hasIoDetails(firstFail) && (
                <div className="rounded-md border border-rose-200 bg-rose-50/40 p-4">
                    <SectionLabel>Failed test case</SectionLabel>
                    <div className="mt-3 space-y-3">
                        {firstFail.input != null && (
                            <div>
                                <p className="mb-1.5 text-xs font-medium text-zinc-700">Input</p>
                                <CodeBlock value={firstFail.input} />
                            </div>
                        )}
                        {firstFail.expectedOutput != null && (
                            <div>
                                <p className="mb-1.5 text-xs font-medium text-zinc-700">
                                    Expected output
                                </p>
                                <CodeBlock value={firstFail.expectedOutput} />
                            </div>
                        )}
                        {firstFail.actualOutput != null && (
                            <div>
                                <p className="mb-1.5 text-xs font-medium text-zinc-700">
                                    Your output
                                </p>
                                <CodeBlock value={firstFail.actualOutput} />
                            </div>
                        )}
                        {firstFail.actualOutput == null &&
                            firstFail.status === 'FAILED' && (
                                <p className="text-xs text-zinc-500">
                                    No stdout captured for this case (runtime/time/memory
                                    error may have occurred).
                                </p>
                            )}
                    </div>
                </div>
            )}

            {submission.testResults && submission.testResults.length > 0 && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <SectionLabel>Test results</SectionLabel>
                    <ul className="mt-3 space-y-2">
                        {submission.testResults.map((row, idx) => (
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
                                        Case {idx + 1}
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
                </div>
            )}

            {showSourceCode && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <SectionLabel>Source code</SectionLabel>
                    <div className="mt-2">
                        <CodeBlock value={submission.sourceCode} />
                    </div>
                </div>
            )}
        </div>
    );
}
