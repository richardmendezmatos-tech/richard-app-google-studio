export interface GeminiBlob {
  data: string;
  mimeType: string;
}

export interface ServerContent {
  outputTranscription?: { text: string };
  inputTranscription?: { text: string };
  turnComplete?: boolean;
  modelTurn?: {
    parts?: Array<{
      inlineData?: { data?: string };
    }>;
  };
}

export interface LiveServerMessage {
  serverContent?: ServerContent;
}
