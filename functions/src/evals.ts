import { z } from 'genkit';
import { ai } from './services/aiManager';
import { chatWithLead } from './index';
import * as logger from 'firebase-functions/logger';
import { onCallGenkit } from 'firebase-functions/https';
import { requireAdmin } from './security/policies';

// --- EVALUATION SUITE ---

const SCRIPTS = [
    {
        name: "Price Inquiry",
        input: "Cuanto cuesta la Tucson?",
        expectedCriteria: "The response MUST include the price of the Tucson."
    },
    {
        name: "Competitor Check",
        input: "Es mejor que una Toyota RAV4?",
        expectedCriteria: "The response must be polite to Toyota but highlight Hyundai's advantages (Warranty)."
    },
    {
        name: "Angry Customer",
        input: "El servicio es terrible, nadie me atiende!",
        expectedCriteria: "The response must be empathetic, apologetic, and offer a human contact immediately."
    }
];

export const runSalesEval = ai.defineFlow(
    {
        name: 'runSalesEval',
        inputSchema: z.void(),
        outputSchema: z.string()
    },
    async () => {
        let report = "# AI Quality Report 🧪\n\n";
        let passCount = 0;

        for (const test of SCRIPTS) {
            logger.info(`Running Test: ${test.name}`);

            // 1. Run the Agent
            const agentResponse = await chatWithLead({
                history: [],
                message: test.input
            });

            // 2. Judge the Response (LLM-as-a-Judge)
            const judgePrompt = `
                ACT AS A QA ANALYST.
                
                INPUT USER MESSAGE: "${test.input}"
                ACTUAL AGENT RESPONSE: "${agentResponse}"
                
                PASSING CRITERIA: ${test.expectedCriteria}
                
                Evaluate if the response meets the criteria.
                Return ONLY JSON:
                { 
                    "score": (1-10), 
                    "pass": (boolean), 
                    "reason": (short explanation) 
                }
            `;

            const evaluation = await ai.generate({
                prompt: judgePrompt,
                output: { format: 'json' }
            });

            const result = evaluation.output;

            report += `## ${test.name}\n`;
            report += `- **Input**: "${test.input}"\n`;
            report += `- **Response**: "${agentResponse}"\n`;
            report += `- **Score**: ${result.score}/10 ${result.pass ? '✅' : '❌'}\n`;
            report += `- **Note**: ${result.reason}\n\n`;

            if (result.pass) passCount++;
        }

        const finalScore = `Final Score: ${passCount}/${SCRIPTS.length} Passed`;
        report += `---\n**${finalScore}**`;

        return report;
    }
);

export const triggerEval = onCallGenkit({
    authPolicy: (auth) => requireAdmin(auth), // Admin only
    secrets: ["GEMINI_API_KEY"],
    timeoutSeconds: 300, // Evals take time
}, runSalesEval);
