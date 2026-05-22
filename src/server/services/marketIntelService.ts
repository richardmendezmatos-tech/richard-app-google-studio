import { supabase } from '@/shared/api/supabase/supabase';
import * as cheerio from 'cheerio';

export interface MarketSnapshot {
  make: string;
  model: string;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  listingCount: number;
  timestamp: Date;
}

const TARGET_MODELS = [
  { make: 'Toyota', model: 'Tacoma' },
  { make: 'Honda', model: 'Civic' },
  { make: 'Toyota', model: 'Corolla' },
];

export const runMarketIntelScraper = async () => {
  console.log('Starting Market Intel Scraper for Puerto Rico...');

  for (const target of TARGET_MODELS) {
    try {
      const url = `https://clasificadosonline.com/UDAutoListing.asp?Make=${target.make}&Model=${target.model}&BusquedaAuto=Busqueda`;

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.statusText}`);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const prices: number[] = [];

      // Typical price extraction logic, looking for $ signs
      $('td, span, div, strong, b, a').each((_, element) => {
        const text = $(element).text().trim();
        const priceMatch = text.match(/\$[\s]*([0-9]{1,3}(?:,[0-9]{3})*)/);
        if (priceMatch) {
          const priceStr = priceMatch[1].replace(/,/g, '');
          const price = parseInt(priceStr, 10);
          // Filter unrealistic prices (outliers like accessories or typos)
          if (!isNaN(price) && price > 3000 && price < 150000) {
            prices.push(price);
          }
        }
      });

      if (prices.length > 0) {
        // Remove duplicates that might be parsed twice in the HTML
        const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);

        if (uniquePrices.length > 0) {
          const sum = uniquePrices.reduce((acc, val) => acc + val, 0);
          const average = sum / uniquePrices.length;
          const lowest = uniquePrices[0];
          const highest = uniquePrices[uniquePrices.length - 1];

          if (supabase) {
            const { error } = await supabase.from('market_insights').insert({
              make: target.make,
              model: target.model,
              average_price: Math.round(average),
              lowest_price: lowest,
              highest_price: highest,
              listing_count: uniquePrices.length,
              timestamp: new Date().toISOString(),
            });

            if (error) throw error;
          }

          console.log(
            `✅ [MarketScraper] Success: ${target.make} ${target.model} | Avg: $${Math.round(average)} | Listings: ${uniquePrices.length}`,
          );
        }
      } else {
        console.warn(`No prices found for ${target.make} ${target.model}`);
      }
    } catch (error) {
      console.error(`Error scraping ${target.make} ${target.model}:`, error);
    }

    // Slight pause to respect the host Server
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

export const getMarketInsight = async (
  make: string,
  model: string,
): Promise<MarketSnapshot | null> => {
  try {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('market_insights')
      .select('*')
      .eq('make', make)
      .eq('model', model)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      make: data.make,
      model: data.model,
      averagePrice: data.average_price,
      lowestPrice: data.lowest_price,
      highestPrice: data.highest_price,
      listingCount: data.listing_count,
      timestamp: new Date(data.timestamp),
    };
  } catch (error) {
    console.error(`Error retrieving market insight for ${make} ${model}:`, error);
    return null;
  }
};
