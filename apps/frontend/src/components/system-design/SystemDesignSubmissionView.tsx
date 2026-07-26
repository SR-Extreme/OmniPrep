'use client';

import type { SystemDesignSubmissionDetail } from '@/types/system-design';

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="section-label">{children}</p>;
}

export function SystemDesignSubmissionView({
    submission,
}: {
    submission: SystemDesignSubmissionDetail;
}) {
    const questions = submission.followUpQuestions ?? [];
    const answers = submission.followUpAnswers ?? [];

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <SectionLabel>Status</SectionLabel>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span>
                        {submission.textAnswer?.trim() ? 'Text answer' : 'No text'}
                    </span>
                    <span>·</span>
                    <span>{submission.diagramUrl ? 'Diagram attached' : 'No diagram'}</span>
                    <span>·</span>
                    <span>
                        {submission.followUpAnswers
                            ? 'Follow-ups answered'
                            : submission.followUpQuestions
                              ? 'Follow-ups pending answers'
                              : 'Awaiting follow-ups'}
                    </span>
                </div>
            </div>

            {submission.textAnswer && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <SectionLabel>Text answer</SectionLabel>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                        {submission.textAnswer}
                    </p>
                </div>
            )}

            {submission.diagramUrl && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <SectionLabel>Diagram</SectionLabel>
                    <img
                        src={submission.diagramUrl}
                        alt="Submitted system design diagram"
                        className="mt-2 max-h-80 w-full rounded-md border border-zinc-200 bg-white object-contain"
                    />
                </div>
            )}

            {questions.length > 0 && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <SectionLabel>Follow-up round</SectionLabel>
                    <ol className="mt-3 space-y-3">
                        {questions.map((q, idx) => (
                            <li
                                key={idx}
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm"
                            >
                                <p className="font-medium text-zinc-800">
                                    <span className="text-zinc-400">Q{idx + 1}. </span>
                                    {q}
                                </p>
                                {answers[idx] != null && (
                                    <p className="mt-2 whitespace-pre-wrap text-zinc-600">
                                        <span className="font-medium text-zinc-700">A: </span>
                                        {answers[idx]}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
