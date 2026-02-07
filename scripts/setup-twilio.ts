#!/usr/bin/env tsx
/**
 * TWILIO CONFIGURATION HELPER
 * Interactive script to help configure Twilio credentials.
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('\n🔧 RICHARD AUTOMOTIVE - TWILIO SETUP HELPER\n');
    console.log('This script will help you configure Twilio credentials.\n');

    // Step 1: Collect credentials
    console.log('📋 Step 1: Enter your Twilio credentials');
    console.log('(You can find these at https://console.twilio.com)\n');

    const accountSid = await question('Account SID (starts with AC): ');
    const authToken = await question('Auth Token: ');
    const phoneNumber = await question('WhatsApp Number (e.g., +14155238886): ');

    // Step 2: Validate format
    if (!accountSid.startsWith('AC') || accountSid.length !== 34) {
        console.error('❌ Invalid Account SID format. Should start with AC and be 34 characters.');
        rl.close();
        return;
    }

    if (!phoneNumber.startsWith('+')) {
        console.error('❌ Phone number should start with + (e.g., +14155238886)');
        rl.close();
        return;
    }

    // Step 3: Update .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
    }

    // Remove existing Twilio vars
    envContent = envContent
        .split('\n')
        .filter(line => !line.startsWith('TWILIO_'))
        .join('\n');

    // Add new credentials
    const twilioVars = `
# Twilio Configuration (Added by setup script)
TWILIO_ACCOUNT_SID=${accountSid}
TWILIO_AUTH_TOKEN=${authToken}
TWILIO_PHONE_NUMBER=${phoneNumber}
`;

    envContent += twilioVars;
    fs.writeFileSync(envPath, envContent.trim() + '\n');

    console.log('\n✅ Credentials saved to .env');

    // Step 4: Encrypt with dotenvx
    console.log('\n🔐 Encrypting .env with dotenvx...');
    const { execSync } = require('child_process');
    try {
        execSync('npx dotenvx encrypt', { stdio: 'inherit' });
        console.log('✅ .env encrypted successfully');
    } catch (error) {
        console.warn('⚠️  dotenvx encryption failed. Make sure to encrypt manually.');
    }

    // Step 5: Provide next steps
    console.log('\n📝 NEXT STEPS:\n');
    console.log('1. Configure webhook in Twilio Console:');
    console.log('   - Go to: https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox');
    console.log('   - Set "When a message comes in" to:');
    console.log('     https://your-project.vercel.app/api/twilio-webhook');
    console.log('   - Method: POST\n');

    console.log('2. Add these variables to Vercel:');
    console.log('   - Go to: https://vercel.com/your-project/settings/environment-variables');
    console.log('   - Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER\n');

    console.log('3. Test the integration:');
    console.log('   - Send a WhatsApp message to your Twilio number');
    console.log('   - Send a photo of a car to test Visual Cortex\n');

    console.log('📖 For detailed instructions, see: twilio_setup_guide.md\n');

    rl.close();
}

main().catch(console.error);
