'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ADMIN_NAV_ITEMS } from '@/components/admin/admin-nav-items';
import { AdminNavLink } from '@/components/admin/AdminNavLink';
import { AdminUserMenu } from '@/components/admin/AdminUserMenu';

export function AdminNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!mobileOpen) {
            return;
        }

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileOpen]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
                <Link
                    href="/admin"
                    className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
                    aria-label="OmniPrep Admin home"
                >
                    <Image
                        src="/logo.png"
                        alt="OmniPrep"
                        width={200}
                        height={52}
                        priority
                        className="h-10 w-auto max-w-[min(55vw,200px)] object-contain object-left sm:h-11"
                    />
                </Link>

                <nav
                    className="hidden flex-1 items-center justify-evenly px-4 xl:px-8 lg:flex"
                    aria-label="Admin"
                >
                    {ADMIN_NAV_ITEMS.map((item) => (
                        <AdminNavLink key={item.href} href={item.href} label={item.label} />
                    ))}
                </nav>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <AdminUserMenu />
                    <button
                        type="button"
                        className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-soft transition hover:border-emerald-300 hover:text-emerald-700 lg:hidden"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((value) => !value)}
                    >
                        {mobileOpen ? (
                            <X className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen ? (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden border-t border-zinc-200/80 bg-white lg:hidden"
                    >
                        <nav
                            className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
                            aria-label="Admin mobile"
                        >
                            {ADMIN_NAV_ITEMS.map((item) => (
                                <AdminNavLink
                                    key={item.href}
                                    href={item.href}
                                    label={item.label}
                                    onClick={() => setMobileOpen(false)}
                                    className="rounded-xl px-3 py-3 hover:bg-emerald-50"
                                />
                            ))}
                        </nav>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </header>
    );
}
