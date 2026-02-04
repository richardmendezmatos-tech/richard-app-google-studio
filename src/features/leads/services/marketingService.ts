
import { Car } from "@/types/types";


export interface MarketingContent {
    instagram: string;
    facebook: string;
    tiktokScript: string;
}

const determineSalesAngle = (car: Car): string => {
    const price = Number(car.price);
    const name = car.name.toLowerCase();
    const type = car.type.toLowerCase();

    if (price > 45000 || type.includes('luxury') || name.includes('mercedes') || name.includes('bmw') || name.includes('audi')) {
        return "LUJO Y ESTATUS: Enfócate en la exclusividad, el éxito, la admiración que genera y el placer de conducción superior. Usa un tono sofisticado y seguro.";
    }
    if (type.includes('suv') || type.includes('van') || name.includes('sienna') || name.includes('odyssey')) {
        return "FAMILIA Y SEGURIDAD: Enfócate en la protección de los hijos, la comodidad en viajes largos, el espacio para todo y la paz mental. Usa un tono cálido y protector.";
    }
    if (price < 15000 || name.includes('spark') || name.includes('mirage') || name.includes('march')) {
        return "INTELIGENCIA FINANCIERA: Enfócate en el ahorro de combustible, bajo costo de mantenimiento, oportunidad única y 'ser listo con el dinero'. Usa un tono empático y entusiasta.";
    }
    if (type.includes('pickup') || name.includes('hilux') || name.includes('tacoma') || name.includes('ranger')) {
        return "TRABAJO Y PODER: Enfócate en la capacidad de carga, durabilidad, respeto en el camino y ser una herramienta para hacer dinero. Usa un tono robusto y directo.";
    }
    // Default
    return "OPORTUNIDAD Y ESTILO: Enfócate en renovarse, mejorar el estilo de vida y aprovechar una gran oferta antes de que se vaya.";
};

export const generateCarMarketingContent = async (car: Car, locale: 'es' | 'en' = 'es'): Promise<MarketingContent> => {
    const psychology = determineSalesAngle(car);

    const prompt = `
        ACTÚA COMO UN COPYWRITER EXPERTO DE CLASE MUNDIAL (Nivel Ogilvy/Gary Halbert).
        Tu objetivo es vender este auto usando psicología de ventas avanzada.
        
        CONTEXTO DEL PRODUCTO:
        - Vehículo: ${car.name}
        - Precio: $${car.price}
        - Tipo: ${car.type}
        - Badge: ${car.badge || 'N/A'}
        
        ÁNGULO PSICOLÓGICO OBLIGATORIO:
        "${psychology}"
        
        Genera 3 piezas de contenido distintas en ${locale === 'es' ? 'Español Latino Neutro' : 'Inglés Nativo'}:

        1. FACEBOOK (Estructura PAS: Problema - Agitación - Solución):
           - Inicia con una pregunta o afirmación que toque una fibra emocional relacionada al ángulo psicológico.
           - Desarrolla una mini-historia sobre cómo este auto mejora la vida del dueño.
           - Elimina objeciones (ej. financiamiento fácil).
           - Cierra con un llamado a la acción suave pero claro.

        2. INSTAGRAM (Estilo "Lifestyle" & Aspirational):
           - Texto corto, punchy y visual.
           - Vende la "sensación" de tenerlo.
           - Usa emojis estratégicamente (no satures).
           - Hashtags: Mezcla 3 de alto volumen y 3 de nicho específico.

        3. TIKTOK SCRIPT (Estructura Viral):
           - [0-3s] EL GANCHO: Algo visualmente impactante o una frase controversial/curiosa sobre el auto.
           - [3-10s] EL VALOR: 3 cortes rápidos mostrando lo mejor del auto (interior, rines, tecnología).
           - [10-15s] EL CIERRE: "Si quieres manejarlo, comenta 'YO' ahora mismo".
        
        FORMATO DE SALIDA (JSON PURO):
        {
            "instagram": "texto...",
            "facebook": "texto...",
            "tiktokScript": "texto..."
        }
    `;

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                model: 'gemini-1.5-flash',
                config: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        return JSON.parse(data.text);

    } catch (error) {
        console.error("Marketing Gen Error:", error);
        return {
            instagram: `¡${car.name} disponible! 🚗💨 Contáctanos hoy.`,
            facebook: `Oportunidad increíble: ${car.name} por solo $${car.price}. ¡Escríbenos!`,
            tiktokScript: "¡Mira esta nave! Disponible en Richard Automotive."
        };
    }
};
