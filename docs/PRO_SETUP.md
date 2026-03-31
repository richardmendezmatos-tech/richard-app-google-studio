# 🚀 Activación de Infraestructura Pro (Manual Requerido)

Como Agente de IA, he preparado el código de la aplicación, pero ciertas configuraciones de infraestructura en Google Cloud requieren tu ejecución manual.

## 1. Optimización de Imágenes (Cloud Storage + WebP)
Para que las imágenes subidas se conviertan automáticamente a WebP y se redimensionen (ahorrando 70% de ancho de banda), instala la extensión oficial:

### Comando de Instalación
Ejecuta esto en tu terminal (en la carpeta `richard-automotive-_-command-center`):

```bash
firebase ext:install firebase/storage-resize-images --project=richard-automotive \
  --params=IMG_BUCKET=richard-automotive.appspot.com,\
  IS_ANIMATED=false,\
  WIDTH=800,\
  HEIGHT=800,\
  FORMAT=webp,\
  DELETE_ORIGINAL=false,\
  MAKE_PUBLIC=true
```
*Si te pregunta sobre "billing", confirma (tiene capa gratuita).*

## 2. BigQuery + Looker Studio (Embudo de Ventas)
He inyectado el código de rastreo (`logEvent`) en `firebaseService.ts` y `authService.ts`. Ahora rastreamos:
*   `generate_lead`: Valor monetario potencial (Score IA).
*   `view_item`: Qué autos se ven más.
*   `login`: Actividad de usuarios.

### Pasos de Activación
1.  Ve a [Firebase Console > Integrations](https://console.firebase.google.com/project/richard-automotive/integrations).
2.  Busca la tarjeta **BigQuery** y haz clic en **Link**.
3.  Asegúrate de marcar el switch de **Google Analytics**.
4.  Espera 24h para que fluyan los datos.
5.  Abre [Looker Studio](https://lookerstudio.google.com/) > Crear Informe > Fuente de Datos: **BigQuery**.

---

## 3. Despliegue Final (Production Ready)

Para aplicar todas las reglas de seguridad, índices y funciones nuevas:

```bash
# 1. Construir Frontend
npm run build

# 2. Desplegar Todo (Rules, Indexes, Functions, Hosting)
firebase deploy
```

## 4. Seguridad de Élite (App Check Obligatorio)
He configurado el código para usar **reCAPTCHA v3 (Estándar)**. Esto protegerá tu backend de bots.

### Pasos de Activación
1.  Ve a la [Consola de Admin de reCAPTCHA](https://www.google.com/recaptcha/admin/create).
2.  Registra un nuevo sitio:
    *   **Tipo**: reCAPTCHA v3.
    *   **Dominios**: Agrega `localhost` y tu dominio de producción (ej. `richard-automotive.web.app`).
3.  Copia la **Clave del Sitio (Site Key)** (NO la clave secreta) y agrégala a tu archivo `.env`:
    ```bash
    VITE_RECAPTCHA_KEY=tu-site-key-v3
    ```
4.  **En Firebase Console**:
    *   Ve a **App Check** > **Apps**.
    *   Registra tu app Web y pega la **Clave Secreta** (Secret Key) que obtuviste en el paso 2.

## 5. Genkit AI Dashboard (Entorno de Pruebas)
Tu proyecto ya incluye **Genkit** pre-instalado y configurado en la carpeta `functions`.
No necesitas instalarlo globalmente. Para abrir el Panel de Desarrollo de IA:

1.  Abre una terminal nueva.
2.  Ejecuta:
    ```bash
    cd functions
    npm run genkit:start
    ```
3.  Se abrirá automáticamente en tu navegador (puerto 4000).
    *   Aquí puedes probar los flujos `analyzeLead` y `chatWithLead` con datos reales.

---

## 🛠️ Guía Rápida de Mantenimiento

Para asegurarte de estar siempre en la carpeta correcta y que los comandos funcionen:

### 1. ¿Dónde estoy?
Antes de ejecutar comandos, verifica tu ubicación:
*   `pwd`: Muestra la ruta actual.
*   `ls`: Muestra los archivos. Debes ver `firebase.json` y `package.json`.

### 2. Cómo llegar a la carpeta principal
Si estás en la carpeta `android` o `ios`, sube un nivel:
```bash
cd ..
```
O entra directamente desde cualquier lugar:
```bash
cd /Users/richardmendez/richard-automotive-_-command-center
```

### 3. Ciclo de Despliegue (Cómo subir cambios)
Cuando hagas cambios en el código y quieras verlos en internet:
```bash
# 1. Entrar a la carpeta
cd /Users/richardmendez/richard-automotive-_-command-center

# 2. Construir la app
npm run build

# 3. Subir a la nube
npx firebase deploy
```

