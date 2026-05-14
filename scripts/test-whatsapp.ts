import { sendTemplateMessage } from '../src/shared/api/messaging/whatsappClient';

async function test() {
  const testNumber = '7873682880'; // Richard's number
  console.log(`🚀 Iniciando prueba de WhatsApp (TEMPLATE) para ${testNumber}...`);

  const result = await sendTemplateMessage({
    to: testNumber,
    templateName: 'hello_world', // Plantilla por defecto de Meta
    languageCode: 'en_US'
  });

  if (result.success) {
    console.log('✨ Template enviado con éxito! ID:', result.messageId);
  } else {
    console.error('❌ Error al enviar el template. Posiblemente el Phone Number ID o el Token están mal.');
  }
}

test();
