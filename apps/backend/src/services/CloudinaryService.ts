import { v2 as cloudinary } from 'cloudinary';
import { isCloudinaryConfigured, env } from '../config/env.js';

export class CloudinaryError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'CONFIG_ERROR'
            | 'INVALID_FILE'
            | 'UPLOAD_FAILED',
    ) {
        super(message);
        this.name = 'CloudinaryError';
    }
}

const DIAGRAM_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
])

const RESUME_MIME_TYPES = new Set(['application/pdf']);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface UploadDiagramInput {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}

export interface UploadResumeInput {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}

let cloudinaryConfigured = false;

function ensureCloudinaryReady(): void {
    if (!isCloudinaryConfigured()) {
        throw new CloudinaryError(
            'Cloudinary is not configured', 'CONFIG_ERROR',
        );
    }

    if (!cloudinaryConfigured) {
        cloudinary.config({
            cloud_name: env.CLOUDINARY_CLOUD_NAME!, //! => not null or undefined
            api_key: env.CLOUDINARY_API_KEY!,
            api_secret: env.CLOUDINARY_API_SECRET!,
        });
        cloudinaryConfigured = true;
    }
}

function validateFileSize(buffer: Buffer, label: string): void {
    if (buffer.length === 0) {
        throw new CloudinaryError(`Uploaded ${label} is empty.`, 'INVALID_FILE');
    }
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
        throw new CloudinaryError(
            `${label} exceeds maximum size of 5 MB.`,
            'INVALID_FILE',
        );
    }
}

function validateDiagramFile(input: UploadDiagramInput): void {
    if (!DIAGRAM_MIME_TYPES.has(input.mimetype)) {
        throw new CloudinaryError(
            'Unsupported image type. Allowed: JPEG, PNG, WebP, GIF.',
            'INVALID_FILE',
        );
    }
    validateFileSize(input.buffer, 'image');
}

function validateResumeFile(input: UploadResumeInput): void {
    if (!RESUME_MIME_TYPES.has(input.mimetype)) {
        throw new CloudinaryError(
            'Unsupported resume type. Only PDF is supported.',
            'INVALID_FILE',
        );
    }

    validateFileSize(input.buffer, 'resume');
}

function uploadToCloudinary(
    input: { buffer: Buffer },
    options: {
        folder: string;
        resourceType: 'image' | 'raw';
        missingUrlMessage: string;
    },
): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder,
                resource_type: options.resourceType,
                use_filename: true,
                unique_filename: true,
                overwrite: false,
            },
            (error, result) => {
                if (error) {
                    reject(
                        new CloudinaryError(
                            error.message || 'Cloudinary upload failed.',
                            'UPLOAD_FAILED',
                        ),
                    );
                    return;
                }

                const url = result?.secure_url;

                if (!url) {
                    reject(
                        new CloudinaryError(
                            options.missingUrlMessage,
                            'UPLOAD_FAILED',
                        ),
                    );
                    return;
                }

                resolve(url);
            },
        );

        //call which actually calls uploadstream and upload image
        //image.buffer has the raw image data
        uploadStream.end(input.buffer);
    });
}

export async function uploadSystemDesignDiagram(
    input: UploadDiagramInput,
    userId: string,
): Promise<string> {
    ensureCloudinaryReady();
    validateDiagramFile(input);

    return uploadToCloudinary(input, {
        folder: `omniprep/system-design/${userId}`,
        resourceType: 'image',
        missingUrlMessage: 'Cloudinary returned no image URL.',
    });
}

export async function uploadBehavioralResume(
    input: UploadResumeInput,
    userId: string,
): Promise<string> {
    ensureCloudinaryReady();
    validateResumeFile(input);

    return uploadToCloudinary(input, {
        folder: `omniprep/behavioral/${userId}`,
        resourceType: 'raw',
        missingUrlMessage: 'Cloudinary returned no resume URL.',
    });
}