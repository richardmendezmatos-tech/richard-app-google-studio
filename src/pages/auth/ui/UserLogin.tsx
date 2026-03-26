import * as React from 'react';
import { useState, useActionState } from 'react';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  signInWithGoogleCredential,
  normalizeUser,
} from '@/features/auth';
import { auth, getRedirectResult } from '@/shared/api/firebase/firebaseService';
import { ArrowRight, Zap, Apple, Chrome, Globe, Mail, Lock } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/entities/session';
import SEO from '@/shared/ui/seo/SEO';
import { motion, AnimatePresence } from 'framer-motion';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsID {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => Promise<void> | void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: () => void;
}

interface GoogleGlobal {
  accounts: {
    id: GoogleAccountsID;
  };
}

interface AuthLikeError {
  code?: string;
  message?: string;
}

const UserLogin: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { setLoading: setStoreLoading, setUser, setError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // React 19: useActionState for login/signup
  const [formState, formAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const emailVal = formData.get('email') as string;
      const passwordVal = formData.get('password') as string;
      const type = formData.get('authType') as string;

      setStoreLoading(true);
      try {
        let appUser;
        if (type === 'register') {
          appUser = await signUpWithEmail(emailVal, passwordVal);
        } else {
          appUser = await signInWithEmail(emailVal, passwordVal);
        }
        setUser(appUser);
        setStoreLoading(false);
        return { error: null, success: true };
      } catch (err: any) {
        const msg = getErrorMsg(err);
        setError(msg);
        setStoreLoading(false);
        return { error: msg, success: false };
      }
    },
    { error: null, success: false },
  );

  // Handle success navigation
  React.useEffect(() => {
    if (formState.success) {
      navigate(from, { replace: true });
    }
  }, [formState.success, navigate, from]);

  // --- Google One Tap Integration ---
  React.useEffect(() => {
    if (loading || isRegistering) return;

    const initializeOneTap = () => {
      const google = (window as Window & { google?: GoogleGlobal }).google;
      if (!google) return;

      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response: GoogleCredentialResponse) => {
          setLoading(true);
          setStoreLoading(true);
          try {
            const appUser = await signInWithGoogleCredential(response.credential);
            setUser(appUser);
            navigate(from, { replace: true });
          } catch (err: unknown) {
            const msg = getErrorMsg(err);
            setLocalError(msg); // Changed setError to setLocalError
            setError(msg);
          } finally {
            setLoading(false);
            setStoreLoading(false);
          }
        },
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true,
      });

      google.accounts.id.prompt();
    };

    const timer = setTimeout(initializeOneTap, 1500);
    return () => clearTimeout(timer);
  }, [from, isRegistering, loading, navigate, setStoreLoading, setUser, setError]);

  // Handle successful redirect return
  React.useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(normalizeUser(result.user) as any);
          navigate(from, { replace: true });
        }
      } catch (err: unknown) {
        setLocalError(getErrorMsg(err)); // Changed setError to setLocalError
      }
    };
    checkRedirect();
  }, [from, navigate, setUser]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setLocalError(null); // Changed setError to setLocalError
    setStoreLoading(true);
    try {
      let user;
      if (provider === 'google') user = await signInWithGoogle();
      if (provider === 'facebook') user = await signInWithFacebook();

      if (user) {
        setUser(normalizeUser(user) as any);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = getErrorMsg(err);
      setLocalError(msg); // Changed setError to setLocalError
      setError(msg);
    } finally {
      setLoading(false);
      setStoreLoading(false);
    }
  };

  const getErrorMsg = (err: unknown) => {
    const authError = err as AuthLikeError;
    if (authError.message?.includes('ADMIN_PORTAL_ONLY')) {
      return 'Acceso no autorizado en este portal. Use el portal administrativo.';
    } else if (authError.code === 'auth/email-already-in-use') {
      return 'Este correo ya está registrado.';
    } else if (
      authError.code === 'auth/invalid-credential' ||
      authError.code === 'auth/user-not-found' ||
      authError.code === 'auth/wrong-password'
    ) {
      return 'Credenciales incorrectas.';
    } else if (authError.code === 'auth/popup-closed-by-user') {
      return 'La ventana de inicio de sesión se cerró.';
    } else {
      return `Error (${authError.code || 'unknown'}): ${authError.message || 'Intente nuevamente'}`;
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#0a1118] overflow-hidden">
      <SEO
        title="Iniciar Sesion"
        description="Portal de acceso premium de Richard Automotive."
        url="/login"
        noIndex
      />

      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a1118] to-black" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden z-10"
      >
        <div className="pt-10 pb-6 px-10 text-center relative">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400"
          >
            <Zap size={36} className="drop-shadow-lg" />
          </motion.div>

          <h2 className="text-3xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            {isRegistering ? 'Crear Perfil' : 'Bienvenido'}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">
            Richard <span className="text-cyan-500 italic">Automotive</span> Command Center
          </p>
        </div>

        <div className="px-10 pb-4 space-y-3">
          <AnimatePresence mode="wait">
            {!isRegistering && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all group"
                >
                  <Chrome size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                  <span>Continuar con Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all group"
                >
                  <Globe size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span>Continuar con Facebook</span>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0f1721] px-3 font-semibold text-slate-500 uppercase tracking-widest rounded-full border border-white/5">
                      Acceso Seguro
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form action={formAction} className="px-10 pb-10 space-y-5">
          <input type="hidden" name="authType" value={isRegistering ? 'register' : 'login'} />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@ejemplo.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {(error || formState.error) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-2xl text-[11px] font-bold flex items-center gap-3 bg-red-500/10 text-red-400 border border-red-500/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error || formState.error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isPending || loading}
            className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 p-px transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 rounded-[11px] font-bold text-white shadow-lg">
              {isPending || loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegistering ? 'Crear Cuenta Segura' : 'Acceso Autorizado'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {isRegistering
                ? '¿Ya estás registrado? Iniciar Sesión'
                : '¿Nuevo en el centro? Solicitar Acceso'}
            </button>
          </div>
        </form>

        <div className="py-6 text-center border-t border-white/10 bg-slate-900/40">
          <Link
            to="/"
            className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/60 hover:text-cyan-400 transition-all hover:tracking-[0.5em]"
          >
            Volver a la Terminal
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UserLogin;
