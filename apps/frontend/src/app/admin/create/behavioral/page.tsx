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
    createAdminBehavioralQuestion,
    getAdminBehavioralQuestion,
    updateAdminBehavioralQuestion,
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import type { CreateBehavioralQuestionBody } from '@/types/admin';
import {
    BEHAVIORAL_PHASE_TYPES,
    type BehavioralPhaseType,
    type BehavioralPhases,
} from '@/types/behavioral';
import { DIFFICULTIES, type Difficulty } from '@/types/dsa';

type FormState = {
    slug: string;
    title: string;
    description: string;
    companyName: string;
    roleName: string;
    difficulty: Difficulty;
    isPublished: boolean;
    phasesJson: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EXPECTED_PHASE_TOTALS: Record<BehavioralPhaseType, number> = {
    INTRODUCTION: 0,
    ICE_BREAKER: 2,
    RESUME_DEEP_DIVE: 3,
    CORE_BEHAVIORAL: 3,
    COMPANY_VALUES: 2,
    CANDIDATE_QUESTIONS: 0,
    WRAP_UP: 0,
};

function validatePhasesJson(phasesJson: string): string | null {
    const trimmed = phasesJson.trim();
    if (!trimmed) {
        return 'Phases JSON is required';
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(trimmed);
    } catch {
        return 'Phases JSON is invalid';
    }

    if (!Array.isArray(parsed)) {
        return 'Phases must be a JSON array';
    }

    if (parsed.length !== BEHAVIORAL_PHASE_TYPES.length) {
        return `Phases must contain exactly ${BEHAVIORAL_PHASE_TYPES.length} phases`;
    }

    for (let i = 0; i < BEHAVIORAL_PHASE_TYPES.length; i++) {
        const phase = parsed[i];
        const expectedType = BEHAVIORAL_PHASE_TYPES[i];

        if (!phase || typeof phase !== 'object' || Array.isArray(phase)) {
            return `Phase at index ${i} must be an object`;
        }

        const record = phase as Record<string, unknown>;

        if (record.type !== expectedType) {
            return `Phase at index ${i} must be ${expectedType}`;
        }

        if (typeof record.title !== 'string' || !record.title.trim()) {
            return `${expectedType} title is required`;
        }

        if (typeof record.description !== 'string' || !record.description.trim()) {
            return `${expectedType} description is required`;
        }

        if (
            typeof record.totalQuestions !== 'number' ||
            !Number.isInteger(record.totalQuestions) ||
            record.totalQuestions < 0
        ) {
            return `${expectedType} totalQuestions must be a non-negative integer`;
        }

        if (record.totalQuestions !== EXPECTED_PHASE_TOTALS[expectedType]) {
            return `${expectedType} must have totalQuestions=${EXPECTED_PHASE_TOTALS[expectedType]}`;
        }

        if (
            !record.content ||
            typeof record.content !== 'object' ||
            Array.isArray(record.content)
        ) {
            return `${expectedType} content must be an object`;
        }
    }

    return null;
}

function validateField(form: FormState, key: keyof FormState): string | undefined {
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
                return 'Slug must be lowercase kebab-case (e.g. google-swe-behavioral)';
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
            return form.description.trim() ? undefined : 'Description is required';
        case 'companyName': {
            const companyName = form.companyName.trim();
            if (!companyName) {
                return 'Company name is required';
            }
            if (companyName.length > 200) {
                return 'Company name must be at most 200 characters';
            }
            return undefined;
        }
        case 'roleName': {
            const roleName = form.roleName.trim();
            if (!roleName) {
                return 'Role name is required';
            }
            if (roleName.length > 200) {
                return 'Role name must be at most 200 characters';
            }
            return undefined;
        }
        case 'difficulty':
            return DIFFICULTIES.includes(form.difficulty)
                ? undefined
                : 'Difficulty must be EASY, MEDIUM, or HARD';
        case 'phasesJson':
            return validatePhasesJson(form.phasesJson) ?? undefined;
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
        'companyName',
        'roleName',
        'difficulty',
        'phasesJson',
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

function buildDefaultPhases(
    companyName = 'Company',
    roleName = 'Role',
): BehavioralPhases {
    return [
        {
            type: 'INTRODUCTION',
            title: 'Introduction',
            description:
                'The interviewer introduces themselves and explains the format. Upload your resume to begin.',
            totalQuestions: 0,
            content: {
                statement: `Welcome to your ${roleName} behavioral interview at ${companyName}.`,
                requiresResumeUpload: true,
            },
        },
        {
            type: 'ICE_BREAKER',
            title: 'Ice-breaker',
            description:
                'Light opening questions to help the candidate relax and share background.',
            totalQuestions: 2,
            content: {
                generationGuidance: [
                    'Ask about recent work or studies.',
                    'Keep the tone warm and conversational.',
                ],
            },
        },
        {
            type: 'RESUME_DEEP_DIVE',
            title: 'Resume Deep Dive',
            description:
                'Project and experience questions based on the candidate resume.',
            totalQuestions: 3,
            content: {
                generationGuidance: [
                    'Probe ownership and impact on listed projects.',
                    'Ask for concrete metrics where possible.',
                ],
            },
        },
        {
            type: 'CORE_BEHAVIORAL',
            title: 'Core Behavioral Questions',
            description:
                'Main behavioral section covering teamwork, conflict, ownership, and leadership.',
            totalQuestions: 3,
            content: {
                generationGuidance: [
                    'Cover conflict, ownership, and collaboration.',
                    'Push for STAR-structured answers.',
                ],
            },
        },
        {
            type: 'COMPANY_VALUES',
            title: 'Company Values Questions',
            description:
                "Assess alignment with the company's working style and values.",
            totalQuestions: 2,
            content: {
                generationGuidance: [
                    `Relate questions to ${companyName} values and working style.`,
                    'Ask how the candidate would operate on the team.',
                ],
            },
        },
        {
            type: 'CANDIDATE_QUESTIONS',
            title: 'Candidate Questions',
            description:
                'The candidate asks questions; the AI interviewer responds on behalf of the company.',
            totalQuestions: 0,
            content: {
                prompt: 'Do you have any questions for me?',
                answerStyle: `Respond as a ${roleName} interviewer at ${companyName} in a realistic, helpful tone.`,
                answerGuidance: [
                    'Answer all candidate questions in one response.',
                    'Be professional and conversational.',
                    'Do not invent confidential internal details.',
                ],
            },
        },
        {
            type: 'WRAP_UP',
            title: 'Wrap Up',
            description: 'Close the interview.',
            totalQuestions: 0,
            content: {
                statement: `Thanks for interviewing with ${companyName}. We will share next steps soon.`,
            },
        },
    ];
}

const INITIAL: FormState = {
    slug: '',
    title: '',
    description: '',
    companyName: '',
    roleName: '',
    difficulty: 'MEDIUM',
    isPublished: false,
    phasesJson: JSON.stringify(buildDefaultPhases(), null, 2),
};

function AdminCreateBehavioralPageContent() {
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
                const { question } = await getAdminBehavioralQuestion(
                    accessToken as string,
                    editId as string,
                );

                if (cancelled) {
                    return;
                }

                setForm({
                    slug: question.slug,
                    title: question.title,
                    description: question.description,
                    companyName: question.companyName,
                    roleName: question.roleName,
                    difficulty: question.difficulty,
                    isPublished: question.isPublished,
                    phasesJson: JSON.stringify(question.phases, null, 2),
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
            if (!message) {
                if (!current[key]) {
                    return current;
                }
                const next = { ...current };
                delete next[key];
                return next;
            }
            return { ...current, [key]: message };
        });
    }

    function resetPhasesTemplate() {
        const company = form.companyName.trim() || 'Company';
        const role = form.roleName.trim() || 'Role';
        updateField('phasesJson', JSON.stringify(buildDefaultPhases(company, role), null, 2));
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
            const phases = JSON.parse(form.phasesJson) as BehavioralPhases;

            const body: CreateBehavioralQuestionBody = {
                slug: form.slug.trim(),
                title: form.title.trim(),
                description: form.description.trim(),
                companyName: form.companyName.trim(),
                roleName: form.roleName.trim(),
                difficulty: form.difficulty,
                phases,
                isPublished: form.isPublished,
            };

            if (isEditing && editId) {
                await updateAdminBehavioralQuestion(accessToken, editId, body);
            } else {
                await createAdminBehavioralQuestion(accessToken, body);
            }

            router.push(
                `/admin/questions/behavioral?status=${form.isPublished ? 'published' : 'draft'}`,
            );
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : `Failed to ${isEditing ? 'update' : 'create'} behavioral question`,
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
                                    ? 'Edit Behavioral question'
                                    : 'Behavioral question'}
                            </CardTitle>
                            <CardDescription>
                                Company, role, and the fixed 7-phase interview schema.
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
                                        onChange={(e) => updateField('slug', e.target.value)}
                                        onBlur={(e) =>
                                            handleFieldBlur('slug', e.target.value)
                                        }
                                        placeholder="google-swe-behavioral"
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
                                    onChange={(e) => updateField('title', e.target.value)}
                                    onBlur={(e) =>
                                        handleFieldBlur('title', e.target.value)
                                    }
                                    placeholder="Google SWE Behavioral Interview"
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
                                        'Leave blank lines between points for a clear description.\n\nExample:\nPractice Google-style behavioral questions.\n\nCovers teamwork, ownership, and leadership.\n\nResume-aware follow-ups included.'
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
                                    <Label htmlFor="companyName">Company</Label>
                                    <Input
                                        id="companyName"
                                        value={form.companyName}
                                        onChange={(e) =>
                                            updateField('companyName', e.target.value)
                                        }
                                        onBlur={(e) =>
                                            handleFieldBlur(
                                                'companyName',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Google"
                                        aria-invalid={Boolean(fieldErrors.companyName)}
                                    />
                                    {fieldErrors.companyName ? (
                                        <p className="text-sm text-rose-600">
                                            {fieldErrors.companyName}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roleName">Role</Label>
                                    <Input
                                        id="roleName"
                                        value={form.roleName}
                                        onChange={(e) =>
                                            updateField('roleName', e.target.value)
                                        }
                                        onBlur={(e) =>
                                            handleFieldBlur('roleName', e.target.value)
                                        }
                                        placeholder="Software Engineer"
                                        aria-invalid={Boolean(fieldErrors.roleName)}
                                    />
                                    {fieldErrors.roleName ? (
                                        <p className="text-sm text-rose-600">
                                            {fieldErrors.roleName}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <Label htmlFor="phasesJson">Phases JSON</Label>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={resetPhasesTemplate}
                                    >
                                        Reset template
                                    </Button>
                                </div>
                                <textarea
                                    id="phasesJson"
                                    className="input-base min-h-72 font-mono text-xs"
                                    value={form.phasesJson}
                                    onChange={(e) =>
                                        updateField('phasesJson', e.target.value)
                                    }
                                    onBlur={(e) =>
                                        handleFieldBlur('phasesJson', e.target.value)
                                    }
                                    placeholder='[{"type":"INTRODUCTION","title":"...","description":"...","totalQuestions":0,"content":{}}]'
                                    aria-invalid={Boolean(fieldErrors.phasesJson)}
                                />
                                {fieldErrors.phasesJson ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.phasesJson}
                                    </p>
                                ) : (
                                    <p className="text-xs text-zinc-500">
                                        Exactly 7 phases in fixed order with required
                                        totalQuestions: Intro 0, Ice-breaker 2, Resume 3,
                                        Core 3, Values 2, Candidate 0, Wrap-up 0.
                                    </p>
                                )}
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

export default function AdminCreateBehavioralPage() {
    return (
        <Suspense fallback={<AdminAuthGate hydrated={false} />}>
            <AdminCreateBehavioralPageContent />
        </Suspense>
    );
}
