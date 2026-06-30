import { captureHotLead } from '@/shared/api/supabase/supabaseClient';

const WHATSAPP_NUMBER = '17873682880';

export function openWhatsAppWithCapture(
  car: { id: string; name: string; price: number },
  payment?: number,
  pronto?: number,
) {
  const priceStr = car.price ? ` a $${car.price.toLocaleString()}` : '';
  const paymentStr = payment ? ` — pago estimado $${payment}/mes` : '';
  const prontoStr = pronto ? ` con pronto de $${pronto.toLocaleString()}` : '';
  const message = `Hola Richard! 👋 Me interesa el ${car.name}${priceStr}${paymentStr}${prontoStr}. ¿Está disponible? También quiero información sobre el Bono Web de $300.`;

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
