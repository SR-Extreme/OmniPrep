'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const { user, logout, isLoading } = useAuthStore();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold tracking-tight text-white">
        OmniPrep
      </h1>
      <p className="mt-4 max-w-md text-center text-slate-400">
        AI Interview Preparation Platform
      </p>

      {user ? (
        <div className="mt-8 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {user.name}
          </p>
          <p className="text-sm text-slate-400">{user.email}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-emerald-400">
            {user.role}
          </p>
          <button
            type="button"
            onClick={() => logout()}
            disabled={isLoading}
            className="mt-6 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-60"
          >
            {isLoading ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-lg bg-emerald-600 px-6 py-2 text-center font-medium text-white transition hover:bg-emerald-500"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-slate-700 px-6 py-2 text-center font-medium text-slate-200 transition hover:border-slate-500"
          >
            Sign up
          </Link>
        </div>
      )}

      <p className="mt-10 text-sm text-slate-500">
        API:{' '}
        <code className="rounded bg-slate-800 px-2 py-1 text-emerald-400">
          {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/health
        </code>
      </p>
    </main>
  );
}