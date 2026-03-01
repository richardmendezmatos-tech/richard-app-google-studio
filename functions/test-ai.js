const ai = require('ai');
console.log(Object.keys(ai).filter(k => k.toLowerCase().includes('data') || k.toLowerCase().includes('stream')));
