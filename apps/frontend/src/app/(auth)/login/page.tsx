'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        clearError();

        try {
            await login({ email, password });
            router.push('/');
        } catch {

        }
    }

    return (
        <main className='flex min-h-screen flex-col items-center justify-center px-6'>
            <div className='w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg'>
                <h1 className='text-2xl font-bold text-white'>Sign in</h1>
                <p className='mt-2 text-sm text-slate-400'>Welcome back to OmniPrep</p>

                <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
                    <div>
                        <label htmlFor="email" className='block text-sm font-medium text-slate-300'>Email</label>
                        <input type="email" id="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className='mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500' />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
                        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500" />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup"
                        className="font-medium text-emerald-400 hover:text-emerald-300"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    )
}