import { AppError } from '../../domain/types';

/**
 * Utility to map domain AppErrors to standard errors.
 * Ensures consistent error reporting to the frontend.
 */
export function mapToHttpsError(error: any): never {
  if (error instanceof AppError) {
    const message = error.message;
    const details = error.details;

    // Simular el comportamiento de HttpsError pero sin la dependencia de firebase
    const err = new Error(message) as any;
    err.details = details;

    switch (error.code) {
      case 'VALIDATION_ERROR':
        err.code = 'invalid-argument';
        break;
      case 'NOT_FOUND':
        err.code = 'not-found';
        break;
      case 'UNAUTHORIZED':
        err.code = 'unauthenticated';
        break;
      case 'EXTERNAL_SERVICE_ERROR':
        err.code = 'unavailable';
        break;
      default:
        err.code = 'internal';
    }
    throw err;
  }

  // Default fallback
  throw error instanceof Error ? error : new Error('Unknown internal error');
}
