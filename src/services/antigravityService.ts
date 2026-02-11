const DEFAULT_HEALTH_PATH = '/health';
const DEFAULT_IMAGE_PATH = '/image';
const DEFAULT_LEAD_ACTION_PATH = '/copilot/lead-action';
const DEFAULT_OUTREACH_ACTION_PATH = '/copilot/outreach-action';

export interface AntigravityConfig {
  enabled: boolean;
  edgeUrl: string;
  apiUrl: string;
  apiKey: string;
  healthPath: string;
  imagePath: string;
  leadActionPath: string;
  outreachActionPath: string;
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const getAntigravityConfig = (): AntigravityConfig => {
  const edgeUrl = (import.meta.env.VITE_ANTIGRAVITY_EDGE_URL || '').trim();
  const apiUrl = (import.meta.env.VITE_ANTIGRAVITY_API_URL || '').trim();
  const apiKey = (import.meta.env.VITE_ANTIGRAVITY_API_KEY || '').trim();
  const healthPath = (import.meta.env.VITE_ANTIGRAVITY_HEALTH_PATH || DEFAULT_HEALTH_PATH).trim();
  const imagePath = (import.meta.env.VITE_ANTIGRAVITY_IMAGE_PATH || DEFAULT_IMAGE_PATH).trim();
  const leadActionPath = (import.meta.env.VITE_ANTIGRAVITY_LEAD_ACTION_PATH || DEFAULT_LEAD_ACTION_PATH).trim();
  const outreachActionPath = (import.meta.env.VITE_ANTIGRAVITY_OUTREACH_ACTION_PATH || DEFAULT_OUTREACH_ACTION_PATH).trim();

  return {
    enabled: Boolean(edgeUrl || apiUrl),
    edgeUrl,
    apiUrl,
    apiKey,
    healthPath: healthPath.startsWith('/') ? healthPath : `/${healthPath}`,
    imagePath: imagePath.startsWith('/') ? imagePath : `/${imagePath}`,
    leadActionPath: leadActionPath.startsWith('/') ? leadActionPath : `/${leadActionPath}`,
    outreachActionPath: outreachActionPath.startsWith('/') ? outreachActionPath : `/${outreachActionPath}`
  };
};

export const getAntigravityHealthUrl = (): string | null => {
  const cfg = getAntigravityConfig();
  const base = cfg.apiUrl || cfg.edgeUrl;
  if (!base) return null;
  return `${trimTrailingSlash(base)}${cfg.healthPath}`;
};

export const getAntigravityHeaders = (): HeadersInit => {
  const { apiKey } = getAntigravityConfig();
  if (!apiKey) return {};
  return {
    'x-api-key': apiKey,
    Authorization: `Bearer ${apiKey}`
  };
};

export const optimizeWithAntigravity = (url: string, width: number = 800): string => {
  if (!url) return '';

  // Preserve Firebase direct URLs by default to avoid auth token breakage on signed links.
  if (url.includes('firebasestorage.googleapis.com')) return url;

  // Keep Unsplash optimization path as fallback if Antigravity is not configured.
  const cfg = getAntigravityConfig();
  if (!cfg.edgeUrl) {
    if (url.includes('images.unsplash.com')) {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?q=80&w=${width}&auto=format&fit=crop`;
    }
    return url;
  }

  const base = trimTrailingSlash(cfg.edgeUrl);
  const params = new URLSearchParams({
    url,
    w: String(width),
    q: '80',
    fit: 'cover',
    auto: 'format'
  });
  return `${base}${cfg.imagePath}?${params.toString()}`;
};

export const antigravityFetch = async <T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> => {
  const cfg = getAntigravityConfig();
  if (!cfg.apiUrl) {
    throw new Error('Antigravity API URL is not configured.');
  }

  const url = `${trimTrailingSlash(cfg.apiUrl)}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: HeadersInit = {
    ...getAntigravityHeaders(),
    ...(init.headers || {})
  };

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    throw new Error(`Antigravity request failed (${response.status})`);
  }

  return (await response.json()) as T;
};
