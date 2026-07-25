import { apiRequest } from './client';
import type { PlatformStats } from '@/types/platform';

export function getPlatformStats(): Promise<PlatformStats> {
    return apiRequest<PlatformStats>('/api/platform/stats');
}
