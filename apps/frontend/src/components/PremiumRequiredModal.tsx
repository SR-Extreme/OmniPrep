'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <p className="section-label">OmniPrep Premium</p>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Not now
                    </Button>
                    <Button asChild>
                        <Link href="/premium" onClick={() => onOpenChange(false)}>
                            Upgrade Now
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
