import {
    AI_QUOTA_EXCEEDED_MESSAGE,
    isAiQuotaExhaustedError,
} from '@/lib/api/client';

type ActionErrorAlertProps = {
    message: string;
};

export function ActionErrorAlert({ message }: ActionErrorAlertProps) {
    const isQuota = isAiQuotaExhaustedError(message);

    return (
        <div
            className={
                isQuota
                    ? 'rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'
                    : 'rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'
            }
            role="alert"
        >
            {isQuota ? AI_QUOTA_EXCEEDED_MESSAGE : message}
        </div>
    );
}
