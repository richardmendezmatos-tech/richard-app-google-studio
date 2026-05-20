import { google } from '@ai-sdk/google';

// Export Vercel AI SDK models for easy access across the project
export const gemini15Flash = google('gemini-2.0-flash');
export const gemini15Pro = google('gemini-1.5-pro');

// Re-export the provider if needed
export { google };
