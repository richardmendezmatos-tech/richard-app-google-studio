import { AuditRepository } from './AuditRepository';

/**
 * AuditRepositoryProvider (Nivel 22)
 * Factory para resolver la instancia correcta de AuditRepository
 * de forma asíncrona, evitando fugas de dependencias de cliente.
 */
export const getAuditRepository = async () => {
    return new AuditRepository();
};
