import { useState, useEffect, useRef, useCallback } from 'react';
import { getAIResponse } from '@/services/geminiService';
import { getInventoryOnce } from '@/services/firebaseService';
import { Car } from '@/types/types';

/**
 * Replacement for useChat from 'ai/react' using GitHub Copilot SDK.
 */
export interface Message {
    id: string;
    role: 'assistant' | 'user' | 'system' | 'data';
    content: string;
    data?: Record<string, unknown>;
    toolInvocations?: Array<{
        toolName: string;
        toolCallId: string;
        args: Record<string, unknown>;
        state: 'call' | 'result';
        result?: unknown;
    }>;
}

export interface UseCopilotAgentOptions {
    initialMessages?: Message[];
    onFinish?: (message: Message) => void;
    onError?: (error: Error) => void;
}

export interface ToolCallData {
    name: string;
    callId: string;
    args: Record<string, unknown>;
}

export interface ToolResultData {
    callId: string;
    result: Record<string, unknown>;
}

export interface SessionEvent {
    type: string;
    data: unknown;
}

export function useCopilotAgent(sessionId: string, options: UseCopilotAgentOptions = {}) {
    void sessionId;
    const [messages, setMessages] = useState<Message[]>(options.initialMessages || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isReady] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const messagesRef = useRef<Message[]>(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const updateToolResult = useCallback((toolResult: ToolResultData) => {
        setMessages((prev: Message[]) => {
            return prev.map(msg => {
                if (msg.toolInvocations) {
                    return {
                        ...msg,
                        toolInvocations: msg.toolInvocations.map(inv => {
                            if (inv.toolCallId === toolResult.callId) {
                                return { ...inv, state: 'result' as const, result: toolResult.result };
                            }
                            return inv;
                        })
                    } as Message;
                }
                return msg;
            });
        });
    }, []);

    const append = useCallback(async (message: Partial<Message>) => {
        const userMsg: Message = {
            id: message.id || Date.now().toString(),
            role: message.role || 'user',
            content: message.content || '',
            ...message
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            const inventory = await getInventoryOnce().catch(() => [] as Car[]);
            const currentMessages = messagesRef.current;
            const history = currentMessages
                .filter((m) => m.role === 'user' || m.role === 'assistant')
                .map((m) => ({
                    role: m.role === 'user' ? 'user' as const : 'bot' as const,
                    text: m.content
                }));
            const content = await getAIResponse(userMsg.content, inventory as Car[], history);

            const assistantMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content
            };

            setMessages(prev => [...prev, assistantMsg]);
            options.onFinish?.(assistantMsg);
            setIsLoading(false);

        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to send message');
            setError(errorObj);
            options.onError?.(errorObj);
            setIsLoading(false);
        }
    }, [options]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const val = input;
        setInput('');
        append({ role: 'user', content: val });
    };

    const addToolResult = useCallback((data: ToolResultData) => {
        updateToolResult(data);
    }, [updateToolResult]);

    return {
        messages,
        setMessages,
        input,
        setInput,
        isLoading,
        isReady,
        error,
        append,
        handleSubmit,
        handleInputChange,
        addToolResult
    };
}
