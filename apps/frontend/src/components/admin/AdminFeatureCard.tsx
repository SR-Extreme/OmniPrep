'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface AdminFeatureCardProps {
    href: string;
    title: string;
    description: string;
    icon?: ReactNode;
    className?: string;
}

export function AdminFeatureCard({
    href,
    title,
    description,
    icon,
    className,
}: AdminFeatureCardProps) {
    return (
        <Link href={href} className={cn('group block h-full', className)}>
            <Card className="h-full transition duration-150 group-hover:border-emerald-300 group-hover:shadow-card">
                <CardHeader>
                    {icon ? (
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                            {icon}
                        </div>
                    ) : (
                        <p className="section-label">Admin</p>
                    )}
                    <CardTitle className="group-hover:text-emerald-800">
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}