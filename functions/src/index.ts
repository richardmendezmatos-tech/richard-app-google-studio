import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { onCallGenkit } from 'firebase-functions/https';

// Initialize Genkit with Google AI plugin
const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-1.5-flash',
});

// Define the Flow
export const generateCarDescription = ai.defineFlow(
    {
        name: 'generateCarDescription',
        inputSchema: z.object({
            carModel: z.string(),
            features: z.array(z.string()).optional(),
        }),
        outputSchema: z.string(),
        streamSchema: z.string(),
    },
    async (input, { sendChunk }) => {
        const { carModel, features } = input;

        const prompt = `
      Eres un experto en marketing automotriz para el mercado de Puerto Rico.
      Escribe una descripción persuasiva y emocionante para vender un ${carModel}.
      
      ${features && features.length > 0 ? `Destaca estas características: ${features.join(', ')}.` : ''}
      
      La descripción debe ser corta (máximo 3 párrafos), usar un tono profesional pero entusiasta, 
      y mencionar que está disponible en "Richard Automotive".
    `;

        const { response, stream } = await ai.generateStream(prompt);

        for await (const chunk of stream) {
            sendChunk(chunk.text);
        }

        const result = await response;
        return result.text;
    }
);

export const generateDescription = onCallGenkit({
    authPolicy: () => true, // Allow all for dev/demo purposes
    cors: true,
}, generateCarDescription);


// Import Cloud Functions v2
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { sendNotificationEmail } from './services/emailService';

// --- New Lead Notification & Analysis ---

// Define a Flow for Lead Analysis
export const analyzeLead = ai.defineFlow(
    {
        name: 'analyzeLead',
        inputSchema: z.object({
            monthlyIncome: z.string(),
            timeAtJob: z.string(),
            jobTitle: z.string(),
            employer: z.string()
        }),
        outputSchema: z.object({
            score: z.number().describe("Score from 1-100 based on financial stability"),
            category: z.enum(["High Potential", "Standard", "Needs Review"]),
            summary: z.string().describe("Brief analysis for the sales agent"),
            recommendedAction: z.string()
        })
    },
    async (input) => {
        // Prompt removed for mock response
        return {
            score: 85,
            category: "High Potential" as const,
            summary: "Candidate has stable employment and sufficient income.",
            recommendedAction: "Call immediately to finalize verification."
        };
    }
);

export const onNewApplication = onDocumentCreated('applications/{applicationId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        return;
    }

    const data = snapshot.data();
    const appId = event.params.applicationId;

    logger.info(`[NEW LEAD]Application received: ${appId}`, { email: data.email });

    try {
        // Run AI Analysis
        // Note: We intentionally call the flow directly here since we are in the same runtime.
        const analysis = await analyzeLead({
            monthlyIncome: data.monthlyIncome || "0",
            timeAtJob: data.timeAtJob || "Unspecified",
            jobTitle: data.jobTitle || "Unspecified",
            employer: data.employer || "Unspecified"
        });

        // Send Real Email
        try {
            await sendNotificationEmail({
                to: 'richardmendezmatos@gmail.com', // Using the owner's email
                subject: `New Lead - ${data.firstName} ${data.lastName} (${analysis.category})`,
                html: `
                    <h2>New Lead Received</h2>
                    <p><strong>Applicant:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <hr>
                    <h3>AI Analysis</h3>
                    <p><strong>Score:</strong> ${analysis.score}/100</p>
                    <p><strong>Category:</strong> ${analysis.category}</p>
                    <p><strong>Summary:</strong> ${analysis.summary}</p>
                    <p><strong>Recommended Action:</strong> ${analysis.recommendedAction}</p>
                `
            });
        } catch (emailError) {
            logger.error("Failed to send email", emailError);
        }

        // In a real app, you would verify the 'snapshot.ref.update()' works here:
        await snapshot.ref.update({
            aiAnalysis: analysis,
            status: analysis.score > 80 ? 'pre-approved' : 'pending_review'
        });

    } catch (err) {
        logger.error("Error analyzing lead", err);
    }
});

// Start a flow server for local development handling stream requests
import { startFlowServer } from '@genkit-ai/express';
if (process.env.GENKIT_ENV === 'dev') {
    startFlowServer({
        flows: [generateCarDescription, analyzeLead],
        port: 3400,
        cors: { origin: '*' }
    });
}

