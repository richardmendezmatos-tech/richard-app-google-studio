
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const testGemini = async () => {
    const key = process.env.VITE_GEMINI_API_KEY;
    console.log("Testing with Key snippet:", key?.substring(0, 10) + "...");

    if (!key) {
        console.error("❌ No API key found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("--- Listing Models ---");
        // Only available in some versions or via different methods
        // Let's try to see if we can get a list
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const modelsData = await response.json();
        console.log("Available Models:", modelsData.models?.map((m: any) => m.name).join(", "));

        console.log("\n--- Testing Text Model (gemini-1.5-flash) ---");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hola, esto es una prueba de conexión.");
        console.log("✅ Text Result:", result.response.text());

        console.log("\n--- Testing Embedding Model (text-embedding-004) ---");
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embedResult = await embedModel.embedContent("Prueba de embedding");
        console.log("✅ Embedding Result Size:", embedResult.embedding.values.length);

    } catch (error: any) {
        console.error("\n❌ API Error Details:");
        console.error("Message:", error.message);
        if (error.response) {
            console.error("Status:", error.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
    }
};

testGemini();
