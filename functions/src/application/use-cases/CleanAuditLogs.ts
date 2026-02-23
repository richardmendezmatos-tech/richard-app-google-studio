import { LogRepository } from '../../domain/repositories/LogRepository';

export class CleanAuditLogs {
    constructor(private logRepo: LogRepository) { }

    async execute(days: number = 30): Promise<number> {
        return await this.logRepo.deleteLogsOlderThan(days);
    }
}
