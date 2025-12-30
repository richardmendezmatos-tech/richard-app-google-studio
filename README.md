
# 🚗 Richard Automotive - Guía de Inicio Rápido

¡Bienvenido! Sigue estos pasos para encender y desplegar tu aplicación premium.

## 1. Encender el Motor (Local)

1. Abre este proyecto en **Visual Studio Code**.
2. Abre la terminal y ejecuta:
   ```bash
   npm install
   npm run dev
   ```
3. Haz clic en el enlace `http://localhost:5173`.

## 2. Despliegue en Vercel (Producción)

Esta aplicación está lista para producción en Vercel.

1. **Sube tu código a GitHub.**
2. **Conecta con Vercel:** Ve a [vercel.com](https://vercel.com) e importa tu repositorio.
3. **Configura la API Key:** 
   - En el paso de configuración, busca la sección **Environment Variables**.
   - Agrega una nueva variable:
     - **Key:** `API_KEY`
     - **Value:** (Pega tu API Key de Google Gemini)
4. **Build & Deploy:** Haz clic en "Deploy". Vercel detectará automáticamente la configuración de Vite y el archivo `vercel.json`.

## 3. Configuración de Firebase

Asegúrate de que en la consola de Firebase, en la sección de **Authentication** > **Settings** > **Authorized Domains**, añadas el dominio que te asigne Vercel (ej: `richard-automotive.vercel.app`) para que el login social funcione correctamente.

## 4. Comandos Útiles

- **npm run build:** Genera la versión de producción en la carpeta `/dist`.
- **npm run preview:** Previsualiza la versión de producción localmente.
