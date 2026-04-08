"use client";

import React, { useEffect, useState } from 'react';
import { getSubscribers } from '@/shared/api/firebase/firebaseService';
import { Subscriber } from '@/shared/types/types';
import { Users, Mail, Bell, Search, Filter, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const AudiencesView: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const data = await getSubscribers();
        setSubscribers(data);
      } catch (e) {
        console.error('Error fetching subscribers:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      alert('¡Broadcast a toda la audiencia enviado exitosamente! (Mock)');
    }, 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Audiences & Growth
          </h1>
          <p className="text-slate-400 font-light mt-2">
            Control de suscriptores y campañas unificadas.
          </p>
        </div>
        <button
          onClick={handleBroadcast}
          disabled={isBroadcasting || subscribers.length === 0}
          className="px-8 py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-3 disabled:opacity-50"
        >
          {isBroadcasting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          Enviar Broadcast
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111c26] border border-white/5 p-8 rounded-3xl">
          <div className="flex items-center gap-4 text-primary mb-4">
            <Users size={24} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Total Suscriptores</h3>
          </div>
          <p className="text-5xl font-black text-white">{subscribers.length}</p>
        </div>
        <div className="bg-[#111c26] border border-white/5 p-8 rounded-3xl">
          <div className="flex items-center gap-4 text-amber-500 mb-4">
            <Mail size={24} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Apertura Promedio</h3>
          </div>
          <p className="text-5xl font-black text-white">42%</p>
        </div>
        <div className="bg-[#111c26] border border-white/5 p-8 rounded-3xl">
          <div className="flex items-center gap-4 text-emerald-500 mb-4">
            <Bell size={24} />
            <h3 className="font-bold uppercase tracking-widest text-xs">CTR</h3>
          </div>
          <p className="text-5xl font-black text-white">8.5%</p>
        </div>
      </div>

      {/* Audience List */}
      <div className="bg-[#111c26] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="relative w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar email..."
              className="w-full bg-[#0b1116] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary transition-all"
            />
          </div>
          <button
            title="Refinar y Filtrar"
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="animate-spin mx-auto" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              No hay suscriptores aún.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0b1116]/50 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="p-6">Email</th>
                  <th className="p-6">Canal</th>
                  <th className="p-6">Fecha Registro</th>
                  <th className="p-6 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub, i) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={sub.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="p-6 font-bold text-white">{sub.email}</td>
                    <td className="p-6 text-slate-400">Website Form</td>
                    <td className="p-6 text-slate-400">
                      {sub.timestamp
                        ? new Date((sub.timestamp as any).seconds * 1000).toLocaleDateString()
                        : 'Reciente'}
                    </td>
                    <td className="p-6 text-right">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/30">
                        Activo
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudiencesView;
