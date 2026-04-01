/**
 * env.ts - Universal Environment Variable Helper
 * -----------------------------------------------------------------------------
 * Bridges the gap between Vite (process.env) and Next.js (process.env).
 * Supports standard VITE_ and NEXT_PUBLIC_ prefixes.
 */

export const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof window === 'undefined') {
    // Server-side (Node.js/Next.js)
    return process.env[key] || defaultValue;
  }

  // Client-side
  try {
    // 1. Try process.env (Next.js/Webpack polyfill)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }

    // 2. Try process.env (Vite/ESM) - SAFELY
    // Use an indexer to avoid TS errors for process.env
    const meta = (globalThis as any).import?.meta;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {
    // Silent fail for client-side access
  }

  return defaultValue;
};

/**
 * Specifically for Antigravity variables which can have multiple prefixes.
 */
export const getAntigravityEnv = (baseKey: string, defaultValue: string = ''): string => {
  const viteKey = `VITE_ANTIGRAVITY_${baseKey}`;
  const nextKey = `NEXT_PUBLIC_ANTIGRAVITY_${baseKey}`;
  
  return getEnv(nextKey) || getEnv(viteKey) || defaultValue;
};
