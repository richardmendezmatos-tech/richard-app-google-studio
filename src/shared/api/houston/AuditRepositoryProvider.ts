import { AuditRepositoryBase } from './AuditRepositoryBase';
import { getDb } from '@/shared/api/firebase';

/**
 * AuditRepositoryProvider (Nivel 22)
 * Factory para resolver la instancia correcta de AuditRepository
 * de forma asíncrona, evitando fugas de dependencias de cliente.
 */
export const getAuditRepository = async () => {
    const db = await getDb();
    return new AuditRepositoryBase(db);
};
