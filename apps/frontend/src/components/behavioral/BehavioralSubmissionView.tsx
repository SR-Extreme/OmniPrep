'use client';

import {
    type BehavioralPhaseType,
    type BehavioralSessionDetail,
    type BehavioralTurnDetail,
} from '@/types/behavioral';

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="section-label">{children}</p>;
}

function phaseLabel(type: BehavioralPhaseType): string {
    return type
        .split('_')
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');
}

function TurnRow({ turn }: { turn: BehavioralTurnDetail }) {
    return (
        <li className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm">
            <p className="text-xs font-medium text-zinc-500">
                {phaseLabel(turn.phaseType)}
                {turn.isFollowUp ? ' · Follow-up' : ''}
            </p>
            <p className="mt-1 font-medium text-zinc-800">Q: {turn.questionText}</p>
            {turn.candidateAnswerText && (
                <p className="mt-2 whitespace-pre-wrap text-zinc-600">
                    A: {turn.candidateAnswerText}
                </p>
            )}
            {turn.phaseType === 'CANDIDATE_QUESTIONS' && turn.interviewerReplyText && (
                <p className="mt-2 text-emerald-800">
                    Interviewer: {turn.interviewerReplyText}
                </p>
            )}
        </li>
    );
}

export function BehavioralSubmissionView({
    session,
}: {
    session: BehavioralSessionDetail;
}) {
    return (
        <div className="space-y-4">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <SectionLabel>Status</SectionLabel>
                <p className="mt-1 text-base font-semibold text-zinc-900">{session.status}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span>{session.turns.length} turns</span>
                    <span>·</span>
                    <span>{session.resumeFileName}</span>
                    {session.completedAt && (
                        <>
                            <span>·</span>
                            <span>
                                Completed{' '}
                                {new Date(session.completedAt).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {session.turns.length > 0 ? (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <SectionLabel>Transcript</SectionLabel>
                    <ol className="mt-3 space-y-2">
                        {session.turns.map((turn) => (
                            <TurnRow key={turn.id} turn={turn} />
                        ))}
                    </ol>
                </div>
            ) : (
                <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
                    No turns recorded yet.
                </div>
            )}
        </div>
    );
}
