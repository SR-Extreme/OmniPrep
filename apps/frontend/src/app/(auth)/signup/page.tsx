'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';

export default function SignupPage() {
    const router = useRouter();
    const { signup, isLoading, error, clearError } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        clearError();

        try {
            await signup({
                name: name.trim(),
                email,
                phoneNo: phoneNo.trim(),
                password,
                role: 'CANDIDATE',
            });
            toast('Account created successfully. Please sign in.', 'success');
            router.push('/login');
        } catch {
            // error is set in the store
        }
    }

    return (
        <AuthShell>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Create your account
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
                Start practicing interviews with OmniPrep
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
                        Name
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
                        className="input-base mt-1.5 !rounded-xl"
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
                        className="input-base mt-1.5 !rounded-xl"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-700">
                        Phone
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        required
                        minLength={10}
                        maxLength={10}
                        pattern="\d{10}"
                        value={phoneNo}
                        onChange={(e) =>
                            setPhoneNo(e.target.value.replace(/\D/g, '').slice(0, 10))
                        }
                        placeholder="9876543210"
                        className="input-base mt-1.5 !rounded-xl"
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
                        maxLength={128}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-base mt-1.5 !rounded-xl"
                    />
                </div>

                {error ? (
                    <div
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                        role="alert"
                    >
                        {error}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full !rounded-xl"
                >
                    {isLoading ? 'Creating account…' : 'Sign up'}
                </button>

                <p className="text-sm text-zinc-500">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-emerald-600 hover:text-emerald-700"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}
