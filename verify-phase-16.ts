import { orchestrationService } from './src/services/orchestrationService.ts';
import { automationService } from './src/services/automationService.ts';
import { Lead } from './src/types/types'

// Mocking external services to avoid Firebase errors
(automationService as unknown as { processLeadNurturing: (lead: Lead) => Promise<void> }).processLeadNurturing = async function (lead: Lead) {
    console.log(`[Mock Automation] Processing lead: ${lead.name}`);
    const now = Date.now();
    const rawCreatedAt = lead.createdAt as unknown;
    const createdAtTime = rawCreatedAt && typeof (rawCreatedAt as { seconds: number }).seconds === 'number'
        ? (rawCreatedAt as { seconds: number }).seconds * 1000 : now;

    const daysSinceCreation = Math.floor((now - createdAtTime) / (1000 * 60 * 60 * 24));
    console.log(`[Mock Automation] Days since creation: ${daysSinceCreation}`);

    // Simulating rule check
    if (daysSinceCreation >= 3 && lead.aiScore && lead.aiScore > 80) {
        console.log(`[Mock Automation] RULE MATCH: day_3_test_drive for ${lead.vehicleOfInterest}`);
    }
};

async function verify() {
    console.log('--- Phase 16 Verification (MOCKED) ---');

    // 1. Test Preference Extraction
    const mockLead: Lead = {
        id: 'test-123',
        name: 'Richard Test',
        email: 'richard@test.com',
        phone: '+17870000000',
        vehicleOfInterest: 'Tacoma',
        type: 'form',
        status: 'new'
    };

    const userMessage = 'Hola, estoy buscando una Tacoma 4x4 para mi trabajo en el campo. También me gusta la Tucson para mi familia.';

    console.log('\n[1] Testing Preference Extraction...');
    console.log('User Message:', userMessage);

    const updatedMemory = orchestrationService.extractLeadPreferences(mockLead, userMessage);
    console.log('Extracted Memory:', JSON.stringify(updatedMemory, null, 2));

    // 2. Test Orchestration with Memory
    console.log('\n[2] Testing Orchestration with Memory...');
    const action = await orchestrationService.orchestrateLeadFollowUp({ ...mockLead, customerMemory: updatedMemory }, null);
    console.log('Orchestrated Message:', action.message);

    // 3. Test Automation Rules
    console.log('\n[3] Testing Automation Rules (Simulating Day 3 for High Score)...');
    const highScoringLead: Lead = {
        ...mockLead,
        aiScore: 85,
        vehicleOfInterest: 'Tacoma',
        createdAt: { seconds: Math.floor(Date.now() / 1000) - (3 * 24 * 60 * 60) - 100, nanoseconds: 0 } as unknown as Lead['createdAt']
    };

    await automationService.processLeadNurturing(highScoringLead);

    console.log('\nVerification Complete.');
}

verify().catch(console.error);
