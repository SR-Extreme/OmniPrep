'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Restores the in-memory access token from the httpOnly refresh cookie once per load.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
    const restoreSession = useAuthStore((s) => s.restoreSession);

    useEffect(() => {
        void restoreSession();
    }, [restoreSession]);

    return <>{children}</>;
}
