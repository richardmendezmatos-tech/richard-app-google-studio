export interface SMSRepository {
    send(to: string, message: string): Promise<boolean>;
}
