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
    starterCodeJson: string;
    examplesJson: string;
    testCases: AdminTestCaseInput[];
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const DEFAULT_TIME_LIMIT_MS = 2000;
const DEFAULT_MEMORY_LIMIT_KB = 256000;

/** Starter templates: boilerplate lines, then the one signature line to edit, then body boilerplate. */
const DEFAULT_STARTER_CODE_LINES = {
    cpp: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'class Solution {',
        'public:',
        '    vector<int> twoSum(vector<int>& nums, int target) {',
        '        // Write your solution here',
        '    }',
        '};',
    ],
    java: [
        'class Solution {',
        '    public int[] twoSum(int[] nums, int target) {',
        '        // Write your solution here',
        '    }',
        '}',
    ],
    python: [
        'from typing import List',
        '',
        'class Solution:',
        '    def twoSum(self, nums: List[int], target: int) -> List[int]:',
        '        # Write your solution here',
        '        pass',
    ],
} as const;

const DESCRIPTION_PLACEHOLDER = `Overview
You are given a list of integers and a target sum.

Given
- An integer array nums
- An integer target

Goal
Return the indices of two distinct elements in nums whose values add up to target. You may assume exactly one valid pair exists unless stated otherwise; if no pair exists, return an empty array.

Notes
- You may not use the same element twice.
- The answer may be returned in any order.`;

function starterCodeToFormJson(starter: StarterCode): string {
    return JSON.stringify(
        {
            cpp: starter.cpp.split('\n'),
            java: starter.java.split('\n'),
            python: starter.python.split('\n'),
        },
        null,
        2,
    );
}

function parseStarterCodeFromFormJson(value: string): StarterCode {
    const parsed = JSON.parse(value) as Record<string, unknown>;

    function toCode(raw: unknown): string {
        if (typeof raw === 'string') {
            return raw;
        }
        if (Array.isArray(raw) && raw.every((line) => typeof line === 'string')) {
            return (raw as string[]).join('\n');
        }
        throw new Error('Invalid starter code language value');
    }

    return {
        cpp: toCode(parsed.cpp),
        java: toCode(parsed.java),
        python: toCode(parsed.python),
    };
}

const INITIAL: FormState = {
    slug: '',
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    difficulty: 'MEDIUM',
    topics: '',
    timeLimitMs: String(DEFAULT_TIME_LIMIT_MS),
    memoryLimitKb: String(DEFAULT_MEMORY_LIMIT_KB),
    hints: '',
    isPublished: false,
    starterCodeJson: JSON.stringify(DEFAULT_STARTER_CODE_LINES, null, 2),
    examplesJson: '',
    testCases: [{ input: '', expectedOutput: '', isHidden: true, order: 0 }],
};

function splitList(value: string): string[] {
    return value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
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

function validateStarterCodeJson(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(trimmed);
    } catch {
        return 'Starter code JSON is invalid';
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return 'Starter code must be a JSON object with cpp, java, and python';
    }

    const record = parsed as Record<string, unknown>;
    for (const key of ['cpp', 'java', 'python'] as const) {
        const raw = record[key];
        const isString = typeof raw === 'string';
        const isLineArray =
            Array.isArray(raw) && raw.every((line) => typeof line === 'string');
        if (!isString && !isLineArray) {
            return `Starter code "${key}" must be a string or an array of lines`;
        }
    }

    return undefined;
}

function validateExamplesJson(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(trimmed);
    } catch {
        return 'Examples JSON is invalid';
    }

    if (!Array.isArray(parsed)) {
        return 'Examples must be a JSON array';
    }

    for (let i = 0; i < parsed.length; i++) {
        const example = parsed[i];
        if (!example || typeof example !== 'object' || Array.isArray(example)) {
            return `Example at index ${i} must be an object`;
        }
        const record = example as Record<string, unknown>;
        if (typeof record.input !== 'string') {
            return `Example at index ${i} requires a string "input"`;
        }
        if (typeof record.output !== 'string') {
            return `Example at index ${i} requires a string "output"`;
        }
        if (
            record.explanation !== undefined &&
            typeof record.explanation !== 'string'
        ) {
            return `Example at index ${i} explanation must be a string`;
        }
    }

    return undefined;
}

