import pdfParse from 'pdf-parse';

export class ResumeParserError extends Error {
    constructor(
        message: string,
        public readonly code: 'INVALID_FILE' | 'PARSE_FAILED' | 'EMPTY_TEXT',
    ) {
        super(message);
        this.name = 'ResumeParserError';
    }
}

const ALLOWED_MIME_TYPES = new Set(['application/pdf']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ParseResumeInput {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}

function normalizeResumeText(raw: string): string {
    return raw
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

export function validateResumeFile(input: ParseResumeInput): void {
    if (!ALLOWED_MIME_TYPES.has(input.mimetype)) {
        throw new ResumeParserError(
            'Unsupported resume type. Only PDF is supported.',
            'INVALID_FILE',
        );
    }

    if (input.buffer.length === 0) {
        throw new ResumeParserError('Uploaded resume is empty.', 'INVALID_FILE');
    }

    if (input.buffer.length > MAX_FILE_SIZE_BYTES) {
        throw new ResumeParserError(
            'Resume exceeds maximum size of 5 MB.',
            'INVALID_FILE',
        );
    }
}

export async function extractResumeText(input: ParseResumeInput): Promise<string> {
    validateResumeFile(input);

    try {
        const parsed = await pdfParse(input.buffer);
        const text = normalizeResumeText(parsed.text ?? '');

        if (text.length === 0) {
            throw new ResumeParserError(
                'Resume PDF contains no extractable text.',
                'EMPTY_TEXT',
            );
        }

        return text;
    } catch (err) {
        if (err instanceof ResumeParserError) {
            throw err;
        }

        const message = err instanceof Error ? err.message : 'Unknown PDF parsing error';

        throw new ResumeParserError(
            `Failed to parse resume PDF: ${message}`,
            'PARSE_FAILED',
        );
    }
}