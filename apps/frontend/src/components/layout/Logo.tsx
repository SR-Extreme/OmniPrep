import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    priority?: boolean;
    /** Larger wordmark-friendly logo for footer */
    size?: 'nav' | 'footer';
}

export function Logo({ className, priority = false, size = 'nav' }: LogoProps) {
    const isFooter = size === 'footer';

    return (
        <Link
            href="/"
            className={cn(
                'inline-flex shrink-0 items-center transition-opacity hover:opacity-90',
                className,
            )}
            aria-label="OmniPrep home"
        >
            <Image
                src="/logo.png"
                alt="OmniPrep"
                width={isFooter ? 220 : 200}
                height={isFooter ? 64 : 52}
                priority={priority}
                className={cn(
                    'w-auto max-w-[min(55vw,220px)] object-contain object-left',
                    isFooter
                        ? 'h-11 sm:h-12'
                        : 'h-10 sm:h-11 lg:h-12',
                )}
            />
        </Link>
    );
}
