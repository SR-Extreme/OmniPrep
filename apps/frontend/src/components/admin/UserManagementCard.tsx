'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
            <Card>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.image}
                            alt={user.name}
                            className="h-12 w-12 rounded-full object-cover ring-1 ring-zinc-200"
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
                            {initials(user.name)}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="truncate">{user.name}</CardTitle>
                            {user.isPremium ? (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    Premium
                                </span>
                            ) : (
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/15">
                                    Free
                                </span>
                            )}
                        </div>
                        <CardDescription className="truncate">
                            {user.email}
                        </CardDescription>
                    </div>

                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => setConfirmOpen(true)}
                    >
                        Remove
                    </Button>
                </CardHeader>

                <CardContent>
                    <dl className="grid gap-3 text-sm sm:grid-cols-3">
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
                </CardContent>
            </Card>

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