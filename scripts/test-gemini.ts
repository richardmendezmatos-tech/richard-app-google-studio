
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

async function listModels() {
    if (!API_KEY) {
        console.error("❌ No API Key found in env variables.");
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
        console.log("Fetching available models...");
        // Hack: The listModels method might not be directly available on the client root in some versions,
        // but let's try the standard way. If this fails, we'll know.
        // Actually, listModels is not on GoogleGenerativeAI instance, it's on the ModelManager or similar?
        // Wait, for @google/generative-ai, it's usually via a specific endpoint or just try generate on a known model.
        // There isn't a simple listModels method exposed in the high-level SDK easily.
        // Let's try to just generate content with 'gemini-1.5-flash' and 'gemini-pro' to see which one works.

        const modelsToTest = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];

        for (const modelName of modelsToTest) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you there?");
                const response = result.response;
                console.log(`✅ ${modelName} SUCCESS:`, response.text());
                return; // Stop after first success
            } catch (error: any) {
                console.error(`❌ ${modelName} FAILED:`, error.message.split('\n')[0]);
            }
        }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

listModels();
