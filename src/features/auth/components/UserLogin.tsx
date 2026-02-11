
import * as React from 'react';
import { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithFacebook, signInWithGoogleCredential } from '../services/authService';
import { auth, getRedirectResult } from '@/services/firebaseService';
import { ArrowRight, Zap, Apple, Chrome, Globe } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';

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
    // Only show One Tap if not already loading and not on mobile (popups often fail)
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
            const user = await signInWithGoogleCredential(response.credential);
            dispatch(loginSuccess(user));
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

    // Wait for script to load
    const timer = setTimeout(initializeOneTap, 1500);
    return () => clearTimeout(timer);
  }, [dispatch, from, isRegistering, loading, navigate]);

  // Handle successful redirect return
  React.useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          dispatch(loginSuccess(result.user));
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
      let user;
      if (isRegistering) {
        user = await signUpWithEmail(email, password);
      } else {
        user = await signInWithEmail(email, password);
      }
      dispatch(loginSuccess(user));
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error(err);
      const msg = getErrorMsg(err);
      setError(msg); // Keep local for now
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
        dispatch(loginSuccess(user));
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = getErrorMsg(err);
      setError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMsg = (err: unknown) => {
    const authError = err as AuthLikeError;
    console.error("Auth Debug Details:", err); // Critical for remote debugging
    if (authError.message?.includes('ADMIN_PORTAL_ONLY')) {
      return 'Acceso no autorizado en este portal. Use el portal administrativo.';
    } else if (authError.code === 'auth/email-already-in-use') {
      return 'Este correo ya está registrado.';
    } else if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
      return 'Credenciales incorrectas.';
    } else if (authError.code === 'auth/popup-closed-by-user') {
      return 'La ventana de inicio de sesión se cerró antes de completar.';
    } else if (authError.code === 'auth/cancelled-popup-request') {
      return 'Solicitud de inicio de sesión cancelada.';
    } else if (authError.message?.includes('projectconfigservice.getprojectconfig-are-blocked')) {
      return 'ERROR CRÍTICO: La API de Autenticación está bloqueada en Google Cloud Console. Por favor, habilite el "Identity Toolkit API" para su API Key.';
    } else {
      return `Error (${authError.code || 'unknown'}): ${authError.message || 'Intente nuevamente'}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00aed9]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full max-w-[480px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700 rounded-[40px] shadow-2xl overflow-hidden">
        <div className="pt-12 pb-8 px-10 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg bg-[#00aed9]/10 text-[#00aed9]">
            <Zap size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 text-slate-800 dark:text-white">
            {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Gestiona tu garaje digital y recibe ofertas personalizadas.
          </p>
        </div>

        {!isRegistering && (
          <div className="px-10 pb-6 space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full social-button bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:shadow-lg hover:shadow-cyan-500/10 transition-all active:scale-95"
            >
              <Chrome size={20} className="text-[#4285F4]" />
              <span className="font-bold">Continuar con Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin('facebook')}
              className="w-full social-button bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-lg shadow-[#1877F2]/20 transition-all active:scale-95"
            >
              <Globe size={20} />
              <span className="font-bold">Continuar con Facebook</span>
            </button>

            <button className="w-full social-button bg-black text-white hover:bg-slate-900 transition-all active:scale-95">
              <Apple size={20} />
              <span className="font-bold">Continuar con Apple</span>
            </button>

            <div className="divider">O usa tu email</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-4">
          <div className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="correo@ejemplo.com" className="form-input" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Contraseña" className="form-input" />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" disabled={loading} className="w-full primary-button">
            {loading ? <div className="loader" /> : <>{isRegistering ? 'Registrar' : 'Ingresar'} <ArrowRight size={18} /></>}
          </button>

          <div className="text-center mt-4">
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="toggle-button">
              {isRegistering ? '¿Ya tienes cuenta? Entrar' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
        <div className="py-4 text-center border-t bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            Volver a la Tienda
          </Link>
        </div>
      </div>
      <style>{`
        .social-button { padding: 1rem; border-radius: 1rem; font-weight: bold; font-size: 0.875rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
        .divider { position: relative; display: flex; padding: 1rem 0; align-items: center; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: bold; }
        .divider::before, .divider::after { content: ''; flex-grow: 1; border-top: 1px solid #e2e8f0; } .dark .divider::before, .dark .divider::after { border-color: #334155; }
        .divider::before { margin-right: 1rem; } .divider::after { margin-left: 1rem; }
        .form-input { width: 100%; padding: 1rem; border-radius: 1rem; font-weight: bold; outline: none; transition: all 0.2s; border: 2px solid transparent; background-color: #f1f5f9; }
        .dark .form-input { background-color: rgba(30, 41, 59, 0.5); color: white; }
        .form-input:focus { background-color: white; border-color: rgba(0, 174, 217, 0.3); } .dark .form-input:focus { background-color: #1e293b; }
        .error-box { padding: 1rem; border-radius: 0.75rem; font-size: 0.75rem; font-weight: bold; display: flex; align-items: center; gap: 0.75rem; background-color: #fff1f2; color: #f43f5e; border: 1px solid #fecdd3; }
        .primary-button { width: 100%; padding: 1.25rem; border-radius: 1rem; font-weight: 900; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.2em; box-shadow: 0 10px 15px -3px rgba(0, 174, 217, 0.3), 0 4px 6px -4px rgba(0, 174, 217, 0.3); transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.75rem; background: linear-gradient(135deg, #00aed9 0%, #007fa1 100%); color: white; }
        .primary-button:active { transform: scale(0.95); } .primary-button:disabled { opacity: 0.7; cursor: wait; }
        .loader { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
        .toggle-button { color: #94a3b8; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; transition: color 0.2s; } .toggle-button:hover { color: #00aed9; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default UserLogin;
