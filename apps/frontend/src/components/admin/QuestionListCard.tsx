'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { AdminQuestionListItem } from '@/types/admin';
import type { Difficulty } from '@/types/dsa';

export interface QuestionListCardProps {
    question: AdminQuestionListItem;
    mode: 'published' | 'draft';
    metricLabel?: string;
    onEdit?: (question: AdminQuestionListItem) => void;
    onPublish?: (question: AdminQuestionListItem) => void;
    onDelete?: (question: AdminQuestionListItem) => void;
    isPublishing?: boolean;
    isDeleting?: boolean;
}

function difficultyBadgeClass(difficulty: Difficulty): string {
    switch (difficulty) {
        case 'EASY':
            return 'badge-easy';
        case 'MEDIUM':
            return 'badge-medium';
        case 'HARD':
            return 'badge-hard';
        default:
            return 'badge-easy';
    }
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export function QuestionListCard({
    question,
    mode,
    metricLabel = 'Submissions',
    onEdit,
    onPublish,
    onDelete,
    isPublishing = false,
    isDeleting = false,
}: QuestionListCardProps) {
    const isBusy = isPublishing || isDeleting;

    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-white via-white to-emerald-50/50 p-5 shadow-soft transition duration-300 hover:shadow-elevated sm:p-6"
        >
            <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-200/30 to-transparent"
                aria-hidden="true"
            />

            <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-zinc-900 sm:text-lg">
                        {question.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className={difficultyBadgeClass(question.difficulty)}>
                            {question.difficulty.charAt(0) +
                                question.difficulty.slice(1).toLowerCase()}
                        </span>
                        {question.topics.length > 0 ? (
                            <span className="text-zinc-500">
                                {question.topics.slice(0, 3).join(' · ')}
                                {question.topics.length > 3
                                    ? ` +${question.topics.length - 3}`
                                    : ''}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    {mode === 'draft' && onEdit ? (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => onEdit(question)}
                        >
                            Edit
                        </Button>
                    ) : null}
                    {mode === 'draft' && onPublish ? (
                        <Button
                            type="button"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => onPublish(question)}
                        >
                            {isPublishing ? 'Publishing…' : 'Publish'}
                        </Button>
                    ) : null}
                    {onDelete ? (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => onDelete(question)}
                        >
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    ) : null}
                </div>
            </div>

            <div className="relative mt-4 border-t border-zinc-100 pt-4">
                {mode === 'published' ? (
                    <dl className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                        <div>
                            <dt className="section-label">{metricLabel}</dt>
                            <dd className="mt-1 font-medium text-zinc-900">
                                {question.totalSubmissions}
                            </dd>
                        </div>
                        <div>
                            <dt className="section-label">Published</dt>
                            <dd className="mt-1 font-medium text-zinc-900">
                                {formatDate(question.publishedAt)}
                            </dd>
                        </div>
                    </dl>
                ) : (
                    <div className="text-sm text-zinc-600">
                        <p className="section-label">Last edited</p>
                        <p className="mt-1 font-medium text-zinc-900">
                            {formatDate(question.updatedAt)}
                        </p>
                    </div>
                )}
            </div>
        </motion.article>
    );
}
