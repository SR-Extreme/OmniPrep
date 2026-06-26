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

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
])

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface UploadDiagramInput {
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

function validateDiagramFile(input: UploadDiagramInput): void {
    if (!ALLOWED_MIME_TYPES.has(input.mimetype)) {
        throw new CloudinaryError(

            'Unsupported image type. Allowed: JPEG, PNG, WebP, GIF.',
            'INVALID_FILE',
        )
    }

    if (input.buffer.length === 0) {
        throw new CloudinaryError('Uploaded image is empty.', 'INVALID_FILE');
    }

    if (input.buffer.length > MAX_FILE_SIZE_BYTES) {
        throw new CloudinaryError(
            'Image exceeds maximum size of 5 MB.',
            'INVALID_FILE',
        );
    }
}

export async function uploadSystemDesignDiagram(
    input: UploadDiagramInput,
    userId: string,
): Promise<string> {
    ensureCloudinaryReady();
    validateDiagramFile(input);

    const folder = `omniprep/system-design/${userId}`;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: 'image',
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
                            'Cloudinary returned no image URL.',
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