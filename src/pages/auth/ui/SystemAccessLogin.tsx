import { useState, useCallback, useEffect, FC, useActionState } from 'react';
import { loginAdmin, loginWithPasskey } from '@/features/auth';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  ShieldCheck,
  Mail,
  Eye,
  EyeOff,
  ScanFace,
  Command,
  Cpu,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/shared/api/firebase/firebaseService';
import GoogleOneTap from '@/shared/ui/components/GoogleOneTap';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '@/entities/session';
import { AppUser, UserRole } from '@/entities/shared';
import { normalizeUser } from '@/features/auth';
import SEO from '@/shared/ui/seo/SEO';

// Using global User type

const SystemAccessLogin: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const navigate = useNavigate();
  const { setLoading, setUser, setError } = useAuthStore();

  // React 19: useActionState for main login form
  const [formState, formAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const emailVal = formData.get('email') as string;
      const passwordVal = formData.get('password') as string;

      setLoading(true);
      try {
        const profile = await loginAdmin(emailVal, passwordVal);
        setUser({
          ...profile,
          role: profile.role as UserRole,
        });
        setLoading(false);
        return { error: null, success: true };
      } catch (err: any) {
        const msg = err.message || 'Error de autenticación';
        setError(msg);
        setLoading(false);
        return { error: msg, success: false };
      }
    },
    { error: null, success: false },
  );

  // Handle success navigation
  useEffect(() => {
    if (formState.success) {
      navigate('/admin');
    }
  }, [formState.success, navigate]);

  const handleGhostLogin = useCallback(
    async (key: string) => {
      setIsLocalLoading(true);
      setLocalError('Activando Protocolo Ghost de CTO...');
      try {
        const { validateGhostKey } = await import('@/features/auth');
        const user = await validateGhostKey(key);
        setUser({
          ...user,
          photoURL: null,
          role: user.role as UserRole,
        });
        setLoading(false);
        navigate('/admin');
      } catch {
        setLocalError('Llave Maestra Rechazada.');
        setError('Llave Maestra Rechazada.');
        setLoading(false);
      } finally {
        setIsLocalLoading(false);
      }
    },
    [navigate, setUser, setLoading, setError],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('richard_key');
    // Ghost Protocol: Auto-access via richard_key (DEV only)
    if (key && import.meta.env.DEV) {
      handleGhostLogin(key);
    }
  }, [handleGhostLogin]);

  const handleMagicLink = async () => {
    if (!email) return setLocalError('Ingresa tu email primero');
    setIsLocalLoading(true);
    try {
      const { sendMagicLink } = await import('@/features/auth');
      await sendMagicLink(email);
      setLocalError('✨ Enlace enviado a tu correo. Revisa tu bandeja.');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setLocalError('Error: ' + errorMsg);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLocalError(null);
    setIsLocalLoading(true);
    setLoading(true);
    try {
      const result = await loginWithPasskey();

      if (result) {
        // MOAT: Secure Device Correlation Success
        if (import.meta.env.DEV) {
          console.log('Passkey verified (DEV override):', result.credential);
          const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL || 'richardmendezmatos@gmail.com';
          const devPass = import.meta.env.VITE_DEV_ADMIN_PASS || '123456';
          await signInWithEmailAndPassword(auth, devEmail, devPass);
        } else {
          const profile = await loginAdmin(result.email, 'PASSKEY_SECURED_SESSION');
          setUser({
            ...profile,
            role: profile.role as UserRole,
          });
          setLoading(false);
          navigate('/admin');
          return;
        }

        const normalized = normalizeUser(auth.currentUser!, 'admin');
        setUser({
          ...normalized,
          role: normalized.role as UserRole,
        });
        setLoading(false);
        navigate('/admin');
      }
    } catch (err: unknown) {
      console.error('Passkey Failed:', err);
      const error = err as { message?: string };
      const msg = error.message || 'No se pudo verificar la identidad biométrica.';
      setLocalError(msg);
      setError(msg);
      setLoading(false);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleDevQuickAccess = async () => {
    if (!import.meta.env.DEV) {
      setLocalError('⛔️ Acceso rápido deshabilitado en Producción.');
      return;
    }
    setIsLocalLoading(true);
    setLocalError(null);
    setLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('@/shared/api/firebase/firebaseService');

      const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL || 'admin@richard.com';
      const devPass = import.meta.env.VITE_DEV_ADMIN_PASS || '123456';

      await signInWithEmailAndPassword(auth, devEmail, devPass);
      const normalized = normalizeUser(auth.currentUser!, 'admin');
      setUser({
        ...normalized,
        role: normalized.role as UserRole,
      });
      setLoading(false);
      navigate('/admin');
    } catch (err: unknown) {
      console.error('Quick Access Error:', err);
      const error = err as { code?: string; message: string };
      const msg =
        'Error: ' +
        (error.code || error.message || 'Verifica que el usuario admin@richard.com existe');
      setLocalError(msg);
      setError(msg);
      setLoading(false);
    } finally {
      setIsLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050b14] relative overflow-hidden font-sans selection:bg-primary/30">
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
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Main Card */}
        <div className="glass-premium overflow-hidden">
          {/* Header */}
          <div className="relative p-8 pb-6 text-center border-b border-white/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/10 border border-primary/20 mb-4 shadow-[0_0_30px_-5px_rgba(0,174,217,0.3)]"
            >
              <Command className="text-primary" size={32} strokeWidth={1.5} />
            </motion.div>

            <h1 className="text-2xl font-black text-white tracking-tight mb-1">
              Command <span className="text-primary">Center</span>
            </h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <ShieldCheck size={10} /> Secure Admin Access
            </p>
          </div>

          {/* Body */}
          <div className="p-8 pt-6">
            <form action={formAction} className="space-y-6">
              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Work Email
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                      <Mail size={18} strokeWidth={1.5} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all"
                      placeholder="admin@richard.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                      <Lock size={18} strokeWidth={1.5} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff size={18} strokeWidth={1.5} />
                      ) : (
                        <Eye size={18} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="min-h-[24px]">
                <AnimatePresence mode="wait">
                  {(error || formState.error) && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-rose-400 justify-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20"
                    >
                      <ShieldAlert size={14} />
                      <span className="text-xs font-bold">{error || formState.error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isPending || isLocalLoading}
                  className="w-full py-4 bg-gradient-to-r from-primary to-[#009ac0] hover:to-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/25 hover:shadow-cyan-400/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Authenticate{' '}
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePasskeyLogin}
                    disabled={isPending || isLocalLoading}
                    className="py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-xs transition-all hover:border-white/20 flex items-center justify-center gap-2 group"
                  >
                    <ScanFace
                      size={16}
                      className="text-purple-400 group-hover:scale-110 transition-transform"
                    />
                    Biometric
                  </button>
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={isPending || isLocalLoading}
                    className="py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-xs transition-all hover:border-white/20 flex items-center justify-center gap-2 group"
                  >
                    <Cpu
                      size={16}
                      className="text-emerald-400 group-hover:scale-110 transition-transform"
                    />
                    Magic Link
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-8 text-center">
              <button className="text-[10px] font-medium text-slate-500 hover:text-primary transition-colors">
                Locked Out?{' '}
                <span className="underline decoration-slate-700 underline-offset-4 hover:decoration-primary">
                  Contact System Admin
                </span>
              </button>
            </div>
          </div>

          {/* Dev Mode Strip */}
          {import.meta.env.DEV && (
            <div className="border-t border-white/5 bg-amber-500/5 p-2 flex justify-center">
              <button
                onClick={handleDevQuickAccess}
                disabled={isPending || isLocalLoading}
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

export default SystemAccessLogin;
