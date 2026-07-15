'use client';

import { useEffect, useRef, useState } from 'react';

export interface SectionTimerProps {
    remainingMs: number;
    label?: string;
    onExpire?: () => void;
    className?: string;
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function urgencyClass(remainingMs: number): string {
    if (remainingMs <= 5 * 60 * 1000) {
        return 'text-rose-600';
    }
    if (remainingMs <= 15 * 60 * 1000) {
        return 'text-amber-600';
    }
    return 'text-zinc-900';
}

export function SectionTimer({
    remainingMs,
    label = 'Section',
    onExpire,
    className = '',
}: SectionTimerProps) {
    const [displayMs, setDisplayMs] = useState(() => Math.max(0, remainingMs));
    const expiredRef = useRef(false);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    // Countdown from the server value whenever remainingMs changes (e.g. new section).
    // Must use remainingMs as the interval base — not displayMs, which is still stale
    // in the same render as a prop change.
    useEffect(() => {
        const initialMs = Math.max(0, remainingMs);
        setDisplayMs(initialMs);

        if (initialMs <= 0) {
            if (!expiredRef.current) {
                expiredRef.current = true;
                onExpireRef.current?.();
            }
            return;
        }

        expiredRef.current = false;
        const startedAt = Date.now();

        const intervalId = window.setInterval(() => {
            const next = Math.max(0, initialMs - (Date.now() - startedAt));
            setDisplayMs(next);

            if (next <= 0) {
                window.clearInterval(intervalId);
                if (!expiredRef.current) {
                    expiredRef.current = true;
                    onExpireRef.current?.();
                }
            }
        }, 250);

        return () => window.clearInterval(intervalId);
    }, [remainingMs]);

    return (
        <div
            className={`rounded-lg border border-zinc-200 bg-white px-3 py-2 text-right ${className}`}
        >
            <p className="section-label">{label}: time remaining</p>
            <p
                className={`mt-0.5 font-mono text-lg font-semibold tabular-nums tracking-tight ${urgencyClass(displayMs)}`}
                aria-live="polite"
            >
                {formatDuration(displayMs)}
            </p>
        </div>
    );
}
