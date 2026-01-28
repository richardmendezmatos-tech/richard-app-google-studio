# 🗺️ Próximos Pasos Recomendados

Dado que la estructura básica está lista, te recomiendo priorizar el "Cerebro" y los "Datos" del proyecto.

## 1. 🗄️ Infraestructura de Datos (Crítico)
La aplicación necesita una base de datos real en Supabase para funcionar.
*   **Tarea**: Generar el script SQL (`schema.sql`) para crear las tablas `cars` y activar la extensión `vector`.
*   **Por qué**: Sin esto, los "Loaders" y la IA fallarán al intentar leer datos reales.

## 2. 🧠 Cerebro IA (Gemini + RAG)
Actualmente, el chat es simulado ("mock").
*   **Tarea**: Implementar la lógica real en `src/routes/api/chat/index.ts`.
*   **Detalle**: Conectar API de Gemini para generar embeddings y buscar coincidencias en Supabase.

## 3. 🏎️ Página de Detalles (UI)
El botón "Ver Detalles" ahora mismo no lleva a ningún lado.
*   **Tarea**: Crear la ruta `src/routes/car/[id]/index.tsx`.
*   **Detalle**: Mostrar especificaciones completas e imágenes en alta resolución.

---

### 💡 Mi Recomendación
Empezar por la **Infraestructura de Datos (Opción 1)**. Sin datos, no hay IA ni catálogo que mostrar.

¿Te parece bien si genero el script SQL para inicializar tu base de datos?
