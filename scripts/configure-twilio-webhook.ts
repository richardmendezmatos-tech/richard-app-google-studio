#!/usr/bin/env tsx
/**
 * TWILIO WEBHOOK AUTO-CONFIGURATOR
 * Configura automáticamente el webhook de WhatsApp Sandbox usando la API de Twilio.
 */

import twilio from 'twilio';

async function main() {
    console.log('\n🔧 CONFIGURANDO WEBHOOK DE TWILIO AUTOMÁTICAMENTE\n');

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const webhookUrl = 'https://www.richard-automotive.com/api/twilio-webhook';

    if (!accountSid || !authToken) {
        console.error('❌ Error: TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN son requeridos');
        process.exit(1);
    }

    console.log('📋 Configuración:');
    console.log(`   Account SID: ${accountSid}`);
    console.log(`   Webhook URL: ${webhookUrl}\n`);

    try {
        const client = twilio(accountSid, authToken);

        // Para WhatsApp Sandbox (versión gratuita), necesitamos actualizar la configuración del sandbox
        console.log('🔄 Actualizando configuración de WhatsApp Sandbox...');

        // Nota: El Sandbox de Twilio no permite configuración programática directa del webhook
        // en la versión gratuita. Necesitamos usar la API de Messaging Services.

        // Primero, intentamos obtener el servicio de mensajería
        const services = await client.messaging.v1.services.list({ limit: 20 });

        if (services.length === 0) {
            console.log('\n⚠️  No se encontraron servicios de mensajería.');
            console.log('📝 Para la versión gratuita (Sandbox), debes configurar el webhook manualmente:\n');
            console.log('1. Ve a: https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox');
            console.log('2. En "When a message comes in":');
            console.log(`   - URL: ${webhookUrl}`);
            console.log('   - Method: POST');
            console.log('3. Click "Save"\n');
            process.exit(0);
        }

        // Si hay servicios, intentamos actualizar el primero
        const service = services[0];
        console.log(`✅ Servicio encontrado: ${service.friendlyName} (${service.sid})`);

        // Actualizar el webhook del servicio
        await client.messaging.v1.services(service.sid)
            .update({
                inboundRequestUrl: webhookUrl,
                inboundMethod: 'POST'
            });

        console.log('\n✅ Webhook configurado exitosamente!');
        console.log(`   URL: ${webhookUrl}`);
        console.log(`   Method: POST\n`);

        console.log('🧪 Prueba el webhook:');
        console.log('   - Envía un mensaje de WhatsApp a tu número de Twilio');
        console.log('   - Envía una foto de un auto para probar Visual Cortex\n');

    } catch (error: any) {
        console.error('\n❌ Error al configurar webhook:', error.message);

        if (error.code === 20003) {
            console.log('\n⚠️  Autenticación fallida. Verifica tus credenciales.');
        } else if (error.code === 20404) {
            console.log('\n⚠️  Recurso no encontrado.');
        }

        console.log('\n📝 Configuración manual requerida:');
        console.log('1. Ve a: https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox');
        console.log('2. Inicia sesión con tu cuenta de Twilio');
        console.log('3. En "Sandbox Configuration" → "When a message comes in":');
        console.log(`   - URL: ${webhookUrl}`);
        console.log('   - Method: POST');
        console.log('4. Click "Save"\n');

        process.exit(1);
    }
}

main().catch(console.error);
