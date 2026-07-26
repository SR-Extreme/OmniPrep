'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function RevealSection({
    title,
    children,
    defaultOpen = false,
    count,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    /** Optional count shown next to the title (e.g. number of hints). */
    count?: number;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-zinc-50"
            >
                <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900">{title}</span>
                    {count != null && (
                        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-zinc-500">
                            {count}
                        </span>
                    )}
                </span>
                <ChevronDown
                    className={[
                        'h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200',
                        open ? 'rotate-180' : '',
                    ].join(' ')}
                    aria-hidden="true"
                />
            </button>
            {open && (
                <div className="border-t border-zinc-100 px-4 py-3">{children}</div>
            )}
        </div>
    );
}
