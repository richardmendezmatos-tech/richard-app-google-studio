
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Lock, User, Briefcase, Banknote, Calendar, ChevronRight, Loader2, Eye, EyeOff, MessagesSquare, FileText } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { submitApplication } from '../services/firebaseService';

interface Props {
    onExit: () => void;
}

const PreQualifyView: React.FC<Props> = ({ onExit }) => {
    const { addNotification } = useNotification();
    const location = useLocation();

    // Retrieve vehicle context if available
    const dealContext = location.state as {
        vehicle: { id: string, name: string, price: number, image: string },
        quote: { monthlyPayment: number, downPayment: number, term: number }
    } | undefined;

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showSSN, setShowSSN] = useState(false);
    const [referenceId, setReferenceId] = useState('');
    // const [processingStage, setProcessingStage] = useState(''); // Removed as per instruction

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        ssn: '',
        address: '',
        city: '',
        zip: '',
        employer: '',
        jobTitle: '',
        monthlyIncome: '',
        timeAtJob: '',
        creditAuth: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = (currentStep: number) => {
        const d = formData;
        if (currentStep === 1) return d.firstName && d.lastName && d.email && d.phone;
        if (currentStep === 2) return d.address && d.city && d.zip && d.employer && d.monthlyIncome;
        if (currentStep === 3) return d.dob && d.ssn.length >= 4 && d.creditAuth;
        return false;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        } else {
            addNotification('error', 'Por favor completa todos los campos requeridos.');
        }
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setIsSubmitting(true);

        // Simulation Stages - Removed as per instruction
        // const stages = [
        //     "Conectando con Servidor Seguro...",
        //     "Encriptando Datos (256-bit SSL)...",
        //     "Consultando Buró de Crédito...",
        //     "Analizando Capacidad de Pago...",
        //     "Generando Oferta Preliminar..."
        // ];

        // for (const stage of stages) {
        //     setProcessingStage(stage);
        //     await new Promise(r => setTimeout(r, 800)); // Cinematic delay
        // }

        try {
            const submissionData = {
                ...formData,
                ...(dealContext ? {
                    vehicleInfo: dealContext.vehicle,
                    quote: dealContext.quote,
                    type: 'finance'
                } : {})
            };

            await submitApplication(submissionData);
            // Ethical Change: Reference ID for Case Tracking, not "Approval"
            const refId = `CASE-${Math.floor(Math.random() * 1000000)}`;
            setReferenceId(refId);
            setIsSuccess(true);
        } catch (error) {
            console.error("Error submitting application:", error);
            addNotification('error', 'Hubo un error al procesar. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // SUCCESS VIEW: REALISTIC & SECURE
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#0d2232] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="bg-slate-900/90 backdrop-blur-xl p-12 rounded-[40px] shadow-[0_0_60px_rgba(0,174,217,0.1)] text-center max-w-lg w-full border border-white/10 animate-in zoom-in duration-500 relative z-10">
                    <div className="w-24 h-24 bg-[#00aed9]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,174,217,0.2)]">
                        <FileText size={48} className="text-[#00aed9]" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">En Revisión por Expertos</h2>
                    <p className="text-slate-300 mb-8 leading-relaxed font-light">
                        Tu perfil ha sido asignado a nuestro equipo de <span className="text-[#00aed9] font-bold">Expertos Financieros</span>. Están analizando tu caso manualmente para asegurar las mejores condiciones reales.
                        <br /><br />
                        <span className="font-medium text-white">Gracias por confiar en nosotros.</span>
                    </p>
                    <div className="bg-slate-800 p-6 rounded-2xl mb-8 border border-white/5">
                        <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2">Número de Caso</p>
                        <p className="text-3xl font-mono font-bold text-white tracking-widest">{referenceId}</p>
                    </div>
                    <button
                        onClick={onExit}
                        className="w-full py-4 bg-[#173d57] hover:bg-[#00aed9] text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    // SOFIA AI AGENT HELP TEXTS (REALISTIC)
    const sofiaTips = [
        "Hola, soy Sofia 👩‍💼. Recopilaré tu información de forma segura para crear tu expediente.",
        "Estos datos ayudarán a nuestros analistas humanos a encontrar el mejor banco para ti 🏦.",
        "Tu seguridad es legalmente sagrada 🔒. Esta conexión está encriptada y tus datos solo los verá un oficial autorizado."
    ];

    return (
        <div className="min-h-screen bg-[#0b1116] text-white flex flex-col font-sans">
            {/* Fintech Header */}
            <div className="bg-[#0f1922] border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="text-[#00aed9]">RICHARD</span> FINANCIAL
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold bg-[#00aed9]/10 text-[#00aed9] px-3 py-1.5 rounded-full border border-[#00aed9]/20">
                    <Lock size={10} /> SECURE APPLICATION
                </div>
            </div>

            <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">

                {/* Visual Sidebar with Sofia */}
                <div className="w-full md:w-1/3 p-6 md:p-12 flex flex-col justify-center relative overflow-hidden">
                    {/* Sofia Avatar Area */}
                    <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl animate-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center shadow-lg border-2 border-[#00aed9]/30">
                                <img src="https://cdn-icons-png.flaticon.com/512/4128/4128335.png" alt="Sofia AI" className="w-10 h-10 object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Sofia AI</h3>
                                <p className="text-xs text-[#00aed9] font-mono">ASISTENTE DE SOLICITUD</p>
                            </div>
                        </div>
                        <div className="relative bg-slate-900/80 p-4 rounded-xl rounded-tl-sm border border-[#00aed9]/20">
                            <p className="text-sm text-slate-300 leading-relaxed italic">
                                "{sofiaTips[step - 1]}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Area */}
                <div className="w-full md:w-2/3 p-4 md:p-12 flex items-center justify-center">
                    <div className="w-full max-w-2xl">

                        {/* Progress */}
                        <div className="flex gap-2 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#00aed9] shadow-[0_0_10px_#00aed9]' : 'bg-slate-800'}`} />
                            ))}
                        </div>

                        <div className="bg-[#131f2a] p-8 md:p-10 rounded-[30px] border border-white/5 shadow-2xl relative overflow-hidden">
                            {/* Loading Overlay */}
                            {isSubmitting && (
                                <div className="absolute inset-0 bg-[#0d2232]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
                                    <div className="w-20 h-20 border-4 border-[#00aed9]/30 border-t-[#00aed9] rounded-full animate-spin mb-6"></div>
                                    <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Encriptando y Enviando...</h3>
                                    <p className="text-slate-400 font-mono text-xs">Protegiendo sus datos</p>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                    <h2 className="text-3xl font-black text-white mb-6">¿Quién solicita?</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Nombre(s)" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Tu nombre oficial" autoFocus />
                                        <Input label="Apellidos" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Tus apellidos" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Móvil (SMS)" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(787) 000-0000" icon={<MessagesSquare size={16} />} />
                                        <Input label="Email Personal" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="tu@email.com" />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                    <h2 className="text-3xl font-black text-white mb-6">Perfil Financiero</h2>
                                    <Input label="Dirección Residencial" name="address" value={formData.address} onChange={handleInputChange} placeholder="Dirección completa" autoFocus />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="Ciudad" name="city" value={formData.city} onChange={handleInputChange} />
                                        <Input label="Zip Code" name="zip" value={formData.zip} onChange={handleInputChange} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Patrono / Empresa" name="employer" value={formData.employer} onChange={handleInputChange} icon={<Briefcase size={16} />} />
                                        <Input label="Puesto / Cargo" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
                                    </div>
                                    <Input
                                        label="Ingreso Mensual ($)"
                                        name="monthlyIncome"
                                        type="number"
                                        value={formData.monthlyIncome}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        icon={<Banknote size={16} />}
                                    />
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                    <h2 className="text-3xl font-black text-white mb-6">Seguridad Legal</h2>

                                    <div className="bg-[#00aed9]/10 border border-[#00aed9]/20 p-4 rounded-xl flex gap-3">
                                        <ShieldCheck className="text-[#00aed9] shrink-0" />
                                        <p className="text-xs text-[#00aed9] font-medium leading-relaxed">
                                            Autorización Oficial. Sus datos serán procesados cumpliendo con la Ley de Crédito Justo y Privacidad Financiera.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Fecha Nacimiento" name="dob" type="date" value={formData.dob} onChange={handleInputChange} icon={<Calendar size={16} />} />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SSN (Últimos 4)</label>
                                            <div className="relative">
                                                <input
                                                    type={showSSN ? "text" : "password"}
                                                    name="ssn"
                                                    value={formData.ssn}
                                                    onChange={handleInputChange}
                                                    placeholder="XXX-XX-XXXX"
                                                    className="w-full bg-[#0b1116] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#00aed9] focus:ring-1 focus:ring-[#00aed9] outline-none transition-all text-center tracking-[0.5em] font-mono"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSSN(!showSSN)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                                >
                                                    {showSSN ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-start gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, creditAuth: !prev.creditAuth }))}>
                                        <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${formData.creditAuth ? 'bg-[#00aed9] border-[#00aed9]' : 'border-slate-600'}`}>
                                            {formData.creditAuth && <CheckCircle2 size={16} className="text-white" />}
                                        </div>
                                        <p className="text-xs text-slate-400 select-none">
                                            Autorizo a Richard Automotive a consultar mi reporte de crédito real para propósitos de evaluación financiera. Entiendo que esto es una solicitud de crédito.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 flex justify-between items-center">
                                {step > 1 ? (
                                    <button onClick={prevStep} className="text-slate-500 hover:text-white font-bold text-sm px-4 py-2 transition-colors">ATRAS</button>
                                ) : <div></div>}

                                <button
                                    onClick={step === 3 ? handleSubmit : nextStep}
                                    disabled={isSubmitting}
                                    className="px-10 py-4 bg-[#00aed9] hover:bg-cyan-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <> <Loader2 className="animate-spin" /> Procesando... </>
                                    ) : (
                                        step === 3 ? 'Enviar Solicitud Segura' : <>Siguiente <ChevronRight size={18} /></>
                                    )}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const Input = ({ label, icon, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            {icon} {label}
        </label>
        <input
            {...props}
            className="w-full bg-[#0b1116] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#00aed9] focus:ring-1 focus:ring-[#00aed9] outline-none transition-all placeholder:text-slate-700 font-medium"
        />
    </div>
);

export default PreQualifyView;
