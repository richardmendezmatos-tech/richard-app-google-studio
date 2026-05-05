import { AppError } from '../../domain/types';
import { HttpsError } from 'firebase-functions/v2/https';

/**
 * Utility to map domain AppErrors to Firebase HttpsErrors.
 * Ensures consistent error reporting to the frontend.
 */
export function mapToHttpsError(error: any): never {
    if (error instanceof AppError) {
        switch (error.code) {
            case 'VALIDATION_ERROR':
                throw new HttpsError('invalid-argument', error.message, error.details);
            case 'NOT_FOUND':
                throw new HttpsError('not-found', error.message);
            case 'UNAUTHORIZED':
                throw new HttpsError('unauthenticated', error.message);
            case 'EXTERNAL_SERVICE_ERROR':
                throw new HttpsError('unavailable', error.message);
            default:
                throw new HttpsError('internal', error.message);
        }
    }

    // Default fallback
    throw new HttpsError('internal', error instanceof Error ? error.message : 'Unknown internal error');
}
