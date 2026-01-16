import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyView: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#00aed9] mb-8 font-bold transition-colors"
                >
                    <ArrowLeft size={20} /> Volver
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-[40px] p-8 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                            <Shield size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                            Aviso de Privacidad
                        </h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-slate-500 dark:text-slate-400">
                        <p className="text-sm font-bold opacity-70">Última actualización: Diciembre 30, 2025</p>

                        <h3>1. Compromiso de Privacidad</h3>
                        <p>En Richard Automotive, valoramos su confianza y nos comprometemos a proteger su información personal y financiera. Esta política detalla cómo recopilamos, usamos y resguardamos sus datos en cumplimiento con las leyes federales y estatales aplicables.</p>

                        <h3>2. Información que Recopilamos</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Identificación Personal (PII):</strong> Nombre, dirección, número de teléfono, dirección de correo electrónico e identificación oficial (Licencia de Conducir).</li>
                            <li><strong>Información Financiera:</strong> Número de Seguro Social (SSN), historial de crédito, ingresos, empleo y detalles bancarios necesarios para el procesamiento de solicitudes de crédito o arrendamiento.</li>
                            <li><strong>Información del Vehículo:</strong> Número de Identificación del Vehículo (VIN), historial de servicio, millaje y condición de su vehículo actual (Trade-In).</li>
                            <li><strong>Datos Digitales:</strong> Dirección IP, tipo de navegador, sistema operativo y patrones de navegación a través de cookies y píxeles de seguimiento.</li>
                        </ul>

                        <h3>3. Uso de su Información</h3>
                        <p>Utilizamos su información para los siguientes propósitos legítimos de negocio:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Procesar su solicitud de compra, venta o intercambio de vehículos.</li>
                            <li>Facilitar solicitudes de crédito a través de nuestras instituciones financieras asociadas.</li>
                            <li>Verificar su identidad y prevenir fraudes.</li>
                            <li>Comunicarnos con usted sobre el estado de su transacción o ofertas relevantes.</li>
                            <li>Mejorar la funcionalidad y experiencia de usuario de nuestra plataforma digital.</li>
                        </ul>

                        <h3>4. Compartir Información con Terceros</h3>
                        <p>No vendemos su información personal a terceros no afiliados. Sin embargo, podemos compartir datos con:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Instituciones Financieras:</strong> Para procesar su solicitud de préstamo o arrendamiento.</li>
                            <li><strong>Proveedores de Servicios:</strong> Compañías que prestan servicios en nuestro nombre (ej. envío de correos, procesamiento de pagos).</li>
                            <li><strong>Autoridades Legales:</strong> Cuando sea requerido por ley o para proteger nuestros derechos legales.</li>
                        </ul>

                        <h3>5. Sus Derechos bajo la FCRA</h3>
                        <p>De acuerdo con la Ley de Informes de Crédito Justos (Fair Credit Reporting Act - FCRA), si tomamos una acción adversa basada en su reporte de crédito, usted tiene derecho a ser notificado y a recibir una copia gratuita de su reporte de la agencia correspondiente.</p>

                        <h3>6. Seguridad de Datos</h3>
                        <p>Implementamos medidas de seguridad físicas, electrónicas y procedimentales de nivel bancario (incluyendo encriptación SSL de 256 bits) para proteger su información contra acceso no autorizado, alteración o divulgación.</p>

                        <h3>7. Cookies y Rastreo</h3>
                        <p>Utilizamos cookies para personalizar su experiencia y analizar el tráfico del sitio. Usted puede configurar su navegador para rechazar cookies, aunque esto puede limitar ciertas funcionalidades de nuestra plataforma.</p>

                        <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-700/50 rounded-2xl border-l-4 border-[#00aed9]">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white m-0 pb-2">Contacto de Privacidad</h4>
                            <p className="m-0 text-sm">Si tiene preguntas sobre esta política, contáctenos en:<br />
                                <span className="font-bold text-[#00aed9]">legal@richardautomotive.com</span> | (787) 555-0123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyView;
