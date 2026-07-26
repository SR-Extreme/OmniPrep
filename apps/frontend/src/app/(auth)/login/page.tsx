'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { RoleTabs } from '@/components/auth/RoleTabs';
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
import type { LoginPageStep, Role } from '@/types/auth';

function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof ApiError ? err.message : fallback;
}

export default function LoginPage() {
    const router = useRouter();
    const { login, verifyLoginOtp, isLoading, error, clearError } = useAuthStore();

    const [role, setRole] = useState<Role>('CANDIDATE');
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
        return Math.max(
            0,
            Math.ceil((new Date(resendAvailableAt).getTime() - nowMs) / 1000),
        );
    }, [resendAvailableAt, nowMs]);

    const busy = isLoading || localLoading;
    const displayError = localError ?? error;
    const tabsLocked = step !== 'login' && step !== 'forgot-email';

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
            const result = await login({
                email,
                password,
                expectedRole: role,
            });

            if (!result.requiresOtp) {
                toast('Signed in successfully', 'success');
                router.push(result.user.role === 'ADMIN' ? '/admin' : '/');
                return;
            }

            setChallengeToken(result.challengeToken);
            setMaskedEmail(result.maskedEmail);
            setOtpMessage(result.message);
            setResendAvailableAt(result.resendAvailableAt);
            setOtp('');
            setStep('login-otp');
            toast(result.message, 'success');
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
        'forgot-reset': 'Reset password',
    };

    const subtitleByStep: Record<LoginPageStep, string> = {
        login:
            role === 'ADMIN'
                ? 'Sign in to the admin panel'
                : 'Sign in to continue your interview preparation',
        'login-otp':
            otpMessage ||
            `A 6-digit verification code has been sent to ${maskedEmail || 'your registered email'}.`,
        'forgot-email': 'Enter your registered email to receive a verification code',
        'forgot-otp':
            otpMessage ||
            `A verification code has been sent to ${maskedEmail || 'your registered email'}.`,
        'forgot-reset': 'Enter your new password and confirm it below',
    };

    return (
        <AuthShell>
            <RoleTabs
                value={role}
                disabled={tabsLocked || busy}
                onChange={(next) => {
                    setRole(next);
                    setLocalError(null);
                    clearError();
                }}
            />

            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                {titleByStep[step]}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">{subtitleByStep[step]}</p>

            {step === 'login' ? (
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
                            className="input-base mt-1.5 !rounded-xl"
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
                            className="input-base mt-1.5 !rounded-xl"
                        />
                    </div>

                    {displayError ? (
                        <div
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                            role="alert"
                        >
                            {displayError}
                        </div>
                    ) : null}

                    <button type="submit" disabled={busy} className="btn-primary w-full !rounded-xl">
                        {busy
                            ? role === 'ADMIN'
                                ? 'Signing in…'
                                : 'Sending code…'
                            : role === 'ADMIN'
                              ? 'Sign in'
                              : 'Continue'}
                    </button>

                    <p className="text-sm text-zinc-500">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/signup"
                            className="font-medium text-emerald-600 hover:text-emerald-700"
                        >
                            Sign up
                        </Link>
                    </p>
                </form>
            ) : null}

            {step === 'login-otp' || step === 'forgot-otp' ? (
                <form
                    onSubmit={
                        step === 'login-otp' ? handleVerifyLoginOtp : handleVerifyForgotOtp
                    }
                    className="mt-8 space-y-5"
                >
                    <OtpInput value={otp} onChange={setOtp} disabled={busy} />

                    {displayError ? (
                        <div
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                            role="alert"
                        >
                            {displayError}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={busy || otp.length !== 6}
                        className="btn-primary w-full !rounded-xl"
                    >
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
            ) : null}

            {step === 'forgot-email' ? (
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
                            className="input-base mt-1.5 !rounded-xl"
                        />
                    </div>

                    {displayError ? (
                        <div
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                            role="alert"
                        >
                            {displayError}
                        </div>
                    ) : null}

                    <button type="submit" disabled={busy} className="btn-primary w-full !rounded-xl">
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
            ) : null}

            {step === 'forgot-reset' ? (
                <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
                    <div>
                        <label
                            htmlFor="new-password"
                            className="block text-sm font-medium text-zinc-700"
                        >
                            Password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-base mt-1.5 !rounded-xl"
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
                            className="input-base mt-1.5 !rounded-xl"
                        />
                    </div>

                    {displayError ? (
                        <div
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
                            role="alert"
                        >
                            {displayError}
                        </div>
                    ) : null}

                    <button type="submit" disabled={busy} className="btn-primary w-full !rounded-xl">
                        {busy ? 'Updating…' : 'Reset Password'}
                    </button>
                </form>
            ) : null}
        </AuthShell>
    );
}
