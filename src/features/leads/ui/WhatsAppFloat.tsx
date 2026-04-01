import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { addLead } from '@/shared/api/adapters/leads/crmService';
import { useMetaPixel } from '@/shared/lib/analytics/useMetaPixel';
import { useLocation } from '@/shared/lib/next-route-adapter';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { createInteractiveMenu } from '@/features/leads/model/whatsappService';
import { Car } from '@/shared/types/types';
import { WhatsAppIcon } from '@/shared/ui/components/icons/WhatsAppIcon';
import styles from './WhatsAppFloat.module.css';

interface WhatsAppFloatProps {
  isEmbedded?: boolean;
  inventory?: Car[];
}

const INITIAL_MESSAGES: { text: string; sender: 'user' | 'bot' }[] = [
  { text: '¡Hola! 👋 Soy Richard IA, tu asesor personal.', sender: 'bot' },
  { text: 'Mi meta es tu tranquilidad. ¿En qué puedo ayudarte a encontrar hoy? 🛡️', sender: 'bot' },
];

// ─── Types and Constants ───────────────────────────────────────────────────
type QuickAction = { icon: string; label: string; message: string };
type VehicleContext = { id?: string; make?: string; model?: string; year?: string | number };

const getContextActions = (
  pathname: string,
  vehicle?: VehicleContext | null,
  inventory: Car[] = [],
): QuickAction[] => {
  let activeVehicle = vehicle;
  if (!activeVehicle && pathname.includes('/vehicle/')) {
    const slug = pathname.split('/').pop();
    const found = inventory.find(
      (c) => c.id === slug || c.name.toLowerCase().replace(/\s+/g, '-') === slug,
    );
    if (found) {
      activeVehicle = {
        id: found.id,
        make: found.make,
        model: found.model,
        year: found.year,
      };
    }
  }

  if (activeVehicle) {
    return [
      {
        icon: '🛡️',
        label: `Consultar seguridad de este ${activeVehicle.make}`,
        message: `Hola Richard IA, busco seguridad y paz mental. ¿Este ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} está listo para una prueba de manejo protegida?`,
      },
      {
        icon: '💰',
        label: 'Ver plan de pagos cómodo',
        message: `Hola! Me interesa un plan de financiamiento tranquilo para el ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}.`,
      },
      {
        icon: '📅',
        label: 'Agendar cita privada',
        message: `Hola! Me gustaría coordinar una visita privada para ver el ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}.`,
      },
    ];
  }
  if (
    pathname.includes('financiamiento') ||
    pathname.includes('prequal') ||
    pathname.includes('prequalify')
  ) {
    return [
      {
        icon: '✅',
        label: 'Quiero pre-cualificarme',
        message: 'Hola! Quiero comenzar mi proceso de pre-cualificación para un auto.',
      },
      {
        icon: '💳',
        label: 'Tengo crédito bajo',
        message: 'Necesito ayuda con financiamiento, tengo historial de crédito limitado.',
      },
      {
        icon: '🏦',
        label: 'Comparar bancos',
        message: 'Quiero comparar las opciones de tasas de interés disponibles.',
      },
    ];
  }
  if (
    pathname.includes('usados-en') ||
    pathname.includes('bayamon') ||
    pathname.includes('vega-alta')
  ) {
    const city = pathname.includes('bayamon')
      ? 'Bayamón'
      : pathname.includes('vega-alta')
        ? 'Vega Alta'
        : 'Puerto Rico';
    return [
      {
        icon: '📍',
        label: `Dealer en ${city}`,
        message: `Hola! Estoy en ${city} y quiero saber más sobre su inventario.`,
      },
      {
        icon: '🚗',
        label: 'Ver inventario disponible',
        message: 'Me gustaría ver los autos disponibles cerca de mí.',
      },
      {
        icon: '💰',
        label: 'Preguntar por financiamiento',
        message: `Quiero financiar un auto desde ${city}.`,
      },
    ];
  }
  if (pathname.includes('vender') || pathname.includes('appraisal') || pathname.includes('trade')) {
    return [
      {
        icon: '🏷️',
        label: 'Tasar mi auto ahora',
        message: 'Hola! Quiero una tasación de mi auto. ¿Me pueden ayudar?',
      },
      {
        icon: '🔄',
        label: 'Trade-in por uno nuevo',
        message: 'Quiero hacer trade-in de mi auto por uno del inventario.',
      },
      {
        icon: '📸',
        label: 'Enviar fotos de mi auto',
        message: 'Me gustaría enviar fotos de mi auto para una tasación rápida.',
      },
    ];
  }
  return [
    {
      icon: '🛡️',
      label: 'Ver Inventario Seguro',
      message:
        'Hola Richard IA! Me gustaría conocer su inventario de autos certificados y seguros.',
    },
    {
      icon: '✅',
      label: 'Prequalificación sin compromiso',
      message:
        'Hola! Me interesa saber mis opciones de financiamiento de forma privada y sin compromiso.',
    },
    {
      icon: '🤝',
      label: 'Hablar con un asesor',
      message: 'Hola! Necesito asesoría para encontrar el auto ideal que me brinde tranquilidad.',
    },
  ];
};

