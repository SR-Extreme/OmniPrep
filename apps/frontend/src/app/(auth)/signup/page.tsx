'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { FieldError } from '@/components/ui/FieldError';
import { toast } from '@/components/ui/Toast';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import {
    validateEmail,
    validateName,
    validatePassword,
    validatePhone,
} from '@/lib/validation/fields';
import { useAuthStore } from '@/store/authStore';

type SignupField = 'name' | 'email' | 'phoneNo' | 'password';

export default function SignupPage() {
    const router = useRouter();
    const { signup, isLoading, error, clearError } = useAuthStore();
    const { errors, touch, clear, setMany } = useFieldErrors<SignupField>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [password, setPassword] = useState('');

    function validateAll(): Partial<Record<SignupField, string>> {
        const next: Partial<Record<SignupField, string>> = {};
        const nameErr = validateName(name);
        const emailErr = validateEmail(email);
        const phoneErr = validatePhone(phoneNo);
        const passwordErr = validatePassword(password);
        if (nameErr) next.name = nameErr;
        if (emailErr) next.email = emailErr;
        if (phoneErr) next.phoneNo = phoneErr;
        if (passwordErr) next.password = passwordErr;
        return next;
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        clearError();

        const next = validateAll();
        setMany(next);
        if (Object.keys(next).length > 0) {
            return;
        }

        try {
            await signup({
                name: name.trim(),
                email: email.trim(),
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

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        maxLength={100}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            clear('name');
                        }}
                        onBlur={() => touch('name', validateName(name))}
                        placeholder="Jane Smith"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className="input-base mt-1.5 !rounded-xl"
                    />
                    <FieldError id="name-error" message={errors.name} />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            clear('email');
                        }}
                        onBlur={() => touch('email', validateEmail(email))}
                        placeholder="you@company.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className="input-base mt-1.5 !rounded-xl"
                    />
                    <FieldError id="email-error" message={errors.email} />
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
                        maxLength={10}
                        value={phoneNo}
                        onChange={(e) => {
                            setPhoneNo(e.target.value.replace(/\D/g, '').slice(0, 10));
                            clear('phoneNo');
                        }}
                        onBlur={() => touch('phoneNo', validatePhone(phoneNo))}
                        placeholder="9876543210"
                        aria-invalid={Boolean(errors.phoneNo)}
                        aria-describedby={errors.phoneNo ? 'phone-error' : undefined}
                        className="input-base mt-1.5 !rounded-xl"
                    />
                    <FieldError id="phone-error" message={errors.phoneNo} />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        maxLength={128}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            clear('password');
                        }}
                        onBlur={() => touch('password', validatePassword(password))}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        className="input-base mt-1.5 !rounded-xl"
                    />
                    <FieldError id="password-error" message={errors.password} />
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
