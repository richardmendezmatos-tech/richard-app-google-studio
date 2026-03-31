import { useEffect, useRef, useState } from 'react';
import { BehavioralFingerprint } from '@/entities/lead';

/**
 * useFingerprinting - Nivel 14: Orquestación Predictiva
 * Monitors micro-interactions to build a behavioral fingerprint of the lead.
 */
export function useFingerprinting(leadId?: string) {
  const [fingerprint, setFingerprint] = useState<{
    scrollVelocity: number;
    imageDwellTime: Record<string, number>;
    featureInteractions: string[];
    interactionIntensity: number;
  }>({
    scrollVelocity: 0,
    imageDwellTime: {},
    featureInteractions: [],
    interactionIntensity: 0,
  });

  const scrollRef = useRef({ lastPos: 0, lastTime: 0 });
  const dwellRef = useRef<{ id: string; start: number } | null>(null);

  useEffect(() => {
    if (!leadId) return;

    scrollRef.current.lastTime = Date.now();

    // 1. Scroll Velocity Tracking
    const handleScroll = () => {
      const now = Date.now();
      const currentPos = window.scrollY;
      const deltaTime = (now - scrollRef.current.lastTime) / 1000;
      const deltaPos = Math.abs(currentPos - scrollRef.current.lastPos);

      if (deltaTime > 0) {
        const velocity = deltaPos / deltaTime;
        setFingerprint((prev) => ({
          ...prev,
          scrollVelocity: Math.round(velocity),
          interactionIntensity: Math.min(prev.interactionIntensity + 0.1, 10),
        }));
      }

      scrollRef.current = { lastPos: currentPos, lastTime: now };
    };

    // 2. Feature Interaction Tracking
    const handleInteraction = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const featureId = target.getAttribute('data-feature-id');

      if (featureId) {
        setFingerprint((prev) => ({
          ...prev,
          featureInteractions: Array.from(new Set([...prev.featureInteractions, featureId])),
          interactionIntensity: Math.min(prev.interactionIntensity + 0.5, 10),
        }));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleInteraction);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleInteraction);
    };
  }, [leadId]);

  // Method to track image dwell time (called by components)
  const trackImageEntry = (imageId: string) => {
    dwellRef.current = { id: imageId, start: Date.now() };
  };

  const trackImageExit = () => {
    if (dwellRef.current) {
      const duration = Date.now() - dwellRef.current.start;
      const id = dwellRef.current.id;
      setFingerprint((prev) => ({
        ...prev,
        imageDwellTime: {
          ...prev.imageDwellTime,
          [id]: (prev.imageDwellTime[id] || 0) + duration,
        },
      }));
      dwellRef.current = null;
    }
  };

  return {
    fingerprint,
    trackImageEntry,
    trackImageExit,
  };
}
