// src/features/inventory-sync/model/ProactiveInventoryBroadcaster.ts
import { Vehicle } from '@/entities/inventory/model/sync/Vehicle';
import { sendWhatsAppMessage } from '@/features/leads/model/whatsappService';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { Lead } from '@/shared/types/lead';

export class ProactiveInventoryBroadcaster {
  /**
   * Difunde proactivamente notificaciones por WhatsApp a los leads activos
   * que coincidan con el perfil de las unidades nuevas o con actualización de precio.
   */
  public async broadcast(inserts: Vehicle[], updates: Vehicle[]): Promise<void> {
    const totalVehicles = [...inserts, ...updates];
    if (totalVehicles.length === 0) return;

    try {
      // 1. Obtener leads activos con teléfono registrado
      const { data: rawLeads, error } = await supabase
        .from('leads')
        .select('*')
        .not('phone', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !rawLeads) {
        console.error('[ProactiveBroadcaster] Error consultando leads activos:', error);
        return;
      }

      const leads = rawLeads as Lead[];

      // 2. Procesar difusiones de manera concurrente controlada
      // Iteramos sobre las unidades para notificar a leads con intereses afines
      for (const vehicle of totalVehicles) {
        const isUpdate = updates.includes(vehicle);
        const { make, model, year } = vehicle.props;
        const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(vehicle.price);
        const vehicleTitle = `${year} ${make} ${model}`.trim();

        // Encontrar leads interesados en esta marca, modelo, o con alta intención
        const matchingLeads = leads.filter(lead => {
          if (!lead.phone) return false;

          const interestStr = `${lead.vehicleOfInterest || ''} ${lead.aiAnalysis?.unidad_interes || ''} ${lead.notes || ''}`.toLowerCase();
          const matchesMakeOrModel = interestStr.includes(make.toLowerCase()) || interestStr.includes(model.toLowerCase());
          const isHighIntent = (lead.closureProbability && lead.closureProbability >= 70) || lead.status === 'negotiation';

          return matchesMakeOrModel || isHighIntent;
        });

        // Limitar notificaciones por unidad para evitar saturación (Anti-Spam)
        const targetLeads = matchingLeads.slice(0, 5);

        for (const lead of targetLeads) {
          if (!lead.phone) continue;

          const clientName = lead.firstName || lead.name?.split(' ')[0] || 'amigo';
          
          let message = '';
          if (isUpdate) {
            message = `🚨 ¡Hola ${clientName}! Richard por aquí. Te tengo excelentes noticias: la unidad *${vehicleTitle}* que tenemos en inventario acaba de recibir un ajuste especial a ${priceFormatted}. ¿Te gustaría aprovechar y agendar una prueba de manejo antes de que se reserve? 🚗💨`;
          } else {
            message = `🚘 ¡Hola ${clientName}! Te saluda Richard de Richard Automotive. Acaba de ingresar a nuestro inventario una unidad que coincide perfectamente con lo que buscas: *${vehicleTitle}* por ${priceFormatted}. Está impecable y lista para entrega. ¿Te envío más fotos o te reservo un espacio para verla hoy? ✨`;
          }

          // Disparo asíncrono robusto
          await sendWhatsAppMessage(lead.phone, message, {
            template: isUpdate ? 'price_drop_broadcast' : 'new_arrival_broadcast'
          });

          console.log(`[ProactiveBroadcaster] Mensaje proactivo enviado a ${lead.phone} para la unidad ${vehicleTitle}`);
        }
      }

    } catch (err) {
      console.error('[ProactiveBroadcaster] Excepción en la difusión proactiva:', err);
    }
  }
}
