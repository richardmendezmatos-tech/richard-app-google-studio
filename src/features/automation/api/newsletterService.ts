import { generateBlogPost } from '@/shared/api/ai';
import { sendTransactionalEmail } from '@/shared/api/communications/emailService';

export const sendAutoNewsletter = async (email: string) => {
  console.log(`[EmailService] Initiating Auto-Newsletter for: ${email}`);

  // 1. Generate Content via AI
  console.log(`[EmailService] Generating Hyundai News Content...`);
  const news = await generateBlogPost('Novedades Recientes de Hyundai', 'professional', 'news');

  // 2. Construct Email
  const emailData = {
    to: email,
    subject: `Bienvenido a Richard Automotive | ${news.title}`,
    body: `
            <h1>Hola!</h1>
            <p>Gracias por suscribirte al Newsroom de Richard Automotive.</p>
            <hr />
            <h2>${news.title}</h2>
            <p>${news.excerpt}</p>
            <br />
            <a href="https://richard-automotive.com/blog/${news.id}">Leer completo</a>
        `,
  };

  // 3. Send using the same transactional pipeline
  const sent = await sendTransactionalEmail({
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.body,
  });

  return {
    success: sent,
    message: sent ? 'Newsletter dispatched' : 'Newsletter failed',
  };
};
