'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

const HIDDEN_SHELL_PREFIXES = ['/login', '/signup'] as const;

function shouldHideShell(pathname: string): boolean {
    return HIDDEN_SHELL_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideShell = shouldHideShell(pathname);

    if (hideShell) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
