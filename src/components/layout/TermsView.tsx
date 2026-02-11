import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/seo/SEO';

const TermsView: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12">
            <SEO
                title="Terminos de Uso"
                description="Lee los terminos de uso de la plataforma digital de Richard Automotive en Puerto Rico."
                url="/terminos"
                type="website"
            />
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#00aed9] mb-8 font-bold transition-colors"
                >
                    <ArrowLeft size={20} /> Volver
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-[40px] p-8 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#00aed9]/10 rounded-full flex items-center justify-center text-[#00aed9]">
                            <FileText size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                            Términos de Uso
                        </h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-slate-500 dark:text-slate-400">
                        <p className="text-sm font-bold opacity-70">Vigencia desde: Diciembre 30, 2025</p>

                        <h3>1. Aceptación de los Términos</h3>
                        <p>Al acceder, navegar o utilizar la plataforma digital de Richard Automotive (el "Sitio"), usted acepta estar sujeto a estos Términos de Uso y a todas las leyes aplicables. Si no está de acuerdo con estos términos, le solicitamos que no utilice nuestros servicios.</p>

                        <h3>2. Uso Autorizado</h3>
                        <p>Este Sitio está destinado exclusivamente para uso personal y no comercial de individuos interesados en comprar, vender o investigar sobre vehículos. Se prohíbe el uso de bots, scrapers o cualquier método automatizado para recopilar datos de nuestro inventario o precios.</p>

                        <h3>3. Disponibilidad y Precios de Vehículos</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Inventario:</strong> Nos esforzamos por mantener nuestro inventario en línea actualizado en tiempo real. Sin embargo, debido a la alta rotación, no garantizamos que todos los vehículos mostrados estén disponibles al momento de su visita física. Recomendamos contactarnos para verificar disponibilidad.</li>
                            <li><strong>Precios:</strong> Los precios mostrados excluyen impuestos, gastos de registro, tablilla, seguro y cargos administrativos del concesionario (Dealer Fees). Los precios están sujetos a cambios sin previo aviso y a aprobación de crédito.</li>
                            <li><strong>Errores:</strong> A pesar de nuestros esfuerzos, pueden ocurrir errores tipográficos o de sistema en los precios o especificaciones. Richard Automotive no se hace responsable por dichos errores y se reserva el derecho de rechazar cualquier transacción basada en información incorrecta.</li>
                        </ul>

                        <h3>4. Propiedad Intelectual</h3>
                        <p>Todo el contenido del Sitio, incluyendo pero no limitado a logotipos, textos, gráficos, imágenes, clips de audio/video y software, es propiedad exclusiva de Richard Automotive o sus proveedores de contenido y está protegido por leyes de derechos de autor y marcas registradas.</p>

                        <h3>5. Estimaciones y Herramientas Financieras</h3>
                        <p>Las calculadoras de pagos, herramientas de valoración de trade-in y estimaciones de crédito proporcionadas en el Sitio son <strong>únicamente ilustrativas</strong> y no constituyen una oferta formal de financiamiento o compra. Los términos finales serán determinados por las instituciones financieras basándose en su solvencia crediticia real.</p>

                        <h3>6. Limitación de Responsabilidad</h3>
                        <p>En la medida máxima permitida por la ley, Richard Automotive no será responsable por daños directos, indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de uso de este Sitio.</p>

                        <h3>7. Enlaces a Terceros</h3>
                        <p>Este Sitio puede contener enlaces a sitios web de terceros (como Carfax, fabricantes, bancos). No somos responsables por el contenido o las prácticas de privacidad de dichos sitios.</p>

                        <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-700/50 rounded-2xl border-l-4 border-amber-500">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white m-0 pb-2">Cláusula de Arbitraje</h4>
                            <p className="m-0 text-sm">Cualquier disputa relacionada con el uso de este Sitio será resuelta mediante arbitraje vinculante, renunciando usted a su derecho de participar en demandas colectivas.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsView;
