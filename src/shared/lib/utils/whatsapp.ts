import { captureHotLead } from '@/shared/api/supabase/supabaseClient';

const WHATSAPP_NUMBER = '17873682880';

export function openWhatsAppWithCapture(
  car: { id: string; name: string; price: number },
  payment?: number,
  pronto?: number,
) {
  const message = `Hola Richard! 👋 Me interesa el ${car.name}.${payment ? ` Vi que tiene un pago estimado de $${payment}/mes` : ''}${pronto ? ` con pronto de $${pronto.toLocaleString()}` : ''}. ¿Está disponible?`;

  captureHotLead({
    vehicleId: car.id,
    vehicleName: car.name,
    vehiclePrice: car.price,
    monthlyPayment: payment,
    downPayment: pronto || 0,
    source: 'car_card_whatsapp',
  }).catch(() => {});

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    '_blank',
  );
}
