
import React, { useState } from 'react';
import { loginUserClient, registerUser, loginWithGoogle, loginWithFacebook } from '../services/firebaseService';
import { ArrowRight, Zap, Check, X, Apple, Chrome, Globe, Lock } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const UserLogin: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the path the user was trying to access before being redirected to login.
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await registerUser(email, password);
      } else {
        await loginUserClient(email, password);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
      setLoading(true);
      setError(null);
      try {
          if (provider === 'google') await loginWithGoogle();
          if (provider === 'facebook') await loginWithFacebook();
          navigate(from, { replace: true });
      } catch (err: any) {
          console.error(err);
          handleAuthError(err);
      } finally {
          setLoading(false);
      }
  };
  
  const handleAuthError = (err: any) => {
    if (err.message.includes('ADMIN_PORTAL_ONLY')) {
        setError('Acceso no autorizado en este portal. Use el portal administrativo.');
    } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas.');
    } else {
        setError('Error de autenticación. Intente nuevamente.');
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
                <button onClick={() => handleSocialLogin('google')} className="w-full social-button bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">
                    <Chrome size={20} /><span>Continuar con Google</span>
                </button>
                <button className="w-full social-button bg-black text-white hover:bg-slate-900">
                    <Apple size={20} /><span>Continuar con Apple</span>
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
