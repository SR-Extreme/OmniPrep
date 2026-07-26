'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

type TopicMultiSelectProps = {
    topics: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label?: string;
    emptyLabel?: string;
};

export function TopicMultiSelect({
    topics,
    selected,
    onChange,
    label = 'Topics',
    emptyLabel = 'All topics',
}: TopicMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const listId = useId();

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    function toggleTopic(topic: string) {
        if (selected.includes(topic)) {
            onChange(selected.filter((item) => item !== topic));
            return;
        }
        onChange([...selected, topic]);
    }

    const summary =
        selected.length === 0
            ? emptyLabel
            : selected.length === 1
              ? selected[0]
              : `${selected.length} topics selected`;

    return (
        <div ref={rootRef} className="relative">
            <label
                htmlFor={`${listId}-trigger`}
                className="block text-sm font-medium text-zinc-700"
            >
                {label}
            </label>
            <button
                id={`${listId}-trigger`}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setOpen((current) => !current)}
                className="input-base mt-1.5 flex w-full items-center justify-between gap-2 text-left"
            >
                <span className={selected.length === 0 ? 'text-zinc-400' : 'text-zinc-900'}>
                    {summary}
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-500 transition ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open ? (
                <div
                    id={listId}
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-soft"
                >
                    {topics.length === 0 ? (
                        <p className="px-2 py-1.5 text-sm text-zinc-500">
                            No topics available
                        </p>
                    ) : (
                        topics.map((topic) => {
                            const checked = selected.includes(topic);
                            return (
                                <label
                                    key={topic}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleTopic(topic)}
                                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>{topic}</span>
                                </label>
                            );
                        })
                    )}
                </div>
            ) : null}
        </div>
    );
}
