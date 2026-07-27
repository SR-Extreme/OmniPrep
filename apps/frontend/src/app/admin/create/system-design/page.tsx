'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
    AdminLoading,
    AdminAuthGate,
    AdminPageShell,
} from '@/components/admin/AdminPageShell';
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

type FieldErrors = Partial<Record<keyof FormState, string>>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const METRIC_ID_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

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

function validateOptionalList(value: string, label: string): string | undefined {
    const items = value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

    if (value.trim() && items.length === 0) {
        return `${label} entries cannot be empty`;
    }

    return undefined;
}

function validateRequiredList(value: string, label: string): string | undefined {
    const items = splitList(value);
    if (items.length === 0) {
        return `At least one ${label} is required (one per line)`;
    }
    return undefined;
}

function validateMetricsJson(
    metricsJson: string,
    deliverablesText: string,
): string | undefined {
    const trimmed = metricsJson.trim();
    if (!trimmed) {
        return 'Evaluation metrics JSON is required';
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(trimmed);
    } catch {
        return 'Evaluation metrics JSON is invalid';
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
        return 'Evaluation metrics must be a non-empty JSON array';
    }

    const deliverables = splitList(deliverablesText);
    if (deliverables.length === 0) {
        return 'Add deliverables first — metrics need one object per deliverable';
    }

    if (parsed.length !== deliverables.length) {
        return `Evaluation metrics must contain exactly one object for each deliverable (${deliverables.length} expected)`;
    }

    const ids: string[] = [];
    const titles: string[] = [];
    let weightSum = 0;

    for (let i = 0; i < parsed.length; i++) {
        const metric = parsed[i];
        if (!metric || typeof metric !== 'object' || Array.isArray(metric)) {
            return `Metric at index ${i} must be an object`;
        }

        const record = metric as Record<string, unknown>;

        if (typeof record.id !== 'string' || !record.id.trim()) {
            return `Metric at index ${i} requires a camelCase id`;
        }
        if (!METRIC_ID_PATTERN.test(record.id)) {
            return `Metric id "${record.id}" must be camelCase (e.g. highLevelDesign)`;
        }

        if (typeof record.title !== 'string' || !record.title.trim()) {
            return `Metric at index ${i} requires a title matching a deliverable`;
        }

        if (
            typeof record.weight !== 'number' ||
            !Number.isInteger(record.weight) ||
            record.weight <= 0
        ) {
            return `Metric "${record.title}" weight must be a positive integer`;
        }

        if (
            !Array.isArray(record.criteria) ||
            record.criteria.length === 0 ||
            record.criteria.some(
                (item) => typeof item !== 'string' || !item.trim(),
            )
        ) {
            return `Metric "${record.title}" must include at least one non-empty criteria string`;
        }

        ids.push(record.id);
        titles.push(record.title.trim());
        weightSum += record.weight;
    }

    if (new Set(ids).size !== ids.length) {
        return 'Evaluation metrics ids must be unique';
    }

    if (weightSum !== 100) {
        return `Evaluation metrics weights must sum to 100 (currently ${weightSum})`;
    }

    const missing = deliverables.filter((item) => !titles.includes(item));
    const extra = titles.filter((item) => !deliverables.includes(item));

    if (missing.length > 0 || extra.length > 0) {
        return 'Evaluation metrics titles must match deliverables exactly (one object per deliverable)';
    }

    return undefined;
}

function validateField(
    form: FormState,
    key: keyof FormState,
): string | undefined {
    switch (key) {
        case 'slug': {
            const slug = form.slug.trim();
            if (!slug) {
                return 'Slug is required';
            }
            if (slug.length > 200) {
                return 'Slug must be at most 200 characters';
            }
            if (!SLUG_PATTERN.test(slug)) {
                return 'Slug must be lowercase kebab-case (e.g. design-url-shortener)';
            }
            return undefined;
        }
        case 'title': {
            const title = form.title.trim();
            if (!title) {
                return 'Title is required';
            }
            if (title.length > 200) {
                return 'Title must be at most 200 characters';
            }
            return undefined;
        }
        case 'description':
            return form.description.trim()
                ? undefined
                : 'Description is required';
        case 'functional':
            return validateRequiredList(form.functional, 'functional requirement');
        case 'nonFunctional':
            return validateRequiredList(
                form.nonFunctional,
                'non-functional requirement',
            );
        case 'deliverables':
            return validateRequiredList(form.deliverables, 'deliverable');
        case 'constraints':
            return validateOptionalList(form.constraints, 'Constraints');
        case 'scaleFactors':
            return validateOptionalList(form.scaleFactors, 'Scale factors');
        case 'topics':
            return validateOptionalList(form.topics, 'Topics');
        case 'hints':
            return validateOptionalList(form.hints, 'Hints');
        case 'difficulty':
            return DIFFICULTIES.includes(form.difficulty)
                ? undefined
                : 'Difficulty must be EASY, MEDIUM, or HARD';
        case 'metricsJson':
            return validateMetricsJson(form.metricsJson, form.deliverables);
        case 'isPublished':
            return undefined;
        default:
            return undefined;
    }
}

