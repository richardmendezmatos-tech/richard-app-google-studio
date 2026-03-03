import { useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface UseVoiceRecognitionOptions {
  onResult: (transcript: string) => void;
  lang?: string;
  prompt?: string;
}

export function useVoiceRecognition({
  onResult,
  lang = 'es-US',
  prompt = 'Habla ahora...',
}: UseVoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const functions = getFunctions();
  const transcribeVoice = httpsCallable<
    { audioBase64: string; mimeType: string },
    { text: string }
  >(functions, 'transcribeVoice');

  const startListening = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      return alert('El modo Premium Voice requiere la App nativa de Richard Automotive.');
    }

    try {
      const { value: available } = await VoiceRecorder.canDeviceVoiceRecord();
      if (!available) return alert('Reconocimiento de voz no soportado en este dispositivo.');

      const { value: hasPermission } = await VoiceRecorder.hasAudioRecordingPermission();
      if (!hasPermission) {
        const { value: granted } = await VoiceRecorder.requestAudioRecordingPermission();
        if (!granted) return alert('Permiso de micrófono denegado.');
      }

      await VoiceRecorder.startRecording();
      setIsListening(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    if (!isListening) return;

    try {
      setIsListening(false);
      setIsLoading(true);
      const { value: recordingData } = await VoiceRecorder.stopRecording();

      if (recordingData.recordDataBase64) {
        const result = await transcribeVoice({
          audioBase64: recordingData.recordDataBase64,
          mimeType: recordingData.mimeType,
        });

        if (result.data.text) {
          onResult(result.data.text);
        }
      }
    } catch (err) {
      console.error('Error stopping/transcribing:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isListening, transcribeVoice, onResult]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return { isListening, toggleListening, stopListening, isLoading };
}
