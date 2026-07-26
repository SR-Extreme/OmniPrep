const DRAFT_PREFIX = 'omniprep:practice:';

export function practiceDraftKey(
    section: 'dsa' | 'system-design' | 'behavioral',
    entityId: string,
    suffix?: string,
): string {
    return suffix
        ? `${DRAFT_PREFIX}${section}:${entityId}:${suffix}`
        : `${DRAFT_PREFIX}${section}:${entityId}`;
}

export function readPracticeDraft<T>(key: string): T | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function writePracticeDraft(key: string, value: unknown): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Quota / private mode — ignore; server resume still works where applicable.
    }
}

export function clearPracticeDraft(key: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.removeItem(key);
    } catch {
        // ignore
    }
}
