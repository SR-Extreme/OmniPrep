'use client';

import { cn } from '@/lib/utils';
import type { Role } from '@/types/auth';

interface RoleTabsProps {
    value: Role;
    onChange: (role: Role) => void;
    disabled?: boolean;
}

const TABS: { role: Role; label: string }[] = [
    { role: 'CANDIDATE', label: 'Candidate' },
    { role: 'ADMIN', label: 'Admin' },
];

export function RoleTabs({ value, onChange, disabled }: RoleTabsProps) {
    return (
        <div
            className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-1"
            role="tablist"
            aria-label="Account type"
        >
            {TABS.map((tab) => {
                const active = value === tab.role;
                return (
                    <button
                        key={tab.role}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        disabled={disabled}
                        onClick={() => onChange(tab.role)}
                        className={cn(
                            'rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                            active
                                ? 'bg-white text-emerald-700 shadow-soft ring-1 ring-emerald-200'
                                : 'text-zinc-500 hover:text-zinc-800',
                            disabled && 'cursor-not-allowed opacity-60',
                        )}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
