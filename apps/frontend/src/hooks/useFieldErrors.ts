'use client';

import { useCallback, useState } from 'react';

/**
 * Per-field error map for blur / submit validation.
 * Call `touch(field, validate())` on blur; clear on change when the user edits.
 */
export function useFieldErrors<T extends string>() {
    const [errors, setErrors] = useState<Partial<Record<T, string>>>({});

    const touch = useCallback((field: T, message: string | undefined) => {
        setErrors((prev) => {
            if (!message) {
                if (prev[field] === undefined) {
                    return prev;
                }
                const next = { ...prev };
                delete next[field];
                return next;
            }
            if (prev[field] === message) {
                return prev;
            }
            return { ...prev, [field]: message };
        });
    }, []);

    const clear = useCallback((field?: T) => {
        if (field === undefined) {
            setErrors({});
            return;
        }
        setErrors((prev) => {
            if (prev[field] === undefined) {
                return prev;
            }
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const setMany = useCallback((next: Partial<Record<T, string>>) => {
        setErrors(next);
    }, []);

    const hasErrors = Object.keys(errors).length > 0;

    return { errors, touch, clear, setMany, hasErrors };
}
