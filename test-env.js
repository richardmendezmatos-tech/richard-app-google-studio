console.log('API KEY:', process.env.VITE_FIREBASE_API_KEY ? 'DEFINED' : 'UNDEFINED');
if (process.env.VITE_FIREBASE_API_KEY) {
  console.log('IS ENCRYPTED:', process.env.VITE_FIREBASE_API_KEY.startsWith('encrypted:'));
}
