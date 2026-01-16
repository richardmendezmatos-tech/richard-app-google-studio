
import fetch from "node-fetch";

async function testAI() {
    const leadData = {
        jobTitle: "Software Engineer",
        employer: "Tech Solutions PR",
        timeAtJob: "3 years",
        monthlyIncome: "5200"
    };

    console.log("🧠 Testing AI Lead Scoring...");

    try {
        const response = await fetch("http://localhost:3400/analyzeLead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: leadData })
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${await response.text()}`);
        }

        const { result } = await response.json();
        console.log("\n✅ AI Analysis Result:");
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("Error testing AI:", error);
        console.log("\n⚠️  Note: Make sure 'npm run genkit:start' is running and the code is recompiled.");
    }
}

testAI();
