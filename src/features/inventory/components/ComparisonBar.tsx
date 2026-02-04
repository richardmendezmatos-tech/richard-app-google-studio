import React from 'react';
import { useComparison } from '@/contexts/ComparisonContext';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, GitCompare } from 'lucide-react';

const ComparisonBar: React.FC = () => {
    const { selectedCars, removeCarFromCompare } = useComparison();
    const navigate = useNavigate();

    if (selectedCars.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 p-4 flex justify-center pointer-events-none">
            <div className="bg-[#0d2232] border border-[#00aed9]/30 rounded-2xl shadow-2xl p-4 flex items-center gap-6 pointer-events-auto max-w-2xl w-full backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00aed9]/10 flex items-center justify-center text-[#00aed9]">
                        <GitCompare size={20} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Comparando</h4>
                        <p className="text-slate-400 text-xs">{selectedCars.length} Vehículos seleccionados</p>
                    </div>
                </div>

                <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                    {selectedCars.map(car => (
                        <div key={car.id} className="relative group shrink-0">
                            <img src={car.img} alt={car.name} className="w-16 h-12 object-contain bg-white/5 rounded-lg border border-white/10" />
                            <button
                                onClick={() => removeCarFromCompare(car.id)}
                                className="absolute -top-2 -right-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    {selectedCars.length < 3 && (
                        <div className="w-16 h-12 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs text-center leading-none">
                            Agregar +
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate('/compare')}
                    className="bg-[#00aed9] hover:bg-[#009ac0] text-slate-900 font-black uppercase text-xs tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                    Comparar <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ComparisonBar;
