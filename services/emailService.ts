import { generateBlogPost } from "./geminiService";

export interface EmailTemplate {
    to: string;
    subject: string;
    body: string;
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

    // 3. Simulate Send (or call API)
    await simulateSend(emailData);

    return { success: true, message: "Newsletter dispatched" };
};

const RESEND_API_KEY = "re_GxkMnkUc_M2RZDh1JpS2uWM5PQ14joE8c"; // API Key Configurada

const simulateSend = async (data: EmailTemplate) => {
    // 1. Simulation Mode (Console Log)
    // 1. Simulation Mode (Console Log) - Only if key is invalid/missing
    if (!RESEND_API_KEY.startsWith("re_")) {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("%c[Simulated Email] Sent Successfully", "color: #00d26a; font-weight: bold;");
                console.log(`To: ${data.to}`);
                console.log(`Subject: ${data.subject}`);
                console.log("-----------------------------------");
                resolve(true);
            }, 1000);
        });
    }

    // 2. Real Sending Mode (Resend API)
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "Richard Auto News <hola@richard-automotive.com>", // Dominio Oficial Verificado
                to: [data.to],
                subject: data.subject,
                html: data.body
            })
        });

        if (response.ok) {
            console.log("✅ Email sent via Resend API!");
            return true;
        } else {
            console.error("❌ Resend API Error:", await response.json());
            return false;
        }
    } catch (e) {
        console.error("Network Error sending email:", e);
        return false;
    }
};
