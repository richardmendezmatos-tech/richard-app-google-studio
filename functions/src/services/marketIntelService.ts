import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import * as cheerio from 'cheerio';

export interface MarketSnapshot {
    make: string;
    model: string;
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    listingCount: number;
    timestamp: admin.firestore.Timestamp;
}

const TARGET_MODELS = [
    { make: 'Toyota', model: 'Tacoma' },
    { make: 'Honda', model: 'Civic' },
    { make: 'Toyota', model: 'Corolla' }
];

export const runMarketIntelScraper = async () => {
    logger.info("Starting Market Intel Scraper for Puerto Rico...");
    const db = admin.firestore();

    for (const target of TARGET_MODELS) {
        try {
            const url = `https://clasificadosonline.com/UDAutoListing.asp?Make=${target.make}&Model=${target.model}&BusquedaAuto=Busqueda`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                logger.error(`Failed to fetch ${url}: ${response.statusText}`);
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

                    const snapshot: MarketSnapshot = {
                        make: target.make,
                        model: target.model,
                        averagePrice: Math.round(average),
                        lowestPrice: lowest,
                        highestPrice: highest,
                        listingCount: uniquePrices.length,
                        timestamp: admin.firestore.Timestamp.now()
                    };

                    await db.collection('marketInsights').add(snapshot);
                    logger.info(`Successfully scraped ${target.make} ${target.model}: Avg $${snapshot.averagePrice} from ${snapshot.listingCount} unique prices`);
                }
            } else {
                logger.warn(`No prices found for ${target.make} ${target.model}`);
            }

        } catch (error) {
            logger.error(`Error scraping ${target.make} ${target.model}:`, error);
        }

        // Slight pause to respect the host Server
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
};
