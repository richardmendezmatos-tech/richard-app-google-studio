'use client';

import { useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import type { UIMessage as AIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export interface Message extends Omit<AIMessage, 'parts'> {
  content: string;
  toolInvocations?: any[];
  parts?: any[];
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
  // Local firebase emulators usually run regional functions differently
  const apiEndpoint = '/api/ai/chat';

  const [input, setInput] = useState('');

  const chatProps = useChat({
    id: sessionId,
    initialMessages: options.initialMessages as any[],
    transport: new DefaultChatTransport({
      api: apiEndpoint,
      body: {
        leadId: sessionId,
      },
    }),
    onFinish: (event) => {
      if (options.onFinish) {
        const rawMessage = (event as any).message || event;
        const parts = rawMessage.parts || [];
        const message = {
          ...rawMessage,
          content:
            rawMessage.content ||
            parts
              .filter((p: any) => p.type === 'text')
              .map((p: any) => p.text)
              .join('') ||
            '',
          toolInvocations:
            rawMessage.toolInvocations ||
            parts
              .filter((p: any) => p.type.startsWith('tool-'))
              .map((p: any) => ({
                ...p,
                toolName: p.type.replace('tool-', ''),
              })) ||
            [],
        };
        options.onFinish(message as Message);
      }
    },
    onError: (error) => {
      if (options.onError) options.onError(error as any);
    },
  } as any);

  // Map messages to include content and toolInvocations for backward compatibility
  const messages = useMemo(() => {
    return chatProps.messages.map((m) => {
      const parts = (m as any).parts || [];
      const toolInvocations =
        (m as any).toolInvocations ||
        parts
          .filter((p: any) => p.type.startsWith('tool-'))
          .map((p: any) => {
            // Map new SDK part format to old toolInvocation format if necessary
            // In many cases, the properties (toolCallId, state, args) are already in the part object
            return {
              ...p,
              toolName: p.toolName || p.type.replace('tool-', ''),
            };
          }) ||
        [];

      return {
        ...m,
        content:
          (m as any).content ||
          parts
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('') ||
          '',
        toolInvocations,
      };
    }) as Message[];
  }, [chatProps.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    if ((chatProps as any).append) {
      (chatProps as any).append({ role: 'user', content: input } as any);
    } else if ((chatProps as any).sendMessage) {
      (chatProps as any).sendMessage(input);
    }

    setInput('');
  };

  // addToolResult mapping - For client-side compatibility
  const addToolResult = (data: ToolResultData) => {
    (chatProps as any).addToolResult({
      toolCallId: data.callId,
      tool: 'agent-tool', // Required in this SDK version
      state: 'output-available',
      output: data.result,
    });
  };

  return {
    ...chatProps,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isReady: true,
    addToolResult,
  } as any;
}
