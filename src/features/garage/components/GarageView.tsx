import React, { useState } from 'react';
import { TrendingUp, Zap, Plus, ChevronRight, Fuel, Wrench } from 'lucide-react';

interface GarageVehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    mileage: number;
    estimatedValue: number;
    equityStatus: 'optimal' | 'stable' | 'depreciating';
}

const GarageView: React.FC = () => {
    const [vehicles] = useState<GarageVehicle[]>([
        {
            id: '1',
            make: 'Toyota',
            model: 'Tacoma',
            year: 2021,
            mileage: 35000,
            estimatedValue: 32000,
            equityStatus: 'optimal'
        }
    ]);

    return (
        <div className="min-h-screen bg-[#0b1116] p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Mi Garaje Inteligente</h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Digital Twin & Asset Management</p>
                </div>
                <button className="bg-[#00aed9] hover:bg-cyan-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20">
                    <Plus size={20} /> AGREGAR AUTO
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map(vehicle => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}

                {/* Empty State / Add Card */}
                <div className="border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center p-12 text-slate-700 hover:border-[#00aed9]/30 hover:text-slate-500 transition-all cursor-pointer group">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                    </div>
                    <p className="font-bold uppercase tracking-widest text-sm text-center">Registrar otro vehículo</p>
                </div>
            </div>
        </div>
    );
};

const VehicleCard = ({ vehicle }: { vehicle: GarageVehicle }) => {
    return (
        <div className="group relative bg-[#131f2a]/80 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 overflow-hidden transition-all hover:border-[#00aed9]/40 hover:shadow-[0_0_40px_rgba(0,174,217,0.1)]">
            {/* Header info */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <span className="text-[10px] font-black text-[#00aed9] uppercase tracking-[0.2em]">{vehicle.year}</span>
                    <h2 className="text-2xl font-black text-white">{vehicle.make} {vehicle.model}</h2>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${vehicle.equityStatus === 'optimal' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                    Status: {vehicle.equityStatus}
                </div>
            </div>

            {/* Asset Value */}
            <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valor de Mercado (AI)</p>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-white">${vehicle.estimatedValue.toLocaleString()}</span>
                    <TrendingUp size={18} className="text-green-500 mb-1" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#0b1116] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Fuel size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Millaje</span>
                    </div>
                    <p className="font-black text-white">{vehicle.mileage.toLocaleString()}</p>
                </div>
                <div className="bg-[#0b1116] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Wrench size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Servicio</span>
                    </div>
                    <p className="font-black text-white">En 1,500 mi</p>
                </div>
            </div>

            {/* AI Nudge Button */}
            {vehicle.equityStatus === 'optimal' && (
                <button className="w-full bg-gradient-to-r from-green-500/20 to-[#00aed9]/20 hover:from-green-500/30 hover:to-[#00aed9]/30 border border-green-500/30 p-4 rounded-2xl flex items-center justify-between group/btn transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <Zap size={16} className="text-white fill-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-white uppercase tracking-wider">Opportunity Detected</p>
                            <p className="text-xs text-green-500 font-bold">Cambia tu equipo hoy</p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-white group-hover/btn:translate-x-1 transition-transform" />
                </button>
            )}
        </div>
    );
}

export default GarageView;
