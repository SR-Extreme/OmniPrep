'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    createAdminSystemDesignQuestion,
    getAdminSystemDesignQuestion,
    updateAdminSystemDesignQuestion,
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import type { CreateSystemDesignQuestionBody } from '@/types/admin';
import { DIFFICULTIES, type Difficulty } from '@/types/dsa';
import type {
    EvaluationMetric,
    SystemDesignRequirements,
} from '@/types/system-design';

type FormState = {
    slug: string;
    title: string;
    description: string;
    functional: string;
    nonFunctional: string;
    deliverables: string;
    constraints: string;
    scaleFactors: string;
    difficulty: Difficulty;
    topics: string;
    hints: string;
    isPublished: boolean;
    metricsJson: string;
};

const DEFAULT_METRICS: EvaluationMetric[] = [
    {
        id: 'highLevelDesign',
        title: 'High Level Design',
        weight: 40,
        criteria: ['Clear components', 'Data flow'],
    },
    {
        id: 'scalability',
        title: 'Scalability',
        weight: 30,
        criteria: ['Bottlenecks addressed', 'Growth plan'],
    },
    {
        id: 'tradeoffs',
        title: 'Tradeoffs',
        weight: 30,
        criteria: ['Justified choices'],
    },
];

const INITIAL: FormState = {
    slug: '',
    title: '',
    description: '',
    functional: '',
    nonFunctional: '',
    deliverables: '',
    constraints: '',
    scaleFactors: '',
    difficulty: 'MEDIUM',
    topics: '',
    hints: '',
    isPublished: false,
    metricsJson: JSON.stringify(DEFAULT_METRICS, null, 2),
};

