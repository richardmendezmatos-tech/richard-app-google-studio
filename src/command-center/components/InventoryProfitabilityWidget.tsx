import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Car as CarType } from '@/types/types';
import { evaluarMargenOperativo } from '@/features/inventory/application/EvaluarMargenOperativo';
import { EstadoUnidad } from '@/features/inventory/domain/Unidad';

interface Props {
  inventory: CarType[];
}

export const InventoryProfitabilityWidget: React.FC<Props> = ({ inventory }) => {
  const analysis = useMemo(() => {
    // Adaptamos los objetos Car del sistema legacy al dominio de Unidad para el análisis
    const units = inventory.map((car) => ({
      id: car.id,
      vin: car.id, // Usamos ID como fallback de VIN para el análisis visual
      marca: car.name.split(' ')[1] || 'Unknown',
      modelo: car.name.split(' ').slice(2).join(' ') || 'Unknown',
      anio: car.year || 2024,
      color: 'N/A',
      millaje: 0,
      costoAdquisicion: car.price * 0.8, // Estimación de costo para el widget (backend data real idealmente)
      costoRecondicionamiento: 500,
      precioVenta: car.price,
      estado: EstadoUnidad.DISPONIBLE,
      fechaIngreso: new Date(),
    }));

    const reports = units.map((u) => evaluarMargenOperativo.execute(u));
    const averageRoi =
      reports.length > 0 ? reports.reduce((acc, r) => acc + r.roi, 0) / reports.length : 0;
    const totalProfit = reports.reduce((acc, r) => acc + r.margenBruto, 0);
    const healthyCount = reports.filter((r) => r.esOperacionSaludable).length;

    return {
      reports: reports.slice(0, 5), // Top 5 para el widget
      averageRoi,
      totalProfit,
      healthyCount,
      totalCount: reports.length,
    };
  }, [inventory]);

  return (
    <div className="glass-premium p-6 border border-white/10 relative overflow-hidden group h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <DollarSign size={18} className="text-[#00aed9]" />
            Margen Operativo
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Análisis de Rentabilidad en Tiempo Real
          </p>
        </div>
        <div className="text-right">
          <div
            className={`text-xl font-black ${analysis.averageRoi >= 15 ? 'text-emerald-500' : 'text-amber-500'}`}
          >
            {analysis.averageRoi.toFixed(1)}%{' '}
            <span className="text-[10px] text-slate-500">AVG ROI</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
          <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Profit Proyectado</p>
          <p className="text-md font-black text-white">${analysis.totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
          <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Salud Operativa</p>
          <div className="flex items-center gap-2">
            <p className="text-md font-black text-white">
              {analysis.healthyCount}/{analysis.totalCount}
            </p>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Unit List */}
      <div className="flex-1 space-y-3 overflow-hidden">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2 px-1">
          Unidades con Mayor Impacto
        </p>
        {analysis.reports.map((report, idx) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all group/item"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-lg ${report.esOperacionSaludable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
              >
                {report.esOperacionSaludable ? (
                  <TrendingUp size={14} />
                ) : (
                  <AlertTriangle size={14} />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-white truncate w-24">
                  ID: {report.id.split('-')[0]}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">
                  ROI: {report.roi.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black text-white">
                ${report.margenBruto.toLocaleString()}
              </p>
              <p className="text-[8px] text-slate-500 font-bold uppercase">MARGEN</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <button className="mt-4 w-full py-3 bg-[#00aed9]/10 hover:bg-[#00aed9] text-[#00aed9] hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
        Ver Reporte de Auditoría Completo
        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>

      {/* Decorative Blur */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#00aed9]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default InventoryProfitabilityWidget;
