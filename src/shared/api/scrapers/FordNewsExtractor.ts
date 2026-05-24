import Parser from 'rss-parser';

export interface FordNewsArticle {
  title: string;
  url: string;
  description: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
  categories: string[];
}

export interface FordNewsExtractorConfig {
  feedUrl: string;
  maxArticles?: number;
}

export class FordNewsExtractor {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['media:content', 'media:thumbnail'],
      },
    });
  }

  async fetchLatest(config: FordNewsExtractorConfig): Promise<FordNewsArticle[]> {
    const { feedUrl, maxArticles = 10 } = config;

    try {
      const feed = await this.parser.parseURL(feedUrl);

      if (!feed.items || feed.items.length === 0) return [];

      return feed.items.slice(0, maxArticles).map((item) => ({
        title: item.title?.trim() || '',
        url: item.link?.trim() || item.guid || '',
        description: item.contentSnippet?.trim() || item.content?.trim()?.replace(/<[^>]*>/g, '') || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: feed.title?.trim() || 'Ford News',
        imageUrl: item['media:content']?.url || item['media:thumbnail']?.url || undefined,
        categories: item.categories || [],
      }));
    } catch (error) {
      console.error(`[FordNewsExtractor] Error fetching ${feedUrl}:`, error);
      return [];
    }
  }

  isFordRelated(article: FordNewsArticle): boolean {
    const keywords = ['ford', 'mustang', 'f-150', 'explorer', 'escape', 'bronco', 'mach-e',
      'ranger', 'expedition', 'edge', 'transit', 'maverick', 'lincoln'];
    const searchText = `${article.title} ${article.description} ${article.categories.join(' ')}`.toLowerCase();
    return keywords.some((kw) => searchText.includes(kw));
  }
}
