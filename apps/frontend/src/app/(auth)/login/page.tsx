'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { OtpInput } from '@/components/auth/OtpInput';
import { toast } from '@/components/ui/Toast';
import {
    forgotPassword,
    resendLoginOtp,
    resendPasswordResetOtp,
    resetPassword,
    verifyPasswordResetOtp,
} from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import type { LoginPageStep } from '@/types/auth';

function AuthCodePanel() {
    return (
        <div className="auth-code-panel">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-zinc-950" />
            <div className="relative z-10 px-10 xl:px-16">
                <p className="mb-6 text-sm font-medium text-zinc-400">
                    Practice like it&apos;s the real interview
                </p>
                <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-elevated">
                    <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                            </div>
                            <span className="text-xs text-zinc-500">Python</span>
                        </div>
                        <span className="text-xs text-zinc-600">solution.py</span>
                    </div>
                    <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6">
                        <code>
                            <span className="text-emerald-400">def</span>{' '}
                            <span className="text-zinc-100">twoSum</span>
                            <span className="text-zinc-400">(nums, target):</span>
                            {'\n'}
                            <span className="text-zinc-500">    </span>
                            <span className="text-emerald-400">seen</span>
                            <span className="text-zinc-400"> = {'{}'}</span>
                            {'\n'}
                            <span className="text-zinc-500">    </span>
                            <span className="text-emerald-400">for</span>
                            <span className="text-zinc-100"> i, num </span>
                            <span className="text-emerald-400">in</span>
                            <span className="text-emerald-400"> enumerate</span>
                            <span className="text-zinc-400">(nums):</span>
                            {'\n'}
                            <span className="text-zinc-500">        </span>
                            <span className="text-emerald-400">if</span>
                            <span className="text-zinc-100"> target - num </span>
                            <span className="text-emerald-400">in</span>
                            <span className="text-zinc-100"> seen</span>
                            <span className="text-zinc-400">:</span>
                            {'\n'}
                            <span className="text-zinc-500">            </span>
                            <span className="text-emerald-400">return</span>
                            <span className="text-zinc-400"> [seen[target - num], i]</span>
                            {'\n'}
                            <span className="text-zinc-500">        </span>
                            <span className="text-zinc-100">seen[num] </span>
                            <span className="text-zinc-400">= i</span>
                        </code>
                    </pre>
                    <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-2.5">
                        <p className="font-mono text-xs text-emerald-500/90">
                            ✓ All sample tests passed · 4 ms · 14.2 MB
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuthStepper({ active }: { active: 'sign-in' | 'sign-up' }) {
    return (
        <div className="mb-10 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                    1
                </span>
                <span className="font-medium text-zinc-900">
                    {active === 'sign-in' ? 'Sign in' : 'Sign up'}
                </span>
            </div>
            <span className="text-zinc-300">›</span>
            <span className="text-zinc-400">Start coding</span>
        </div>
    );
}

function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof ApiError ? err.message : fallback;
}

export default function LoginPage() {
    const router = useRouter();
    const {
        login,
        verifyLoginOtp,
        isLoading,
        error,
        clearError,
    } = useAuthStore();

    const [step, setStep] = useState<LoginPageStep>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [challengeToken, setChallengeToken] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [otpMessage, setOtpMessage] = useState('');
    const [resendAvailableAt, setResendAvailableAt] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [localLoading, setLocalLoading] = useState(false);

    useEffect(() => {
        if (!resendAvailableAt) {
            return;
        }

        const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [resendAvailableAt]);

    const resendSecondsLeft = useMemo(() => {
        if (!resendAvailableAt) {
            return 0;
        }
        return Math.max(0, Math.ceil((new Date(resendAvailableAt).getTime() - nowMs) / 1000));
    }, [resendAvailableAt, nowMs]);

    const busy = isLoading || localLoading;
    const displayError = localError ?? error;

    function resetOtpFields() {
        setOtp('');
        setLocalError(null);
        clearError();
    }

    function goToLogin() {
        setStep('login');
        setPassword('');
        setOtp('');
        setChallengeToken('');
        setMaskedEmail('');
        setOtpMessage('');
        setResendAvailableAt(null);
        setNewPassword('');
        setConfirmPassword('');
        setLocalError(null);
        clearError();
    }

    async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLocalError(null);
        clearError();

        try {
            const challenge = await login({ email, password });
            setChallengeToken(challenge.challengeToken);
            setMaskedEmail(challenge.maskedEmail);
            setOtpMessage(challenge.message);
            setResendAvailableAt(challenge.resendAvailableAt);
            setOtp('');
            setStep('login-otp');
            toast(challenge.message, 'success');
        } catch {
            // store error
        }
    }

    async function handleVerifyLoginOtp(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLocalError(null);
        clearError();

        if (otp.length !== 6) {
            setLocalError('Enter the 6-digit verification code');
            return;
        }

        try {
            await verifyLoginOtp({ challengeToken, otp });
            toast('Signed in successfully', 'success');
            router.push('/');
        } catch {
            // store error
        }
    }

    async function handleResendLoginOtp() {
        if (resendSecondsLeft > 0 || busy) {
            return;
        }

        setLocalLoading(true);
        setLocalError(null);
        clearError();

        try {
            const challenge = await resendLoginOtp({ challengeToken });
            setChallengeToken(challenge.challengeToken);
            setMaskedEmail(challenge.maskedEmail);
            setOtpMessage(challenge.message);
            setResendAvailableAt(challenge.resendAvailableAt);
            setOtp('');
            toast(challenge.message, 'success');
        } catch (err) {
            setLocalError(getErrorMessage(err, 'Failed to resend code'));
            toast(getErrorMessage(err, 'Failed to resend code'), 'error');
        } finally {
            setLocalLoading(false);
        }
    }

    async function handleForgotEmailSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLocalLoading(true);
        setLocalError(null);
        clearError();

        try {
            const challenge = await forgotPassword({ email });
            setChallengeToken(challenge.challengeToken);
            setMaskedEmail(challenge.maskedEmail);
            setOtpMessage(challenge.message);
            setResendAvailableAt(challenge.resendAvailableAt);
            setOtp('');
            setStep('forgot-otp');
            toast(challenge.message, 'success');
        } catch (err) {
            setLocalError(getErrorMessage(err, 'Failed to send reset code'));
            toast(getErrorMessage(err, 'Failed to send reset code'), 'error');
        } finally {
            setLocalLoading(false);
        }
    }

    async function handleVerifyForgotOtp(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLocalLoading(true);
        setLocalError(null);

        if (otp.length !== 6) {
            setLocalError('Enter the 6-digit verification code');
            setLocalLoading(false);
            return;
        }

        try {
            const result = await verifyPasswordResetOtp({ challengeToken, otp });
            setChallengeToken(result.challengeToken);
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setStep('forgot-reset');
            toast(result.message, 'success');
        } catch (err) {
            setLocalError(getErrorMessage(err, 'OTP verification failed'));
            toast(getErrorMessage(err, 'OTP verification failed'), 'error');
        } finally {
            setLocalLoading(false);
        }
    }

    async function handleResendForgotOtp() {
        if (resendSecondsLeft > 0 || busy) {
            return;
        }

        setLocalLoading(true);
        setLocalError(null);

        try {
            const challenge = await resendPasswordResetOtp({ challengeToken });
            setChallengeToken(challenge.challengeToken);
            setMaskedEmail(challenge.maskedEmail);
            setOtpMessage(challenge.message);
            setResendAvailableAt(challenge.resendAvailableAt);
            setOtp('');
            toast(challenge.message, 'success');
        } catch (err) {
            setLocalError(getErrorMessage(err, 'Failed to resend code'));
            toast(getErrorMessage(err, 'Failed to resend code'), 'error');
        } finally {
            setLocalLoading(false);
        }
    }

    async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLocalLoading(true);
        setLocalError(null);

        if (newPassword.length < 8) {
            setLocalError('Password must be at least 8 characters');
            setLocalLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setLocalError('Passwords do not match');
            setLocalLoading(false);
            return;
        }

        try {
            const result = await resetPassword({
                challengeToken,
                newPassword,
                confirmPassword,
            });
            toast(result.message, 'success');
            goToLogin();
        } catch (err) {
            setLocalError(getErrorMessage(err, 'Failed to update password'));
            toast(getErrorMessage(err, 'Failed to update password'), 'error');
        } finally {
            setLocalLoading(false);
        }
    }

    const titleByStep: Record<LoginPageStep, string> = {
        login: 'Welcome back',
        'login-otp': 'Verify your email',
        'forgot-email': 'Forgot password',
        'forgot-otp': 'Verify your email',
        'forgot-reset': 'Set a new password',
    };

    const subtitleByStep: Record<LoginPageStep, string> = {
        login: 'Sign in to continue your interview preparation',
        'login-otp':
            otpMessage ||
            `A 6-digit verification code has been sent to ${maskedEmail || 'your registered email'}.`,
        'forgot-email': 'Enter your registered email to receive a verification code',
        'forgot-otp':
            otpMessage ||
            `A verification code has been sent to ${maskedEmail || 'your registered email'}.`,
        'forgot-reset': 'Choose a strong password for your OmniPrep account',
    };

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

                    <AuthStepper active="sign-in" />

                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        {titleByStep[step]}
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">{subtitleByStep[step]}</p>

                    {step === 'login' && (
                        <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="input-base mt-1.5"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-zinc-700"
                                    >
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                        onClick={() => {
                                            resetOtpFields();
                                            setStep('forgot-email');
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-base mt-1.5"
                                />
                            </div>

                            {displayError && (
                                <div
                                    className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                                    role="alert"
                                >
                                    {displayError}
                                </div>
                            )}

                            <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
                                {busy ? 'Sending code…' : 'Continue'}
                                {!busy && <span aria-hidden="true">→</span>}
                            </button>
                        </form>
                    )}

                    {(step === 'login-otp' || step === 'forgot-otp') && (
                        <form
                            onSubmit={
                                step === 'login-otp'
                                    ? handleVerifyLoginOtp
                                    : handleVerifyForgotOtp
                            }
                            className="mt-8 space-y-5"
                        >
                            <OtpInput value={otp} onChange={setOtp} disabled={busy} />

                            {displayError && (
                                <div
                                    className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                                    role="alert"
                                >
                                    {displayError}
                                </div>
                            )}

                            <button type="submit" disabled={busy || otp.length !== 6} className="btn-primary w-full">
                                {busy ? 'Verifying…' : 'Verify OTP'}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    className="font-medium text-zinc-600 hover:text-zinc-900"
                                    onClick={() => {
                                        resetOtpFields();
                                        setStep(step === 'login-otp' ? 'login' : 'forgot-email');
                                    }}
                                    disabled={busy}
                                >
                                    ← Back
                                </button>

                                <button
                                    type="button"
                                    className="font-medium text-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-zinc-400"
                                    onClick={
                                        step === 'login-otp'
                                            ? handleResendLoginOtp
                                            : handleResendForgotOtp
                                    }
                                    disabled={busy || resendSecondsLeft > 0}
                                >
                                    {resendSecondsLeft > 0
                                        ? `Resend in ${resendSecondsLeft}s`
                                        : 'Resend OTP'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'forgot-email' && (
                        <form onSubmit={handleForgotEmailSubmit} className="mt-8 space-y-5">
                            <div>
                                <label
                                    htmlFor="forgot-email"
                                    className="block text-sm font-medium text-zinc-700"
                                >
                                    Registered email
                                </label>
                                <input
                                    type="email"
                                    id="forgot-email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="input-base mt-1.5"
                                />
                            </div>

                            {displayError && (
                                <div
                                    className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                                    role="alert"
                                >
                                    {displayError}
                                </div>
                            )}

                            <button type="submit" disabled={busy} className="btn-primary w-full">
                                {busy ? 'Sending code…' : 'Send OTP'}
                            </button>

                            <button
                                type="button"
                                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                                onClick={goToLogin}
                                disabled={busy}
                            >
                                ← Back to sign in
                            </button>
                        </form>
                    )}

                    {step === 'forgot-reset' && (
                        <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
                            <div>
                                <label
                                    htmlFor="new-password"
                                    className="block text-sm font-medium text-zinc-700"
                                >
                                    New password
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input-base mt-1.5"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirm-password"
                                    className="block text-sm font-medium text-zinc-700"
                                >
                                    Confirm password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-base mt-1.5"
                                />
                            </div>

                            {displayError && (
                                <div
                                    className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                                    role="alert"
                                >
                                    {displayError}
                                </div>
                            )}

                            <button type="submit" disabled={busy} className="btn-primary w-full">
                                {busy ? 'Updating…' : 'Change Password'}
                            </button>
                        </form>
                    )}

                    {step === 'login' && (
                        <p className="mt-8 text-sm text-zinc-500">
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/signup"
                                className="font-medium text-emerald-600 hover:text-emerald-700"
                            >
                                Sign up
                            </Link>
                        </p>
                    )}
                </div>
            </div>

            <AuthCodePanel />
        </div>
    );
}