function validateTestCaseRow(
    row: AdminTestCaseInput,
): string | undefined {
    const hasInput = Boolean(row.input.trim());
    const hasOutput = Boolean(row.expectedOutput.trim());

    if (!hasInput && !hasOutput) {
        return undefined;
    }

    if (!hasInput) {
        return 'Test case input is required when expected output is set';
    }
    if (!hasOutput) {
        return 'Test case expected output is required when input is set';
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
                return 'Slug must be lowercase kebab-case (e.g. two-sum)';
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
        case 'inputFormat': {
            const value = form.inputFormat.trim();
            if (!value) {
                return undefined;
            }
            if (!value.startsWith('{') || !value.endsWith('}')) {
                return 'Input format must be an object type, e.g. { nums: number[], target: number }';
            }
            return undefined;
        }
        case 'outputFormat':
            return undefined;
        case 'constraints':
            return undefined;
        case 'topics':
            return validateOptionalList(form.topics, 'Topics');
        case 'hints':
            return validateOptionalList(form.hints, 'Hints');
        case 'difficulty':
            return DIFFICULTIES.includes(form.difficulty)
                ? undefined
                : 'Difficulty must be EASY, MEDIUM, or HARD';
        case 'timeLimitMs':
        case 'memoryLimitKb':
            return undefined;
        case 'starterCodeJson':
            return validateStarterCodeJson(form.starterCodeJson);
        case 'examplesJson':
            return validateExamplesJson(form.examplesJson);
        case 'testCases': {
            for (let i = 0; i < form.testCases.length; i++) {
                const message = validateTestCaseRow(form.testCases[i]);
                if (message) {
                    return `Test case ${i + 1}: ${message}`;
                }
            }
            return undefined;
        }
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
        'inputFormat',
        'outputFormat',
        'constraints',
        'topics',
        'hints',
        'difficulty',
        'starterCodeJson',
        'examplesJson',
        'testCases',
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

function AdminCreateDsaPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const isEditing = Boolean(editId);

    const { user, accessToken, isReady: hydrated } = useAuthStore();
    const [form, setForm] = useState<FormState>(INITIAL);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [testCaseErrors, setTestCaseErrors] = useState<Record<number, string>>(
        {},
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(Boolean(editId));
    const [error, setError] = useState<string | null>(null);

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
                    topics: question.topics.join('\n'),
                    timeLimitMs: String(
                        question.timeLimitMs || DEFAULT_TIME_LIMIT_MS,
                    ),
                    memoryLimitKb: String(
                        question.memoryLimitKb || DEFAULT_MEMORY_LIMIT_KB,
                    ),
                    hints: question.hints.join('\n'),
                    isPublished: question.isPublished,
                    starterCodeJson: starterCodeToFormJson(
                        starter ?? {
                            cpp: DEFAULT_STARTER_CODE_LINES.cpp.join('\n'),
                            java: DEFAULT_STARTER_CODE_LINES.java.join('\n'),
                            python: DEFAULT_STARTER_CODE_LINES.python.join('\n'),
                        },
                    ),
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
        setTestCaseErrors((current) => {
            if (!current[index]) {
                return current;
            }
            const next = { ...current };
            delete next[index];
            return next;
        });
        setFieldErrors((current) => {
            if (!current.testCases) {
                return current;
            }
            const next = { ...current };
            delete next.testCases;
            return next;
        });
    }

    function handleTestCaseBlur(
        index: number,
        patch?: Partial<AdminTestCaseInput>,
    ) {
        const currentRow = form.testCases[index];
        if (!currentRow) {
            return;
        }
        const row = { ...currentRow, ...patch };
        const message = validateTestCaseRow(row);
        setTestCaseErrors((current) => {
            if (!message) {
                if (!current[index]) {
                    return current;
                }
                const next = { ...current };
                delete next[index];
                return next;
            }
            return { ...current, [index]: message };
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!accessToken) {
            return;
        }

        const nextFieldErrors = validateForm(form);
        const nextTestCaseErrors: Record<number, string> = {};
        form.testCases.forEach((row, index) => {
            const message = validateTestCaseRow(row);
            if (message) {
                nextTestCaseErrors[index] = message;
            }
        });

        setFieldErrors(nextFieldErrors);
        setTestCaseErrors(nextTestCaseErrors);
        setError(null);

        if (
            Object.keys(nextFieldErrors).length > 0 ||
            Object.keys(nextTestCaseErrors).length > 0
        ) {
            return;
        }

        setIsSubmitting(true);

        try {
            let examples: CreateDsaQuestionBody['examples'];
            if (form.examplesJson.trim()) {
                examples = JSON.parse(
                    form.examplesJson,
                ) as CreateDsaQuestionBody['examples'];
            }

            const starterCode = form.starterCodeJson.trim()
                ? parseStarterCodeFromFormJson(form.starterCodeJson)
                : undefined;

            const body: CreateDsaQuestionBody = {
                slug: form.slug.trim(),
                title: form.title.trim(),
                description: form.description.trim(),
                inputFormat: form.inputFormat.trim() || undefined,
                outputFormat: form.outputFormat.trim() || undefined,
                constraints: form.constraints.trim() || undefined,
                difficulty: form.difficulty,
                topics: splitList(form.topics),
                timeLimitMs: DEFAULT_TIME_LIMIT_MS,
                memoryLimitKb: DEFAULT_MEMORY_LIMIT_KB,
                hints: splitList(form.hints),
                isPublished: form.isPublished,
                examples,
                starterCode,
                testCases: form.testCases
                    .filter(
                        (row) =>
                            row.input.trim() && row.expectedOutput.trim(),
                    )
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
                    : `Failed to ${isEditing ? 'update' : 'create'} DSA question`,
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
                            {isEditing ? 'Edit DSA question' : 'DSA question'}
                        </CardTitle>
                        <CardDescription>
                            Required fields plus optional starter code, examples, and
                            test cases.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm font-bold text-rose-600">
                            Inputs should be in accordance to the placeholders and
                            messages given with fields for smooth creation of
                            question.
                        </p>

                        {error ? (
                            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
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
                                    placeholder="two-sum"
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
                                placeholder="Two Sum"
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
                                className="input-base min-h-32"
                                value={form.description}
                                onChange={(e) =>
                                    updateField('description', e.target.value)
                                }
                                onBlur={(e) =>
                                    handleFieldBlur('description', e.target.value)
                                }
                                placeholder={DESCRIPTION_PLACEHOLDER}
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
                                <Label htmlFor="inputFormat">Input format</Label>
                                <textarea
                                    id="inputFormat"
                                    className="input-base min-h-20 font-mono text-xs"
                                    value={form.inputFormat}
                                    onChange={(e) =>
                                        updateField('inputFormat', e.target.value)
                                    }
                                    onBlur={(e) =>
                                        handleFieldBlur(
                                            'inputFormat',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="{ nums: number[], target: number }"
                                    aria-invalid={Boolean(fieldErrors.inputFormat)}
                                />
                                {fieldErrors.inputFormat ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.inputFormat}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="outputFormat">Output format</Label>
                                <textarea
                                    id="outputFormat"
                                    className="input-base min-h-20 font-mono text-xs"
                                    value={form.outputFormat}
                                    onChange={(e) =>
                                        updateField('outputFormat', e.target.value)
                                    }
                                    onBlur={(e) =>
                                        handleFieldBlur(
                                            'outputFormat',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="number[]"
                                    aria-invalid={Boolean(fieldErrors.outputFormat)}
                                />
                                {fieldErrors.outputFormat ? (
                                    <p className="text-sm text-rose-600">
                                        {fieldErrors.outputFormat}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-1 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2 text-sm text-rose-600">
                            <p>
                                <span className="font-semibold">*</span> Input
                                format must be an object type describing JSON keys.
                            </p>
                            <p>
                                <span className="font-semibold">*</span> Output
                                format is a single return type.
                            </p>
                            <p className="font-semibold">Allowed data types:</p>
                            <ul className="list-disc space-y-0.5 pl-5">
                                <li>
                                    <code>number</code>, <code>number[]</code>,{' '}
                                    <code>number[][]</code>
                                </li>
                                <li>
                                    <code>string</code>, <code>string[]</code>,{' '}
                                    <code>string[][]</code>
                                </li>
                                <li>
                                    <code>boolean</code>
                                </li>
                                <li>
                                    <code>(number|null)[]</code> for trees / linked
                                    lists
                                </li>
                            </ul>
                            <p>
                                Examples: input{' '}
                                <code>{'{ nums: number[], target: number }'}</code>
                                , output <code>number[]</code>
                            </p>
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
                                onBlur={(e) =>
                                    handleFieldBlur('constraints', e.target.value)
                                }
                                placeholder={
                                    '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9'
                                }
                                aria-invalid={Boolean(fieldErrors.constraints)}
                            />
                            {fieldErrors.constraints ? (
                                <p className="text-sm text-rose-600">
                                    {fieldErrors.constraints}
                                </p>
                            ) : null}
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
                                        'Stored as string[] — one per line:\narrays\nhash-table'
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
                                        'Stored as string[] — one per line:\nUse a hash map\nCheck complement = target - nums[i]'
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

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="timeLimitMs">Time limit (ms)</Label>
                                <Input
                                    id="timeLimitMs"
                                    type="number"
                                    value={DEFAULT_TIME_LIMIT_MS}
                                    readOnly
                                    disabled
                                />
                                <p className="text-xs text-zinc-500">
                                    Fixed at {DEFAULT_TIME_LIMIT_MS} ms (cannot be
                                    changed).
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="memoryLimitKb">
                                    Memory limit (KB)
                                </Label>
                                <Input
                                    id="memoryLimitKb"
                                    type="number"
                                    value={DEFAULT_MEMORY_LIMIT_KB}
                                    readOnly
                                    disabled
                                />
                                <p className="text-xs text-zinc-500">
                                    Fixed at {DEFAULT_MEMORY_LIMIT_KB} KB (cannot be
                                    changed).
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="examplesJson">Examples JSON</Label>
                            <textarea
                                id="examplesJson"
                                className="input-base min-h-28 font-mono text-xs"
                                value={form.examplesJson}
                                onChange={(e) =>
                                    updateField('examplesJson', e.target.value)
                                }
                                onBlur={(e) =>
                                    handleFieldBlur('examplesJson', e.target.value)
                                }
                                placeholder={`[\n  {\n    "input": "nums = [2,7,11,15]\\ntarget = 9",\n    "output": "[0,1]",\n    "explanation": "Because nums[0] + nums[1] == 9"\n  }\n]`}
                                aria-invalid={Boolean(fieldErrors.examplesJson)}
                            />
                            {fieldErrors.examplesJson ? (
                                <p className="text-sm text-rose-600">
                                    {fieldErrors.examplesJson}
                                </p>
                            ) : (
                                <p className="text-xs text-zinc-500">
                                    Optional. Display strings shown to users (not
                                    raw judge JSON).
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
                </Card>

                <Card className="overflow-hidden border-emerald-200/60 shadow-soft">
                    <CardHeader>
                        <CardTitle>Starter code</CardTitle>
                        <CardDescription>
                            Each language is an array of lines: boilerplate, then
                            the method-signature line to edit, then body
                            boilerplate. Saved to the DB as joined strings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="starterCodeJson">
                                Starter code JSON
                            </Label>
                            <textarea
                                id="starterCodeJson"
                                className="input-base min-h-64 font-mono text-xs"
                                value={form.starterCodeJson}
                                onChange={(e) =>
                                    updateField('starterCodeJson', e.target.value)
                                }
                                onBlur={(e) =>
                                    handleFieldBlur(
                                        'starterCodeJson',
                                        e.target.value,
                                    )
                                }
                                aria-invalid={Boolean(fieldErrors.starterCodeJson)}
                            />
                            {fieldErrors.starterCodeJson ? (
                                <p className="text-sm text-rose-600">
                                    {fieldErrors.starterCodeJson}
                                </p>
                            ) : (
                                <p className="text-sm text-rose-600">
                                    <span className="font-semibold">*</span> Edit
                                    only the method-signature line (name, params,
                                    return type). Keep the surrounding boilerplate
                                    lines as-is.
                                </p>
                            )}
                        </div>

                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-emerald-200/60 shadow-soft">
                    <CardHeader>
                        <CardTitle>Test cases</CardTitle>
                        <CardDescription>
                            Judge I/O is stored as JSON strings. Rows without both
                            input and expected output are skipped.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fieldErrors.testCases ? (
                            <p className="text-sm text-rose-600">
                                {fieldErrors.testCases}
                            </p>
                        ) : null}

                        {form.testCases.map((row, index) => (
                            <div
                                key={index}
                                className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4"
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
                                        onBlur={(e) =>
                                            handleTestCaseBlur(index, {
                                                input: e.target.value,
                                            })
                                        }
                                        placeholder='{"nums":[2,7,11,15],"target":9}'
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
                                        onBlur={(e) =>
                                            handleTestCaseBlur(index, {
                                                expectedOutput: e.target.value,
                                            })
                                        }
                                        placeholder="[0,1]"
                                    />
                                </div>
                                {testCaseErrors[index] ? (
                                    <p className="text-sm text-rose-600">
                                        {testCaseErrors[index]}
                                    </p>
                                ) : null}
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
        </AdminPageShell>
    );
}

export default function AdminCreateDsaPage() {
    return (
        <Suspense fallback={<AdminAuthGate hydrated={false} />}>
            <AdminCreateDsaPageContent />
        </Suspense>
    );
}
