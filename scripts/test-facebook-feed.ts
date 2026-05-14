import axios from 'axios';

async function testFacebookFeed() {
  console.log('📡 Testing Facebook Automotive Feed...');
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const feedUrl = `${siteUrl}/api/distribution/facebook-feed`;

  try {
    const response = await axios.get(feedUrl);
    
    console.log('✅ Feed Status:', response.status);
    console.log('📄 Content-Type:', response.headers['content-type']);
    
    const xml = response.data;
    console.log('\n--- XML PREVIEW (First 500 chars) ---');
    console.log(xml.substring(0, 500));
    console.log('-------------------------------------\n');

    // Basic validation
    if (xml.includes('<listings>') && xml.includes('<listing>')) {
      console.log('✅ Basic XML Structure Validated.');
    } else {
      console.warn('⚠️ XML structure might be incomplete or empty.');
    }

    if (xml.includes('<vehicle_id>') && xml.includes('<make>') && xml.includes('<model>')) {
      console.log('✅ Automotive Fields Detected.');
    } else {
      console.warn('⚠️ Mandatory Automotive fields missing.');
    }

  } catch (err: any) {
    console.error('❌ Feed Test Failed:', err.message);
    if (err.response) {
      console.error('Data:', err.response.data);
    }
  }
}

testFacebookFeed();
