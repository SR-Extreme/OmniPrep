'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { AdminUserListItem } from '@/types/admin';

export interface UserManagementCardProps {
    user: AdminUserListItem;
    onDelete: (user: AdminUserListItem) => void;
    isDeleting?: boolean;
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return '?';
    }
    if (parts.length === 1) {
        return parts[0]!.slice(0, 2).toUpperCase();
    }
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

export function UserManagementCard({
    user,
    onDelete,
    isDeleting = false,
}: UserManagementCardProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const scoreText =
        user.averageInterviewScore == null
            ? '—'
            : user.averageInterviewScore.toFixed(1);

    return (
        <>
            <motion.article
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                whileHover={{ y: -2 }}
                className="group relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-white via-white to-emerald-50/50 p-5 shadow-soft transition duration-300 hover:shadow-elevated sm:p-6"
            >
                <div
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-200/30 to-transparent"
                    aria-hidden="true"
                />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
                    {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.image}
                            alt={user.name}
                            className="h-12 w-12 rounded-2xl object-cover ring-1 ring-zinc-200"
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700">
                            {initials(user.name)}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-zinc-900 sm:text-lg">
                                {user.name}
                            </h3>
                            {user.isPremium ? (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    Premium
                                </span>
                            ) : (
                                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/15">
                                    Free
                                </span>
                            )}
                        </div>
                        <p className="mt-1 truncate text-sm text-zinc-500">{user.email}</p>
                    </div>

                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => setConfirmOpen(true)}
                        className="self-start"
                    >
                        Remove
                    </Button>
                </div>

                <dl className="relative mt-5 grid gap-3 border-t border-zinc-100 pt-4 text-sm sm:grid-cols-3">
                    <div>
                        <dt className="section-label">Avg score</dt>
                        <dd className="mt-1 font-medium text-zinc-900">{scoreText}</dd>
                    </div>
                    <div>
                        <dt className="section-label">Joined</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                            {formatDate(user.createdAt)}
                        </dd>
                    </div>
                    <div>
                        <dt className="section-label">Latest login</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                            {formatDate(user.recentLogin)}
                        </dd>
                    </div>
                </dl>
            </motion.article>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove user?</DialogTitle>
                        <DialogDescription>
                            This permanently deletes{' '}
                            <span className="font-medium text-zinc-800">{user.name}</span>{' '}
                            ({user.email}) and related data. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setConfirmOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => {
                                onDelete(user);
                                setConfirmOpen(false);
                            }}
                        >
                            {isDeleting ? 'Removing…' : 'Remove user'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
