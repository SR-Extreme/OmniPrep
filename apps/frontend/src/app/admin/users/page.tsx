'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { UserManagementCard } from '@/components/admin/UserManagementCard';
import {
    AdminEmptyState,
    AdminErrorAlert,
    AdminInlineLoading,
    AdminAuthGate,
    AdminPageHeader,
    AdminPageShell,
} from '@/components/admin/AdminPageShell';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/input';
import { deleteAdminUser, listAdminUsers } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { validateSearchQuery } from '@/lib/validation/fields';
import { useAuthStore } from '@/store/authStore';
import type { AdminUserListItem } from '@/types/admin';

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, accessToken } = useAuthStore();

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
    const { errors, touch, clear } = useFieldErrors<'search'>();

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

        const searchErr = validateSearchQuery(searchInput);
        touch('search', searchErr);
        if (searchErr) {
            return;
        }

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
        return <AdminAuthGate hydrated={hydrated} />;
    }

    return (
        <AdminPageShell>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-6"
            >
                <AdminPageHeader
                    label="User management"
                    title="Candidates"
                    description="Premium users first. Search by name or email."
                    actions={
                        <p className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3.5 py-2 text-sm font-medium text-emerald-800">
                            {total} users
                        </p>
                    }
                />

                <form
                    onSubmit={handleSearchSubmit}
                    className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-soft sm:flex-row sm:items-start sm:p-5"
                >
                    <div className="w-full sm:max-w-md">
                        <Input
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value);
                                clear('search');
                            }}
                            onBlur={() =>
                                touch('search', validateSearchQuery(searchInput))
                            }
                            placeholder="Search name or email"
                            aria-invalid={Boolean(errors.search)}
                        />
                        <FieldError message={errors.search} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setSearchInput('');
                                clear('search');
                                setAppliedSearch(undefined);
                                setPage(1);
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </form>

                {error ? <AdminErrorAlert message={error} /> : null}

                {isLoading ? (
                    <AdminInlineLoading label="Loading users…" />
                ) : users.length === 0 ? (
                    <AdminEmptyState message="No users found." />
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
                    <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-soft sm:px-5">
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
            </motion.div>
        </AdminPageShell>
    );
}
