'use client';

import {
    useEffect,
    useRef,
    type ClipboardEvent,
    type KeyboardEvent,
} from 'react';

interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    length?: number;
    autoFocus?: boolean;
}

export function OtpInput({
    value,
    onChange,
    onBlur,
    disabled = false,
    length = 6,
    autoFocus = true,
}: OtpInputProps) {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const digits = Array.from({ length }, (_, index) => value[index] ?? '');

    useEffect(() => {
        if (autoFocus && !disabled) {
            inputsRef.current[0]?.focus();
        }
    }, [autoFocus, disabled]);

    function updateDigit(index: number, digit: string) {
        if (!/^\d?$/.test(digit)) {
            return;
        }

        const next = digits.slice();
        next[index] = digit;
        onChange(next.join('').slice(0, length));

        if (digit && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }

        if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault();
            inputsRef.current[index - 1]?.focus();
        }

        if (event.key === 'ArrowRight' && index < length - 1) {
            event.preventDefault();
            inputsRef.current[index + 1]?.focus();
        }
    }

    function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
        event.preventDefault();
        const pasted = event.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, length);

        if (!pasted) {
            return;
        }

        onChange(pasted);
        const focusIndex = Math.min(pasted.length, length - 1);
        inputsRef.current[focusIndex]?.focus();
    }

    return (
        <div className="flex items-center justify-between gap-2" role="group" aria-label="One-time password">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    aria-label={`Digit ${index + 1}`}
                    onChange={(event) =>
                        updateDigit(index, event.target.value.replace(/\D/g, '').slice(-1))
                    }
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    onBlur={(event) => {
                        const next = event.relatedTarget as Node | null;
                        const leavingGroup =
                            !next ||
                            !inputsRef.current.some((input) => input === next);
                        if (leavingGroup) {
                            onBlur?.();
                        }
                    }}
                    className="input-base h-12 w-11 px-0 text-center text-lg font-semibold tracking-widest sm:h-12 sm:w-12"
                />
            ))}
        </div>
    );
}