import React, { Suspense } from 'react';
import { Smartphone, Shield, Key } from 'lucide-react';
import { auth } from '@/shared/api/firebase/firebaseService';

// Lazy load
const AuditLogViewer = React.lazy(() => import('./AuditLogViewer').then((m) => ({ default: m.AuditLogViewer })));

export const SecurityTabView: React.FC = () => {
  const handleRegisterPasskey = async () => {
    if (!auth.currentUser) return alert('Debes estar logueado.');
    try {
      const { registerPasskey } = await import('@/features/auth');
      await registerPasskey(auth.currentUser);
      alert('✅ Dispositivo vinculado exitosamente.');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-xl font-black flex items-center gap-3 text-white uppercase tracking-tight">
            <div className="p-3 bg-primary/10 rounded-xl relative">
              <Key className="text-primary relative z-10" size={24} />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            Acceso Biométrico (Passkeys)
          </h3>
          <p className="text-slate-400 text-sm mt-3 max-w-md">
            Implementa login sin contraseña (passwordless) utilizando la seguridad biométrica de tu dispositivo actual (FaceID / TouchID).
          </p>
        </div>
        
        <button
          onClick={handleRegisterPasskey}
          className="relative group px-8 py-4 bg-primary/10 text-primary border border-primary/30 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(0,174,217,0.4)] hover:-translate-y-1 flex items-center gap-3 z-10 overflow-hidden"
        >
          <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full opacity-0 group-hover:opacity-100" />
          <Smartphone size={18} /> Vincular Dispositivo
        </button>
      </div>

      <div className="min-h-[600px] relative">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/10 pointer-events-none" />
        <div className="relative z-10">
          <Suspense fallback={<div className="p-12 text-center text-slate-500 animate-pulse font-bold tracking-widest uppercase">Consultando Auditoría...</div>}>
            <AuditLogViewer />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
