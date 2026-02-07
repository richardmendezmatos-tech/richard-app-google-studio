import { generateText } from './geminiService';
import { Car } from '@/types/types';

export interface ValidationResult {
    isValid: boolean;
    issues: string[];
    sanitizedResponse: string;
}

const GOLDEN_RULES = `
1. PRECISIÓN DE INVENTARIO: Solo menciona autos que estén explícitamente en el "Contexto de Inventario". Si no están, di que no los tienes disponibles ahora mismo.
2. TASAS DE INTERÉS (APR): NUNCA des un porcentaje exacto (ej. "7.5%"). Usa rangos (ej. "tasas competitivas desde 4.95%") y siempre aclara que la aprobación final depende del banco y de Richard.
3. DESLINDE LEGAL: La respuesta debe sonar profesional y consultiva, incluyendo una mención a que Richard validará todo en la oficina.
4. PROTECCIÓN DE DATOS: No solicites SSN o datos altamente sensibles en el chat abierto.
`;

export class ValidationAgentService {
    /**
     * Audits a bot response against Golden Rules and Inventory.
     */
    async validateResponse(
        userQuery: string,
        botResponse: string,
        inventory: Car[]
    ): Promise<ValidationResult> {
        const inventoryList = inventory.map(c => `- ${c.name} ($${c.price})`).join('\n');

        const prompt = `
        ACTÚA COMO UN AUDITOR DE CUMPLIMIENTO (COMPLIANCE) PARA RICHARD AUTOMOTIVE.
        
        REGLAS DE ORO:
        ${GOLDEN_RULES}
        
        CONTEXTO DE INVENTARIO ACTUAL:
        ${inventoryList}
        
        MENSAJE DEL USUARIO: "${userQuery}"
        RESPUESTA A AUDITAR: "${botResponse}"
        
        TAREA:
        1. Verifica si la respuesta viola alguna REGLA DE ORO.
        2. Verifica si menciona autos que NO están en el inventario.
        
        RETORNA UNICAMENTE UN JSON CON ESTE FORMATO:
        {
            "isValid": boolean,
            "issues": ["lista de problemas encontrados"],
            "sanitizedResponse": "La respuesta corregida si es necesario, manteniendo el tono original pero cumpliendo las reglas."
        }
        `;

        try {
            const rawResult = await generateText(prompt, "Eres un auditor de cumplimiento estricto.");
            // Parse JSON from response
            const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Invalid auditor response format");

            return JSON.parse(jsonMatch[0]) as ValidationResult;
        } catch (error) {
            console.error("Validation Agent Error:", error);
            // Fallback: If validation fails, return original as valid to avoid blocking (or handle as needed)
            return {
                isValid: true,
                issues: [],
                sanitizedResponse: botResponse
            };
        }
    }
}

export const validationAgentService = new ValidationAgentService();
