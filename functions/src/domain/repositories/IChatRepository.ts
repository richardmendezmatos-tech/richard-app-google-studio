export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
}

export interface ChatSession {
    messages: ChatMessage[];
    lastUpdated: Date;
    phone: string;
}

export interface ChatRepository {
    getById(chatId: string): Promise<ChatSession | null>;
    save(chatId: string, session: ChatSession): Promise<void>;
}
