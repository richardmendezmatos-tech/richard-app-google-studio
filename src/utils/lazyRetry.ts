
/**
 * Utility to wrap React.lazy imports with a retry mechanism.
 * Useful for handling "Failed to fetch dynamically imported module" errors
 * which occur when a new version of the app is deployed and old hashes are removed.
 */
export function lazyRetry<T extends React.ComponentType<any>>(
    componentImport: () => Promise<{ default: T }>
): Promise<{ default: T }> {
    return componentImport().catch((error) => {
        // Check if the error is a ChunkLoadError or related to dynamic import failure
        const isChunkError = /Failed to fetch dynamically imported module|Loading chunk|Llamada al módulo fallida/.test(error.message);

        // Only retry and force reload if it's a chunk error
        if (isChunkError) {
            console.warn("Chunk load error detected. Forcing page reload to get latest version...");
            window.location.reload();
        }

        throw error;
    });
}
