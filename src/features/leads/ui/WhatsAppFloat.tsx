import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { addLead } from '@/shared/api/adapters/leads/crmService';
import { useMetaPixel } from '@/shared/lib/analytics/useMetaPixel';
import { useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { createInteractiveMenu } from '@/features/leads/model/whatsappService';
import { Car } from '@/shared/types/types';
import { WhatsAppIcon } from '@/shared/ui/components/icons/WhatsAppIcon';

interface WhatsAppFloatProps {
  isEmbedded?: boolean;
  inventory?: Car[];
}

const INITIAL_MESSAGES: { text: string; sender: 'user' | 'bot' }[] = [
  { text: '¡Hola! 👋 Soy Richard IA, tu asesor personal.', sender: 'bot' },
  { text: 'Mi meta es tu tranquilidad. ¿En qué puedo ayudarte a encontrar hoy? 🛡️', sender: 'bot' },
];

// ─── Context detection ────────────────────────────────────────────────────────
type QuickAction = { icon: string; label: string; message: string };

const getContextActions = (pathname: string, vehicle?: VehicleContext | null, inventory: Car[] = []): QuickAction[] => {
  // Enhanced detection: if no vehicle in state, try to find it by current slug
  let activeVehicle = vehicle;
  if (!activeVehicle && pathname.includes('/vehicle/')) {
    const slug = pathname.split('/').pop();
    const found = inventory.find(c => c.id === slug || c.name.toLowerCase().replace(/\s+/g, '-') === slug);
    if (found) {
      activeVehicle = {
        id: found.id,
        make: found.make,
        model: found.model,
        year: found.year
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
      { icon: '💰', label: 'Ver plan de pagos cómodo', message: `Hola! Me interesa un plan de financiamiento tranquilo para el ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}.` },
      { icon: '📅', label: 'Agendar cita privada', message: `Hola! Me gustaría coordinar una visita privada para ver el ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}.` },
    ];
  }
  if (pathname.includes('financiamiento') || pathname.includes('prequal') || pathname.includes('prequalify')) {
    return [
      { icon: '✅', label: 'Quiero pre-cualificarme', message: 'Hola! Quiero comenzar mi proceso de pre-cualificación para un auto.' },
      { icon: '💳', label: 'Tengo crédito bajo', message: 'Necesito ayuda con financiamiento, tengo historial de crédito limitado.' },
      { icon: '🏦', label: 'Comparar bancos', message: 'Quiero comparar las opciones de tasas de interés disponibles.' },
    ];
  }
  if (pathname.includes('usados-en') || pathname.includes('bayamon') || pathname.includes('vega-alta')) {
    const city = pathname.includes('bayamon') ? 'Bayamón' : pathname.includes('vega-alta') ? 'Vega Alta' : 'Puerto Rico';
    return [
      { icon: '📍', label: `Dealer en ${city}`, message: `Hola! Estoy en ${city} y quiero saber más sobre su inventario.` },
      { icon: '🚗', label: 'Ver inventario disponible', message: 'Me gustaría ver los autos disponibles cerca de mí.' },
      { icon: '💰', label: 'Preguntar por financiamiento', message: `Quiero financiar un auto desde ${city}.` },
    ];
  }
  if (pathname.includes('vender') || pathname.includes('appraisal') || pathname.includes('trade')) {
    return [
      { icon: '🏷️', label: 'Tasar mi auto ahora', message: 'Hola! Quiero una tasación de mi auto. ¿Me pueden ayudar?' },
      { icon: '🔄', label: 'Trade-in por uno nuevo', message: 'Quiero hacer trade-in de mi auto por uno del inventario.' },
      { icon: '📸', label: 'Enviar fotos de mi auto', message: 'Me gustaría enviar fotos de mi auto para una tasación rápida.' },
    ];
  }
  // Default / Storefront
  return [
    { icon: '🛡️', label: 'Ver Inventario Seguro', message: 'Hola Richard IA! Me gustaría conocer su inventario de autos certificados y seguros.' },
    { icon: '✅', label: 'Prequalificación sin compromiso', message: 'Hola! Me interesa saber mis opciones de financiamiento de forma privada y sin compromiso.' },
    { icon: '🤝', label: 'Hablar con un asesor', message: 'Hola! Necesito asesoría para encontrar el auto ideal que me brinde tranquilidad.' },
  ];
};

// ─── Preview bubble messages by context ──────────────────────────────────────
const getPreviewMessage = (pathname: string): string => {
  if (pathname.includes('financiamiento') || pathname.includes('prequal'))
    return '💳 ¿Dudas sobre financiamiento? Te ayudo en segundos.';
  if (pathname.includes('usados-en'))
    return '📍 ¿Quieres un dealer cerca de ti? Escríbenos.';
  if (pathname.includes('vender') || pathname.includes('appraisal'))
    return '🏷️ ¿Cuánto vale tu auto? Te damos precio hoy.';
  return '👋 ¿Buscas un auto? Escríbenos, respondemos en minutos.';
};

type VehicleContext = { id?: string; make?: string; model?: string; year?: string | number };

// ─── Main Component ───────────────────────────────────────────────────────────
export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({ isEmbedded = false, inventory = [] }) => {
  const [isOpen, setIsOpen] = useState(isEmbedded); // Default open if embedded
  const [showPreview, setShowPreview] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'bot' | 'user' }[]>([
    { text: '¡Hola! 👋 Soy Richard IA, tu asesor digital.', sender: 'bot' },
    { text: 'Selecciona una opción y te conectamos en segundos con nuestro equipo. 🚀', sender: 'bot' },
  ]);

  const phoneNumber = SITE_CONFIG.contact.whatsapp;
  const location = useLocation();
  const { trackEvent } = useMetaPixel();

  const state = location.state as { vehicle?: VehicleContext } | null;
  const vehicle = state?.vehicle;
  const quickActions = getContextActions(location.pathname, vehicle, inventory);
  const previewMsg = getPreviewMessage(location.pathname);

  // Smart preview: once per session, after 4s, hide after 8s
  useEffect(() => {
    const key = 'wa_preview_seen';
    if (isOpen || dismissed || sessionStorage.getItem(key)) return;
    const show = setTimeout(() => {
      setShowPreview(true);
      sessionStorage.setItem(key, 'true');
    }, 4000);
    const hide = setTimeout(() => setShowPreview(false), 12000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [isOpen, dismissed]);

  // Reset messages when route changes (context shift) - idiomatic way to reset state on change
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    if (messages.length > 2) {
      setMessages(INITIAL_MESSAGES);
    }
  }

  const handleQuickAction = async (action: QuickAction) => {
    setMessages((prev) => [...prev, { text: action.label, sender: 'user' }]);
    trackEvent('Lead', { content_name: 'WhatsApp Quick Action', content_category: action.label });
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let finalMsg = action.message;
      if (vehicle) finalMsg += ` [Auto: ${vehicle.year} ${vehicle.make} ${vehicle.model} #${vehicle.id}]`;

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

  return (
    <div className={`${isEmbedded ? 'relative p-0' : 'fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3'}`}>

      {/* ── Preview Bubble ─────────────────────────────────────────────── */}
      {showPreview && !isOpen && !isEmbedded && (
        <div
          className="relative flex items-center gap-2 max-w-[240px] px-4 py-2.5 rounded-2xl text-white text-[12px] font-semibold leading-tight cursor-pointer select-none"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(37,211,102,0.35)',
            boxShadow: '0 8px 32px rgba(37,211,102,0.2), 0 2px 8px rgba(0,0,0,0.4)',
            animation: 'wa-slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          onClick={handleToggle}
        >
          <span className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" style={{ animation: 'wa-pulse 1.5s ease-in-out infinite' }} />
          <span>{previewMsg}</span>
          {/* Arrow pointing right-down */}
          <div
            className="absolute -bottom-2 right-6 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '8px solid #16213e',
            }}
          />
        </div>
      )}

      {/* ── Chat Widget ────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="w-[320px] overflow-hidden rounded-3xl font-sans"
          style={{
            background: '#0f0f1a',
            border: isEmbedded ? 'none' : '1px solid rgba(37,211,102,0.25)',
            boxShadow: isEmbedded ? 'none' : '0 24px 80px rgba(37,211,102,0.18), 0 8px 32px rgba(0,0,0,0.6)',
            animation: isEmbedded ? 'none' : 'wa-open 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transformOrigin: 'bottom right',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #075E54 0%, #128C7E 50%, #25D366 100%)',
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Glow orb */}
            <div style={{
              position: 'absolute', top: '-20px', right: '-20px',
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', filter: 'blur(12px)',
            }} />
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                }}>
                  <WhatsAppIcon size={26} />
                </div>
                <span style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 12, height: 12, background: '#a3ffac',
                  border: '2px solid #075E54', borderRadius: '50%',
                  animation: 'wa-pulse 2s ease-in-out infinite',
                }} />
              </div>
              <div className="flex-1">
                <h3 style={{ color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '0.05em', margin: 0 }}>
                  RICHARD IA · WHATSAPP
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span style={{ width: 6, height: 6, background: '#a3ffac', borderRadius: '50%', animation: 'wa-pulse 1.5s ease-in-out infinite' }} />
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em' }}>
                    EN LÍNEA AHORA
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggle}
                style={{
                  background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: '50%',
                  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.8)',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div style={{
            padding: '16px', height: 280, overflowY: 'auto',
            background: 'linear-gradient(180deg, #0d1117 0%, #0f0f1a 100%)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  maxWidth: '88%',
                  alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'bot' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                  background: msg.sender === 'bot'
                    ? 'rgba(255,255,255,0.06)'
                    : 'linear-gradient(135deg, #128C7E, #25D366)',
                  border: msg.sender === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  color: '#f0f0f0',
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1.5,
                  boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(37,211,102,0.3)' : 'none',
                  animation: 'wa-msg-in 0.3s ease',
                }}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{
                alignSelf: 'flex-start', display: 'flex', gap: 5,
                padding: '10px 14px', borderRadius: '4px 18px 18px 18px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <span key={i} style={{
                    width: 6, height: 6, background: '#25D366', borderRadius: '50%',
                    animation: `wa-bounce 1s ease-in-out infinite`,
                    animationDelay: `${d}s`,
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            padding: '12px 14px 6px',
            background: '#0f0f1a',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(action)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, cursor: 'pointer', marginBottom: 6,
                  transition: 'all 0.2s',
                  color: '#e0e0e0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(37,211,102,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(37,211,102,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <span style={{ fontSize: 18 }}>{action.icon}</span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>
                  {action.label}
                </span>
                <ChevronRight size={13} style={{ color: '#25D366', opacity: 0.7 }} />
              </button>
            ))}
          </div>

          {/* Footer CTA */}
          <div style={{ padding: '0 14px 14px', background: '#0f0f1a' }}>
            <button
              onClick={handleOpenChat}
              style={{
                width: '100%', padding: '11px',
                background: 'linear-gradient(135deg, #128C7E, #25D366)',
                border: 'none', borderRadius: 14, cursor: 'pointer',
                color: '#fff', fontSize: 11, fontWeight: 800,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.35)';
              }}
            >
              <WhatsAppIcon size={16} />
              Abrir Chat en WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Button ─────────────────────────────────────────────── */}
      {!isEmbedded && (
        <button
          onClick={handleToggle}
          aria-label="Abrir chat de WhatsApp"
          style={{
            width: 60, height: 60, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(37,211,102,0.5), 0 0 0 0 rgba(37,211,102,0.4)',
            animation: isOpen ? 'none' : 'wa-ring 2.5s ease-in-out infinite',
            transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s',
            transform: isOpen ? 'rotate(10deg) scale(0.92)' : 'scale(1)',
            color: '#fff',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (!isOpen) e.currentTarget.style.transform = 'scale(1.12)';
          }}
          onMouseLeave={(e) => {
            if (!isOpen) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isOpen ? <X size={24} /> : <WhatsAppIcon size={30} />}

          {/* Notification badge */}
          {!isOpen && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 16, height: 16, background: '#ff3b3b',
              borderRadius: '50%', border: '2px solid #0f0f1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800, color: '#fff',
            }}>
              1
            </span>
          )}
        </button>
      )}

      {/* ── Keyframe Styles ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes wa-ring {
          0%   { box-shadow: 0 4px 24px rgba(37,211,102,0.5), 0 0 0 0 rgba(37,211,102,0.4); }
          70%  { box-shadow: 0 4px 24px rgba(37,211,102,0.5), 0 0 0 16px rgba(37,211,102,0); }
          100% { box-shadow: 0 4px 24px rgba(37,211,102,0.5), 0 0 0 0 rgba(37,211,102,0); }
        }
        @keyframes wa-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes wa-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-5px); }
        }
        @keyframes wa-open {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes wa-slide-in {
          from { opacity: 0; transform: translateX(20px) scale(0.92); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes wa-msg-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
