import React, { useState } from 'react';
import { useDealer } from '@/contexts/DealerContext';
import { addVehicle as addCar } from '@/features/inventory/services/inventoryService';
import { Rocket, ShieldCheck, Palette, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BetaOnboard = () => {
    const { setDealer } = useDealer();
    const [status, setStatus] = useState<string>('Ready');
    const navigate = useNavigate();

    const handleOnboardEliteMotors = async () => {
        setStatus('Initializing Elite Motors...');

        // 1. Switch Identity
        const eliteConfig = {
            id: 'elite-motors-beta',
            name: 'Elite Motors (Beta)',
            themeColor: '#A855F7'
        };
        setDealer(eliteConfig);

        try {
            setStatus('Seeding Inventory for Elite...');
            // 2. Generate specialized inventory
            const eliteCars = [
                {
                    name: 'Elite Cyber-Sedan 2026',
                    price: 85000,
                    type: 'luxury' as any,
                    badge: 'Exclusivo Elite',
                    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
                    featured: true
                },
                {
                    name: 'Elite SUV-X Phantom',
                    price: 120000,
                    type: 'suv' as any,
                    badge: 'Hyper-Limited',
                    img: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=1200&auto=format&fit=crop',
                    featured: true
                }
            ];

            for (const car of eliteCars) {
                await addCar(car);
            }

            setStatus('Success! Redirecting...');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error(err);
            setStatus('Error during onboarding.');
        }
    };

    return (
        <div className="min-h-screen bg-[#050b14] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-900/20">
                <div className="flex items-center gap-3 text-purple-400 mb-6">
                    <Rocket size={32} />
                    <h1 className="text-2xl font-black uppercase tracking-tighter">B2B Sandbox</h1>
                </div>

                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                    Estás a punto de simular el alta de <strong>Elite Motors</strong>. Esto demostrará el aislamiento de datos y la capacidad de marca blanca instantánea.
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase">
                        <Palette size={14} /> Color Base: <span className="text-purple-500">#A855F7</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase">
                        <Database size={14} /> ID de Base de Datos: <span className="text-white">elite-motors-beta</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase">
                        <ShieldCheck size={14} /> Seguridad: <span className="text-emerald-500">Aislamiento Activo</span>
                    </div>
                </div>

                <button
                    onClick={handleOnboardEliteMotors}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                >
                    {status === 'Ready' ? 'Onboard Elite Motors' : status}
                </button>
            </div>
        </div>
    );
};

export default BetaOnboard;
