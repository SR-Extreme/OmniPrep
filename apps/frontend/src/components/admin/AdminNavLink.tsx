'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AdminNavLinkProps {
    href: string;
    label: string;
    onClick?: () => void;
    className?: string;
}

export function AdminNavLink({ href, label, onClick, className }: AdminNavLinkProps) {
    const pathname = usePathname();
    const isActive =
        href === '/admin'
            ? pathname === '/admin'
            : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'group relative px-2 py-1.5 text-base font-medium tracking-tight transition-colors duration-200',
                isActive ? 'text-emerald-600' : 'text-zinc-600 hover:text-zinc-900',
                className,
            )}
        >
            {label}
            <span
                className={cn(
                    'absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-emerald-600 transition-transform duration-300 ease-out',
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                )}
                aria-hidden="true"
            />
        </Link>
    );
}
