'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getAdminProfile } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { updateProfile, uploadAvatar } from '@/lib/api/profile';
import { useAuthStore } from '@/store/authStore';
import type { AdminProfileResponse } from '@/types/admin';

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

export default function AdminProfilePage() {
    const router = useRouter();
    const { user, accessToken, logout, setUser, isLoading: authLoading } =
        useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [hydrated, setHydrated] = useState(false);
    const [profile, setProfile] = useState<AdminProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) {
            return;
        }
        if (!accessToken) {
            router.replace('/login');
            return;
        }
        if (user && user.role !== 'ADMIN') {
            router.replace('/');
        }
    }, [hydrated, accessToken, user, router]);

    useEffect(() => {
        if (!hydrated || !accessToken || user?.role !== 'ADMIN') {
            return;
        }

        let cancelled = false;

        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await getAdminProfile(accessToken as string);
                if (!cancelled) {
                    setProfile(result);
                    setName(result.name);
                    setPhoneNo(result.phoneNo ?? '');
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load admin profile',
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, user]);

    async function handleAvatarSelected(file: File) {
        if (!accessToken || !user) {
            return;
        }

        setIsUploadingAvatar(true);
        setError(null);

        try {
            const updated = await uploadAvatar(accessToken, file);
            setProfile((current) =>
                current
                    ? {
                        ...current,
                        image: updated.image,
                        phoneNo: updated.phoneNo,
                        name: updated.name,
                    }
                    : current,
            );
            setUser({
                ...user,
                name: updated.name,
                image: updated.image,
                isPremium: updated.isPremium,
                premiumFrom: updated.premiumFrom,
                premiumTill: updated.premiumTill,
            });
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to upload avatar',
            );
        } finally {
            setIsUploadingAvatar(false);
        }
    }

    async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!accessToken || !user || !profile) {
            return;
        }

        const trimmedName = name.trim();
        const trimmedPhone = phoneNo.trim();

        if (!trimmedName) {
            setFormError('Name is required');
            return;
        }

        if (!/^\d{10}$/.test(trimmedPhone)) {
            setFormError('Phone number must be exactly 10 digits');
            return;
        }

        setFormError(null);

        const body: { name?: string; phoneNo?: string } = {};
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

        setIsUpdatingProfile(true);
        setError(null);

        try {
            const updated = await updateProfile(accessToken, body);
            setProfile((current) =>
                current
                    ? {
                        ...current,
                        name: updated.name,
                        phoneNo: updated.phoneNo,
                        image: updated.image,
                    }
                    : current,
            );
            setName(updated.name);
            setPhoneNo(updated.phoneNo ?? '');
            setUser({
                ...user,
                name: updated.name,
                image: updated.image,
            });
            setIsEditing(false);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to update profile',
            );
        } finally {
            setIsUpdatingProfile(false);
        }
    }

    async function handleLogout() {
        await logout();
        router.replace('/login');
    }

    if (!hydrated || !accessToken || !user || user.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                Loading…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
                <div>
                    <p className="section-label">Admin</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                        Profile
                    </h1>
                </div>

                {error ? (
                    <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : null}

                {isLoading || !profile ? (
                    <p className="text-sm text-zinc-500">Loading profile…</p>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4">
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
                                <div>
                                    <CardTitle className="text-xl">{profile.name}</CardTitle>
                                    <CardDescription>{profile.email}</CardDescription>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {!isEditing ? (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setName(profile.name);
                                            setPhoneNo(profile.phoneNo ?? '');
                                            setFormError(null);
                                            setIsEditing(true);
                                        }}
                                    >
                                        Edit profile
                                    </Button>
                                ) : null}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            void handleAvatarSelected(file);
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={authLoading}
                                    onClick={() => void handleLogout()}
                                >
                                    Logout
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {isEditing ? (
                                <form
                                    onSubmit={(event) => void handleSaveProfile(event)}
                                    className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="admin-profile-name"
                                                className="block text-sm font-medium text-zinc-700"
                                            >
                                                Name
                                            </label>
                                            <input
                                                id="admin-profile-name"
                                                type="text"
                                                autoComplete="name"
                                                required
                                                minLength={1}
                                                maxLength={100}
                                                value={name}
                                                disabled={isUpdatingProfile}
                                                onChange={(event) =>
                                                    setName(event.target.value)
                                                }
                                                className="input-base mt-1.5 !rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="admin-profile-phone"
                                                className="block text-sm font-medium text-zinc-700"
                                            >
                                                Phone number
                                            </label>
                                            <input
                                                id="admin-profile-phone"
                                                type="tel"
                                                inputMode="numeric"
                                                autoComplete="tel"
                                                required
                                                minLength={10}
                                                maxLength={10}
                                                pattern="\d{10}"
                                                value={phoneNo}
                                                disabled={isUpdatingProfile}
                                                onChange={(event) =>
                                                    setPhoneNo(
                                                        event.target.value
                                                            .replace(/\D/g, '')
                                                            .slice(0, 10),
                                                    )
                                                }
                                                placeholder="9876543210"
                                                className="input-base mt-1.5 !rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {formError ? (
                                        <p className="text-sm text-rose-600">
                                            {formError}
                                        </p>
                                    ) : null}

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="submit"
                                            disabled={isUpdatingProfile}
                                        >
                                            {isUpdatingProfile
                                                ? 'Saving…'
                                                : 'Save changes'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={isUpdatingProfile}
                                            onClick={() => {
                                                setIsEditing(false);
                                                setName(profile.name);
                                                setPhoneNo(profile.phoneNo ?? '');
                                                setFormError(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : null}

                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="section-label">Phone</dt>
                                    <dd className="mt-1 font-medium text-zinc-900">
                                        {profile.phoneNo || '—'}
                                    </dd>
                                </div>
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
                            </dl>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
