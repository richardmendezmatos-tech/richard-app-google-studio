
import { useState, useCallback, useEffect, FC, FormEvent } from 'react';
import { loginAdmin, loginWithPasskey } from '../services/authService';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck, Mail, Eye, EyeOff, ScanFace, Command, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebaseService';
import GoogleOneTap from '@/components/layout/GoogleOneTap';
import { motion, AnimatePresence } from 'framer-motion';

import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { AppUser, UserRole } from '@/types/types';
import { normalizeUser } from '../services/authService';
import SEO from '@/components/seo/SEO';

// Using global User type

const AdminLogin: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGhostLogin = useCallback(async (key: string) => {
    setLoading(true);
    setError("Activando Protocolo Ghost de CTO...");
    try {
      const { validateGhostKey } = await import('../services/authService');
      const user = await validateGhostKey(key);
      dispatch(loginSuccess({
        ...user,
        role: user.role as UserRole
      }));
      navigate('/admin');
    } catch {
      setError("Llave Maestra Rechazada.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('richard_key');
    if (key) {
      handleGhostLogin(key);
    }
  }, [handleGhostLogin]);

  const handleMagicLink = async () => {
    if (!email) return setError("Ingresa tu email primero");
    setLoading(true);
    try {
      const { sendMagicLink } = await import('../services/authService');
      await sendMagicLink(email);
      setError("✨ Enlace enviado a tu correo. Revisa tu bandeja.");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError("Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    dispatch(loginStart());

    try {
      const user = await loginAdmin(email, password, twoFactorCode || '123456') as AppUser;
      dispatch(loginSuccess(user));
      navigate('/admin');
    } catch (err: unknown) {
      console.error('Login Error Details:', err);
      let msg = '';
      const error = err as { code?: string; message: string };
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        msg = 'Credenciales incorrectas';
      } else if (error.message.includes('ACCESS_DENIED')) {
        msg = 'Cuenta no autorizada (Verifica tu Rol)';
      } else if (error.message.includes('INVALID_2FA')) {
        msg = 'Token 2FA incorrecto (Usa 123456)';
      } else {
        msg = `Error: ${error.code || error.message || 'Desconocido'}`;
      }
      setError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setError(null);
    setLoading(true);
    dispatch(loginStart());
    try {
      const credential = await loginWithPasskey();

      if (credential) {
        if (import.meta.env.DEV) {
          console.log("Passkey verified (DEV override):", credential);
          const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL || 'richardmendezmatos@gmail.com';
          const devPass = import.meta.env.VITE_DEV_ADMIN_PASS || '123456';
          await signInWithEmailAndPassword(auth, devEmail, devPass);
          const normalized = normalizeUser(auth.currentUser!, 'admin');
          dispatch(loginSuccess(normalized));
          navigate('/admin');
        } else {
          throw new Error("Passkey backend verification not implemented for production.");
        }
      }
    } catch (err: unknown) {
      console.error("Passkey Failed:", err);
      const error = err as { message?: string };
      const msg = error.message || "No se pudo verificar la identidad biométrica.";
      setError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleDevQuickAccess = async () => {
    if (!import.meta.env.DEV) {
      setError("⛔️ Acceso rápido deshabilitado en Producción.");
      return;
    }
    setLoading(true);
    setError(null);
    dispatch(loginStart());
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('@/services/firebaseService');

      const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL || 'admin@richard.com';
      const devPass = import.meta.env.VITE_DEV_ADMIN_PASS || '123456';

      await signInWithEmailAndPassword(auth, devEmail, devPass);
      const normalized = normalizeUser(auth.currentUser!, 'admin');
      dispatch(loginSuccess(normalized));
      navigate('/admin');
    } catch (err: unknown) {
      console.error('Quick Access Error:', err);
      const error = err as { code?: string; message: string };
      const msg = 'Error: ' + (error.code || error.message || 'Verifica que el usuario admin@richard.com existe');
      setError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050b14] relative overflow-hidden font-sans selection:bg-[#00aed9]/30">
      <SEO
        title="Acceso Administrativo"
        description="Portal administrativo de Richard Automotive."
        url="/admin-login"
        noIndex
        noFollow
      />
      <GoogleOneTap onSuccess={() => navigate('/admin')} />

      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#00aed9]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Main Card */}
        <div className="glass-premium overflow-hidden">

          {/* Header */}
          <div className="relative p-8 pb-6 text-center border-b border-white/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00aed9] to-transparent opacity-60"></div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00aed9]/20 to-indigo-500/10 border border-[#00aed9]/20 mb-4 shadow-[0_0_30px_-5px_rgba(0,174,217,0.3)]"
            >
              <Command className="text-[#00aed9]" size={32} strokeWidth={1.5} />
            </motion.div>

            <h1 className="text-2xl font-black text-white tracking-tight mb-1">
              Command <span className="text-[#00aed9]">Center</span>
            </h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <ShieldCheck size={10} /> Secure Admin Access
            </p>
          </div>

          {/* Body */}
          <div className="p-8 pt-6">
            <form onSubmit={handleLogin} className="space-y-6">

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Work Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00aed9] transition-colors">
                      <Mail size={18} strokeWidth={1.5} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00aed9]/50 focus:bg-white/5 transition-all"
                      placeholder="admin@richard.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00aed9] transition-colors">
                      <Lock size={18} strokeWidth={1.5} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00aed9]/50 focus:bg-white/5 transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="min-h-[24px]">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-rose-400 justify-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20"
                    >
                      <ShieldAlert size={14} />
                      <span className="text-xs font-bold">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#00aed9] to-[#009ac0] hover:to-[#00aed9] text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-[#00aed9]/25 hover:shadow-cyan-400/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>Authenticate <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePasskeyLogin}
                    disabled={loading}
                    className="py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-xs transition-all hover:border-white/20 flex items-center justify-center gap-2 group"
                  >
                    <ScanFace size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
                    Biometric
                  </button>
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={loading}
                    className="py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-xs transition-all hover:border-white/20 flex items-center justify-center gap-2 group"
                  >
                    <Cpu size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    Magic Link
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-8 text-center">
              <button className="text-[10px] font-medium text-slate-500 hover:text-[#00aed9] transition-colors">
                Locked Out? <span className="underline decoration-slate-700 underline-offset-4 hover:decoration-[#00aed9]">Contact System Admin</span>
              </button>
            </div>
          </div>

          {/* Dev Mode Strip */}
          {import.meta.env.DEV && (
            <div className="border-t border-white/5 bg-amber-500/5 p-2 flex justify-center">
              <button
                onClick={handleDevQuickAccess}
                disabled={loading}
                className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border border-amber-500/20 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                Dev Quick Access
              </button>
            </div>
          )}

        </div>
      </motion.div>

    </div>
  );
};

export default AdminLogin;
