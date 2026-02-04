import React, { useState } from 'react';
import { useDealer } from '@/contexts/DealerContext';
import { addVehicle as addCar } from '@/features/inventory/services/inventoryService';
import { ShieldCheck, TrendingUp, Handshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EarlyAdopterOnboard = () => {
    const { setDealer } = useDealer();
    const [status, setStatus] = useState<string>('Ready');
    const navigate = useNavigate();

    const handleOnboardPrestige = async () => {
        setStatus('Onboarding PRESTIGE AUTO...');

        // 1. Production B2B Configuration
        const prestigeConfig = {
            id: 'prestige-auto-001',
            name: 'Prestige Auto Group',
            themeColor: '#0F172A',
            logo: 'https://images.unsplash.com/photo-1599305090748-35cb06f0e74f?q=80&w=200&h=200&auto=format&fit=crop',
            welcomeMessage: 'Bienvenido a Prestige Auto Group. La mejor selección BMW & Mercedes de la región.'
        };
        setDealer(prestigeConfig);

        try {
            setStatus('Seeding Premium Inventory...');
            const cars = [
                {
                    name: 'BMW M4 Competition 2024',
                    price: 98000,
                    type: 'luxury' as any,
                    badge: 'Prestige Certified',
                    img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop',
                    featured: true,
                    description: 'Full carbon package, zero miles.'
                }
            ];

            for (const car of cars) {
                await addCar(car);
            }

            setStatus('DONE! Welcome Prestige Auto.');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error(err);
            setStatus('Setup Failed.');
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-10 shadow-2xl">
                <div className="flex items-center gap-3 text-emerald-400 mb-8">
                    <Handshake size={40} />
                    <h1 className="text-3xl font-black uppercase tracking-tighter">COO Provisioning</h1>
                </div>

                <p className="text-slate-400 mb-10 text-sm leading-relaxed font-medium">
                    Ejecutando la acción <strong>#701</strong> de nuestro Balanced Scorecard. Alta real del primer concesionario Early Adopter: <strong>Prestige Auto Group</strong>.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                        <TrendingUp size={16} className="text-emerald-500 mb-2" />
                        <div className="text-[10px] text-slate-500 uppercase font-black">Proyección MRR</div>
                        <div className="text-lg font-black">$1,000/mo</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                        <ShieldCheck size={16} className="text-[#00aed9] mb-2" />
                        <div className="text-[10px] text-slate-500 uppercase font-black">Aislamiento</div>
                        <div className="text-lg font-black">AES-READY</div>
                    </div>
                </div>

                <button
                    onClick={handleOnboardPrestige}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-3"
                >
                    {status === 'Ready' ? 'Provision prestige auto' : status}
                </button>
            </div>
        </div>
    );
};

export default EarlyAdopterOnboard;
