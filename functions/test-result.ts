import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';

async function main() {
  const result = streamText({
    model: google('gemini-1.5-flash'),
    prompt: 'hello'
  });
  console.log(Object.keys(result));
}
main();
