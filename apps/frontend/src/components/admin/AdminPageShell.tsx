import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AdminLoading({ label = 'Loading…' }: { label?: string }) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center bg-zinc-50 text-zinc-500">
            <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                {label}
            </div>
        </div>
    );
}

export function AdminInlineLoading({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-sm text-zinc-500 shadow-soft">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            {label}
        </div>
    );
}

interface AdminPageShellProps {
    children: ReactNode;
    className?: string;
    /** Defaults to max-w-7xl. Use max-w-5xl for forms. */
    width?: 'full' | 'form';
}

export function AdminPageShell({
    children,
    className,
    width = 'full',
}: AdminPageShellProps) {
    return (
        <div className="overflow-x-hidden bg-zinc-50">
            <div
                className={cn(
                    'mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12',
                    width === 'full' ? 'max-w-7xl' : 'max-w-5xl',
                    className,
                )}
            >
                {children}
            </div>
        </div>
    );
}

interface AdminPageHeaderProps {
    label: string;
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function AdminPageHeader({
    label,
    title,
    description,
    actions,
}: AdminPageHeaderProps) {
    return (
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
                <p className="section-label">{label}</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                    {title}
                </h1>
                {description ? (
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500 sm:text-base">
                        {description}
                    </p>
                ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
    );
}

export function AdminErrorAlert({ message }: { message: string }) {
    return (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
        </p>
    );
}

export function AdminEmptyState({ message }: { message: string }) {
    return (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-12 text-center text-sm text-zinc-500 shadow-soft">
            {message}
        </p>
    );
}

export function AdminStatCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/70 px-4 py-4 shadow-soft sm:px-5">
            <div
                className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-emerald-200/35 to-transparent"
                aria-hidden="true"
            />
            <p className="relative section-label">{label}</p>
            <p className="relative mt-1.5 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                {value}
            </p>
            {hint ? (
                <p className="relative mt-1.5 text-xs leading-relaxed text-zinc-500">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

export function AdminPanel({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-soft',
                className,
            )}
        >
            <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-700"
                aria-hidden="true"
            />
            {children}
        </div>
    );
}
