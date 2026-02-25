import { LogRepository } from '../../../domain/repositories';

export class CleanAuditLogs {
    constructor(private logRepo: LogRepository) { }

    async execute(days: number = 30): Promise<number> {
        return await this.logRepo.deleteLogsOlderThan(days);
    }
}
