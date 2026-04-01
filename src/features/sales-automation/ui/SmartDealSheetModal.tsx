import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Loader2,
  Sparkles,
  Target,
  Brain,
  DollarSign,
  X,
  Car as CarIcon,
  Download,
} from 'lucide-react';
import { Lead, Car } from '@/shared/types/types';
import { generateSmartDealSheet, DealSheetData } from '../model/dealSheetService';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';

interface SmartDealSheetModalProps {
  lead: Lead | null;
  onClose: () => void;
  onExportPDF?: (data: DealSheetData, lead: Lead) => void;
}

const SmartDealSheetModal: React.FC<SmartDealSheetModalProps> = ({
  lead,
  onClose,
  onExportPDF,
}) => {
  const [dealData, setDealData] = useState<DealSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealSheet = async () => {
      if (!lead) return;
      setLoading(true);
      setError(null);
      try {
        // Obtenemos un bloque del inventario real para contexto
        const response = await getPaginatedCars(15, null);
        const allCars = response.cars;
        const data = await generateSmartDealSheet(lead, allCars); // Pasamos una muestra por tokens
        setDealData(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo generar el Deal Sheet. La IA está experimentando alta latencia.');
      } finally {
        setLoading(false);
      }
    };

    if (lead && !dealData && !loading && !error) {
      fetchDealSheet();
    }
  }, [lead, dealData, loading, error]);

  if (!lead) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="relative w-full max-w-5xl max-h-full overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-2xl rounded-3xl sm:rounded-[40px] border border-slate-200 dark:border-slate-800 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Smart Deal Sheet <Sparkles className="text-amber-400" size={20} />
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500">
                  Estrategia Generativa para:{' '}
                  <span className="text-primary font-bold">
                    {lead.firstName} {lead.lastName}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {dealData && (
                <button
                  onClick={() => onExportPDF?.(dealData, lead)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm font-bold"
                >
                  <Download size={16} /> Exportar
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Cerrar modal"
                title="Cerrar modal"
                className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse">
                  Analizando psicología del comprador con Gemini Flash...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-rose-500 gap-4">
                <Brain size={48} className="opacity-50" />
                <p className="text-sm font-bold bg-rose-500/10 px-4 py-2 rounded-xl">{error}</p>
                <button
                  onClick={() => {
                    setDealData(null);
                    setError(null);
                    setLoading(false);
                  }}
                  className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700"
                >
                  Reintentar
                </button>
              </div>
            ) : dealData ? (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
                {/* Executive Summary */}
                <div className="p-5 sm:p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-3 flex items-center gap-2">
                    <Target size={14} /> Resumen Ejecutivo AI
                  </h3>
                  <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    "{dealData.executiveSummary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Psycological Profile */}
                  <div className="space-y-6">
                    <div className="p-5 sm:p-6 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 dark:bg-slate-800/50 rounded-3xl border border-purple-500/10 dark:border-slate-700">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-5 flex items-center gap-2">
                        <Brain size={14} /> Perfil Psicológico
                      </h3>

                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500">Arquetipo:</span>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-black tracking-tight">
                          {dealData.psychologicalProfile.buyerType}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-bold text-emerald-500 mb-2 block">
                            Motivadores Clave (Botones Calientes):
                          </span>
                          <ul className="space-y-2">
                            {dealData.psychologicalProfile.keyMotivators.map((m, i) => (
                              <li
                                key={i}
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2"
                              >
                                <span className="text-emerald-500 mt-0.5">•</span> {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-rose-500 mb-2 block">
                            Deal Breakers (Puntos de Fricción):
                          </span>
                          <ul className="space-y-2">
                            {dealData.psychologicalProfile.dealBreakers.map((d, i) => (
                              <li
                                key={i}
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2"
                              >
                                <span className="text-rose-500 mt-0.5">•</span> {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Pitch */}
                  <div className="space-y-6">
                    <div className="p-5 sm:p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-5 flex items-center gap-2">
                        <DollarSign size={14} /> Estrategia Financiera
                      </h3>

                      <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Pronto Ideal
                          </span>
                          <span className="text-2xl font-black text-slate-800 dark:text-white">
                            ${dealData.financialStrategy.suggestedDownPayment.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                            Cierre Mensual
                          </span>
                          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                            ${dealData.financialStrategy.targetMonthly.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-500">
                          Argumentos de Estructuración:
                        </span>
                        {dealData.financialStrategy.talkingPoints.map((tp, i) => (
                          <div
                            key={i}
                            className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                          >
                            {tp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Pitch */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-primary/10 to-cyan-500/10 dark:bg-primary/5 rounded-3xl border border-primary/20">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                    <Sparkles size={14} /> Pitch de Cierre (Copiar y Pegar / Leer)
                  </h3>
                  <p className="text-md sm:text-lg font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                    "{dealData.recommendedPitch}"
                  </p>
                </div>

                {/* Alternatives */}
                {dealData.vehicleAlternatives.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2 pl-2">
                      <CarIcon size={14} /> Unidades Alternativas (Pivot)
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {dealData.vehicleAlternatives.map((alt, i) => (
                        <div
                          key={i}
                          className="flex flex-col p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          <span className="font-bold text-slate-800 dark:text-white mb-2">
                            {alt.name}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                            {alt.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SmartDealSheetModal;
