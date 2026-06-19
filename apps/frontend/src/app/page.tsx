'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const FEATURES = [
    {
        title: 'Master Data Structures & Algorithms',
        description:
            'Solve curated interview-style problems across arrays, strings, trees, graphs, dynamic programming, and more—organized by topic and difficulty.',
        accent: 'border-emerald-200 bg-emerald-50/50',
        icon: (
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
        ),
    },
    {
        title: 'System Design Challenges',
        description:
            'Practice real-world system design interview questions covering scalable architectures, databases, caching, load balancing, and distributed systems.',
        accent: 'border-zinc-200 bg-zinc-50/80',
        icon: (
            <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
        ),
    },
    {
        title: 'Behavioural Aspect',
        description:
            'Prepare for behavioural interview rounds with company-style questions focused on leadership, teamwork, communication, problem-solving, and decision-making.',
        accent: 'border-zinc-200 bg-zinc-50/80',
        icon: (
            <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
        ),
    },
] as const;

export default function HomePage() {
    const { user, logout, isLoading } = useAuthStore();

    return (
        <div className="min-h-screen grid-bg-fade">
            <header className="nav-header">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                            O
                        </span>
                        <span className="text-base font-semibold tracking-tight text-zinc-900">
                            OmniPrep
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-6 sm:flex">
                        <Link href="/problems" className="text-sm text-zinc-600 transition hover:text-zinc-900">
                            Problems
                        </Link>
                        <span className="text-sm text-zinc-400">Practice</span>
                    </nav>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <span className="hidden text-sm text-zinc-500 md:inline">
                                    {user.name}
                                </span>
                                <Link href="/problems" className="btn-primary !py-2">
                                    Open problems
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn-ghost hidden sm:inline-flex">
                                    Sign in
                                </Link>
                                <Link href="/signup" className="btn-primary !py-2">
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                            Interview preparation platform
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl sm:leading-tight">
                            One platform from practice to{' '}
                            <span className="text-emerald-600">interview-ready</span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg">
                            Master data structures and algorithms with curated problems,
                            a built-in code editor, and instant judge feedback.
                        </p>

                        <div className="mx-auto mt-10 max-w-lg">
                            {user ? (
                                <div className="card p-6 text-left shadow-card">
                                    <p className="text-sm text-zinc-500">Welcome back</p>
                                    <p className="mt-1 text-lg font-semibold text-zinc-900">
                                        {user.name}
                                    </p>
                                    <p className="text-sm text-zinc-500">{user.email}</p>
                                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                        <Link href="/problems" className="btn-primary flex-1">
                                            Continue practicing
                                            <span aria-hidden="true">→</span>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => logout()}
                                            disabled={isLoading}
                                            className="btn-secondary flex-1"
                                        >
                                            {isLoading ? 'Signing out…' : 'Sign out'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="card overflow-hidden p-1.5 shadow-card">
                                    <div className="rounded-md border border-zinc-100 bg-zinc-50/80 px-5 py-4 text-left">
                                        <p className="text-sm font-medium text-zinc-700">
                                            Ready to start?
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            Create a free account and jump into your first problem.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 p-3 sm:flex-row">
                                        <Link href="/signup" className="btn-primary flex-1">
                                            Get started free
                                            <span aria-hidden="true">→</span>
                                        </Link>
                                        <Link href="/login" className="btn-secondary flex-1">
                                            Sign in
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="border-t border-zinc-200/80 bg-white/60">
                    <div className="mx-auto grid max-w-6xl gap-0 divide-y divide-zinc-200/80 px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
                        {FEATURES.map((feature) => (
                            <article key={feature.title} className="px-2 py-10 md:px-8 md:py-14">
                                <div
                                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border ${feature.accent}`}
                                >
                                    {feature.icon}
                                </div>
                                <h2 className="text-base font-semibold text-zinc-900">
                                    {feature.title}
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                                    {feature.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="border-t border-zinc-200/80 bg-white">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-zinc-400 sm:flex-row">
                    <p>© {new Date().getFullYear()} OmniPrep</p>
                    <p>
                        API{' '}
                        <code className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-zinc-500">
                            {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/health
                        </code>
                    </p>
                </div>
            </footer>
        </div>
    );
}
