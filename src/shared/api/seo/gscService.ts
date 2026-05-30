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
    clientSecret: 'd-FL95Q19q7MQmFpd7hHD0Ty',
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
