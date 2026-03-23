/**
 * DevSecOps: Secure Error Handling Module
 * 
 * Propósito: Prevenir la fuga de información (Information Leakage).
 * Todos los errores de Firebase (como "permission-denied", rutas, reglas de esquema)
 * son interceptados, registrados de forma segura y mascarados en excepciones genéricas 
 * antes de llegar a la interfaz de usuario.
 */

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string = 'internal_error'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Envoltorio (Wrapper) para enmascarar errores de Firebase o Zod 
 * y devolver un mensaje estéril y cálido al cliente sin revelar infraestructura.
 */
export async function withSecureErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // 1. Registro seguro interno (Sentry / Datadog / Console Backend)
    // ATENCIÓN: Esta traza nunca viaja al Frontend de cara al usuario.
    console.error('[SECURE_AUDIT_LOG] Operation Failed:', error?.message || error);

    // 2. Errores de validación criptográfica (Input data malformada)
    if (error?.name === 'ZodError') {
      throw new AppError(
        'La información proporcionada contiene un formato incorrecto. Por favor verifíquela e intente nuevamente.', 
        'validation_error'
      );
    }

    // 3. Errores de Firebase (Permisos, límites, esquema)
    // Enmascaramos el error real en un mensaje cálido y genérico.
    throw new AppError(
      'No hemos podido procesar tu solicitud en este momento por seguridad o indisponibilidad técnica. Por favor, intenta de nuevo en unos minutos.',
      'operation_failed'
    );
  }
}
