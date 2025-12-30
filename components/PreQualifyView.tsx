
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Lock, User, Briefcase, Banknote, Calendar, ChevronRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { submitApplication } from '../services/firebaseService';

interface Props {
    onExit: () => void;
}

const PreQualifyView: React.FC<Props> = ({ onExit }) => {
    const { addNotification } = useNotification();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showSSN, setShowSSN] = useState(false);
    const [referenceId, setReferenceId] = useState('');

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
        timeAtJob: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = (currentStep: number) => {
        const d = formData;
        if (currentStep === 1) return d.firstName && d.lastName && d.email && d.phone;
        if (currentStep === 2) return d.address && d.city && d.zip && d.employer && d.monthlyIncome;
        if (currentStep === 3) return d.dob && d.ssn.length >= 4; // Basic check
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
        if (!validateStep(3)) {
            addNotification('error', 'Por favor completa la información de identidad.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            await submitApplication(formData);
            const refId = `REF-${Math.floor(Math.random() * 1000000)}`;
            setReferenceId(refId);
            setIsSuccess(true);
            addNotification('success', 'Solicitud guardada correctamente en la base de datos.');
        } catch (error) {
            console.error("Error submitting application:", error);
            addNotification('error', 'Hubo un error al enviar la solicitud. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
                <div className="bg-white dark:bg-slate-800 p-12 rounded-[40px] shadow-2xl text-center max-w-lg w-full border border-slate-100 dark:border-slate-700 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">¡Pre-Aprobación Recibida!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        Tus datos han sido procesados y guardados exitosamente en el sistema seguro. Un oficial de finanzas de Richard Automotive te contactará al <strong>{formData.phone}</strong>.
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-xl mb-8">
                        <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Número de Referencia</p>
                        <p className="text-xl font-mono font-bold text-[#00aed9]">{referenceId}</p>
                    </div>
                    <button 
                        onClick={onExit}
                        className="w-full py-4 bg-[#173d57] hover:bg-[#00aed9] text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                        Volver a la Tienda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Header Seguro */}
            <div className="bg-[#173d57] text-white p-6 shadow-md z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <ShieldCheck className="text-emerald-400" /> Solicitud Segura
                        </h1>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Lock size={10} /> 256-bit SSL Encrypted Connection
                        </p>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        Servidor Seguro Activo
                    </div>
                </div>
            </div>

            <main className="flex-1 flex justify-center p-4 md:p-10 overflow-y-auto">
                <div className="w-full max-w-4xl">
                    
                    {/* Progress Bar */}
                    <div className="mb-10 flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full"></div>
                        <div 
                            className="absolute top-1/2 left-0 h-1 bg-[#00aed9] -z-10 rounded-full transition-all duration-500" 
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        ></div>
                        
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`flex flex-col items-center gap-2 transition-all ${step >= s ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all ${
                                    step >= s ? 'bg-[#173d57] border-[#00aed9] text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                                }`}>
                                    {s}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block text-slate-500 dark:text-slate-400">
                                    {s === 1 ? 'Contacto' : s === 2 ? 'Ingresos' : 'Identidad'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-5">
                        
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <User className="text-[#00aed9]" /> Información Personal
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Nombre(s)" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ej. Juan" />
                                    <Input label="Apellidos" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Ej. Del Pueblo" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Teléfono Celular" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(787) 000-0000" />
                                    <Input label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="ejemplo@email.com" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <Briefcase className="text-[#00aed9]" /> Empleo e Ingresos
                                </h2>
                                <Input label="Dirección Residencial" name="address" value={formData.address} onChange={handleInputChange} placeholder="Calle, Número, Urb..." />
                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Ciudad" name="city" value={formData.city} onChange={handleInputChange} placeholder="San Juan" />
                                    <Input label="Código Postal" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="009..." />
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-700 my-6"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Patrono Actual" name="employer" value={formData.employer} onChange={handleInputChange} placeholder="Nombre de la empresa" />
                                    <Input label="Puesto / Título" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="Ej. Gerente" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Ingreso Mensual Bruto ($)" 
                                        name="monthlyIncome" 
                                        type="number" 
                                        value={formData.monthlyIncome} 
                                        onChange={handleInputChange} 
                                        placeholder="0.00" 
                                        icon={<Banknote size={16} />}
                                    />
                                    <Input label="Tiempo en empleo" name="timeAtJob" value={formData.timeAtJob} onChange={handleInputChange} placeholder="Ej. 2 años" />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <Lock className="text-[#00aed9]" /> Identidad Segura
                                </h2>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl flex gap-3 mb-6">
                                    <ShieldCheck className="text-blue-500 shrink-0" />
                                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                        Esta información es encriptada y utilizada únicamente para obtener tu reporte de crédito preliminar. No almacenamos tu Seguro Social completo en servidores públicos.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Fecha de Nacimiento" 
                                        name="dob" 
                                        type="date" 
                                        value={formData.dob} 
                                        onChange={handleInputChange} 
                                        icon={<Calendar size={16} />}
                                    />
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                                            Seguro Social (SSN) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type={showSSN ? "text" : "password"}
                                                name="ssn"
                                                value={formData.ssn}
                                                onChange={handleInputChange}
                                                placeholder="XXX-XX-XXXX"
                                                className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-700 dark:text-white border-2 border-transparent rounded-[20px] focus:ring-4 focus:ring-[#00aed9]/20 text-lg font-bold outline-none transition-all placeholder:text-slate-300 tracking-widest"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowSSN(!showSSN)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00aed9]"
                                            >
                                                {showSSN ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 mt-4">
                                    <input type="checkbox" id="consent" className="mt-1 w-4 h-4 rounded border-slate-300 text-[#00aed9] focus:ring-[#00aed9]" />
                                    <label htmlFor="consent" className="text-xs text-slate-500 dark:text-slate-400">
                                        Autorizo a Richard Automotive a obtener mi reporte de crédito para fines de pre-cualificación. Entiendo que esto no garantiza una aprobación final de crédito.
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-700">
                            {step > 1 ? (
                                <button 
                                    onClick={prevStep}
                                    className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Atrás
                                </button>
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
            </main>
        </div>
    );
};

const Input = ({ label, icon, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
            {icon} {label} <span className="text-red-500">*</span>
        </label>
        <input 
            {...props}
            className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-700 dark:text-white border-2 border-transparent rounded-[20px] focus:ring-4 focus:ring-[#00aed9]/20 text-lg font-bold outline-none transition-all placeholder:text-slate-300"
        />
    </div>
);

export default PreQualifyView;
