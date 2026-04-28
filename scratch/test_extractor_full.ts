import { RestApiExtractorAdapter } from '../src/shared/api/scrapers/RestApiExtractorAdapter';

async function test() {
  const extractor = new RestApiExtractorAdapter();
  console.log('--- Testing Full Extraction ---');
  try {
    const vehicles = await extractor.extractFullInventory({
      targetUrls: [], // Ignored by this adapter
      useStealthMode: true
    });
    console.log(`\n✅ Total Vehicles Found: ${vehicles.length}`);
    vehicles.slice(0, 5).forEach(v => {
      console.log(`- [${v.props.condition}] ${v.props.year} ${v.props.make} ${v.props.model} (VIN: ${v.vin})`);
    });
  } catch (e) {
    console.error('❌ Test Failed:', e);
  }
}

test();
