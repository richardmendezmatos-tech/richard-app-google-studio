console.log('🔑 Available Environment Keys:');
Object.keys(process.env).filter(k => k.includes('CLASIFICADOS') || k.includes('FB') || k.includes('FACEBOOK')).forEach(k => console.log(`- ${k}`));