function validateForm(form: FormState): FieldErrors {
    const keys: (keyof FormState)[] = [
        'slug',
        'title',
        'description',
        'functional',
        'nonFunctional',
        'deliverables',
        'constraints',
        'scaleFactors',
        'topics',
        'hints',
        'difficulty',
        'metricsJson',
    ];

    const errors: FieldErrors = {};
    for (const key of keys) {
        const message = validateField(form, key);
        if (message) {
            errors[key] = message;
        }
    }
    return errors;
}

function AdminCreateSystemDesignPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const isEditing = Boolean(editId);

    const { user, accessToken } = useAuthStore();
    const [hydrated, setHydrated] = useState(false);
    const [form, setForm] = useState<FormState>(INITIAL);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
        setFieldErrors((current) => {
            if (!current[key]) {
                return current;
            }
            const next = { ...current };
            delete next[key];
            return next;
        });
    }

    function handleFieldBlur<K extends keyof FormState>(
        key: K,
        value?: FormState[K],
    ) {
        const snapshot =
            value !== undefined ? { ...form, [key]: value } : form;
        const message = validateField(snapshot, key);

        setFieldErrors((current) => {
            const next = { ...current };

            if (!message) {
                delete next[key];
            } else {
                next[key] = message;
            }

            // Deliverables drive metrics matching — re-check metrics when deliverables change.
            if (key === 'deliverables') {
                const metricsMessage = validateMetricsJson(
                    snapshot.metricsJson,
                    snapshot.deliverables,
                );
                if (!metricsMessage) {
                    delete next.metricsJson;
                } else {
                    next.metricsJson = metricsMessage;
                }
            }

            return next;
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!accessToken) {
            return;
        }

        const nextFieldErrors = validateForm(form);
        setFieldErrors(nextFieldErrors);
        setError(null);

        if (Object.keys(nextFieldErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

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
                    : `Failed to ${isEditing ? 'update' : 'create'} system design question`,
            );
            setIsSubmitting(false);
        }
    }

    if (!hydrated || !accessToken || !user || user.role !== 'ADMIN') {
        return <AdminAuthGate hydrated={hydrated} />;
    }

    if (isLoadingQuestion) {
        return <AdminLoading label="Loading question…" />;
    }

    return (
        <AdminPageShell width="form">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <Card className="overflow-hidden border-emerald-200/60 shadow-soft">
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
                        <p className="text-sm font-bold text-rose-600">
                            Inputs should be in accordance to the placeholders and
                            messages given with fields for smooth creation of
                            question.
                        </p>

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
                                    onChange={(e) =>
                                        updateField('slug', e.target.value)
                                    }
                                    onBlur={(e) =>
                                        handleFieldBlur('slug', e.target.value)
                                    }
                                    placeholder="design-url-shortener"
                                    aria-invalid={Boolean(fieldErrors.slug)}
                                />
                                {fieldErrors.slug ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.slug}
                                    </p>
                                ) : null}
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
                                    onBlur={(e) =>
                                        handleFieldBlur(
                                            'difficulty',
                                            e.target.value as Difficulty,
                                        )
                                    }
                                    aria-invalid={Boolean(fieldErrors.difficulty)}
                                >
                                    {DIFFICULTIES.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.difficulty ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.difficulty}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) =>
                                    updateField('title', e.target.value)
                                }
                                onBlur={(e) =>
                                    handleFieldBlur('title', e.target.value)
                                }
                                placeholder="Design a URL Shortener"
                                aria-invalid={Boolean(fieldErrors.title)}
                            />
                            {fieldErrors.title ? (
                                <p className="text-sm text-rose-600">
                                    {fieldErrors.title}
                                </p>
                            ) : null}
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
                                onBlur={(e) =>
                                    handleFieldBlur('description', e.target.value)
                                }
                                placeholder={
                                    'Leave blank lines between points for a clear description.\n\nExample:\nDesign a URL shortening service like bit.ly.\n\nCover APIs, storage, and scale.\n\nDiscuss tradeoffs and bottlenecks.'
                                }
                                aria-invalid={Boolean(fieldErrors.description)}
                            />
                            {fieldErrors.description ? (
                                <p className="text-sm text-rose-600">
                                    {fieldErrors.description}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="functional">
                                    Functional requirements
                                </Label>
                                <textarea
                                    id="functional"
                                    className="input-base min-h-24"
                                    value={form.functional}
                                    onChange={(e) =>
                                        updateField('functional', e.target.value)
                                    }
                                    onBlur={(e) =>
                                        handleFieldBlur(
                                            'functional',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={
                                        'Stored as string[] — one per line:\nShorten a long URL\nRedirect short URL to original\nCustom aliases'
                                    }
                                    aria-invalid={Boolean(fieldErrors.functional)}
                                />
                                {fieldErrors.functional ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.functional}
                                    </p>
                                ) : null}
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
                                        updateField(
                                            'nonFunctional',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={(e) =>
                                        handleFieldBlur(
                                            'nonFunctional',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={
                                        'Stored as string[] — one per line:\nLow latency redirects\nHigh availability\nHandle 100M URLs'
                                    }
                                    aria-invalid={Boolean(
                                        fieldErrors.nonFunctional,
                                    )}
                                />
                                {fieldErrors.nonFunctional ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.nonFunctional}
                                    </p>
                                ) : null}
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
                                onBlur={(e) =>
                                    handleFieldBlur('deliverables', e.target.value)
                                }
                                placeholder={
                                    'Stored as string[] — one per line (titles must match metrics):\nHigh Level Design\nScalability\nTradeoffs'
                                }
                                aria-invalid={Boolean(fieldErrors.deliverables)}
                            />
                            {fieldErrors.deliverables ? (
                                <p className="text-sm text-rose-600">
                                    {fieldErrors.deliverables}
                                </p>
                            ) : null}
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
                                    onBlur={(e) =>
                                        handleFieldBlur(
                                            'constraints',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={
                                        'Stored as string[] — one per line:\nNo third-party shorteners\nLinks expire after 1 year'
                                    }
                                    aria-invalid={Boolean(fieldErrors.constraints)}
                                />
                                {fieldErrors.constraints ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.constraints}
                                    </p>
                                ) : null}
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
                                    onBlur={(e) =>
                                        handleFieldBlur(
                                            'scaleFactors',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={
                                        'Stored as string[] — one per line:\n100M URLs\n10K writes/sec\n100K reads/sec'
                                    }
                                    aria-invalid={Boolean(fieldErrors.scaleFactors)}
                                />
                                {fieldErrors.scaleFactors ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.scaleFactors}
                                    </p>
                                ) : null}
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
                                    onBlur={(e) =>
                                        handleFieldBlur('topics', e.target.value)
                                    }
                                    placeholder={
                                        'Stored as string[] — one per line:\nCaching\nHashing\nDatabases'
                                    }
                                    aria-invalid={Boolean(fieldErrors.topics)}
                                />
                                {fieldErrors.topics ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.topics}
                                    </p>
                                ) : null}
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
                                    onBlur={(e) =>
                                        handleFieldBlur('hints', e.target.value)
                                    }
                                    placeholder={
                                        'Stored as string[] — one per line:\nStart with API design\nConsider read-heavy traffic\nThink about hash collisions'
                                    }
                                    aria-invalid={Boolean(fieldErrors.hints)}
                                />
                                {fieldErrors.hints ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.hints}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="metricsJson">
                                Evaluation metrics JSON
                            </Label>
                            <textarea
                                id="metricsJson"
                                className="input-base min-h-48 font-mono text-xs"
                                value={form.metricsJson}
                                onChange={(e) =>
                                    updateField('metricsJson', e.target.value)
                                }
                                onBlur={(e) =>
                                    handleFieldBlur('metricsJson', e.target.value)
                                }
                                placeholder={`[\n  {\n    "id": "highLevelDesign",\n    "title": "High Level Design",\n    "weight": 40,\n    "criteria": ["Clear components", "Data flow"]\n  }\n]`}
                                aria-invalid={Boolean(fieldErrors.metricsJson)}
                            />
                            {fieldErrors.metricsJson ? (
                                <p className="text-sm text-rose-600">
                                    {fieldErrors.metricsJson}
                                </p>
                            ) : null}
                            <p className="text-sm text-rose-600">
                                <span className="font-semibold">*</span> Evaluation
                                metrics should contain an object for each
                                deliverable.
                            </p>
                            <p className="text-sm text-rose-600">
                                <span className="font-semibold">*</span> The weights
                                of all metric objects in the JSON must sum to 100.
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
        </AdminPageShell>
    );
}

export default function AdminCreateSystemDesignPage() {
    return (
        <Suspense fallback={<AdminAuthGate hydrated={false} />}>
            <AdminCreateSystemDesignPageContent />
        </Suspense>
    );
}
