'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { StudyPlanDetail } from '@/components/profile/StudyPlanDetail';
import { StudyPlanHistory } from '@/components/profile/StudyPlanHistory';
import { ApiError } from '@/lib/api/client';
import {
    getProfile,
    getStudyPlanDetail,
    getStudyPlanHistory,
    submitStudyPlanProgress,
    uploadAvatar,
} from '@/lib/api/profile';
import { useAuthStore } from '@/store/authStore';
import type {
    ProfileResponse,
    StudyPlanDetailResponse,
    StudyPlanHistoryItem,
    StudyPlanTaskKey,
} from '@/types/profile';

export default function ProfilePage() {
    const router = useRouter();
    const { accessToken, logout, setUser, isLoading: authLoading } =
        useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [plans, setPlans] = useState<StudyPlanHistoryItem[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<StudyPlanDetailResponse | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);
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
        }
    }, [hydrated, accessToken, router]);

    useEffect(() => {
        if (!hydrated || !accessToken) {
            return;
        }

        let cancelled = false;

        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const [profileResult, historyResult] = await Promise.all([
                    getProfile(accessToken as string),
                    getStudyPlanHistory(accessToken as string),
                ]);

                if (cancelled) {
                    return;
                }

                setProfile(profileResult);
                setPlans(historyResult.plans);
                setUser({
                    id: profileResult.id,
                    email: profileResult.email,
                    role: profileResult.role,
                    name: profileResult.name,
                    image: profileResult.image,
                    isPremium: profileResult.isPremium,
                    premiumFrom: profileResult.premiumFrom,
                    premiumTill: profileResult.premiumTill,
                });
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load profile',
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
    }, [hydrated, accessToken, setUser]);

    async function handleSelectPlan(plan: StudyPlanHistoryItem) {
        if (!accessToken) {
            return;
        }

        setError(null);

        try {
            const detail = await getStudyPlanDetail(accessToken, plan.id);
            setSelectedPlan(detail);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to load study plan',
            );
        }
    }

    async function handleAvatarSelected(file: File) {
        if (!accessToken) {
            return;
        }

        setIsUploadingAvatar(true);
        setError(null);

        try {
            const updated = await uploadAvatar(accessToken, file);
            setProfile(updated);
            setUser({
                id: updated.id,
                email: updated.email,
                role: updated.role,
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

    async function handleSubmitProgress(completedTaskKeys: StudyPlanTaskKey[]) {
        if (!accessToken || !selectedPlan) {
            return;
        }

        setIsSubmittingProgress(true);
        setError(null);

        try {
            const updated = await submitStudyPlanProgress(
                accessToken,
                selectedPlan.id,
                { completedTaskKeys },
            );
            setSelectedPlan(updated);
            setPlans((current) =>
                current.map((plan) =>
                    plan.id === updated.id
                        ? {
                            ...plan,
                            completedTasks: updated.completedTaskKeys.length,
                            completionPercent: updated.completionPercent,
                            completedAt: updated.completedAt,
                        }
                        : plan,
                ),
            );
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to save progress',
            );
        } finally {
            setIsSubmittingProgress(false);
        }
    }

    async function handleLogout() {
        await logout();
        router.replace('/login');
    }

    if (!hydrated || !accessToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                    Loading…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
                {error ? (
                    <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : null}

                {isLoading || !profile ? (
                    <p className="text-sm text-zinc-500">Loading profile…</p>
                ) : (
                    <>
                        <ProfileHeader
                            profile={profile}
                            onLogout={handleLogout}
                            onAvatarSelected={handleAvatarSelected}
                            isUploadingAvatar={isUploadingAvatar}
                            isLoggingOut={authLoading}
                        />
                        <ProfileStats stats={profile.stats} />
                        <div className="grid gap-6 lg:grid-cols-2">
                            <StudyPlanHistory
                                plans={plans}
                                selectedPlanId={selectedPlan?.id ?? null}
                                onSelect={handleSelectPlan}
                            />
                            {selectedPlan ? (
                                <StudyPlanDetail
                                    plan={selectedPlan}
                                    onSubmit={handleSubmitProgress}
                                    isSubmitting={isSubmittingProgress}
                                />
                            ) : (
                                <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
                                    Select a study plan to track day-by-day progress.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}