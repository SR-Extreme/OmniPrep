'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { UserManagementCard } from '@/components/admin/UserManagementCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteAdminUser, listAdminUsers } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import type { AdminUserListItem } from '@/types/admin';

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [users, setUsers] = useState<AdminUserListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) {
            return;
        }
        if (!accessToken) {
            router.replace('/login');
            return;
        }
        if (user && user.role !== 'ADMIN') {
            router.replace('/');
        }
    }, [hydrated, accessToken, user, router]);

    useEffect(() => {
        if (!hydrated || !accessToken || user?.role !== 'ADMIN') {
            return;
        }

        let cancelled = false;

        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await listAdminUsers(accessToken as string, {
                    search: appliedSearch,
                    page,
                    limit: PAGE_SIZE,
                });

                if (cancelled) {
                    return;
                }

                setUsers(result.users);
                setTotalPages(result.pagination.totalPages);
                setTotal(result.pagination.total);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load users',
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, user, page, appliedSearch]);

    function handleSearchSubmit(event: FormEvent) {
        event.preventDefault();
        const next = searchInput.trim() || undefined;
        setAppliedSearch(next);
        setPage(1);
    }

    async function handleDelete(target: AdminUserListItem) {
        if (!accessToken) {
            return;
        }

        setDeletingId(target.id);
        setError(null);

        try {
            await deleteAdminUser(accessToken, target.id);
            setUsers((current) => current.filter((row) => row.id !== target.id));
            setTotal((current) => Math.max(0, current - 1));
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : 'Failed to remove user',
            );
        } finally {
            setDeletingId(null);
        }
    }

    if (!hydrated || !accessToken || !user || user.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                Loading…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <header className="nav-header">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                                O
                            </span>
                            <span className="text-base font-semibold tracking-tight text-zinc-900">
                                OmniPrep
                            </span>
                        </Link>
                        <nav className="hidden items-center gap-1 sm:flex">
                            <Link
                                href="/admin"
                                className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                            >
                                Admin
                            </Link>
                            <span className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900">
                                Users
                            </span>
                        </nav>
                    </div>
                    <button
                        type="button"
                        onClick={() => logout()}
                        disabled={authLoading}
                        className="btn-secondary !py-2"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="section-label">User management</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                            Candidates
                        </h1>
                        <p className="mt-2 text-sm text-zinc-600">
                            Premium users first. Search by name or email.
                        </p>
                    </div>
                    <p className="text-sm text-zinc-500">{total} users</p>
                </div>

                <form
                    onSubmit={handleSearchSubmit}
                    className="flex flex-col gap-2 sm:flex-row"
                >
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search name or email"
                        className="sm:max-w-sm"
                    />
                    <div className="flex gap-2">
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setSearchInput('');
                                setAppliedSearch(undefined);
                                setPage(1);
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </form>

                {error ? (
                    <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : null}

                {isLoading ? (
                    <p className="text-sm text-zinc-500">Loading users…</p>
                ) : users.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
                        No users found.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {users.map((row) => (
                            <UserManagementCard
                                key={row.id}
                                user={row}
                                onDelete={handleDelete}
                                isDeleting={deletingId === row.id}
                            />
                        ))}
                    </div>
                )}

                {totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={page <= 1 || isLoading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <p className="text-sm text-zinc-500">
                            Page {page} of {totalPages}
                        </p>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={page >= totalPages || isLoading}
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                        >
                            Next
                        </Button>
                    </div>
                ) : null}
            </main>
        </div>
    );
}