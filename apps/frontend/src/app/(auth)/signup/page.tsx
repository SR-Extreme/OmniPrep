'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

function AuthCodePanel() {
    return (
        <div className="auth-code-panel">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-zinc-950" />
            <div className="relative z-10 px-10 xl:px-16">
                <p className="mb-6 text-sm font-medium text-zinc-400">
                    Write, run, and submit — all in one place
                </p>
                <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-elevated">
                    <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                            </div>
                            <span className="text-xs text-zinc-500">Java</span>
                        </div>
                        <span className="text-xs text-zinc-600">Solution.java</span>
                    </div>
                    <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6">
                        <code>
                            <span className="text-emerald-400">class</span>{' '}
                            <span className="text-amber-200">Solution</span>{' '}
                            <span className="text-zinc-400">{'{'}</span>
                            {'\n'}
                            <span className="text-zinc-500">    </span>
                            <span className="text-emerald-400">public int</span>{' '}
                            <span className="text-zinc-100">maxDepth</span>
                            <span className="text-zinc-400">(TreeNode root) {'{'}</span>
                            {'\n'}
                            <span className="text-zinc-500">        </span>
                            <span className="text-emerald-400">if</span>
                            <span className="text-zinc-400"> (root == </span>
                            <span className="text-emerald-400">null</span>
                            <span className="text-zinc-400">) </span>
                            <span className="text-emerald-400">return</span>
                            <span className="text-zinc-400"> 0;</span>
                            {'\n'}
                            <span className="text-zinc-500">        </span>
                            <span className="text-emerald-400">return</span>
                            <span className="text-zinc-400"> 1 + Math.max(</span>
                            {'\n'}
                            <span className="text-zinc-500">            </span>
                            <span className="text-zinc-100">maxDepth</span>
                            <span className="text-zinc-400">(root.left),</span>
                            {'\n'}
                            <span className="text-zinc-500">            </span>
                            <span className="text-zinc-100">maxDepth</span>
                            <span className="text-zinc-400">(root.right));</span>
                            {'\n'}
                            <span className="text-zinc-500">    </span>
                            <span className="text-zinc-400">{'}'}</span>
                            {'\n'}
                            <span className="text-zinc-400">{'}'}</span>
                        </code>
                    </pre>
                    <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-2.5">
                        <p className="font-mono text-xs text-emerald-500/90">
                            ✓ Accepted · 100/100 tests · O(n) time
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuthStepper() {
    return (
        <div className="mb-10 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                    1
                </span>
                <span className="font-medium text-zinc-900">Sign up</span>
            </div>
            <span className="text-zinc-300">›</span>
            <span className="text-zinc-400">Start coding</span>
        </div>
    );
}

export default function SignupPage() {
    const router = useRouter();
    const { signup, isLoading, error, clearError } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        clearError();

        try {
            await signup({
                name: name.trim(),
                email,
                password,
            });
            router.push('/');
        } catch {
            // error is set in the store
        }
    }

    return (
        <div className="flex min-h-screen">
            <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[52%] lg:px-16 xl:px-24">
                <div className="mx-auto w-full max-w-md">
                    <Link href="/" className="mb-10 inline-flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                            O
                        </span>
                        <span className="text-base font-semibold text-zinc-900">OmniPrep</span>
                    </Link>

                    <AuthStepper />

                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        Create your account
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        We&apos;ll use this to personalize your practice experience
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
                                Full name
                            </label>
                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                required
                                minLength={1}
                                maxLength={100}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Smith"
                                className="input-base mt-1.5"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="input-base mt-1.5"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-base mt-1.5"
                            />
                            <p className="mt-1.5 text-xs text-zinc-400">
                                At least 8 characters
                            </p>
                        </div>

                        {error && (
                            <div
                                className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">
                            {isLoading ? 'Creating account…' : 'Continue'}
                            {!isLoading && <span aria-hidden="true">→</span>}
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-zinc-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <AuthCodePanel />
        </div>
    );
}
