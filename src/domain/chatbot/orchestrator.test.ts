import { describe, it, expect } from 'vitest';
import { ChatflowOrchestrator } from './orchestrator';
import { ChatOrchestrationState, ImmutableLead } from './entities';

describe('ChatflowOrchestrator', () => {
  const orchestrator = new ChatflowOrchestrator();

  const createInitialState = (
    overrides?: Partial<ChatOrchestrationState>,
  ): ChatOrchestrationState => ({
    currentAgentId: 'ricardo',
    activeFlow: 'General',
    dataCollected: { hasVehicleId: false, hasFinancialProfile: false, hasContactInfo: false },
    fallbackCount: 0,
    ...overrides,
  });

  const createLead = (overrides?: Partial<ImmutableLead>): ImmutableLead => ({
    id: 'test-lead-1',
    name: 'Test User',
    intentScore: 50,
    context: { sessionCount: 1, lastInteractionType: 'chat', preferredAgent: 'ricardo' },
    ...overrides,
  });

  it('should stay with ricardo if Finance Simulation is requested but no vehicle is selected', () => {
    const initialState = createInitialState();
    const lead = createLead({ vehicleOfInterestId: undefined });
    const nextState = orchestrator.nextState(lead, initialState, 'quiero ver financiamiento pagos');

    expect(nextState.currentAgentId).toBe('ricardo');
    expect(nextState.activeFlow).toBe('InventorySearch');
  });

  it('should switch to sofia if Finance Simulation is requested and vehicle is selected', () => {
    const initialState = createInitialState();
    const lead = createLead({ vehicleOfInterestId: 'vehicle-123' });
    const nextState = orchestrator.nextState(lead, initialState, 'quiero ver financiamiento pagos');

    expect(nextState.currentAgentId).toBe('sofia');
    expect(nextState.activeFlow).toBe('FinanceSimulation');
  });

  it('should extract financial profile data intent properly', () => {
    const initialState = createInitialState({
      dataCollected: { hasVehicleId: true, hasFinancialProfile: false, hasContactInfo: false },
    });
    const lead = createLead();

    // Testing specific regex parsing for analyzeFinancialData
    const nextState = orchestrator.nextState(lead, initialState, 'puedo dar un pronto de $500');

    expect(nextState.dataCollected.hasFinancialProfile).toBe(true);
  });

  it('should switch to ricardo and set InventorySearch flow if inventory keywords are used', () => {
    const initialState = createInitialState({ currentAgentId: 'sofia' });
    const lead = createLead();

    const nextState = orchestrator.nextState(
      lead,
      initialState,
      'que modelos de color rojo tienes?',
    );

    expect(nextState.currentAgentId).toBe('ricardo');
    expect(nextState.activeFlow).toBe('InventorySearch');
  });

  it('should switch to jordan and Closing flow if high intent keywords are used', () => {
    const initialState = createInitialState();
    const lead = createLead({ intentScore: 50 });

    const nextState = orchestrator.nextState(
      lead,
      initialState,
      'estoy listo para la oferta de hoy mismo',
    );

    expect(nextState.currentAgentId).toBe('jordan');
    expect(nextState.activeFlow).toBe('Closing');
  });

  it('should switch to jordan immediately if intent score > 90', () => {
    const initialState = createInitialState();
    const lead = createLead({ intentScore: 95 });

    const nextState = orchestrator.nextState(lead, initialState, 'cualquier cosa');

    expect(nextState.currentAgentId).toBe('jordan');
    expect(nextState.activeFlow).toBe('Closing');
  });

  it('should fallback to system agent if fallback count exceeds 2', () => {
    const initialState = createInitialState({ fallbackCount: 3 });
    const lead = createLead();

    const nextState = orchestrator.nextState(lead, initialState, 'no entiendo');

    expect(nextState.currentAgentId).toBe('system');
    expect(nextState.activeFlow).toBe('TechnicalSupport');
  });
});
