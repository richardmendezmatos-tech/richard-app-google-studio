
export const getWelcomeEmailTemplate = (lead: any) => {
    const isTradeIn = lead.type === 'trade-in';
    const vehicleName = lead.vehicleOfInterest || 'un vehículo';
    // Fallback image if none provided
    const vehicleImage = lead.vehicleImage || 'https://images.unsplash.com/photo-1560179707-f14e90ef3dab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { background-color: #173d57; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #ffffff; }
        .vehicle-card { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
        .vehicle-image { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #00aed9; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .highlight { color: #00aed9; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0;">Richard Automotive</h1>
            <p style="margin:5px 0 0; opacity:0.8;">Tu solicitud ha sido recibida</p>
        </div>
        
        <div class="content">
            <h2>¡Hola ${lead.firstName}! 👋</h2>
            <p>Gracias por contactarnos. Hemos recibido tu interés en <span class="highlight">${vehicleName}</span>.</p>
            
            ${lead.vehicleInfo ? `
            <div class="vehicle-card">
                <img src="${vehicleImage}" alt="${vehicleName}" class="vehicle-image" />
                <h3 style="margin-top:0;">${vehicleName}</h3>
                <p style="margin-bottom:0; color:#64748b;">Precio: <strong>$${lead.vehicleInfo.price?.toLocaleString() || 'Consultar'}</strong></p>
            </div>
            ` : ''}

            <p>Un especialista analizó tu perfil preliminar y tenemos buenas noticias. Estamos listos para dar el siguiente paso.</p>
            
            <p><strong>Próximos pasos:</strong></p>
            <ul>
                <li>Nuestro equipo revisará tu solicitud en los próximos 30 minutos.</li>
                <li>Te contactaremos al <strong>${lead.phone}</strong> para confirmar detalles.</li>
                ${isTradeIn ? '<li>Prepararemos una oferta formal para tu Trade-In.</li>' : ''}
            </ul>

            <center>
                <a href="https://richard-automotive.web.app/garage" class="btn">Ver Estatus en Mi Garaje</a>
            </center>
        </div>

        <div class="footer">
            <p>© 2025 Richard Automotive. Todos los derechos reservados.</p>
            <p>Bayamón, Puerto Rico • (787) 555-0123</p>
        </div>
    </div>
</body>
</html>
    `;
};

export const getNudgeEmailTemplate = (lead: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #173d57; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h3>¿Sigues buscando auto, ${lead.firstName}? 🤔</h3>
        <p>Notamos que hace unos días mostraste interés en el <strong>${lead.vehicleOfInterest}</strong>, pero no hemos logrado conectar.</p>
        <p>Queremos saber si:</p>
        <ol>
            <li>¿Sigues interesado en este vehículo?</li>
            <li>¿Preferirías ver otras opciones más económicas?</li>
            <li>¿Ya compraste en otro lugar? (¡Avísanos para cerrar tu expediente!)</li>
        </ol>
        <p>Si respondes a este correo, te puedo enviar una <strong>oferta de financiamiento especial</strong> que acaba de salir hoy.</p>
        <br>
        <a href="https://richard-automotive.web.app/" class="btn">Ver Inventario Actualizado</a>
    </div>
</body>
</html>
    `;
};

export const getPriceDropEmailTemplate = (lead: any, oldPrice: number, newPrice: number) => {
    const savings = oldPrice - newPrice;
    const vehicleName = lead.vehicleOfInterest || 'El vehículo que te gusta';

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background-color: white; text-align: center; }
        .price-box { font-size: 24px; font-weight: bold; color: #ef4444; margin: 20px 0; }
        .old-price { text-decoration: line-through; color: #94a3b8; font-size: 16px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0;">🚨 ¡Bajó de Precio!</h2>
        </div>
        <div class="content">
            <h3>Buenas noticias, ${lead.firstName}</h3>
            <p>El <strong>${vehicleName}</strong> que estabas viendo acaba de bajar de precio.</p>
            
            <div class="price-box">
                <span class="old-price">$${oldPrice.toLocaleString()}</span> 
                ➡️ $${newPrice.toLocaleString()}
            </div>
            
            <p>¡Te ahorras <strong>$${savings.toLocaleString()}</strong> si compras hoy!</p>
            
            <br>
            <a href="https://richard-automotive.web.app/" class="btn">Ver Oferta Ahora</a>
            
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                Estas ofertas suelen venderse rápido. Te recomendamos actuar pronto.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

export const getContactedEmailTemplate = (lead: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background-color: #00aed9; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #173d57; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>¡Estamos revisando tu caso! 📋</h2>
        </div>
        <div class="content">
            <p>Hola <strong>${lead.firstName}</strong>,</p>
            <p>Queríamos informarte que un asesor de ventas de <strong>Richard Automotive</strong> ha comenzado a trabajar en tu solicitud para el <strong>${lead.vehicleOfInterest}</strong>.</p>
            <p>Estamos verificando el inventario y las opciones de financiamiento para ti.</p>
            <p>Si necesitas agilizar el proceso, puedes enviarnos tus documentos por aquí.</p>
            <br>
            <center>
                <a href="https://richard-automotive.web.app/login" class="btn">Subir Documentos</a>
            </center>
            <br>
            <p style="font-size: 12px; color: #666;">Te contactaremos pronto por teléfono o WhatsApp.</p>
        </div>
    </div>
</body>
</html>
    `;
};

export const getSoldEmailTemplate = (lead: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 10px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; text-align: center; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #173d57; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .confetti { font-size: 40px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Felicidades! 🎉</h1>
        </div>
        <div class="content">
            <div class="confetti">🚗💨</div>
            <h2>¡Disfruta tu Nuevo Auto, ${lead.firstName}!</h2>
            <p>Ha sido un placer ayudarte a conseguir tu <strong>${lead.vehicleOfInterest}</strong>.</p>
            <p>En <strong>Richard Automotive</strong> nos esforzamos por brindar la mejor experiencia. Esperamos que disfrutes cada milla.</p>
            <br>
            <p>¿Nos dejarías una reseña de tu experiencia?</p>
            <br>
            <a href="https://g.page/richard-automotive/review" class="btn">Dejar Reseña en Google</a>
            <br><br>
            <p style="font-size: 12px; color: #666;">Recuerda que tu primer mantenimiento es gratis. ¡Te esperamos pronto!</p>
        </div>
    </div>
</body>
</html>
    `;
};
