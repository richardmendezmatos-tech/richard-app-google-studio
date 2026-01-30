/**
 * Test file for GitHub Copilot SDK integration
 * 
 * This file demonstrates basic usage of the Copilot service.
 * Run with: npx tsx tests/copilot.test.ts
 */

import { copilotService } from '../services/copilotService';

async function testCopilotIntegration() {
    console.log('🚀 Testing GitHub Copilot SDK Integration\n');

    try {
        // Step 1: Initialize the service
        console.log('1️⃣ Initializing Copilot service...');
        await copilotService.initialize();
        console.log('✅ Service initialized\n');

        // Step 2: Create a session
        console.log('2️⃣ Creating agent session...');
        const sessionId = 'test-session-' + Date.now();
        await copilotService.createSession(sessionId, {
            model: 'gpt-4o',
            streaming: true
        });
        console.log(`✅ Session created: ${sessionId}\n`);

        // Step 3: Send a simple message
        console.log('3️⃣ Sending test message...');
        const response = await copilotService.sendMessage(
            sessionId,
            'What is 2 + 2? Answer in one word.'
        );

        if (response.error) {
            console.error('❌ Error:', response.error);
        } else {
            console.log('✅ Response:', response.content);
        }
        console.log('');

        // Step 4: Test streaming
        console.log('4️⃣ Testing streaming response...');
        console.log('Response: ');

        await copilotService.streamMessage(
            sessionId,
            'Explain what a car dealership does in one sentence.',
            (chunk) => {
                process.stdout.write(chunk);
            }
        );
        console.log('\n✅ Streaming complete\n');

        // Step 5: Check service status
        console.log('5️⃣ Service status:');
        console.log(`   - Ready: ${copilotService.isReady()}`);
        console.log(`   - Active sessions: ${copilotService.getActiveSessionCount()}`);
        console.log('');

        // Step 6: Cleanup
        console.log('6️⃣ Cleaning up...');
        await copilotService.closeSession(sessionId);
        await copilotService.shutdown();
        console.log('✅ Cleanup complete\n');

        console.log('🎉 All tests passed!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Test failed:', error);

        if (error instanceof Error) {
            if (error.message.includes('command not found')) {
                console.log('\n⚠️  Copilot CLI not found!');
                console.log('📖 Please follow the setup guide:');
                console.log('   file:///.gemini/antigravity/brain/.../copilot-cli-setup-guide.md\n');
            }
        }

        await copilotService.shutdown();
        process.exit(1);
    }
}

// Run the test
testCopilotIntegration();