function splitList(value: string): string[] {
    return value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function joinList(value: string[] | null | undefined): string {
    return Array.isArray(value) ? value.join('\n') : '';
}

export default function AdminCreateSystemDesignPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const isEditing = Boolean(editId);

    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();
    const [hydrated, setHydrated] = useState(false);
    const [form, setForm] = useState<FormState>(INITIAL);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(Boolean(editId));
    const [error, setError] = useState<string | null>(null);

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
        if (!hydrated || !accessToken || !editId || user?.role !== 'ADMIN') {
            return;
        }

        let cancelled = false;

        async function loadQuestion() {
            setIsLoadingQuestion(true);
            setError(null);

            try {
                const { question } = await getAdminSystemDesignQuestion(
                    accessToken as string,
                    editId as string,
                );

                if (cancelled) {
                    return;
                }

                const requirements = question.requirements as SystemDesignRequirements;

                setForm({
                    slug: question.slug,
                    title: question.title,
                    description: question.description,
                    functional: joinList(requirements?.functional),
                    nonFunctional: joinList(requirements?.nonFunctional),
                    deliverables: joinList(question.deliverables),
                    constraints: joinList(question.constraints),
                    scaleFactors: joinList(question.scaleFactors),
                    difficulty: question.difficulty,
                    topics: joinList(question.topics),
                    hints: joinList(question.hints),
                    isPublished: question.isPublished,
                    metricsJson: JSON.stringify(
                        question.evaluationMetrics ?? DEFAULT_METRICS,
                        null,
                        2,
                    ),
                });
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load question for editing',
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingQuestion(false);
                }
            }
        }

        void loadQuestion();

        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, user, editId]);

    function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!accessToken) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const evaluationMetrics = JSON.parse(
                form.metricsJson,
            ) as CreateSystemDesignQuestionBody['evaluationMetrics'];

            const body: CreateSystemDesignQuestionBody = {
                slug: form.slug.trim(),
                title: form.title.trim(),
                description: form.description.trim(),
                requirements: {
                    functional: splitList(form.functional),
                    nonFunctional: splitList(form.nonFunctional),
                },
                deliverables: splitList(form.deliverables),
                constraints: splitList(form.constraints),
                scaleFactors: splitList(form.scaleFactors),
                difficulty: form.difficulty,
                topics: splitList(form.topics),
                hints: splitList(form.hints),
                evaluationMetrics,
                isPublished: form.isPublished,
            };

            if (isEditing && editId) {
                await updateAdminSystemDesignQuestion(accessToken, editId, body);
            } else {
                await createAdminSystemDesignQuestion(accessToken, body);
            }

            router.push(
                `/admin/questions/system-design?status=${form.isPublished ? 'published' : 'draft'}`,
            );
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : err instanceof SyntaxError
                      ? 'Evaluation metrics JSON is invalid'
                      : `Failed to ${isEditing ? 'update' : 'create'} system design question`,
            );
            setIsSubmitting(false);
        }
    }

    if (!hydrated || !accessToken || !user || user.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                Loading…
            </div>
        );
    }

    if (isLoadingQuestion) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                Loading question…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <header className="nav-header">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                                O
                            </span>
                            <span className="text-base font-semibold tracking-tight text-zinc-900">
                                OmniPrep
                            </span>
                        </Link>
                        <nav className="hidden items-center gap-1 sm:flex">
                            <Link
                                href="/admin/create"
                                className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                            >
                                Create
                            </Link>
                            <span className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900">
                                System Design
                            </span>
                        </nav>
                    </div>
                    <button
                        type="button"
                        onClick={() => logout()}
                        disabled={authLoading}
                        className="btn-secondary !py-2"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-6 py-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <p className="section-label">
                                {isEditing ? 'Edit' : 'Create'}
                            </p>
                            <CardTitle>
                                {isEditing
                                    ? 'Edit System Design question'
                                    : 'System Design question'}
                            </CardTitle>
                            <CardDescription>
                                Requirements, deliverables, and evaluation metrics (weights
                                must sum to 100).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error ? (
                                <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                    {error}
                                </p>
                            ) : null}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={form.slug}
                                        onChange={(e) => updateField('slug', e.target.value)}
                                        placeholder="design-url-shortener"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">Difficulty</Label>
                                    <select
                                        id="difficulty"
                                        className="select-base"
                                        value={form.difficulty}
                                        onChange={(e) =>
                                            updateField(
                                                'difficulty',
                                                e.target.value as Difficulty,
                                            )
                                        }
                                    >
                                        {DIFFICULTIES.map((level) => (
                                            <option key={level} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="input-base min-h-28"
                                    value={form.description}
                                    onChange={(e) =>
                                        updateField('description', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="functional">Functional requirements</Label>
                                    <textarea
                                        id="functional"
                                        className="input-base min-h-24"
                                        value={form.functional}
                                        onChange={(e) =>
                                            updateField('functional', e.target.value)
                                        }
                                        placeholder="One per line"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nonFunctional">
                                        Non-functional requirements
                                    </Label>
                                    <textarea
                                        id="nonFunctional"
                                        className="input-base min-h-24"
                                        value={form.nonFunctional}
                                        onChange={(e) =>
                                            updateField('nonFunctional', e.target.value)
                                        }
                                        placeholder="One per line"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deliverables">Deliverables</Label>
                                <textarea
                                    id="deliverables"
                                    className="input-base min-h-20"
                                    value={form.deliverables}
                                    onChange={(e) =>
                                        updateField('deliverables', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="constraints">Constraints</Label>
                                    <textarea
                                        id="constraints"
                                        className="input-base min-h-20"
                                        value={form.constraints}
                                        onChange={(e) =>
                                            updateField('constraints', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="scaleFactors">Scale factors</Label>
                                    <textarea
                                        id="scaleFactors"
                                        className="input-base min-h-20"
                                        value={form.scaleFactors}
                                        onChange={(e) =>
                                            updateField('scaleFactors', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="topics">Topics</Label>
                                    <textarea
                                        id="topics"
                                        className="input-base min-h-20"
                                        value={form.topics}
                                        onChange={(e) =>
                                            updateField('topics', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hints">Hints</Label>
                                    <textarea
                                        id="hints"
                                        className="input-base min-h-20"
                                        value={form.hints}
                                        onChange={(e) =>
                                            updateField('hints', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="metricsJson">Evaluation metrics JSON</Label>
                                <textarea
                                    id="metricsJson"
                                    className="input-base min-h-48 font-mono text-xs"
                                    value={form.metricsJson}
                                    onChange={(e) =>
                                        updateField('metricsJson', e.target.value)
                                    }
                                    required
                                />
                                <p className="text-xs text-zinc-500">
                                    Unique camelCase ids; weights must sum to 100.
                                </p>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-zinc-700">
                                <input
                                    type="checkbox"
                                    checked={form.isPublished}
                                    onChange={(e) =>
                                        updateField('isPublished', e.target.checked)
                                    }
                                />
                                Published
                            </label>
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button type="button" variant="secondary" asChild>
                                <Link href="/admin/create">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? isEditing
                                        ? 'Saving…'
                                        : 'Creating…'
                                    : isEditing
                                      ? 'Save changes'
                                      : 'Create question'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </div>
    );
}
