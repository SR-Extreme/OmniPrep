'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface PremiumRequiredModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export function PremiumRequiredModal({
    open,
    onOpenChange,
    title = 'Premium Required',
    description = 'Mock Interviews are available only for Premium users. Upgrade to unlock full mock sessions, AI reports, and personalized study plans.',
}: PremiumRequiredModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md overflow-hidden">
                <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-700"
                    aria-hidden="true"
                />
                <DialogHeader>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        OmniPrep Premium
                    </span>
                    <DialogTitle className="mt-2">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-2">
                    <button
                        type="button"
                        className="btn-secondary !rounded-xl"
                        onClick={() => onOpenChange(false)}
                    >
                        Not now
                    </button>
                    <Link
                        href="/premium"
                        onClick={() => onOpenChange(false)}
                        className="btn-primary !rounded-xl"
                    >
                        Upgrade Now
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
