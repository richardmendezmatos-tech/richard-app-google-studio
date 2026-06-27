import { OAuth2Client } from 'google-auth-library';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

export interface GSCSiteStatus {
  siteUrl: string;
  permissionLevel: string | null;
}

export interface SitemapEntry {
  path: string;
  lastSubmitted: string | null;
  isPending: boolean;
  isSitemapsIndex: boolean;
  type: string;
  lastDownloaded: string | null;
  warnings: number;
  errors: number;
  contents?: { type: string; submitted: number; indexed: number }[];
}

export interface GSCSearchAnalyticsQuery {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
}

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCError {
  code: number;
  message: string;
  status: string;
}

type GSCResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: GSCError };

const getCredentials = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !refreshToken) return null;
  return { clientId, refreshToken };
};

let cachedClient: OAuth2Client | null = null;

const getClient = async (): Promise<OAuth2Client | null> => {
  if (cachedClient) return cachedClient;

  const creds = getCredentials();
  if (!creds) return null;

  const client = new OAuth2Client({
    clientId: creds.clientId,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
    redirectUri: 'http://localhost:8085',
  });

  client.quotaProjectId = 'richard-automotive';
  client.setCredentials({
    refresh_token: creds.refreshToken,
  });

  cachedClient = client;
  return client;
};

const siteUrl = SITE_CONFIG.url;

export async function getSiteStatus(): Promise<GSCResult<GSCSiteStatus>> {
  const client = await getClient();
  if (!client) {
    return { ok: false, error: { code: 401, message: 'GSC not configured — run `node scripts/setup-gsc-oauth.mjs` to set up OAuth', status: 'UNAUTHENTICATED' } };
  }

  try {
    const res = await client.request({
      url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`,
    });
    return { ok: true, data: res.data as GSCSiteStatus };
  } catch (err: any) {
    return { ok: false, error: { code: err.code || 500, message: err.message, status: err.status || 'UNKNOWN' } };
  }
}

export async function getSitemaps(): Promise<GSCResult<SitemapEntry[]>> {
  const client = await getClient();
  if (!client) {
    return { ok: false, error: { code: 401, message: 'GSC not configured', status: 'UNAUTHENTICATED' } };
  }

  try {
    const res = await client.request({
      url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
    });
    return { ok: true, data: (res.data as any).sitemap || [] };
  } catch (err: any) {
    return { ok: false, error: { code: err.code || 500, message: err.message, status: err.status || 'UNKNOWN' } };
  }
}

export type IndexingType = 'URL_UPDATED' | 'URL_DELETED';

export interface IndexingResult {
  url: string;
  type: IndexingType;
  notifyTime?: string;
  urlNotificationMetadata?: unknown;
}

/**
 * Submit a URL to Google Indexing API for immediate crawl scheduling.
 * Requires GOOGLE_OAUTH_CLIENT_ID + GOOGLE_REFRESH_TOKEN + GOOGLE_OAUTH_CLIENT_SECRET.
 * Note: Google only guarantees priority crawling for pages with JobPosting/BroadcastEvent schema.
 * For general pages this still works as a crawl hint.
 */
export async function submitUrlToGoogle(
  url: string,
  type: IndexingType = 'URL_UPDATED',
): Promise<GSCResult<IndexingResult>> {
  const client = await getClient();
  if (!client) {
    return { ok: false, error: { code: 401, message: 'GSC not configured', status: 'UNAUTHENTICATED' } };
  }

  try {
    const res = await client.request({
      url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
      method: 'POST',
      data: { url, type },
    });
    return { ok: true, data: res.data as IndexingResult };
  } catch (err: any) {
    return { ok: false, error: { code: err.code || 500, message: err.message, status: err.status || 'UNKNOWN' } };
  }
}

/**
 * Submit multiple URLs in batch (max 100 per call per Google quota).
 */
export async function submitUrlsBatch(
  urls: string[],
  type: IndexingType = 'URL_UPDATED',
): Promise<{ submitted: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(urls.map((u) => submitUrlToGoogle(u, type)));
  let submitted = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.ok) {
      submitted++;
    } else {
      failed++;
      const msg = r.status === 'rejected' ? r.reason?.message : !r.value.ok ? r.value.error.message : 'unknown';
      errors.push(msg);
    }
  }
  return { submitted, failed, errors };
}

/**
 * Submit a URL via IndexNow protocol (Bing/Yandex + partial Google support).
 * Requires INDEXNOW_API_KEY env var and a key file at /public/<key>.txt.
 */
export async function submitUrlIndexNow(url: string): Promise<GSCResult<{ status: number }>> {
  const key = process.env.INDEXNOW_API_KEY;
  if (!key) {
    return { ok: false, error: { code: 401, message: 'INDEXNOW_API_KEY not configured', status: 'UNAUTHENTICATED' } };
  }

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key,
        keyLocation: `${siteUrl}/${key}.txt`,
        urlList: [url],
      }),
    });
    if (res.ok || res.status === 202) {
      return { ok: true, data: { status: res.status } };
    }
    return { ok: false, error: { code: res.status, message: await res.text(), status: 'ERROR' } };
  } catch (err: any) {
    return { ok: false, error: { code: 500, message: err.message, status: 'UNKNOWN' } };
  }
}

export async function getSearchAnalytics(query: GSCSearchAnalyticsQuery): Promise<GSCResult<SearchAnalyticsRow[]>> {
  const client = await getClient();
  if (!client) {
    return { ok: false, error: { code: 401, message: 'GSC not configured', status: 'UNAUTHENTICATED' } };
  }

  try {
    const res = await client.request({
      url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      method: 'POST',
      data: {
        startDate: query.startDate,
        endDate: query.endDate,
        dimensions: query.dimensions || ['query'],
        rowLimit: query.rowLimit || 10,
      },
    });
    return { ok: true, data: (res.data as any).rows || [] };
  } catch (err: any) {
    return { ok: false, error: { code: err.code || 500, message: err.message, status: err.status || 'UNKNOWN' } };
  }
}
