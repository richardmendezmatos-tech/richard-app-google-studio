export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiating' | 'sold' | 'lost' | 'pre-approved';

export interface LeadState {
    status: LeadStatus;
    score?: number;
    assignedAgent?: string;
    lossReason?: string;
    saleId?: string;
    amount?: number;
    source?: string;
    timestamp?: Date;
}

// --- Error Pattern (Gold Standard) ---
export type ErrorCode =
    | 'INTERNAL_ERROR'
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'EXTERNAL_SERVICE_ERROR';

export class AppError extends Error {
    constructor(
        public readonly code: ErrorCode,
        message: string,
        public readonly details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

// --- Result Pattern ---
export type Result<T, E = AppError | Error> = Success<T> | Failure<E>;

export class Success<T> {
    readonly tag = 'success';
    constructor(readonly value: T) { }
    isSuccess(): this is Success<T> { return true; }
    isFailure(): this is Failure<any> { return false; }
}

export class Failure<E> {
    readonly tag = 'failure';
    constructor(readonly error: E) { }
    isSuccess(): this is Success<any> { return false; }
    isFailure(): this is Failure<E> { return true; }
}

export const success = <T>(value: T): Success<T> => new Success(value);
export const failure = <E>(error: E): Failure<E> => new Failure(error);
