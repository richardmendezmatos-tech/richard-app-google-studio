
// Image Optimizer Worker

export interface WorkerMessage {
    file: File;
    id: string;
    options?: {
        quality?: number;
        maxWidth?: number;
    };
}

export interface WorkerResponse {
    id: string;
    success: boolean;
    data?: {
        blob: Blob;
        width: number;
        height: number;
    };
    error?: string;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    const { file, id, options } = e.data;
    const quality = options?.quality || 0.85;
    const maxWidth = options?.maxWidth || 1600;

    try {
        const bitmap = await createImageBitmap(file);
        let width = bitmap.width;
        let height = bitmap.height;

        // Calculate new dimensions
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get OffscreenCanvas context');
        }

        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, width, height);

        // Compress
        const blob = await canvas.convertToBlob({
            type: 'image/jpeg',
            quality,
        });

        self.postMessage({
            id,
            success: true,
            data: {
                blob,
                width,
                height,
            },
        } as WorkerResponse);

    } catch (err) {
        self.postMessage({
            id,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown worker error',
        } as WorkerResponse);
    }
};
