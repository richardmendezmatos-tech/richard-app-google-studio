import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { sendWhatsAppMessage } from '@/features/leads/model/whatsappService';

interface FordNewsAlert {
  title: string;
  slug: string;
  excerpt: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class FordNewsBroadcaster {
  async broadcast(news: FordNewsAlert): Promise<{ notified: number }> {
    try {
      const supabase = createServerSupabaseClient();
      if (!supabase) {
        console.error('[FordNewsBroadcaster] No database client available');
        return { notified: 0 };
      }
      const { data: leads, error } = await supabase
        .from('leads')
        .select('phone, first_name')
        .not('phone', 'is', null)
        .or(`vehicle_of_interest.ilike.%Ford%,vehicle_of_interest.ilike.%ford%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !leads) {
        console.error('[FordNewsBroadcaster] Error fetching leads:', error);
        return { notified: 0 };
      }

      let notified = 0;
      const articleUrl = `https://www.richard-automotive.com/blog/${news.slug}`;

      for (const lead of leads) {
        // Add a randomized delay (2000ms to 5000ms) between sending messages to prevent WhatsApp bans
        if (notified > 0) {
          const sleepTime = Math.random() * 3000 + 2000;
          await delay(sleepTime);
        }

        const clientName = lead.first_name?.split(' ')[0] || 'amigo';
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

