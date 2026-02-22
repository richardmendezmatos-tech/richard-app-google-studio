
import * as React from 'react';
import { useState } from 'react';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithFacebook, signInWithGoogleCredential, normalizeUser } from '../services/authService';
import { auth, getRedirectResult } from '@/services/firebaseService';
import { ArrowRight, Zap, Apple, Chrome, Globe, Mail, Lock } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import SEO from '@/components/seo/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginView.css';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsID {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => Promise<void>;
    cancel_on_tap_outside?: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

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
          dispatch(loginStart());
          try {
            const appUser = await signInWithGoogleCredential(response.credential);
            dispatch(loginSuccess(appUser));
            navigate(from, { replace: true });
          } catch (err: unknown) {
            const msg = getErrorMsg(err);
            setError(msg);
            dispatch(loginFailure(msg));
          } finally {
            setLoading(false);
          }
        },
        cancel_on_tap_outside: false
      });

      google.accounts.id.prompt();
    };

    const timer = setTimeout(initializeOneTap, 1500);
    return () => clearTimeout(timer);
  }, [dispatch, from, isRegistering, loading, navigate]);

  // Handle successful redirect return
  React.useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          dispatch(loginSuccess(normalizeUser(result.user) as any));
          navigate(from, { replace: true });
        }
      } catch (err: unknown) {
        setError(getErrorMsg(err));
      }
    };
    checkRedirect();
  }, [dispatch, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    dispatch(loginStart());

    try {
      const appUser = isRegistering
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      dispatch(loginSuccess(appUser));
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = getErrorMsg(err);
      setError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError(null);
    dispatch(loginStart());
    try {
      let user;
      if (provider === 'google') user = await signInWithGoogle();
      if (provider === 'facebook') user = await signInWithFacebook();

      if (user) {
        dispatch(loginSuccess(normalizeUser(user) as any));
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = getErrorMsg(err);
      setError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMsg = (err: unknown) => {
    const authError = err as AuthLikeError;
    if (authError.message?.includes('ADMIN_PORTAL_ONLY')) {
      return 'Acceso no autorizado en este portal. Use el portal administrativo.';
    } else if (authError.code === 'auth/email-already-in-use') {
      return 'Este correo ya está registrado.';
    } else if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
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

      {/* Neural Background Elements */}
      <div className="neural-glow-bg" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[460px] glass-login-card rounded-[48px] overflow-hidden"
      >
        <div className="pt-12 pb-6 px-10 text-center relative">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
          >
            <Zap size={40} className="drop-shadow-lg" />
          </motion.div>

          <h2 className="text-4xl font-black tracking-tighter uppercase mb-3 text-gradient-premium">
            {isRegistering ? 'Crear Perfil' : 'Bienvenido'}
          </h2>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-8">
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
                  onClick={() => handleSocialLogin('google')}
                  className="social-btn-premium google-btn-premium"
                >
                  <Chrome size={20} className="text-[#4285F4]" />
                  <span>Continuar con Google</span>
                </button>

                <button
                  onClick={() => handleSocialLogin('facebook')}
                  className="social-btn-premium bg-[#1877F2] text-white border-transparent hover:bg-[#166fe5]"
                >
                  <Globe size={20} />
                  <span>Continuar con Facebook</span>
                </button>

                <div className="auth-divider">Neural Auth Gateway</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="CORREO ELECTRÓNICO"
                className="input-premium pl-12"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-premium pl-12"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-2xl text-[11px] font-bold flex items-center gap-3 bg-red-500/10 text-red-400 border border-red-500/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading} className="primary-btn-premium group">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="relative z-10">{isRegistering ? 'Inicializar Registro' : 'Acceder al Sistema'}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {isRegistering ? '¿Ya estás registrado? Iniciar Sesión' : '¿Nuevo en el centro? Solicitar Acceso'}
            </button>
          </div>
        </form>

        <div className="py-6 text-center border-t border-white/10 bg-slate-900/40">
          <Link to="/" className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/60 hover:text-cyan-400 transition-all hover:tracking-[0.5em]">
            Volver a la Terminal
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UserLogin;
