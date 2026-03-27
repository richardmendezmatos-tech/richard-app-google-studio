import React, { useState } from 'react';
import {
  Zap,
  User,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SolicitudPrestamo, ResultadoAprobacion } from '../domain/Loan';
import { DI } from '@/app/di/registry';
import {
  appraisalVisionService,
  AppraisalResult,
} from '../../appraisal/services/AppraisalVisionService';

const QuickQualifyCard: React.FC = React.memo(() => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<
    Omit<SolicitudPrestamo, 'precioUnidad' | 'montoSolicitado'>
  >({
    nombreSolicitante: '',
    seguroSocial: '',
    telefono: '',
    ingresosMensuales: 0,
    puntuacionCredito: 700,
  });
  const [monto, setMonto] = useState<number>(25000);
  const [resultado, setResultado] = useState<ResultadoAprobacion | null>(null);
  const [isAppraising, setIsAppraising] = useState(false);
  const [appraisalResult, setAppraisalResult] = useState<AppraisalResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleCalculate = async () => {
    const tradeInEstimado = appraisalResult ? appraisalResult.suggestedAppraisal : 0;
    const montoSolicitadoFinal = Math.max(0, monto - tradeInEstimado);

    const solicitud: SolicitudPrestamo = {
      ...formData,
      montoSolicitado: montoSolicitadoFinal,
      precioUnidad: monto,
      valorTradeIn: tradeInEstimado > 0 ? tradeInEstimado : undefined,
    };

    const evaluateUseCase = DI.getEvaluarAprobacionVentaUseCase();
    const res = await evaluateUseCase.execute(solicitud);

    setResultado(res);
    setStep(2);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      setIsAppraising(true);
      try {
        // Usamos un baseline de mercado de $15,000 para este ejemplo
        const result = await appraisalVisionService.appraiseVehicle([base64], 15000);
        setAppraisalResult(result);
        // Ajustamos el monto (pronto/trade-in) si el usuario tiene una tasación
        // Aquí podríamos restar el suggestedAppraisal del monto total si fuera relevante
      } catch (error) {
        console.error('Appraisal Error:', error);
      } finally {
        setIsAppraising(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setStep(1);
    setResultado(null);
    setAppraisalResult(null);
    setPreviewImage(null);
  };

  return (
    <div className="bg-[#131f2a] border border-white/5 rounded-[32px] p-6 lg:p-8 overflow-hidden relative group transition-all hover:border-primary/30 shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-primary">
        <Zap size={120} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  Power Qualify
                </h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  Cualificación de Venta Express
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User size={12} className="text-primary" /> Nombre del Comprador
                </label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  title="Nombre completo del comprador"
                  className="w-full bg-[#0b1116] border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-primary/50 transition-all outline-none"
                  value={formData.nombreSolicitante}
                  onChange={(e) => setFormData({ ...formData, nombreSolicitante: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User size={12} className="text-primary" /> Seguro Social
                </label>
                <input
                  type="text"
                  placeholder="XXX-XX-XXXX"
                  title="Número de Seguro Social Completo"
                  className="w-full bg-[#0b1116] border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-primary/50 transition-all outline-none"
                  value={formData.seguroSocial}
                  onChange={(e) => setFormData({ ...formData, seguroSocial: e.target.value })}
                  maxLength={11}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User size={12} className="text-primary" /> Teléfono Móvil
                </label>
                <input
                  type="tel"
                  placeholder="(787) 555-0000"
                  title="Número de Teléfono del comprador"
                  className="w-full bg-[#0b1116] border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-primary/50 transition-all outline-none"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Empírica / Score
                  </label>
                  <input
                    type="number"
                    title="Puntuación de crédito (Empírica)"
                    className="w-full bg-[#0b1116] border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-primary/50 transition-all outline-none"
                    value={formData.puntuacionCredito}
                    onChange={(e) =>
                      setFormData({ ...formData, puntuacionCredito: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Ingreso (Poder de Compra)
                  </label>
                  <input
                    type="number"
                    title="Ingreso mensual bruto del comprador"
                    className="w-full bg-[#0b1116] border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-primary/50 transition-all outline-none"
                    value={formData.ingresosMensuales}
                    onChange={(e) =>
                      setFormData({ ...formData, ingresosMensuales: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Precio de la Unidad
                  </label>
                  <span className="text-primary font-black">${monto.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="80000"
                  step="1000"
                  title="Ajustar precio de la unidad para simulación"
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                  value={monto}
                  onChange={(e) => setMonto(Number(e.target.value))}
                />

                {appraisalResult && (
                  <>
                    <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center text-xs">
                      <span className="text-emerald-400 font-bold uppercase tracking-widest text-[9px]">
                        Trade-In Agregado
                      </span>
                      <span className="text-white font-black">
                        -${appraisalResult.suggestedAppraisal.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 px-3 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 uppercase tracking-widest font-black">
                        Total a Financiar
                      </span>
                      <span className="text-primary font-black">
                        ${Math.max(0, monto - appraisalResult.suggestedAppraisal).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* VISUAL APPRAISAL SECTION */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <Camera size={12} /> Tasación Visual IA
                  </h4>
                  {previewImage && (
                    <button
                      onClick={() => {
                        setPreviewImage(null);
                        setAppraisalResult(null);
                      }}
                      className="text-[8px] font-bold text-rose-400 uppercase tracking-widest hover:text-rose-300 transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </div>

                {!previewImage ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl py-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group/upload">
                    <ImageIcon
                      className="text-slate-500 group-hover/upload:text-primary transition-colors mb-2"
                      size={24}
                    />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover/upload:text-slate-300">
                      Subir foto del Trade-In
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="relative h-24 w-full rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {isAppraising && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                          <Loader2 size={20} className="text-primary animate-spin mb-1" />
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">
                            Analizando...
                          </span>
                        </div>
                      )}
                    </div>
                    {appraisalResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                            {appraisalResult.condition}
                          </span>
                          <span className="text-sm font-black text-white">
                            ${appraisalResult.suggestedAppraisal.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[8px] text-slate-300 leading-tight">
                          {appraisalResult.reasoning}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-[#00c2f0] hover:to-blue-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group/btn"
              >
                Evaluar Aprobación{' '}
                <ArrowRight
                  size={14}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative z-10 text-center py-4"
          >
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border-4 ${resultado?.esElegible ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-amber-500/10 border-amber-500 text-amber-500'}`}
            >
              {resultado?.esElegible ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
            </div>

            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
              Resultado del Análisis
            </h4>
            <div
              className={`text-4xl font-black uppercase tracking-tighter mb-4 ${resultado?.perfil === 'Power Elite' ? 'text-white' : resultado?.esElegible ? 'text-emerald-400' : 'text-amber-400'}`}
            >
              {resultado?.perfil}
            </div>

            <div className="bg-[#0b1116] border border-white/5 rounded-2xl p-6 mb-8 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#131f2a] px-4 text-[8px] font-black text-primary uppercase tracking-widest border border-white/5 rounded-full">
                Sales Script AI
              </span>
              <p className="text-white font-bold leading-relaxed italic text-sm">
                "{resultado?.mensajeVenta}"
              </p>
            </div>

            {resultado?.esElegible && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    APR Sugerido
                  </p>
                  <p className="text-xl font-black text-primary">{resultado.aprSugerido}%</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Estatus
                  </p>
                  <p className="text-sm font-black text-emerald-400 uppercase">Listo para Cierre</p>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl border border-white/10 transition-all"
            >
              Nueva Consulta
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

QuickQualifyCard.displayName = 'QuickQualifyCard';

export default QuickQualifyCard;
