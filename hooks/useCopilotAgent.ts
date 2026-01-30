import { useState, useEffect, useRef, useCallback } from 'react';
import { copilotService, SessionEvent } from '../services/copilotService';

/**
 * Replacement for useChat from 'ai/react' using GitHub Copilot SDK.
 */
export interface Message {
    id: string;
    role: 'assistant' | 'user' | 'system' | 'data';
    content: string;
    data?: any;
    toolInvocations?: any[];
}

export interface UseCopilotAgentOptions {
    initialMessages?: Message[];
    onFinish?: (message: Message) => void;
    onError?: (error: Error) => void;
}

interface ToolCallData {
    name: string;
    callId: string;
    args: any;
}

interface ToolResultData {
    callId: string;
    result: any;
}

export function useCopilotAgent(sessionId: string, options: UseCopilotAgentOptions = {}) {
    const [messages, setMessages] = useState<Message[]>(options.initialMessages || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const messagesRef = useRef<Message[]>(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const updateLastMessageContent = useCallback((delta: string) => {
        setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
                return [
                    ...prev.slice(0, -1),
                    { ...last, content: last.content + delta }
                ];
            }
            return [
                ...prev,
                { id: Date.now().toString(), role: 'assistant', content: delta }
            ];
        });
    }, []);

    const addToolInvocation = useCallback((toolCall: ToolCallData) => {
        setMessages(prev => {
            const last = prev[prev.length - 1];
            const invocation = {
                toolName: toolCall.name,
                toolCallId: toolCall.callId,
                args: toolCall.args,
                state: 'call'
            };

            if (last && last.role === 'assistant') {
                return [
                    ...prev.slice(0, -1),
                    {
                        ...last,
                        toolInvocations: [...(last.toolInvocations || []), invocation]
                    }
                ];
            }
            return [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: '',
                    toolInvocations: [invocation]
                }
            ];
        });
    }, []);

    const updateToolResult = useCallback((toolResult: ToolResultData) => {
        setMessages(prev => {
            return prev.map(msg => {
                if (msg.toolInvocations) {
                    return {
                        ...msg,
                        toolInvocations: msg.toolInvocations.map(inv => {
                            if (inv.toolCallId === toolResult.callId) {
                                return { ...inv, state: 'result', result: toolResult.result };
                            }
                            return inv;
                        })
                    };
                }
                return msg;
            });
        });
    }, []);

    const handleCopilotEvent = useCallback((event: SessionEvent) => {
        const anyEvent = event as any;
        switch (anyEvent.type) {
            case 'assistant.message_delta':
                updateLastMessageContent(anyEvent.data.deltaContent || '');
                break;

            case 'assistant.message_done': {
                const lastMsg = messagesRef.current[messagesRef.current.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                    options.onFinish?.(lastMsg);
                }
                setIsLoading(false);
                break;
            }

            case 'tool.call':
                addToolInvocation(anyEvent.data as unknown as ToolCallData);
                break;

            case 'tool.result':
                updateToolResult(anyEvent.data as unknown as ToolResultData);
                break;

            case 'session.error': {
                const err = new Error(anyEvent.data.message || 'Session error');
                setError(err);
                options.onError?.(err);
                setIsLoading(false);
                break;
            }
        }
    }, [options, updateLastMessageContent, addToolInvocation, updateToolResult]);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                await copilotService.initialize();
                if (!isMounted) return;
                await copilotService.createSession(sessionId);
                if (!isMounted) return;
                setIsReady(true);
            } catch (err) {
                if (!isMounted) return;
                const errorObj = err instanceof Error ? err : new Error('Failed to initialize');
                setError(errorObj);
                options.onError?.(errorObj);
            }
        };

        init();

        const cleanup = copilotService.onEvent((event: SessionEvent) => {
            if (!isMounted) return;
            handleCopilotEvent(event);
        });

        return () => {
            isMounted = false;
            cleanup();
            copilotService.closeSession(sessionId);
        };
    }, [sessionId, options, handleCopilotEvent]);

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
            await copilotService.sendMessage(sessionId, userMsg.content);
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to send message');
            setError(errorObj);
            options.onError?.(errorObj);
            setIsLoading(false);
        }
    }, [sessionId, options]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const val = input;
        setInput('');
        append({ role: 'user', content: val });
    };

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
    };
}
