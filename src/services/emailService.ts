import { generateBlogPost } from "./geminiService";

export interface EmailTemplate {
    to: string;
    subject: string;
    body: string;
}

export interface TransactionalEmailInput {
    to: string;
    subject: string;
    html: string;
}

/**
 * Automates the "Welcome + Hyundai News" email flow.
 * Note: This currently simulates sending by logging to console.
 * To enable real sending, integrate Resend/SendGrid here.
 */
export const sendAutoNewsletter = async (email: string) => {
    console.log(`[EmailService] Initiating Auto-Newsletter for: ${email}`);

    // 1. Generate Content via AI
    console.log(`[EmailService] Generating Hyundai News Content...`);
    const news = await generateBlogPost("Novedades Recientes de Hyundai", "professional", "news");

    // 2. Construct Email
    const emailData: EmailTemplate = {
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
        `
    };

    // 3. Send using the same transactional pipeline
    const sent = await sendTransactionalEmail({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.body
    });

    return {
        success: sent,
        message: sent ? "Newsletter dispatched" : "Newsletter failed"
    };
};

const RESEND_API_KEY = (import.meta.env.VITE_RESEND_API_KEY || "").trim();
const RESEND_FROM = (import.meta.env.VITE_RESEND_FROM_EMAIL || "Richard Auto News <hola@richard-automotive.com>").trim();
const RESEND_API_URL = "https://api.resend.com/emails";

export const sendTransactionalEmail = async (data: TransactionalEmailInput): Promise<boolean> => {
    // Simulation mode for local/dev when Resend is not configured.
    if (!RESEND_API_KEY.startsWith("re_")) {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("%c[Simulated Email] Sent Successfully", "color: #00d26a; font-weight: bold;");
                console.log(`To: ${data.to}`);
                console.log(`Subject: ${data.subject}`);
                console.log("-----------------------------------");
                resolve(true);
            }, 300);
        });
    }

    // Real sending mode (Resend API).
    try {
        const response = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: RESEND_FROM,
                to: [data.to],
                subject: data.subject,
                html: data.html
            })
        });

        if (response.ok) {
            console.log("[EmailService] Email sent via Resend API");
            return true;
        } else {
            console.error("[EmailService] Resend API error:", await response.json());
            return false;
        }
    } catch (e) {
        console.error("[EmailService] Network error sending email:", e);
        return false;
    }
};
