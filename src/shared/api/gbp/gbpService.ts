const GBP_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1';

interface GBPConfig {
  accountId: string;
  locationId: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
}

export class GBPService {
  private config: GBPConfig;

  constructor(config: Partial<GBPConfig> = {}) {
    this.config = {
      accountId: config.accountId || '',
      locationId: config.locationId || '',
      accessToken: config.accessToken || null,
      refreshToken: config.refreshToken || null,
      tokenExpiry: config.tokenExpiry || null,
    };
  }

  get isConfigured(): boolean {
    return !!(this.config.accountId && this.config.locationId && this.config.accessToken);
  }

  get locationPath(): string {
    return `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.config.refreshToken) return false;
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.config.accessToken = data.access_token;
      this.config.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
      return true;
    } catch {
      return false;
    }
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    if (!this.isConfigured) return null;
    if (this.config.tokenExpiry && Date.now() > this.config.tokenExpiry) {
      await this.refreshAccessToken();
    }
    try {
      const res = await fetch(`${GBP_API_BASE}/${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      if (!res.ok) {
        if (res.status === 401) await this.refreshAccessToken();
        return null;
      }
      return res.json();
    } catch {
      return null;
    }
  }

  async getReviews(): Promise<any[]> {
    const data = await this.request(`${this.locationPath}/reviews`);
    return data?.reviews || [];
  }

  async replyToReview(reviewId: string, replyText: string): Promise<boolean> {
    const res = await this.request(`${this.locationPath}/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ comment: { text: replyText } }),
    });
    return !!res;
  }

  async createPost(post: {
    topicType: string;
    languageCode: string;
    summary: { text: string };
    callToAction?: { actionType: string; url: string };
    media?: { mediaFormat: string; sourceUrl: string }[];
  }): Promise<boolean> {
    const res = await this.request(`${this.locationPath}/localPosts`, {
      method: 'POST',
      body: JSON.stringify(post),
    });
    return !!res;
  }

  async getInsights(): Promise<any> {
    const data = await this.request(`${this.locationPath}/insights`, {
      method: 'POST',
      body: JSON.stringify({
        timeRange: {
          startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
        },
        requests: [
          { metric: 'BUSINESS_IMPRESSIONS_MAPS', options: { aggregations: ['TOTAL'] } },
          { metric: 'BUSINESS_IMPRESSIONS_SEARCH', options: { aggregations: ['TOTAL'] } },
          { metric: 'BUSINESS_CONVERSIONS_CALLS', options: { aggregations: ['TOTAL'] } },
          { metric: 'BUSINESS_CONVERSIONS_CLICKS', options: { aggregations: ['TOTAL'] } },
          { metric: 'BUSINESS_CONVERSIONS_WEBSITE', options: { aggregations: ['TOTAL'] } },
          { metric: 'BUSINESS_CONVERSIONS_DIRECTIONS', options: { aggregations: ['TOTAL'] } },
        ],
      }),
    });
    return data;
  }
}

export const gbpService = new GBPService();
