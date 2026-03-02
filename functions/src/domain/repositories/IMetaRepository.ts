export interface MetaRepository {
    sendLeadEvent(email?: string, phone?: string, data?: any): Promise<boolean>;
}
