import { ImmutableLead, ChatOrchestrationState } from './entities';

/**
 * ChatflowOrchestrator
 * Pure Domain Logic for managing the conversation state and agent transitions.
 * This class does not depend on Frameworks or external Services (Clean Architecture).
 */
export class ChatflowOrchestrator {
  /**
   * Determines the next state and agent based on the current lead profile and user input patterns.
   */
  public nextState(
    currentLead: ImmutableLead,
    currentState: ChatOrchestrationState,
    lastMessage: string,
  ): ChatOrchestrationState {
    const message = lastMessage.toLowerCase();

    // 1. Detect Flow Shift - Finance Simulation
    if (message.match(/(pagos|mensualidad|credito|banco|pronto|financiamiento)/)) {
      // STRICT STATE GUARD: Only allow Sofia if we have a vehicle of interest
      if (!currentState.dataCollected.hasVehicleId && !currentLead.vehicleOfInterestId) {
        return {
          ...currentState,
          currentAgentId: 'ricardo', // Stay with Ricardo to clarify vehicle selection
          activeFlow: 'InventorySearch',
        };
      }
      return {
        ...currentState,
        currentAgentId: 'sofia',
        activeFlow: 'FinanceSimulation',
        dataCollected: {
          ...currentState.dataCollected,
          hasFinancialProfile: this.analyzeFinancialData(message),
        },
      };
    }

    // 2. Detect Flow Shift - Inventory Search
    if (message.match(/(inventario|stock|modelo|tienes|disponible|color)/)) {
      return {
        ...currentState,
        currentAgentId: 'ricardo',
        activeFlow: 'InventorySearch',
        dataCollected: {
          ...currentState.dataCollected,
          hasVehicleId:
            currentState.dataCollected.hasVehicleId || !!currentLead.vehicleOfInterestId,
        },
      };
    }

    // 3. Detect Flow Shift - Closing (High Intent)
    if (
      currentLead.intentScore > 90 ||
      message.match(/(comprar|trato|oferta|cita|hoy mismo|listo)/)
    ) {
      return {
        ...currentState,
        currentAgentId: 'jordan',
        activeFlow: 'Closing',
      };
    }

    // 4. Fallback Logic
    if (currentState.fallbackCount > 2) {
      // Escalation to Human or Support mode if AI is looping
      return {
        ...currentState,
        currentAgentId: 'system',
        activeFlow: 'TechnicalSupport',
      };
    }

    return currentState;
  }

  private analyzeFinancialData(message: string): boolean {
    // Simple regex-based check for numbers/amounts in context of finance
    return /\d+/.test(message) && message.includes('$');
  }
}
