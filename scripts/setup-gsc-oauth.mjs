import { OAuth2Client } from 'google-auth-library';
import { createServer } from 'node:http';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const CLIENT_ID = '764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com';
const CLIENT_SECRET = 'd-FL95Q19q7MQmFpd7hHD0Ty';
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, 'http://localhost:8085');

const authUrl = client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n=== GSC OAuth2 Setup ===\n');

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:8085');
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end(`Error: ${error}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body><h1>Waiting for authorization...</h1></body></html>');
    return;
  }

  try {
    const { tokens } = await client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('No refresh token received.');
      server.close();
      process.exit(1);
    }

    const envPath = join(PROJECT_ROOT, '.env.local');
    let envContent = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';

    const setVar = (key, value) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    };

    envContent += '\n# Google Search Console OAuth\n';
    setVar('GOOGLE_OAUTH_CLIENT_ID', CLIENT_ID);
    setVar('GOOGLE_REFRESH_TOKEN', refreshToken);

    writeFileSync(envPath, envContent);
    console.log(`\n✅ Refresh token obtained and saved to .env.local`);
    console.log(`   GOOGLE_OAUTH_CLIENT_ID=${CLIENT_ID}`);
    console.log(`   GOOGLE_REFRESH_TOKEN=${refreshToken.substring(0, 24)}...\n`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body><h1>✅ GSC OAuth setup complete!</h1><p>Refresh token saved to .env.local. You can close this window.</p></body></html>');
    server.close();
  } catch (err) {
    console.error('Token exchange error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error: ${err.message}`);
    server.close();
  }
});

server.listen(8085, () => {
  console.log('Open this URL in your browser and authorize:');
  console.log(`\n  ${authUrl}\n`);
  console.log('Waiting for OAuth callback on http://localhost:8085 ...\n');
});
