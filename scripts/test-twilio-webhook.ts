#!/usr/bin/env tsx
/**
 * TWILIO WEBHOOK VERIFICATION TEST
 * Verifica que el webhook esté configurado correctamente simulando un mensaje de Twilio.
 */

async function main() {
    console.log('\n🧪 VERIFICANDO CONFIGURACIÓN DE WEBHOOK\n');

    const webhookUrl = 'https://www.richard-automotive.com/api/twilio-webhook';

    console.log('📋 Información del Webhook:');
    console.log(`   URL: ${webhookUrl}`);
    console.log(`   Method: POST\n`);

    console.log('🔄 Enviando mensaje de prueba...\n');

    // Simular un mensaje de texto de Twilio
    const testPayload = {
        MessageSid: 'SM_test_' + Date.now(),
        From: 'whatsapp:+12563048461',
        To: 'whatsapp:+14155238886',
        Body: 'Hola, quiero vender mi auto',
        NumMedia: '0'
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(testPayload as any).toString()
        });

        console.log(`✅ Status: ${response.status} ${response.statusText}`);

        const responseText = await response.text();
        console.log('\n📨 Respuesta del Webhook:');
        console.log(responseText);

        if (response.ok) {
            console.log('\n✅ ¡WEBHOOK CONFIGURADO CORRECTAMENTE!');
            console.log('\n🎯 Próximos Pasos:');
            console.log('1. Únete al Sandbox de WhatsApp:');
            console.log('   - Envía "join [código]" al número de Twilio');
            console.log('2. Prueba con un mensaje real:');
            console.log('   - Envía "Hola" al número de WhatsApp');
            console.log('3. Prueba Visual Cortex:');
            console.log('   - Envía una foto de un auto\n');
        } else {
            console.log('\n⚠️  El webhook respondió pero con un error.');
            console.log('Verifica los logs en Vercel Dashboard.\n');
        }

    } catch (error: any) {
        console.error('\n❌ Error al conectar con el webhook:', error.message);
        console.log('\n🔍 Posibles causas:');
        console.log('- El webhook no está desplegado en Vercel');
        console.log('- Hay un error en el código del webhook');
        console.log('- Problema de red/DNS\n');
    }
}

main().catch(console.error);
