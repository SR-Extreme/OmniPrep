'use client';

import Image from 'next/image';
import { Logo } from '@/components/layout/Logo';

export function AuthShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen overflow-x-hidden bg-white">
            <div className="flex w-full flex-col justify-center px-5 py-10 sm:px-8 lg:w-[45%] lg:px-12 xl:px-16">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-8 inline-flex">
                        <Logo priority />
                    </div>
                    {children}
                </div>
            </div>

            <div className="relative hidden min-h-screen w-[55%] overflow-hidden lg:block">
                <Image
                    src="/auth-hero.png"
                    alt="OmniPrep interview preparation"
                    fill
                    priority
                    sizes="55vw"
                    className="object-cover object-center"
                />
            </div>
        </div>
    );
}
