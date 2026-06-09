'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';

function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  sessionKey: string,
): React.LazyExoticComponent<T> {
  return lazy(
    () =>
      factory().catch((err: unknown) => {
        const isChunkError =
          err instanceof TypeError &&
          /failed to fetch dynamically imported module/i.test((err as Error).message);

        if (isChunkError && !sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, '1');
          if (typeof window !== 'undefined') window.location.reload();
        }

        return { default: (() => null) as unknown as T };
      }) as Promise<{ default: T }>,
  );
}

const AIChatWidget = safeLazy(
  () =>
    import('@/features/ai-hub/ui/AIChatWidget').then((m) => ({ default: (m as any).default || m })),
  'chat_chunk_reloaded',
) as any;

const VoiceWidget = safeLazy(
  () =>
    import('@/features/ai-hub/ui/VoiceWidget').then((mod) => ({
      default: (mod as any).default || mod.VoiceWidget || mod,
    })),
  'voice_chunk_reloaded',
);

const WhatsAppFloat = safeLazy(
  () =>
    import('@/features/leads').then((mod) => ({
      default: (mod as any).default || mod.WhatsAppFloat || mod,
    })),
  'whatsapp_chunk_reloaded',
) as any;

import dynamic from 'next/dynamic';

const SentinelFlashTicker = dynamic(() => import('@/widgets/brand-ui/layout/SentinelFlashTicker'), { ssr: false });
const ChatErrorBoundary = dynamic(() => import('@/shared/ui/error-boundary/ChatErrorBoundary'), { ssr: false });
const FloatingActionOrbit = dynamic(() => import('@/widgets/brand-ui/layout/FloatingActionOrbit').then(m => m.FloatingActionOrbit), { ssr: false });
const MobileBottomBar = dynamic(() => import('@/widgets/brand-ui/layout/MobileBottomBar').then(m => m.MobileBottomBar), { ssr: false });
const NeuroTrajectoryDriver = dynamic(() => import('@/features/predictive/ui/NeuroTrajectoryDriver').then(m => m.NeuroTrajectoryDriver), { ssr: false });
const NeuroUIAdapter = dynamic(() => import('@/widgets/brand-ui/layout/NeuroUIAdapter').then(m => m.NeuroUIAdapter), { ssr: false });
const SentinelPulseFeed = dynamic(() => import('@/widgets/brand-ui/layout/SentinelPulseFeed'), { ssr: false });

interface FloatingWidgetsHostProps {
  inventory: any[];
  activeWidget: 'chat' | 'voice' | 'whatsapp' | null;
  onWidgetSelect: (widget: 'chat' | 'voice' | 'whatsapp' | null) => void;
}

export default function FloatingWidgetsHost({ inventory, activeWidget, onWidgetSelect }: FloatingWidgetsHostProps) {
  const [showDeferred, setShowDeferred] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowDeferred(true);
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <SentinelFlashTicker />
        </div>
      </div>

      <NeuroTrajectoryDriver />
      <NeuroUIAdapter />
      <SentinelPulseFeed />

      {showDeferred && (
        <FloatingActionOrbit
          activeWidget={activeWidget}
          onWidgetSelect={onWidgetSelect}
          chatWidget={
            <ChatErrorBoundary>
              <Suspense fallback={null}>
                <AIChatWidget inventory={inventory} />
              </Suspense>
            </ChatErrorBoundary>
          }
          voiceWidget={
            <ChatErrorBoundary>
              <Suspense fallback={null}>
                <VoiceWidget />
              </Suspense>
            </ChatErrorBoundary>
          }
          whatsappWidget={
            <ChatErrorBoundary>
              <Suspense fallback={null}>
                <WhatsAppFloat isEmbedded={true} inventory={inventory} />
              </Suspense>
            </ChatErrorBoundary>
          }
        />
      )}
      <MobileBottomBar />
    </>
  );
}
