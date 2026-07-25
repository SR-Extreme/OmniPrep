import { apiRequest } from './client';
import type {
    CheckoutSessionResponse,
    CreateCheckoutSessionBody,
    PlanCatalogResponse,
    PremiumStatusResponse,
} from '@/types/billing';

export function getPlanCatalog(): Promise<PlanCatalogResponse> {
    return apiRequest<PlanCatalogResponse>('/api/billing/plans');
}

export function getPremiumStatus(
    accessToken: string,
): Promise<PremiumStatusResponse> {
    return apiRequest<PremiumStatusResponse>('/api/billing/status', {
        token: accessToken,
    });
}

export function createCheckoutSession(
    accessToken: string,
    body: CreateCheckoutSessionBody,
): Promise<CheckoutSessionResponse> {
    return apiRequest<CheckoutSessionResponse>('/api/billing/checkout', {
        method: 'POST',
        token: accessToken,
        body,
    });
}
