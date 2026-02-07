#!/usr/bin/env tsx
/**
 * TWILIO LOGS CHECKER
 * Verifica los logs de Twilio para diagnosticar problemas con el webhook.
 */

import twilio from 'twilio';

async function main() {
    console.log('\n🔍 VERIFICANDO LOGS DE TWILIO\n');

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        console.error('❌ Error: Credenciales de Twilio no encontradas');
        process.exit(1);
    }

    try {
        const client = twilio(accountSid, authToken);

        console.log('📋 Últimos mensajes de WhatsApp:\n');

        // Obtener los últimos mensajes
        const messages = await client.messages.list({
            limit: 10,
            from: 'whatsapp:+14155238886'
        });

        if (messages.length === 0) {
            console.log('⚠️  No se encontraron mensajes recientes.');
            console.log('\n💡 Esto puede significar:');
            console.log('   - No has enviado mensajes al Sandbox');
            console.log('   - No te has unido al Sandbox (envía "join [código]")');
            console.log('   - Los mensajes son muy antiguos\n');
            return;
        }

        messages.forEach((msg, index) => {
            console.log(`${index + 1}. ${msg.direction === 'outbound-api' ? '📤 Bot →' : '📥 Usuario →'} ${msg.to}`);
            console.log(`   Status: ${msg.status}`);
            console.log(`   Body: ${msg.body?.substring(0, 100) || '(imagen)'}...`);
            console.log(`   Date: ${msg.dateCreated.toLocaleString()}`);
            if (msg.errorCode) {
                console.log(`   ❌ Error: ${msg.errorCode} - ${msg.errorMessage}`);
            }
            console.log('');
        });

        // Verificar errores recientes
        console.log('🔍 Verificando errores recientes...\n');

        const alerts = await client.monitor.v1.alerts.list({
            limit: 5
        });

        if (alerts.length === 0) {
            console.log('✅ No se encontraron errores recientes.\n');
        } else {
            console.log('⚠️  Errores encontrados:\n');
            alerts.forEach((alert, index) => {
                console.log(`${index + 1}. ${alert.alertText}`);
                console.log(`   Date: ${alert.dateCreated.toLocaleString()}`);
                console.log('');
            });
        }

        console.log('📊 Resumen:');
        console.log(`   Total de mensajes: ${messages.length}`);
        console.log(`   Alertas: ${alerts.length}\n`);

        console.log('💡 Próximos pasos:');
        console.log('   1. Verifica que hayas enviado "join [código]" primero');
        console.log('   2. Envía un mensaje de prueba');
        console.log('   3. Revisa los logs en Vercel Dashboard\n');

    } catch (error: any) {
        console.error('\n❌ Error al obtener logs:', error.message);

        if (error.code === 20003) {
            console.log('\n⚠️  Credenciales inválidas. Verifica TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN.\n');
        }
    }
}

main().catch(console.error);
