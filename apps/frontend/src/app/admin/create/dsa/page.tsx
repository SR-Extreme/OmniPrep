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
    createAdminDsaQuestion,
    getAdminDsaQuestion,
    updateAdminDsaQuestion,
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import type { AdminTestCaseInput, CreateDsaQuestionBody } from '@/types/admin';
import { DIFFICULTIES, type Difficulty, type StarterCode } from '@/types/dsa';

type FormState = {
    slug: string;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    difficulty: Difficulty;
    topics: string;
    timeLimitMs: string;
    memoryLimitKb: string;
    hints: string;
    isPublished: boolean;
    starterCpp: string;
    starterJava: string;
    starterPython: string;
    solutionCpp: string;
    solutionJava: string;
    solutionPython: string;
    examplesJson: string;
    testCases: AdminTestCaseInput[];
};

const INITIAL: FormState = {
    slug: '',
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    difficulty: 'MEDIUM',
    topics: '',
    timeLimitMs: '2000',
    memoryLimitKb: '256000',
    hints: '',
    isPublished: false,
    starterCpp: '',
    starterJava: '',
    starterPython: '',
    solutionCpp: '',
    solutionJava: '',
    solutionPython: '',
    examplesJson: '',
    testCases: [
        { input: '', expectedOutput: '', isHidden: true, order: 0 },
    ],
};

