/**
 * CLEAN ARCHITECTURE - DOMAIN LAYER
 * Immutable Entities for Richard Automotive Chatbot
 * These interfaces ensure that AI agents operate on a consistent, read-only data model.
 */

export interface ImmutableVehicle {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly type: string;
    readonly condition: 'new' | 'used' | 'certified';
    readonly stockCount: number;
    readonly features: readonly string[];
    readonly specifications: {
        readonly year: number;
        readonly mileage?: number;
        readonly transmission: string;
        readonly fuelType: string;
    };
}

export interface ImmutableFinancialRate {
    readonly id: string;
    readonly bankName: string;
    readonly aprRange: {
        readonly min: number;
        readonly max: number;
    };
    readonly maxTermMonths: number;
    readonly creditTier: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ImmutableLead {
    readonly id: string;
    readonly name: string;
    readonly intentScore: number;
    readonly vehicleOfInterestId?: string;
    readonly budgetRange?: {
        readonly min: number;
        readonly max: number;
    };
    readonly context: {
        readonly sessionCount: number;
        readonly lastInteractionType: string;
        readonly preferredAgent: string;
    };
}

/**
 * Domain-Specific Chat State
 * Tracks the orchestration flow without exposing raw database handles.
 */
export interface ChatOrchestrationState {
    readonly currentAgentId: string;
    readonly activeFlow: 'InventorySearch' | 'FinanceSimulation' | 'Closing' | 'TechnicalSupport' | 'General';
    readonly dataCollected: {
        readonly hasVehicleId: boolean;
        readonly hasFinancialProfile: boolean;
        readonly hasContactInfo: boolean;
    };
    readonly fallbackCount: number;
}
