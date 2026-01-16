
import React, { useState } from 'react';
import { loginAdmin } from '../services/firebaseService';
import { ShieldAlert, Fingerprint, Lock, ArrowRight, ShieldCheck, Mail, Eye, EyeOff, ScanFace } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@richard.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(email, password, twoFactorCode || '123456'); // Default 2FA for ease if empty
      navigate('/admin');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas');
      } else if (err.message.includes('ACCESS_DENIED')) {
        setError('Cuenta no autorizada');
      } else {
        setError('Error de conexión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = () => {
    // Simulación de WebAuthn
    setLoading(true);
    setTimeout(() => {
      setError('Dispositivo Passkey no detectado (Simulación)');
      setLoading(false);
    }, 1500);
  };

  // DEV MODE: Quick Access (Auto-login)
  const handleDevQuickAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      // Bypass all security - use Firebase Auth directly
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../services/firebaseService');

      await signInWithEmailAndPassword(auth, 'admin@richard.com', '123456');
      navigate('/admin');
    } catch (err: any) {
      console.error('Quick Access Error:', err);
      setError('Error: ' + (err.code || err.message || 'Verifica que el usuario admin@richard.com existe'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#050b14] relative overflow-hidden font-sans">

      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00aed9]/20 rounded-full blur-[120px] pointer-events-none opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none opacity-30"></div>

      {/* Glassmorphic Card */}
      <div className="w-full max-w-[420px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[30px] shadow-2xl relative z-10 overflow-hidden">

        {/* Top Decorative Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#00aed9] to-transparent opacity-50"></div>

        {/* DEV MODE BANNER (Only in Development) */}
        {import.meta.env.DEV && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Modo Desarrollo</span>
              </div>
              <button
                onClick={handleDevQuickAccess}
                disabled={loading}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-amber-500/30 disabled:opacity-50"
              >
                Quick Access
              </button>
            </div>
          </div>
        )}

        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00aed9]/20 to-purple-500/10 border border-white/5 mb-5 shadow-lg shadow-[#00aed9]/10">
              <ShieldCheck className="text-[#00aed9]" size={28} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Command Center</h1>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Acceso Seguro Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Corporativo</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00aed9] transition-colors"><Mail size={18} /></div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00aed9]/50 focus:bg-black/40 transition-all hover:bg-black/30"
                  placeholder="admin@empresa.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00aed9] transition-colors"><Lock size={18} /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00aed9]/50 focus:bg-black/40 transition-all hover:bg-black/30"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message Container (Fixed Height to prevent layout shift) */}
            <div className="h-6 flex items-center justify-center">
              {error && (
                <div className="flex items-center gap-2 text-rose-400 animate-in fade-in slide-in-from-top-1">
                  <ShieldAlert size={12} />
                  <span className="text-xs font-bold">{error}</span>
                </div>
              )}
            </div>

            {/* Main Action Codes */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#00aed9] hover:bg-[#009ac0] text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-[#00aed9]/25 hover:shadow-cyan-400/40 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Acceder al Panel <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-600 uppercase">O usa biométricos</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <button
                type="button"
                onClick={handlePasskeyLogin}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:border-white/20 active:bg-white/15"
              >
                <ScanFace size={16} className="text-purple-400" /> Acceso con Passkey
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <a href="#" className="text-[10px] font-medium text-slate-500 hover:text-[#00aed9] transition-colors">
              ¿Problemas de acceso? <span className="underline decoration-slate-700 underline-offset-4">Contactar Soporte IT</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
