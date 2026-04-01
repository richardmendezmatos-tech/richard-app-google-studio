export interface TransactionalEmailInput {
  to: string;
  subject: string;
  html: string;
}

const RESEND_API_KEY = (process.env.VITE_RESEND_API_KEY || '').trim();
const RESEND_FROM = (
  process.env.VITE_RESEND_FROM_EMAIL || 'Richard Auto News <hola@richard-automotive.com>'
).trim();
const RESEND_API_URL = 'https://api.resend.com/emails';

export const sendTransactionalEmail = async (data: TransactionalEmailInput): Promise<boolean> => {
  // Simulation mode for local/dev when Resend is not configured.
  if (!RESEND_API_KEY.startsWith('re_')) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('%c[Simulated Email] Sent Successfully', 'color: #00d26a; font-weight: bold;');
        console.log(`To: ${data.to}`);
        console.log(`Subject: ${data.subject}`);
        console.log('-----------------------------------');
        resolve(true);
      }, 300);
    });
  }

  // Real sending mode (Resend API).
  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [data.to],
        subject: data.subject,
        html: data.html,
      }),
    });

    if (response.ok) {
      console.log('[EmailService] Email sent via Resend API');
      return true;
    } else {
      console.error('[EmailService] Resend API error:', await response.json());
      return false;
    }
  } catch (e) {
    console.error('[EmailService] Network error sending email:', e);
    return false;
  }
};
