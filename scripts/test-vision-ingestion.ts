/**
 * TEST SCRIPT: Inventory Ingestion API
 * Simulates a request from the Sentinel Vision UI to the ingestion endpoint.
 */

async function testIngestion() {
  console.log('🚀 Testing Inventory Ingestion API...');

  const mockVehicle = {
    vin: 'TEST-I-O-Q-' + Math.floor(Math.random() * 100000),
    make: 'Tesla',
    model: 'Model S',
    year: 2024,
    price: 89990,
    mileage: 15,
    color: 'Ultra Red',
    transmission: 'Automatic',
    engine: 'Dual Motor',
    marketingDescription: 'The pinnacle of electric performance and luxury. Autopilot enabled.',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80'
  };

  try {
    const response = await fetch('http://localhost:3000/api/inventory/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockVehicle),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Ingestion Successful:', result);
    } else {
      console.error('❌ Ingestion Failed:', result);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

testIngestion();
