import { supabase } from '@/shared/api/supabase/supabase';
import { sendWhatsAppMessage } from '@/features/leads/model/whatsappService';

interface FordNewsAlert {
  title: string;
  slug: string;
  excerpt: string;
}

export class FordNewsBroadcaster {
  async broadcast(news: FordNewsAlert): Promise<{ notified: number }> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('phone, name, firstName')
        .not('phone', 'is', null)
        .or(`vehicleOfInterest.ilike.%Ford%,vehicleOfInterest.ilike.%ford%,notes.ilike.%ford%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !leads) {
        console.error('[FordNewsBroadcaster] Error fetching leads:', error);
        return { notified: 0 };
      }

      let notified = 0;
      const articleUrl = `https://richard-automotive.com/blog/${news.slug}`;

      for (const lead of leads) {
        const clientName = lead.firstName || lead.name?.split(' ')[0] || 'amigo';
        const message = `🚗 ¡Hola ${clientName}! Richard Automotive te trae una noticia que te puede interesar:\n\n📰 *${news.title}*\n${news.excerpt}\n\nLee el artículo completo aquí:\n${articleUrl}\n\n¿Te gustaría saber más? Estamos en Vega Alta. ¡Te esperamos! 🏁`;

        try {
          await sendWhatsAppMessage(lead.phone, message);
          notified++;
        } catch (err) {
          console.error(`[FordNewsBroadcaster] Failed to send to ${lead.phone}:`, err);
        }
      }

      console.log(`[FordNewsBroadcaster] Notified ${notified} leads about: ${news.title}`);
      return { notified };
    } catch (err) {
      console.error('[FordNewsBroadcaster] Error:', err);
      return { notified: 0 };
    }
  }
}
