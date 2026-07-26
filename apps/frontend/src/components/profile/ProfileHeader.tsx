'use client';

import { motion } from 'framer-motion';
import { Camera, LogOut, Pencil, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { FieldError } from '@/components/ui/FieldError';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { validateAvatarFile, validateName, validatePhone } from '@/lib/validation/fields';
import type { ProfileResponse, UpdateProfileBody } from '@/types/profile';

export interface ProfileHeaderProps {
    profile: ProfileResponse;
    onLogout: () => void;
    onAvatarSelected?: (file: File) => void;
    onUpdateProfile?: (body: UpdateProfileBody) => Promise<void>;
    isUploadingAvatar?: boolean;
    isUpdatingProfile?: boolean;
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
    onUpdateProfile,
    isUploadingAvatar = false,
    isUpdatingProfile = false,
    isLoggingOut = false,
}: ProfileHeaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile.name);
    const [phoneNo, setPhoneNo] = useState(profile.phoneNo ?? '');
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const { errors, touch, clear, setMany } = useFieldErrors<'name' | 'phoneNo'>();

    useEffect(() => {
        if (!isEditing) {
            setName(profile.name);
            setPhoneNo(profile.phoneNo ?? '');
            clear();
        }
    }, [profile.name, profile.phoneNo, isEditing, clear]);

    const scoreText =
        profile.averageInterviewScore == null
            ? '—'
            : profile.averageInterviewScore.toFixed(1);

    const premiumWindow =
        profile.isPremium && profile.premiumFrom && profile.premiumTill
            ? `${formatDate(profile.premiumFrom)} → ${formatDate(profile.premiumTill)}`
            : null;

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!onUpdateProfile) {
            return;
        }

        const trimmedName = name.trim();
        const trimmedPhone = phoneNo.trim();

        const next: Partial<Record<'name' | 'phoneNo', string>> = {};
        const nameErr = validateName(name);
        const phoneErr = validatePhone(phoneNo);
        if (nameErr) next.name = nameErr;
        if (phoneErr) next.phoneNo = phoneErr;
        setMany(next);
        if (Object.keys(next).length > 0) {
            return;
        }

        const body: UpdateProfileBody = {};
        if (trimmedName !== profile.name) {
            body.name = trimmedName;
        }
        if (trimmedPhone !== (profile.phoneNo ?? '')) {
            body.phoneNo = trimmedPhone;
        }

        if (body.name === undefined && body.phoneNo === undefined) {
            setIsEditing(false);
            return;
        }

        try {
            await onUpdateProfile(body);
            setIsEditing(false);
        } catch {
            // Parent surfaces the API error
        }
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-elevated"
        >
            <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-700"
                aria-hidden="true"
            />

            <div className="relative p-5 sm:p-6 lg:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="relative">
                            {profile.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profile.image}
                                    alt={profile.name}
                                    className="h-16 w-16 rounded-2xl object-cover ring-1 ring-zinc-200"
                                />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-base font-semibold text-emerald-700">
                                    {initials(profile.name)}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                                    {profile.name}
                                </h1>
                                {profile.isPremium ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                                        Premium
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/15">
                                        Free
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-zinc-500">{profile.email}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {onUpdateProfile && !isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="btn-secondary !rounded-xl"
                            >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                                Edit profile
                            </button>
                        ) : null}
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
                                            const message = validateAvatarFile(file);
                                            if (message) {
                                                setAvatarError(message);
                                            } else {
                                                setAvatarError(null);
                                                onAvatarSelected(file);
                                            }
                                        }
                                        event.target.value = '';
                                    }}
                                />
                                <div>
                                    <button
                                        type="button"
                                        disabled={isUploadingAvatar}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn-secondary !rounded-xl"
                                    >
                                        <Camera className="h-4 w-4" aria-hidden="true" />
                                        {isUploadingAvatar ? 'Uploading…' : 'Change photo'}
                                    </button>
                                    <FieldError message={avatarError} />
                                </div>
                            </>
                        ) : null}
                        {!profile.isPremium ? (
                            <Link href="/premium" className="btn-primary !rounded-xl">
                                Upgrade
                            </Link>
                        ) : null}
                        <button
                            type="button"
                            disabled={isLoggingOut}
                            onClick={onLogout}
                            className="btn-ghost !rounded-xl"
                        >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            {isLoggingOut ? 'Logging out…' : 'Logout'}
                        </button>
                    </div>
                </div>

                {isEditing && onUpdateProfile ? (
                    <form
                        onSubmit={(event) => void handleSave(event)}
                        noValidate
                        className="mt-6 space-y-4 border-t border-zinc-100 pt-5"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-zinc-900">
                                Update name & phone
                            </p>
                            <button
                                type="button"
                                disabled={isUpdatingProfile}
                                onClick={() => {
                                    setIsEditing(false);
                                    setName(profile.name);
                                    setPhoneNo(profile.phoneNo ?? '');
                                    clear();
                                }}
                                className="btn-ghost !rounded-xl !px-2 !py-1.5"
                                aria-label="Cancel editing"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="profile-name"
                                    className="block text-sm font-medium text-zinc-700"
                                >
                                    Name
                                </label>
                                <input
                                    id="profile-name"
                                    type="text"
                                    autoComplete="name"
                                    maxLength={100}
                                    value={name}
                                    disabled={isUpdatingProfile}
                                    onChange={(event) => {
                                        setName(event.target.value);
                                        clear('name');
                                    }}
                                    onBlur={() => touch('name', validateName(name))}
                                    aria-invalid={Boolean(errors.name)}
                                    className="input-base mt-1.5 !rounded-xl"
                                />
                                <FieldError message={errors.name} />
                            </div>
                            <div>
                                <label
                                    htmlFor="profile-phone"
                                    className="block text-sm font-medium text-zinc-700"
                                >
                                    Phone number
                                </label>
                                <input
                                    id="profile-phone"
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    maxLength={10}
                                    value={phoneNo}
                                    disabled={isUpdatingProfile}
                                    onChange={(event) => {
                                        setPhoneNo(
                                            event.target.value.replace(/\D/g, '').slice(0, 10),
                                        );
                                        clear('phoneNo');
                                    }}
                                    onBlur={() => touch('phoneNo', validatePhone(phoneNo))}
                                    placeholder="9876543210"
                                    aria-invalid={Boolean(errors.phoneNo)}
                                    className="input-base mt-1.5 !rounded-xl"
                                />
                                <FieldError message={errors.phoneNo} />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="btn-primary !rounded-xl"
                            >
                                {isUpdatingProfile ? 'Saving…' : 'Save changes'}
                            </button>
                            <button
                                type="button"
                                disabled={isUpdatingProfile}
                                onClick={() => {
                                    setIsEditing(false);
                                    setName(profile.name);
                                    setPhoneNo(profile.phoneNo ?? '');
                                    clear();
                                }}
                                className="btn-secondary !rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : null}

                <dl className="mt-6 grid gap-3 border-t border-zinc-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
                        <dt className="section-label">Phone</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                            {profile.phoneNo || '—'}
                        </dd>
                    </div>
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
                        <dt className="section-label">Joined</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                            {formatDate(profile.createdAt)}
                        </dd>
                    </div>
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
                        <dt className="section-label">Latest login</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                            {formatDate(profile.recentLogin)}
                        </dd>
                    </div>
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
                        <dt className="section-label">Avg interview score</dt>
                        <dd className="mt-1 font-medium text-zinc-900">{scoreText}</dd>
                    </div>
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
                        <dt className="section-label">Premium window</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                            {premiumWindow ?? 'Not subscribed'}
                        </dd>
                    </div>
                </dl>
            </div>
        </motion.section>
    );
}
