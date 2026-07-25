'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/layout/Logo';
import { NAV_ITEMS } from '@/components/layout/nav-items';
import { NavLink } from '@/components/layout/NavLink';
import { UserMenu } from '@/components/layout/UserMenu';

export function Navbar() {
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
            <div className="mx-auto flex h-[96px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-[104px] sm:px-6 lg:h-[112px] lg:gap-8 lg:px-8">
                <Logo priority />

                <nav
                    className="hidden flex-1 items-center justify-evenly px-6 xl:px-10 lg:flex"
                    aria-label="Primary"
                >
                    {NAV_ITEMS.map((item) => (
                        <NavLink key={item.href} href={item.href} label={item.label} />
                    ))}
                </nav>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <UserMenu />
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
                            aria-label="Mobile"
                        >
                            {NAV_ITEMS.map((item) => (
                                <NavLink
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
