import { useChat } from 'ai/react';
import type { Message as AIMessage } from 'ai/react';

export interface Message extends AIMessage {
  data?: any;
}

export interface UseCopilotAgentOptions {
  initialMessages?: Message[];
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export interface ToolResultData {
  callId: string;
  result: Record<string, unknown>;
}

export function useCopilotAgent(sessionId: string, options: UseCopilotAgentOptions = {}) {
  const isDev = import.meta.env.DEV;
  // Local firebase emulators usually run regional functions differently
  const apiEndpoint = isDev
    ? 'http://127.0.0.1:5001/richard-automotive/us-central1/chatStream'
    : 'https://us-central1-richard-automotive.cloudfunctions.net/chatStream';

  const chatProps = useChat({
    api: apiEndpoint,
    id: sessionId,
    initialMessages: options.initialMessages as AIMessage[],
    body: {
      leadId: sessionId,
    },
    maxSteps: 5, // Allows the agent to automatically chain tool calls (Vercel AI SDK 4.x feature)
    onFinish: (message) => {
      if (options.onFinish) options.onFinish(message as Message);
    },
    onError: (error) => {
      if (options.onError) options.onError(error);
    },
  });

  // addToolResult mapping - For client-side compatibility
  const addToolResult = (data: ToolResultData) => {
    chatProps.addToolResult({
      toolCallId: data.callId,
      result: data.result,
    });
  };

  return {
    ...chatProps,
    isReady: true,
    addToolResult,
  };
}
