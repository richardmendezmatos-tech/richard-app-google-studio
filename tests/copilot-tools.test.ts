/**
 * Test file for GitHub Copilot Tools
 * 
 * Verifies that the agent can use custom tools like search_inventory and calculate_financing.
 * Run with: npx tsx tests/copilot-tools.test.ts
 */

import { copilotService } from '../services/copilotService';

async function testCopilotTools() {
    console.log('🚀 Testing GitHub Copilot Agent with Custom Tools\n');

    try {
        await copilotService.initialize();
        const sessionId = 'tool-test-' + Date.now();
        await copilotService.createSession(sessionId);

        // Test 1: Inventory Search via AI
        console.log('--- Test 1: Inventory Search ---');
        console.log('Prompt: "Busca camionetas SUV blancas de menos de $45,000"\n');

        await copilotService.streamMessage(
            sessionId,
            'Busca camionetas SUV blancas de menos de $45,000. Dime cuántas encontraste y menciónalas.',
            (chunk) => process.stdout.write(chunk)
        );
        console.log('\n\n');

        // Test 2: Financing Calculation via AI
        console.log('--- Test 2: Financing Calculation ---');
        console.log('Prompt: "Calcula el pago mensual para un auto de $35,000 con $5,000 de pronto a 60 meses al 6% APR"\n');

        await copilotService.streamMessage(
            sessionId,
            'Calcula el pago mensual para un auto de $35,000 con $5,000 de pronto a 60 meses al 6% APR.',
            (chunk) => process.stdout.write(chunk)
        );
        console.log('\n\n');

        // Test 3: Dealer Info
        console.log('--- Test 3: Dealer Info ---');
        console.log('Prompt: "¿A qué hora abren los sábados?"\n');

        await copilotService.streamMessage(
            sessionId,
            '¿A qué hora abren los sábados?',
            (chunk) => process.stdout.write(chunk)
        );
        console.log('\n\n');

        await copilotService.closeSession(sessionId);
        await copilotService.shutdown();
        console.log('✅ Tool tests complete');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Tool test failed:', error);
        await copilotService.shutdown();
        process.exit(1);
    }
}

testCopilotTools();
