interface FieldErrorProps {
    message?: string | null;
    id?: string;
}

/** Red inline error shown below a form field after blur / submit validation. */
export function FieldError({ message, id }: FieldErrorProps) {
    if (!message) {
        return null;
    }

    return (
        <p id={id} className="mt-1.5 text-sm text-rose-600" role="alert">
            {message}
        </p>
    );
}
