export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-6">
            <h1 className="text-4xl font-bold tracking-tight text-white">
                OmniPrep
            </h1>
            <p className="mt-4 max-w-md text-center text-slate-400">
                AI Interview Preparation Platform — Phase 0 setup complete.
            </p>
            <p className="mt-8 text-sm text-slate-500">
                API health check:{' '}
                <code className="rounded bg-slate-800 px-2 py-1 text-emerald-400">
                    http://localhost:4000/health
                </code>
            </p>
        </main>
    );
}