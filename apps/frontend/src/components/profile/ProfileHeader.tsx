'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ProfileResponse } from '@/types/profile';

export interface ProfileHeaderProps {
    profile: ProfileResponse;
    onLogout: () => void;
    onAvatarSelected?: (file: File) => void;
    isUploadingAvatar?: boolean;
    isLoggingOut?: boolean;
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

export function ProfileHeader({
    profile,
    onLogout,
    onAvatarSelected,
    isUploadingAvatar = false,
    isLoggingOut = false,
}: ProfileHeaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scoreText =
        profile.averageInterviewScore == null
            ? '—'
            : profile.averageInterviewScore.toFixed(1);

    const premiumWindow =
        profile.isPremium && profile.premiumFrom && profile.premiumTill
            ? `${formatDate(profile.premiumFrom)} → ${formatDate(profile.premiumTill)}`
            : null;

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="relative">
                        {profile.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.image}
                                alt={profile.name}
                                className="h-16 w-16 rounded-full object-cover ring-1 ring-zinc-200"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-base font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
                                {initials(profile.name)}
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-xl">{profile.name}</CardTitle>
                            {profile.isPremium ? (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    Premium
                                </span>
                            ) : (
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/15">
                                    Free
                                </span>
                            )}
                        </div>
                        <CardDescription className="mt-1">{profile.email}</CardDescription>
                        {profile.phoneNo ? (
                            <p className="mt-1 text-sm text-zinc-600">{profile.phoneNo}</p>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {onAvatarSelected ? (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) {
                                        onAvatarSelected(file);
                                    }
                                    event.target.value = '';
                                }}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={isUploadingAvatar}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploadingAvatar ? 'Uploading…' : 'Change photo'}
                            </Button>
                        </>
                    ) : null}
                    {!profile.isPremium ? (
                        <Button asChild variant="outline">
                            <Link href="/premium">Upgrade</Link>
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isLoggingOut}
                        onClick={onLogout}
                    >
                        {isLoggingOut ? 'Logging out…' : 'Logout'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <dt className="section-label">Joined</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                            {formatDate(profile.createdAt)}
                        </dd>
                    </div>
                    <div>
                        <dt className="section-label">Latest login</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                            {formatDate(profile.recentLogin)}
                        </dd>
                    </div>
                    <div>
                        <dt className="section-label">Avg interview score</dt>
                        <dd className="mt-1 font-medium text-zinc-900">{scoreText}</dd>
                    </div>
                    <div>
                        <dt className="section-label">Premium window</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                            {premiumWindow ?? 'Not subscribed'}
                        </dd>
                    </div>
                </dl>
            </CardContent>
        </Card>
    );
}