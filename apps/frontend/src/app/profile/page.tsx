'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PracticeAuthLoading } from '@/components/practice/PracticeListShell';
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
    updateProfile,
    uploadAvatar,
} from '@/lib/api/profile';
import { useAuthStore } from '@/store/authStore';
import type {
    ProfileResponse,
    StudyPlanDetailResponse,
    StudyPlanHistoryItem,
    StudyPlanTaskKey,
    UpdateProfileBody,
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
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
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

    function syncAuthUser(updated: ProfileResponse) {
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
            syncAuthUser(updated);
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

    async function handleUpdateProfile(body: UpdateProfileBody) {
        if (!accessToken) {
            return;
        }

        setIsUpdatingProfile(true);
        setError(null);

        try {
            const updated = await updateProfile(accessToken, body);
            setProfile(updated);
            syncAuthUser(updated);
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : 'Failed to update profile';
            setError(message);
            throw err;
        } finally {
            setIsUpdatingProfile(false);
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
        return <PracticeAuthLoading />;
    }

    return (
        <div className="overflow-x-hidden bg-zinc-50">
            <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                {error ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : null}

                {isLoading || !profile ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-sm text-zinc-500 shadow-soft">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                        Loading profile…
                    </div>
                ) : (
                    <>
                        <ProfileHeader
                            profile={profile}
                            onLogout={handleLogout}
                            onAvatarSelected={handleAvatarSelected}
                            onUpdateProfile={handleUpdateProfile}
                            isUploadingAvatar={isUploadingAvatar}
                            isUpdatingProfile={isUpdatingProfile}
                            isLoggingOut={authLoading}
                        />
                        <div className="border-t border-zinc-200/80 pt-8 sm:pt-10">
                            <ProfileStats stats={profile.stats} />
                        </div>
                        <div className="grid gap-6 border-t border-zinc-200/80 pt-8 sm:pt-10 lg:grid-cols-2">
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
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-16 text-center shadow-soft">
                                    <p className="text-sm font-medium text-zinc-700">
                                        No plan selected
                                    </p>
                                    <p className="mt-1 max-w-xs text-sm text-zinc-500">
                                        Select a study plan to track day-by-day progress.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
