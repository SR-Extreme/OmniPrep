'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FeatureCards } from '@/components/home/FeatureCards';
import { FlagshipMockInterview } from '@/components/home/FlagshipMockInterview';
import { HeroSection } from '@/components/home/HeroSection';
import { InfoCards } from '@/components/home/InfoCards';
import { StatsSection } from '@/components/home/StatsSection';
import { SupportSection } from '@/components/home/SupportSection';
import { getPremiumStatus } from '@/lib/api/billing';
import { useAuthStore } from '@/store/authStore';

function CheckoutSuccessHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { accessToken, setUser } = useAuthStore();
    const confirmingCheckout = useRef(false);

    useEffect(() => {
        const checkout = searchParams.get('checkout');

        if (checkout !== 'success' || !accessToken) {
            return;
        }

        if (confirmingCheckout.current) {
            return;
        }

        confirmingCheckout.current = true;

        void (async () => {
            // Webhook activates premium; poll status until it lands (or give up).
            const delaysMs = [500, 1000, 1500, 2000, 3000];

            try {
                for (const delayMs of delaysMs) {
                    await new Promise((resolve) => setTimeout(resolve, delayMs));

                    const status = await getPremiumStatus(accessToken);
                    if (!status.isPremium) {
                        continue;
                    }

                    const currentUser = useAuthStore.getState().user;
                    if (currentUser) {
                        setUser({
                            ...currentUser,
                            isPremium: status.isPremium,
                            premiumFrom: status.premiumFrom,
                            premiumTill: status.premiumTill,
                        });
                    }
                    break;
                }
            } catch (err) {
                console.error(err);
            } finally {
                router.replace('/');
            }
        })();
    }, [accessToken, router, searchParams, setUser]);

    return null;
}

export default function HomePage() {
    return (
        <div className="overflow-x-hidden bg-zinc-50">
            <Suspense fallback={null}>
                <CheckoutSuccessHandler />
            </Suspense>
            <HeroSection />
            <FeatureCards />
            <FlagshipMockInterview />
            <InfoCards />
            <StatsSection />
            <SupportSection />
        </div>
    );
}