function splitList(value: string): string[] {
    return value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function AdminCreateDsaPage() {
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
                const { question } = await getAdminDsaQuestion(
                    accessToken as string,
                    editId as string,
                );

                if (cancelled) {
                    return;
                }

                const starter = question.starterCode;
                const solution = (
                    question as typeof question & {
                        solutionCode?: StarterCode | null;
                    }
                ).solutionCode;

                const rawCases = question.testCases as Array<{
                    input: string;
                    expectedOutput: string;
                    explanation?: string | null;
                    isHidden?: boolean;
                    order?: number;
                }>;

                const testCases = rawCases.map((row, order) => ({
                    input: row.input,
                    expectedOutput: row.expectedOutput,
                    explanation: row.explanation ?? undefined,
                    isHidden: row.isHidden ?? true,
                    order: row.order ?? order,
                }));

                setForm({
                    slug: question.slug,
                    title: question.title,
                    description: question.description,
                    inputFormat: question.inputFormat ?? '',
                    outputFormat: question.outputFormat ?? '',
                    constraints: question.constraints ?? '',
                    difficulty: question.difficulty,
                    topics: question.topics.join(', '),
                    timeLimitMs: String(question.timeLimitMs),
                    memoryLimitKb: String(question.memoryLimitKb),
                    hints: question.hints.join('\n'),
                    isPublished: question.isPublished,
                    starterCpp: starter?.cpp ?? '',
                    starterJava: starter?.java ?? '',
                    starterPython: starter?.python ?? '',
                    solutionCpp: solution?.cpp ?? '',
                    solutionJava: solution?.java ?? '',
                    solutionPython: solution?.python ?? '',
                    examplesJson: question.examples
                        ? JSON.stringify(question.examples, null, 2)
                        : '',
                    testCases:
                        testCases.length > 0
                            ? testCases
                            : [
                                  {
                                      input: '',
                                      expectedOutput: '',
                                      isHidden: true,
                                      order: 0,
                                  },
                              ],
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

    function updateTestCase(
        index: number,
        patch: Partial<AdminTestCaseInput>,
    ) {
        setForm((current) => ({
            ...current,
            testCases: current.testCases.map((row, i) =>
                i === index ? { ...row, ...patch } : row,
            ),
        }));
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!accessToken) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            let examples: CreateDsaQuestionBody['examples'];
            if (form.examplesJson.trim()) {
                examples = JSON.parse(form.examplesJson) as CreateDsaQuestionBody['examples'];
            }

            const body: CreateDsaQuestionBody = {
                slug: form.slug.trim(),
                title: form.title.trim(),
                description: form.description.trim(),
                inputFormat: form.inputFormat.trim() || undefined,
                outputFormat: form.outputFormat.trim() || undefined,
                constraints: form.constraints.trim() || undefined,
                difficulty: form.difficulty,
                topics: splitList(form.topics),
                timeLimitMs: Number(form.timeLimitMs) || 2000,
                memoryLimitKb: Number(form.memoryLimitKb) || 256000,
                hints: splitList(form.hints),
                isPublished: form.isPublished,
                examples,
                starterCode: {
                    cpp: form.starterCpp,
                    java: form.starterJava,
                    python: form.starterPython,
                },
                solutionCode: {
                    cpp: form.solutionCpp,
                    java: form.solutionJava,
                    python: form.solutionPython,
                },
                testCases: form.testCases
                    .filter((row) => row.input.trim() && row.expectedOutput.trim())
                    .map((row, order) => ({
                        input: row.input,
                        expectedOutput: row.expectedOutput,
                        explanation: row.explanation,
                        isHidden: row.isHidden ?? true,
                        order,
                    })),
            };

            if (isEditing && editId) {
                await updateAdminDsaQuestion(accessToken, editId, body);
            } else {
                await createAdminDsaQuestion(accessToken, body);
            }

            router.push(
                `/admin/questions/dsa?status=${form.isPublished ? 'published' : 'draft'}`,
            );
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : err instanceof SyntaxError
                      ? 'Examples JSON is invalid'
                      : `Failed to ${isEditing ? 'update' : 'create'} DSA question`,
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
                                DSA
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
                                {isEditing ? 'Edit DSA question' : 'DSA question'}
                            </CardTitle>
                            <CardDescription>
                                Required fields plus optional starter code, examples, and test
                                cases.
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
                                        placeholder="two-sum"
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
                                    className="input-base min-h-32"
                                    value={form.description}
                                    onChange={(e) =>
                                        updateField('description', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="inputFormat">Input format</Label>
                                    <textarea
                                        id="inputFormat"
                                        className="input-base min-h-20"
                                        value={form.inputFormat}
                                        onChange={(e) =>
                                            updateField('inputFormat', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="outputFormat">Output format</Label>
                                    <textarea
                                        id="outputFormat"
                                        className="input-base min-h-20"
                                        value={form.outputFormat}
                                        onChange={(e) =>
                                            updateField('outputFormat', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

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

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="topics">Topics (comma/newline)</Label>
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
                                    <Label htmlFor="hints">Hints (comma/newline)</Label>
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

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="timeLimitMs">Time limit (ms)</Label>
                                    <Input
                                        id="timeLimitMs"
                                        type="number"
                                        value={form.timeLimitMs}
                                        onChange={(e) =>
                                            updateField('timeLimitMs', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="memoryLimitKb">Memory limit (KB)</Label>
                                    <Input
                                        id="memoryLimitKb"
                                        type="number"
                                        value={form.memoryLimitKb}
                                        onChange={(e) =>
                                            updateField('memoryLimitKb', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="examplesJson">
                                    Examples JSON (optional array)
                                </Label>
                                <textarea
                                    id="examplesJson"
                                    className="input-base min-h-24 font-mono text-xs"
                                    placeholder='[{"input":"...","output":"...","explanation":"..."}]'
                                    value={form.examplesJson}
                                    onChange={(e) =>
                                        updateField('examplesJson', e.target.value)
                                    }
                                />
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
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Starter / solution code</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(
                                [
                                    ['starterCpp', 'Starter C++'],
                                    ['starterJava', 'Starter Java'],
                                    ['starterPython', 'Starter Python'],
                                    ['solutionCpp', 'Solution C++'],
                                    ['solutionJava', 'Solution Java'],
                                    ['solutionPython', 'Solution Python'],
                                ] as const
                            ).map(([key, label]) => (
                                <div key={key} className="space-y-2">
                                    <Label htmlFor={key}>{label}</Label>
                                    <textarea
                                        id={key}
                                        className="input-base min-h-24 font-mono text-xs"
                                        value={form[key]}
                                        onChange={(e) => updateField(key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Test cases</CardTitle>
                            <CardDescription>
                                Rows without both input and expected output are skipped.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {form.testCases.map((row, index) => (
                                <div
                                    key={index}
                                    className="space-y-3 rounded-lg border border-zinc-200 p-4"
                                >
                                    <div className="space-y-2">
                                        <Label>Input</Label>
                                        <textarea
                                            className="input-base min-h-16 font-mono text-xs"
                                            value={row.input}
                                            onChange={(e) =>
                                                updateTestCase(index, {
                                                    input: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expected output</Label>
                                        <textarea
                                            className="input-base min-h-16 font-mono text-xs"
                                            value={row.expectedOutput}
                                            onChange={(e) =>
                                                updateTestCase(index, {
                                                    expectedOutput: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={row.isHidden ?? true}
                                            onChange={(e) =>
                                                updateTestCase(index, {
                                                    isHidden: e.target.checked,
                                                })
                                            }
                                        />
                                        Hidden
                                    </label>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                    setForm((current) => ({
                                        ...current,
                                        testCases: [
                                            ...current.testCases,
                                            {
                                                input: '',
                                                expectedOutput: '',
                                                isHidden: true,
                                                order: current.testCases.length,
                                            },
                                        ],
                                    }))
                                }
                            >
                                Add test case
                            </Button>
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
