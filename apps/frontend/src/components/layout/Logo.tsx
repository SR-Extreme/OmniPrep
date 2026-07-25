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
                width={isFooter ? 420 : 400}
                height={isFooter ? 110 : 96}
                priority={priority}
                className={cn(
                    'w-auto max-w-[min(70vw,420px)] object-contain object-left',
                    isFooter
                        ? 'h-[72px] sm:h-[84px]'
                        : 'h-[64px] sm:h-[76px] lg:h-[88px]',
                )}
            />
        </Link>
    );
}
