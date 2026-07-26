/** Shared field validators aligned with backend Zod schemas. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;
const OTP_RE = /^\d{6}$/;

export const LIMITS = {
    name: 100,
    passwordMin: 8,
    passwordMax: 128,
    phone: 10,
    otp: 6,
    answer: 20_000,
    candidateQuestions: 10_000,
    textAnswer: 50_000,
    sourceCode: 100_000,
    search: 200,
    companyRole: 100,
    fileMaxBytes: 5 * 1024 * 1024,
} as const;

export function validateEmail(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Email is required';
    }
    if (!EMAIL_RE.test(trimmed)) {
        return 'Invalid email address';
    }
    return undefined;
}

export function validatePassword(
    value: string,
    options: { required?: boolean; minLength?: number; maxLength?: number } = {},
): string | undefined {
    const {
        required = true,
        minLength = LIMITS.passwordMin,
        maxLength = LIMITS.passwordMax,
    } = options;

    if (!value) {
        return required ? 'Password is required' : undefined;
    }
    if (value.length < minLength) {
        return `Password must be at least ${minLength} characters`;
    }
    if (value.length > maxLength) {
        return `Password must be at most ${maxLength} characters`;
    }
    return undefined;
}

/** Login password: required but no min length on the client beyond non-empty. */
export function validateLoginPassword(value: string): string | undefined {
    if (!value) {
        return 'Password is required';
    }
    return undefined;
}

export function validateConfirmPassword(
    password: string,
    confirmPassword: string,
): string | undefined {
    if (!confirmPassword) {
        return 'Confirm password is required';
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return undefined;
}

export function validateName(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Name is required';
    }
    if (trimmed.length > LIMITS.name) {
        return `Name must be at most ${LIMITS.name} characters`;
    }
    return undefined;
}

export function validatePhone(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Phone number is required';
    }
    if (!PHONE_RE.test(trimmed)) {
        return 'Phone number must be exactly 10 digits';
    }
    return undefined;
}

export function validateOtp(value: string): string | undefined {
    if (!OTP_RE.test(value)) {
        return 'OTP must be exactly 6 digits';
    }
    return undefined;
}

export function validateRequiredText(
    value: string,
    label: string,
    maxLength?: number,
): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return `${label} is required`;
    }
    if (maxLength != null && trimmed.length > maxLength) {
        return `${label} must be at most ${maxLength.toLocaleString()} characters`;
    }
    return undefined;
}

export function validateOptionalMaxLength(
    value: string,
    label: string,
    maxLength: number,
): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }
    if (trimmed.length > maxLength) {
        return `${label} must be at most ${maxLength.toLocaleString()} characters`;
    }
    return undefined;
}

export function validateAnswer(value: string): string | undefined {
    return validateRequiredText(value, 'Answer', LIMITS.answer);
}

export function validateCandidateQuestions(value: string): string | undefined {
    return validateRequiredText(
        value,
        'Questions',
        LIMITS.candidateQuestions,
    );
}

export function validateTextAnswer(value: string): string | undefined {
    return validateOptionalMaxLength(value, 'Text answer', LIMITS.textAnswer);
}

export function validateFollowUpAnswer(
    value: string,
    index: number,
): string | undefined {
    return validateRequiredText(value, `Follow-up answer ${index}`, LIMITS.answer);
}

export function validateSourceCode(value: string): string | undefined {
    if (!value.trim()) {
        return 'Source code is required';
    }
    if (value.length > LIMITS.sourceCode) {
        return 'Source code is too large (max 100,000 characters)';
    }
    return undefined;
}

export function validateSearchQuery(value: string): string | undefined {
    return validateOptionalMaxLength(value, 'Search', LIMITS.search);
}

export function validateCompanyOrRoleFilter(
    value: string,
    label: string,
): string | undefined {
    return validateOptionalMaxLength(value, label, LIMITS.companyRole);
}

export function validatePdfFile(file: File | null | undefined): string | undefined {
    if (!file) {
        return 'Resume PDF is required';
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        return 'Resume must be a PDF file';
    }
    if (file.size > LIMITS.fileMaxBytes) {
        return 'Resume must be at most 5 MB';
    }
    return undefined;
}

const AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DIAGRAM_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

export function validateAvatarFile(file: File | null | undefined): string | undefined {
    if (!file) {
        return 'Image is required';
    }
    if (!AVATAR_TYPES.has(file.type)) {
        return 'Image must be JPEG, PNG, or WebP';
    }
    if (file.size > LIMITS.fileMaxBytes) {
        return 'Image must be at most 5 MB';
    }
    return undefined;
}

export function validateDiagramFile(file: File | null | undefined): string | undefined {
    if (!file) {
        return undefined;
    }
    if (!DIAGRAM_TYPES.has(file.type)) {
        return 'Diagram must be JPEG, PNG, WebP, or GIF';
    }
    if (file.size > LIMITS.fileMaxBytes) {
        return 'Diagram must be at most 5 MB';
    }
    return undefined;
}

export function validateSystemDesignInitialContent(
    textAnswer: string,
    diagramFile: File | null | undefined,
): string | undefined {
    const textError = validateTextAnswer(textAnswer);
    if (textError) {
        return textError;
    }
    const diagramError = validateDiagramFile(diagramFile);
    if (diagramError) {
        return diagramError;
    }
    if (!textAnswer.trim() && !diagramFile) {
        return 'Provide a text answer and/or a diagram';
    }
    return undefined;
}

export function validateBehavioralRole(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Role is required';
    }
    if (trimmed.length > LIMITS.companyRole) {
        return `Role must be at most ${LIMITS.companyRole} characters`;
    }
    return undefined;
}