const getPreviewMessage = (pathname: string): string => {
  if (pathname.includes('financiamiento') || pathname.includes('prequal'))
    return '💳 ¿Dudas sobre financiamiento? Te ayudo en segundos.';
  if (pathname.includes('usados-en')) return '📍 ¿Quieres un dealer cerca de ti? Escríbenos.';
  if (pathname.includes('vender') || pathname.includes('appraisal'))
    return '🏷️ ¿Cuánto vale tu auto? Te damos precio hoy.';
  return '👋 ¿Buscas un auto? Escríbenos, respondemos en minutos.';
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({
  isEmbedded = false,
  inventory = [],
}) => {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [showPreview, setShowPreview] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'bot' | 'user' }[]>([
    { text: '¡Hola! 👋 Soy Richard IA, tu asesor digital.', sender: 'bot' },
    {
      text: 'Selecciona una opción y te conectamos en segundos con nuestro equipo. 🚀',
      sender: 'bot',
    },
  ]);

  const phoneNumber = SITE_CONFIG.contact.whatsapp;
  const location = useLocation();
  const { trackEvent } = useMetaPixel();

  const vehicle = useMemo(() => {
    const state = location.state as { vehicle?: VehicleContext } | null;
    return state?.vehicle;
  }, [location.state]);

  const quickActions = useMemo(
    () => getContextActions(location.pathname, vehicle, inventory),
    [location.pathname, vehicle, inventory],
  );

  const previewMsg = getPreviewMessage(location.pathname);

  useEffect(() => {
    const key = 'wa_preview_seen';
    if (isOpen || dismissed || sessionStorage.getItem(key)) return;
    const show = setTimeout(() => {
      setShowPreview(true);
      sessionStorage.setItem(key, 'true');
    }, 4000);
    const hide = setTimeout(() => setShowPreview(false), 12000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [isOpen, dismissed]);

  const [prevPath, setPrevPath] = useState(location.pathname);

  // Reset messages when route changes (during render for performance and lint compliance)
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setMessages(INITIAL_MESSAGES);
  }

  const handleQuickAction = async (action: QuickAction) => {
    setMessages((prev) => [...prev, { text: action.label, sender: 'user' }]);
    trackEvent('Lead', { content_name: 'WhatsApp Quick Action', content_category: action.label });
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let finalMsg = action.message;
      if (vehicle)
        finalMsg += ` [Auto: ${vehicle.year} ${vehicle.make} ${vehicle.model} #${vehicle.id}]`;

      addLead({
        type: 'whatsapp',
        name: 'Lead WhatsApp',
        phone: 'Pendiente',
        notes: `Acción: ${action.label}. Ruta: ${location.pathname}`,
        carId: vehicle?.id,
      });

      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMsg)}`, '_blank');
    }, 1000);
  };

  const handleOpenChat = () => {
    trackEvent('Lead', { content_name: 'WhatsApp Open Chat', content_category: 'Floating Button' });
    const menu = createInteractiveMenu();
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(menu)}`, '_blank');
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setShowPreview(false);
    setDismissed(true);
  };

  const containerClasses = `${isEmbedded ? styles.relativeContainer : styles.fixedContainer} ${styles.container}`;

  return (
    <div className={containerClasses}>
      {/* ── Preview Bubble ─────────────────────────────────────────────── */}
      {showPreview && !isOpen && !isEmbedded && (
        <div className={styles.previewBubble} onClick={handleToggle}>
          <span className={styles.previewDot} />
          <span>{previewMsg}</span>
          <div className={styles.previewArrow} />
        </div>
      )}

      {/* ── Chat Widget ────────────────────────────────────────────────── */}
      {isOpen && (
        <div className={`${styles.chatWidget} ${isEmbedded ? styles.chatWidgetEmbedded : ''}`}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerGlow} />
            <div className={styles.headerContent}>
              <div className={styles.iconContainer}>
                <div className={styles.iconBg}>
                  <WhatsAppIcon size={26} />
                </div>
                <span className={styles.statusIndicator} />
              </div>
              <div className={styles.headerInfo}>
                <h3 className="m-0">Richard IA · WHATSAPP</h3>
                <div className={styles.statusText}>
                  <span className={styles.statusDot} />
                  <span className={styles.statusLabel}>EN LÍNEA AHORA</span>
                </div>
              </div>
              <button className={styles.closeButton} onClick={handleToggle} title="Cerrar chat">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className={styles.chatBody}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.message} ${msg.sender === 'bot' ? styles.botMessage : styles.userMessage}`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className={styles.typingIndicator}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            {quickActions.map((action, i) => (
              <button
                key={i}
                className={styles.actionButton}
                onClick={() => handleQuickAction(action)}
              >
                <span className={styles.actionIcon}>{action.icon}</span>
                <span className={styles.actionLabel}>{action.label}</span>
                <ChevronRight size={13} className={styles.actionChevron} />
              </button>
            ))}
          </div>

          {/* Footer CTA */}
          <div className={styles.footer}>
            <button className={styles.primaryButton} onClick={handleOpenChat}>
              <WhatsAppIcon size={16} />
              Abrir Chat en WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Button ─────────────────────────────────────────────── */}
      {!isEmbedded && (
        <button
          className={`${styles.floatingButton} ${isOpen ? styles.floatingButtonOpen : styles.floatingButtonRing}`}
          onClick={handleToggle}
          aria-label="Abrir chat de WhatsApp"
          title="Chat con Richard IA"
        >
          {isOpen ? <X size={24} /> : <WhatsAppIcon size={30} />}
          {!isOpen && <span className={styles.badge}>1</span>}
        </button>
      )}
    </div>
  );
};
