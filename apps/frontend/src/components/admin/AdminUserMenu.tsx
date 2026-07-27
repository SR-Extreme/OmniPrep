'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return 'A';
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function AdminUserMenu() {
    const router = useRouter();
    const { user, logout, isReady } = useAuthStore();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    if (!isReady || !user) {
        return null;
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Admin profile menu"
                onClick={() => setOpen((value) => !value)}
                className={cn(
                    'flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 shadow-soft transition duration-200',
                    'hover:border-emerald-300 hover:ring-2 hover:ring-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
                )}
            >
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.name}
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                        unoptimized
                    />
                ) : (
                    <span className="text-xs font-semibold text-emerald-700">
                        {initials(user.name)}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute right-0 z-50 mt-3 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg"
                    >
                        <div className="border-b border-zinc-100 px-3 py-2.5">
                            <p className="truncate text-sm font-medium text-zinc-900">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">{user.email}</p>
                        </div>

                        <Link
                            href="/admin/profile"
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                        >
                            <User className="h-4 w-4" aria-hidden="true" />
                            Profile
                        </Link>

                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                void logout();
                                router.replace('/login');
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-rose-50 hover:text-rose-700"
                        >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            Logout
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
