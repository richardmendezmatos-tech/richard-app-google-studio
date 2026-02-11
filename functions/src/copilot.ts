import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { ai } from "./services/aiManager";
import { assertSignedIn } from "./security/policies";

export const chatWithAgent = onCall({
    region: "us-central1",
    secrets: ["GEMINI_API_KEY", "VITE_GEMINI_API_KEY"],
    timeoutSeconds: 60,
    memory: "512MiB"
}, async (request) => {
    logger.info("🤖 Chat with Agent (Genkit Backend) - Request Received");

    // 1. Validate Auth
    assertSignedIn(request.auth ?? null);

    // 2. Extract Data
    const { messages, agentId } = request.data;
    logger.info(`📝 Agent ID: ${agentId}, Message Count: ${messages?.length || 0}`);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        logger.warn("❌ Invalid messages format");
        throw new HttpsError("invalid-argument", "Messages array is required and cannot be empty.");
    }

    try {
        // 3. Construct History for Genkit (Prompt-based)
        // Since ai.generate() doesn't support 'history' directly in this version,
        // we inject it into the prompt.
        const historyText = messages
            .slice(0, -1)
            .map((msg: any) => {
                const role = msg?.role === "user" ? "User" : "Agent";
                const content = String(msg?.content || "");
                return `${role}: ${content}`;
            })
            .join("\n");

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || typeof lastMessage.content !== "string" || !lastMessage.content.trim()) {
            throw new HttpsError("invalid-argument", "Last message content is required.");
        }
        const prompt = `
Context / History:
${historyText}

User Input:
${lastMessage.content}

Respond to the user input based on the context.
`;

        logger.info("🚀 Sending request to Genkit (Gemini 1.5 Flash)...");

        // 4. Generate Content
        const result = await ai.generate({
            prompt: prompt,
        });

        const text = result.text;

        logger.info("✅ Genkit Response Received");

        // 5. Return standard format
        return {
            status: "success",
            message: text,
            meta: {
                model: "gemini-pro",
                timestamp: new Date().toISOString()
            }
        };

    } catch (error: any) {
        logger.error("❌ Genkit API Error:", error);
        throw new HttpsError("internal", `AI processing failed: ${error.message}`);
    }
});
