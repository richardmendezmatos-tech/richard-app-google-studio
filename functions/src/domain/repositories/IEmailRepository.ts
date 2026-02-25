export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}

export interface EmailRepository {
    send(options: EmailOptions): Promise<void>;
}
