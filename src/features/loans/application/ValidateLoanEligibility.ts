import { LoanApplication } from '../domain/Loan';
import { LOAN_RULES } from '../domain/rules';

export interface EligibilityResult {
  isEligible: boolean;
  reason?: string;
  suggestedApr?: number;
}

/**
 * Caso de Uso: Validar Elegibilidad de Préstamo
 * Este archivo "grita" su intención.
 */
export class ValidateLoanEligibility {
  execute(application: LoanApplication): EligibilityResult {
    // 1. Validar Score de Crédito
    if (application.creditScore < LOAN_RULES.MIN_CREDIT_SCORE) {
      return {
        isEligible: false,
        reason: `Credit score too low. Required: ${LOAN_RULES.MIN_CREDIT_SCORE}`,
      };
    }

    // 2. Validar Capacidad de Pago (Simplificado)
    // El 'pronto' o pago mensual proyectado vs ingreso
    const dti = application.requestedAmount / 60 / application.monthlyIncome;
    if (dti > LOAN_RULES.MAX_DTI_RATIO) {
      return {
        isEligible: false,
        reason: 'Debt-to-income ratio exceeds maximum allowed.',
      };
    }

    // 3. Asignar APR sugerido basado en Score
    let suggestedApr = LOAN_RULES.MIN_APR;
    if (application.creditScore < 700) suggestedApr = 8.5;
    if (application.creditScore < 650) suggestedApr = 12.0;

    return {
      isEligible: true,
      suggestedApr,
    };
  }
}

export const validateLoanEligibility = new ValidateLoanEligibility();
