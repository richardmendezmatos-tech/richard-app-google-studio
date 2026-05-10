# 🛰️ Plan de Distribución Autónoma: Richard Automotive (Nivel 16)

Este documento detalla la estrategia técnica para automatizar la presencia del inventario en las plataformas líderes de Puerto Rico.

## 🎯 Objetivo
Eliminar el 100% del trabajo manual en la publicación de unidades, asegurando que cada vehículo `status: available` esté sincronizado en tiempo real con ClasificadosOnline y FB Marketplace.

## 🛠️ Arquitectura Propuesta

### 1. ClasificadosOnline (Browser Automation)
Dado que ClasificadosOnline no ofrece una API pública robusta para dealers independientes, utilizaremos un **Sentinel Posting Agent** basado en:
- **Tecnología**: Playwright / Puppeteer.
- **Flujo**:
  1. El agente recibe una unidad de Supabase.
  2. Inicia sesión en ClasificadosOnline con las credenciales de Richard Automotive.
  3. Navega al formulario de "Publicar Unidad".
  4. Realiza un "Form Injection" inteligente (Año, Marca, Modelo, Precio, Millaje).
  5. Sube las imágenes procesadas por el optimizador de assets.
  6. Confirma la publicación y guarda el `external_id` en nuestro DB.

### 2. Facebook Marketplace (Automotive Catalog Feed)
Para Meta (Facebook/Instagram), utilizaremos el método profesional de **Catalog Feeds**:
- **Tecnología**: Endpoint dinámico `/api/distribution/facebook-feed`.
- **Flujo**:
  1. Meta scrapea nuestro endpoint cada 1-4 horas.
  2. El endpoint genera un XML en formato `Automotive` que cumple con los requisitos de Meta Business Manager.
  3. Las unidades aparecen automáticamente en Marketplace y en los anuncios dinámicos de Richard Automotive.

### 3. Orquestador de Sincronización (Sentinel Cron)
Un **Vercel Cron Job** ejecutará una revisión diaria (o cada vez que se agregue una unidad) para:
- Detectar unidades nuevas.
- Detectar unidades vendidas para darlas de baja automáticamente.
- Re-publicar ("Bump") unidades estancadas si el ROI lo justifica.

## 🛡️ Próximos Pasos Técnicos
1.  **Validación de Credenciales**: Richard debe proveer acceso (vía vault seguro) para ClasificadosOnline.
2.  **Configuración de Meta**: Vincular el feed `/api/distribution/facebook-feed` en el Commerce Manager.
3.  **Prototipo de Browser Agent**: Implementar el primer "Post de Prueba" en una unidad de demo.

---
© 2026 Richard Automotive | Sentinel N26 Protocol
