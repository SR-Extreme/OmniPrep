'use client';

import { motion } from 'framer-motion';
import { Camera, LogOut, Pencil, Shield, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import {
    AdminErrorAlert,
    AdminInlineLoading,
    AdminAuthGate,
    AdminPageHeader,
    AdminPageShell,
    AdminPanel,
} from '@/components/admin/AdminPageShell';
import { FieldError } from '@/components/ui/FieldError';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { getAdminProfile } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { updateProfile, uploadAvatar } from '@/lib/api/profile';
import { validateAvatarFile, validateName, validatePhone } from '@/lib/validation/fields';
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
    const { user, accessToken, logout, setUser } =
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
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const { errors, touch, clear, setMany } = useFieldErrors<'name' | 'phoneNo'>();
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

        const message = validateAvatarFile(file);
        if (message) {
            setAvatarError(message);
            return;
        }
        setAvatarError(null);

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

        const next: Partial<Record<'name' | 'phoneNo', string>> = {};
        const nameErr = validateName(name);
        const phoneErr = validatePhone(phoneNo);
        if (nameErr) next.name = nameErr;
        if (phoneErr) next.phoneNo = phoneErr;
        setMany(next);
        if (Object.keys(next).length > 0) {
            return;
        }

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

    function handleLogout() {
        void logout();
        router.replace('/login');
    }

    if (!hydrated || !accessToken || !user || user.role !== 'ADMIN') {
        return <AdminAuthGate hydrated={hydrated} />;
    }

    return (
        <AdminPageShell>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-6"
            >
                <AdminPageHeader
                    label="Admin"
                    title="Profile"
                    description="Manage your admin account details and security settings."
                />

                {error ? <AdminErrorAlert message={error} /> : null}

                {isLoading || !profile ? (
                    <AdminInlineLoading label="Loading profile…" />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-stretch">
                        <AdminPanel className="flex h-full flex-col">
                            <div className="relative flex h-full min-h-[32rem] flex-col items-center px-5 py-8 text-center sm:px-6 sm:py-10 lg:px-10 lg:py-12">
                                {profile.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={profile.image}
                                        alt={profile.name}
                                        className="h-28 w-28 rounded-2xl object-cover ring-1 ring-zinc-200 sm:h-32 sm:w-32"
                                    />
                                ) : (
                                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-2xl font-semibold text-emerald-700 sm:h-32 sm:w-32 sm:text-3xl">
                                        {initials(profile.name)}
                                    </div>
                                )}

                                <h2 className="mt-5 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                                    {profile.name}
                                </h2>

                                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    <Shield className="h-3 w-3" aria-hidden="true" />
                                    Admin
                                </span>

                                <p className="mt-2.5 max-w-md break-all text-sm text-zinc-500">
                                    {profile.email}
                                </p>

                                <div className="mt-8 flex w-full max-w-md flex-1 flex-col justify-end gap-3">
                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setName(profile.name);
                                                setPhoneNo(profile.phoneNo ?? '');
                                                clear();
                                                setIsEditing(true);
                                            }}
                                            className="btn-secondary !w-full !rounded-xl"
                                        >
                                            <Pencil
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                            Edit profile
                                        </button>
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
                                    <button
                                        type="button"
                                        disabled={isUploadingAvatar}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn-secondary !w-full !rounded-xl"
                                    >
                                        <Camera
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                        {isUploadingAvatar
                                            ? 'Uploading…'
                                            : 'Change photo'}
                                    </button>
                                    <FieldError message={avatarError} />
                                    <button
                                        type="button"
                                        onClick={() => handleLogout()}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-50"
                                    >
                                        <LogOut
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                        Logout
                                    </button>
                                </div>

                                {isEditing ? (
                                    <form
                                        onSubmit={(event) => void handleSaveProfile(event)}
                                        noValidate
                                        className="mt-6 w-full space-y-4 rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/40 to-white p-4 text-left sm:p-5"
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
                                                    maxLength={100}
                                                    value={name}
                                                    disabled={isUpdatingProfile}
                                                    onChange={(event) => {
                                                        setName(event.target.value);
                                                        clear('name');
                                                    }}
                                                    onBlur={() =>
                                                        touch('name', validateName(name))
                                                    }
                                                    aria-invalid={Boolean(errors.name)}
                                                    className="input-base mt-1.5 !rounded-xl"
                                                />
                                                <FieldError message={errors.name} />
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
                                                    maxLength={10}
                                                    value={phoneNo}
                                                    disabled={isUpdatingProfile}
                                                    onChange={(event) => {
                                                        setPhoneNo(
                                                            event.target.value
                                                                .replace(/\D/g, '')
                                                                .slice(0, 10),
                                                        );
                                                        clear('phoneNo');
                                                    }}
                                                    onBlur={() =>
                                                        touch(
                                                            'phoneNo',
                                                            validatePhone(phoneNo),
                                                        )
                                                    }
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
                                                {isUpdatingProfile
                                                    ? 'Saving…'
                                                    : 'Save changes'}
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
                                                <X
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : null}
                            </div>
                        </AdminPanel>

                        <AdminPanel className="flex h-full flex-col">
                            <div className="relative flex h-full flex-col p-5 sm:p-6 lg:p-8">
                                <h3 className="text-base font-semibold text-zinc-900">
                                    Account details
                                </h3>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Key information for this admin account.
                                </p>
                                <dl className="mt-6 flex flex-1 flex-col justify-between gap-4">
                                    <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/50 px-4 py-4">
                                        <dt className="section-label">Phone</dt>
                                        <dd className="mt-1.5 font-medium text-zinc-900">
                                            {profile.phoneNo || '—'}
                                        </dd>
                                    </div>
                                    <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/50 px-4 py-4">
                                        <dt className="section-label">Joined</dt>
                                        <dd className="mt-1.5 font-medium text-zinc-900">
                                            {formatDate(profile.createdAt)}
                                        </dd>
                                    </div>
                                    <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/50 px-4 py-4">
                                        <dt className="section-label">Latest login</dt>
                                        <dd className="mt-1.5 font-medium text-zinc-900">
                                            {formatDate(profile.recentLogin)}
                                        </dd>
                                    </div>
                                    <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/50 px-4 py-4">
                                        <dt className="section-label">Role</dt>
                                        <dd className="mt-1.5 font-medium text-zinc-900">
                                            Administrator
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </AdminPanel>
                    </div>
                )}
            </motion.div>
        </AdminPageShell>
    );
}
