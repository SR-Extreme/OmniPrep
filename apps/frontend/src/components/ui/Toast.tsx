'use client';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error';

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
    for (const listener of listeners) {
        listener(toasts);
    }
}

export function toast(message: string, type: ToastType = 'success') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    toasts = [...toasts, { id, type, message }];
    emit();

    window.setTimeout(() => {
        toasts = toasts.filter((item) => item.id !== id);
        emit();
    }, 4000);
}

export function ToastViewport() {
    const [items, setItems] = useState<ToastItem[]>([]);

    useEffect(() => {
        const listener: Listener = (next) => setItems(next);
        listeners.add(listener);
        setItems(toasts);

        return () => {
            listeners.delete(listener);
        };
    }, []);

    if (items.length === 0) {
        return null;
    }

    return (
        <div
            className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
            aria-live="polite"
        >
            {items.map((item) => (
                <div
                    key={item.id}
                    role="status"
                    className={[
                        'pointer-events-auto w-full max-w-sm rounded-md border px-4 py-3 text-sm shadow-lg',
                        item.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-rose-200 bg-rose-50 text-rose-700',
                    ].join(' ')}
                >
                    {item.message}
                </div>
            ))}
        </div>
    );
}