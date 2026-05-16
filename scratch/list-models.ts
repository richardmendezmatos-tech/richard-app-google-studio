import dotenv from 'dotenv';

dotenv.config();
const apiKey = process.env.VITE_GEMINI_API_KEY;

async function test() {
  if (!apiKey) {
    console.error('API Key missing');
    return;
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.error) {
      console.error('API Error:', data.error);
    } else {
      const models = data.models.map(m => m.name.replace('models/', ''));
      console.log('Models found:', models);
      const target = 'gemini-1.5-flash';
      if (models.includes(target)) {
        console.log(`✅ ${target} is AVAILABLE.`);
      } else {
        console.log(`❌ ${target} is NOT in the list. Available alternatives:`, models.filter(m => m.includes('flash')));
      }
    }
  } catch (e) {
    console.error('Failed to list models:', e.message);
  }
}

test();
