'use client';

import { cn } from '@/lib/utils';
import type { QuestionListStatus } from '@/types/admin';

interface AdminStatusFilterProps {
    status: QuestionListStatus;
    onChange: (status: QuestionListStatus) => void;
}

export function AdminStatusFilter({ status, onChange }: AdminStatusFilterProps) {
    return (
        <aside className="h-fit rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-white via-white to-emerald-50/60 p-3 shadow-soft sm:p-4">
            <p className="section-label px-2 pb-2">Status</p>
            <div className="space-y-1">
                {(['published', 'draft'] as const).map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onChange(value)}
                        className={cn(
                            'w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium capitalize transition',
                            status === value
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-zinc-600 hover:bg-emerald-50 hover:text-emerald-800',
                        )}
                    >
                        {value}
                    </button>
                ))}
            </div>
        </aside>
    );
}
