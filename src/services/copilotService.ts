/**
 * GitHub Copilot SDK Service
 * 
 * Core service for integrating GitHub Copilot AI agents into the automotive application.
 * Provides agent management, tool registration, and session handling.
 */

import { CopilotClient } from '@github/copilot-sdk';
import type { CopilotSession, SessionEvent } from '@github/copilot-sdk';
import { automotiveTools } from './copilotTools';

// Types
export interface CopilotConfig {
    model?: string;
    streaming?: boolean;
    maxTokens?: number;
}

export interface AgentResponse {
    content: string;
    toolCalls?: ToolCall[];
    error?: string;
}

export interface ToolCall {
    name: string;
    args: Record<string, any>;
    result: any;
}

export type EventHandler = (event: SessionEvent) => void;

/**
 * CopilotService - Main service class for GitHub Copilot SDK
 */
class CopilotService {
    private client: CopilotClient | null = null;
    private sessions: Map<string, CopilotSession> = new Map();
    private isInitialized = false;
    private eventHandlers: Set<EventHandler> = new Set();

    /**
     * Initialize the Copilot client
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('[Copilot] Already initialized');
            return;
        }

        try {
            console.log('[Copilot] Initializing SDK client...');
            this.client = new CopilotClient();
            this.isInitialized = true;
            console.log('[Copilot] SDK client initialized successfully');
        } catch (error) {
            console.error('[Copilot] Failed to initialize:', error);
            throw new Error(`Failed to initialize Copilot SDK: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a new agent session
     */
    async createSession(
        sessionId: string,
        config: CopilotConfig = {}
    ): Promise<CopilotSession> {
        if (!this.client) {
            throw new Error('Copilot client not initialized. Call initialize() first.');
        }

        try {
            console.log(`[Copilot] Creating session: ${sessionId}`);

            const session = await this.client.createSession({
                model: config.model || 'gpt-4o',
                streaming: config.streaming ?? true,
                tools: automotiveTools, // Add automotive tools
            });

            // Set up event handlers
            session.on((event: SessionEvent) => {
                this.handleSessionEvent(sessionId, event);
            });

            this.sessions.set(sessionId, session);
            console.log(`[Copilot] Session created: ${sessionId}`);

            return session;
        } catch (error) {
            console.error(`[Copilot] Failed to create session ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Send a message to an agent session
     */
    async sendMessage(
        sessionId: string,
        prompt: string
    ): Promise<AgentResponse> {
        const session = this.sessions.get(sessionId);

        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        try {
            console.log(`[Copilot] Sending message to session ${sessionId}`);

            const response = await session.sendAndWait({ prompt });

            return {
                content: response?.data.content || '',
                toolCalls: [], // Will be populated in Phase 2
            };
        } catch (error) {
            console.error(`[Copilot] Error sending message:`, error);
            return {
                content: '',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Stream a message response
     */
    async streamMessage(
        sessionId: string,
        prompt: string,
        onChunk: (chunk: string) => void
    ): Promise<void> {
        const session = this.sessions.get(sessionId);

        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        try {
            console.log(`[Copilot] Streaming message to session ${sessionId}`);

            // Add temporary handler for this stream
            const streamHandler = (event: SessionEvent) => {
                if (event.type === 'assistant.message_delta') {
                    onChunk(event.data.deltaContent || '');
                }
            };

            this.eventHandlers.add(streamHandler);

            await session.sendAndWait({ prompt });

            // Remove handler after stream completes
            this.eventHandlers.delete(streamHandler);
        } catch (error) {
            console.error(`[Copilot] Error streaming message:`, error);
            throw error;
        }
    }

    /**
     * Handle session events
     */
    private handleSessionEvent(sessionId: string, event: SessionEvent): void {
        // Broadcast to all registered handlers
        this.eventHandlers.forEach(handler => {
            try {
                handler(event);
            } catch (error) {
                console.error('[Copilot] Error in event handler:', error);
            }
        });

        // Log important events
        if (event.type === 'session.error') {
            console.error(`[Copilot] Session ${sessionId} error:`, event.data);
        }
    }

    /**
     * Register a global event handler
     */
    onEvent(handler: EventHandler): () => void {
        this.eventHandlers.add(handler);

        // Return cleanup function
        return () => {
            this.eventHandlers.delete(handler);
        };
    }

    /**
     * Close a session
     */
    async closeSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);

        if (session) {
            console.log(`[Copilot] Closing session: ${sessionId}`);
            this.sessions.delete(sessionId);
        }
    }

    /**
     * Get active session count
     */
    getActiveSessionCount(): number {
        return this.sessions.size;
    }

    /**
     * Check if service is ready
     */
    isReady(): boolean {
        return this.isInitialized && this.client !== null;
    }

    /**
     * Shutdown the service
     */
    async shutdown(): Promise<void> {
        if (!this.client) return;

        try {
            console.log('[Copilot] Shutting down...');

            // Close all sessions
            const sessionIds = Array.from(this.sessions.keys());
            await Promise.all(sessionIds.map(id => this.closeSession(id)));

            // Stop the client
            await this.client.stop();

            this.client = null;
            this.isInitialized = false;
            this.eventHandlers.clear();

            console.log('[Copilot] Shutdown complete');
        } catch (error) {
            console.error('[Copilot] Error during shutdown:', error);
        }
    }
}

// Singleton instance
export const copilotService = new CopilotService();

// Export types
export type { CopilotSession, SessionEvent };
