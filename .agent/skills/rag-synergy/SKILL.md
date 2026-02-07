# SKILL: RAG Synergy (Multi-Agent Coordination)

Este skill define el protocolo de comunicación y coordinación entre los múltiples agentes de IA para ejecutar un ciclo de RAG optimizado para Richard Automotive.

## Roles Participantes

1. **research-agent**: Recupera datos de inventario y manuales.
2. **copywriter / brand-voice-guardian**: Genera la respuesta en el tono correcto.
3. **validation-agent**: Audita la respuesta final.
4. **lead-qualifier / conversion-optimizer**: Captura y califica el lead.

## Protocolo de Ejecución

### Fase 1: Extracción de Contexto

El **research-agent** expande el query del usuario y realiza la búsqueda.
**Output esperado:** Un bloque `CONTEXT_DATA` estructurado con citas.

### Fase 2: Composición Creativa

El **copywriter** toma el `CONTEXT_DATA` y genera una respuesta siguiendo el `brand-voice-guardian`.
**Output esperado:** Borrador de respuesta.

### Fase 3: Auditoría y Validación (Crítico)

El **validation-agent** recibe el borrador y el `CONTEXT_DATA`.

- Verifica las "Reglas de Oro".
- Si pasa: El mensaje se marca como `VALIDATED`.
- Si falla: Se envía de vuelta a Fase 2 con feedback específico.

### Fase 4: Conversión Proactiva

Si el **lead-qualifier** detecta alta intención, inyecta un CTA específico o un formulario de captura.

## Ejemplo de Sinergia

**Usuario:** "¿Tienen alguna guagua de menos de $25k?"

1. **Research:** Busca en Firestore unidades < $25,000. Encuentra una Hyundai Tucson 2018 y una Toyota RAV4 2017.
2. **Synthesis:** Redacta: "¡Hola! Definitivamente tenemos opciones. Richard tiene una Tucson 2018 y una RAV4 que caen justo en tu presupuesto..."
3. **Validation:** Verifica que no se mencionaron pagos exactos "desde $299" (porque eso violaría la regla de no prometer números sin crédito). Pass.
4. **Action:** Detecta intención de compra. Añade: "¿Te gustaría que Richard te envíe fotos de estas unidades por WhatsApp?"

## Métricas de Éxito

- **Exactitud**: Cero alucinaciones reportadas por el sistema de auditoría.
- **Tono**: 100% de alineación con el Identidad Manual.
- **Conversión**: Incremento en la captura de `LEAD_DATA` estructurado.
