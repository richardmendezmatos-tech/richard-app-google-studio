/**
 * Image Optimization Service
 * 
 * Handles automatic image compression, WebP conversion, blur placeholder generation,
 * and responsive image sizes for optimal performance.
 */

export interface OptimizedImageResult {
    original: {
        url: string;
        size: number;
    };
    optimized: {
        webp: string;
        jpeg: string;
        thumbnail: string;
        blurPlaceholder: string;
    };
    metadata: {
        width: number;
        height: number;
        format: string;
        compressionRatio: number;
    };
}

export interface ImageSizes {
    thumbnail: Blob; // 200px
    medium: Blob;    // 800px
    large: Blob;     // 1600px
}

/**
 * Compress image using Canvas API
 */
export const compressImage = async (
    file: File,
    quality: number = 0.85,
    maxWidth: number = 1600
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Optimization timed out (15s). Try a smaller image or different format.'));
        }, 15000);

        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            clearTimeout(timeoutId);
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            // Fallback to DOM Canvas to avoid OffscreenCanvas quirks
            const canvas = document.createElement('canvas');

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Enable image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Failed to create blob'));
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('Failed to load image. File may be corrupted or unsupported format.'));
        };

        reader.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('Failed to read file.'));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Convert image to WebP format
 */
export const convertToWebP = async (
    file: File,
    quality: number = 0.85
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('WebP conversion failed'));
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        reader.readAsDataURL(file);
    });
};

/**
 * Generate blur placeholder (tiny base64 data URI)
 */
export const generateBlurPlaceholder = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            // Create tiny canvas (10px width maintains aspect ratio)
            const canvas = document.createElement('canvas');
            const aspectRatio = img.height / img.width;
            canvas.width = 10;
            canvas.height = Math.round(10 * aspectRatio);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Disable smoothing for pixelated blur effect
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to data URI with low quality
            const dataUri = canvas.toDataURL('image/jpeg', 0.1);
            resolve(dataUri);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        reader.readAsDataURL(file);
    });
};

/**
 * Generate responsive image sizes
 */
export const generateResponsiveSizes = async (file: File): Promise<ImageSizes> => {
    const [thumbnail, medium, large] = await Promise.all([
        compressImage(file, 0.8, 200),   // Thumbnail
        compressImage(file, 0.85, 800),  // Medium
        compressImage(file, 0.9, 1600),  // Large
    ]);

    return { thumbnail, medium, large };
};

/**
 * Get image dimensions
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        reader.readAsDataURL(file);
    });
};

/**
 * Check if browser supports WebP
 */
export const supportsWebP = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;

        canvas.toBlob(
            (blob) => resolve(blob !== null),
            'image/webp'
        );
    });
};

/**
 * Calculate file size reduction
 */
export const calculateSavings = (originalSize: number, optimizedSize: number) => {
    const savings = originalSize - optimizedSize;
    const percentage = ((savings / originalSize) * 100).toFixed(1);

    return {
        bytes: savings,
        percentage: parseFloat(percentage),
        formatted: `${(savings / 1024 / 1024).toFixed(2)} MB (${percentage}%)`
    };
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']; // Removed HEIC support until heic2any is added
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Formato no válido. Usa JPEG, PNG o WebP. (HEIC/iPhone requiere conversión previa)'
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'Archivo muy grande. Máximo 10MB.'
        };
    }

    return { valid: true };
};

/**
 * Convert blob to base64
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Main optimization pipeline
 * Processes image and returns all optimized versions
 */
export const optimizeImageComplete = async (
    file: File,
    options: {
        quality?: number;
        maxWidth?: number;
        generateWebP?: boolean;
    } = {}
): Promise<{
    jpeg: Blob;
    webp?: Blob;
    thumbnail: Blob;
    blurPlaceholder: string;
    dimensions: { width: number; height: number };
    savings: { bytes: number; percentage: number };
}> => {
    const { quality = 0.85, maxWidth = 1600, generateWebP = true } = options;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Get original dimensions
    const dimensions = await getImageDimensions(file);

    // Generate optimized versions in parallel
    const [jpeg, webp, thumbnail, blurPlaceholder] = await Promise.all([
        compressImage(file, quality, maxWidth),
        generateWebP ? convertToWebP(file, quality) : Promise.resolve(undefined),
        compressImage(file, 0.8, 200),
        generateBlurPlaceholder(file),
    ]);

    // Calculate savings
    const savings = calculateSavings(file.size, jpeg.size);

    return {
        jpeg,
        webp,
        thumbnail,
        blurPlaceholder,
        dimensions,
        savings,
    };
};
