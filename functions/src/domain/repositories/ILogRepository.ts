export interface LogRepository {
    deleteLogsOlderThan(days: number): Promise<number>;
    recordAction(action: string, metadata: any): Promise<void>;
}
