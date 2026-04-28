import { RestApiExtractorAdapter } from '../src/shared/api/scrapers/RestApiExtractorAdapter';

async function test() {
  const extractor = new RestApiExtractorAdapter();
  try {
    const results = await extractor.extractFullInventory({
      targetUrls: [
        'https://centralfordpr.com/inventario-nuevos/',
        'https://centralfordpr.com/inventario-usados/'
      ]
    });
    console.log(`Extracted ${results.length} vehicles`);
    if (results.length > 0) {
      console.log('First vehicle:', JSON.stringify(results[0], null, 2));
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
