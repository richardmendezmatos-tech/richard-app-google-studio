import React, { useState } from 'react';
import {
  Camera,
  CarFront,
  DollarSign,
  Hash,
  Calendar,
  Palette,
  Gauge,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  recibirNuevaUnidad,
  RecibirUnidadParams,
} from '@/features/inventory';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';

const IntakeView: React.FC = () => {
  const [formData, setFormData] = useState<RecibirUnidadParams>({
    vin: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
    millaje: 0,
    costoAdquisicion: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await recibirNuevaUnidad.execute(formData);
      addNotification(
        'success',
        `Unidad ${result.vin} recibida exitosamente con un ROI proyectado optimista.`,
      );
      setStep(3); // Success step
    } catch (error: any) {
      addNotification('error', error.message || 'Error al procesar la unidad.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'anio' || name === 'millaje' || name === 'costoAdquisicion'
          ? Number(value)
          : value,
    }));
  };

  return (
    <div className="glass-premium p-8 border border-white/10 relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700" />

      <div className="relative z-10">
        <header className="relative z-10 mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                In-Take Digital System
              </span>
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
              Recepción de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
                Unidades
              </span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border transition-all ${
                    step >= s
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                >
                  {step > s ? <CheckCircle2 size={16} /> : s}
                </div>
                <div className={`h-px w-8 bg-white/10 ${s === 3 ? 'hidden' : ''}`} />
              </div>
            ))}
          </div>
        </header>

        <div className="relative z-10 max-w-4xl mx-auto">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <InputGroup
                    icon={Hash}
                    label="VIN de la Unidad"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                    placeholder="Ej: 1G1RC6S5..."
                  />
                  <InputGroup
                    icon={CarFront}
                    label="Marca"
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    placeholder="Ej: Toyota"
                  />
                  <InputGroup
                    icon={CarFront}
                    label="Modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    placeholder="Ej: Camry"
                  />
                </div>
                <div className="space-y-4">
                  <InputGroup
                    icon={Calendar}
                    label="Año"
                    name="anio"
                    type="number"
                    value={formData.anio}
                    onChange={handleInputChange}
                  />
                  <InputGroup
                    icon={Palette}
                    label="Color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Ej: Blanco Perla"
                  />
                  <InputGroup
                    icon={Gauge}
                    label="Millaje"
                    name="millaje"
                    type="number"
                    value={formData.millaje}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="h-14 px-10 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl flex items-center gap-3 hover:bg-primary hover:text-white transition-all group"
                >
                  Continuar a Finanzas
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form
              onSubmit={handleSubmit}
              className="animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 mb-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <DollarSign size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                      Análisis de Adquisición
                    </h3>
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
                      Control de Margen Richards
                    </p>
                  </div>
                </div>

                <div className="max-w-md">
                  <InputGroup
                    icon={DollarSign}
                    label="Costo de Adquisición (Pagado al Cliente)"
                    name="costoAdquisicion"
                    type="number"
                    value={formData.costoAdquisicion}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-3xl flex items-start gap-4">
                  <ShieldCheck className="text-primary shrink-0" size={20} />
                  <div>
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                      Algoritmo de Recondicionamiento Ra-Ai
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Al procesar, nuestro sistema estimará automáticamente el costo de
                      recondicionamiento basado en el millaje ({formData.millaje} mi) y año (
                      {formData.anio}) para proyectar tu ROI neto real.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors"
                >
                  ← Volver a Datos
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.costoAdquisicion <= 0}
                  className="h-16 px-12 bg-primary text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl flex items-center gap-3 shadow-2xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  {isSubmitting ? 'Procesando en el Vault...' : 'Registrar Unidad Maestra'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="animate-in zoom-in-95 fade-in duration-700 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-bounce">
                <CheckCircle2 size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                Unidad Integrada con Éxito
              </h2>
              <p className="text-slate-400 max-w-md mx-auto mb-12">
                La unidad con VIN <span className="text-primary font-mono">{formData.vin}</span>{' '}
                ha sido registrada y el informe de rentabilidad está disponible en el Dashboard
                Central.
              </p>
              <button
                onClick={() => {
                  setFormData({
                    vin: '',
                    marca: '',
                    modelo: '',
                    anio: new Date().getFullYear(),
                    color: '',
                    millaje: 0,
                    costoAdquisicion: 0,
                  });
                  setStep(1);
                }}
                className="px-10 h-14 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all"
              >
                Recibir Otra Unidad
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InputGroup: React.FC<{
  icon: any;
  label: string;
  name: string;
  value: any;
  onChange: any;
  type?: string;
  placeholder?: string;
}> = ({ icon: Icon, label, name, value, onChange, type = 'text', placeholder }) => (
  <div className="group">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-primary transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white font-bold transition-all focus:bg-white/10 focus:border-primary/50 focus:ring-0 outline-none"
      />
    </div>
  </div>
);

export default IntakeView;
