
import React, { useState } from 'react';
import { loginAdmin } from '../services/firebaseService';
import { ShieldAlert, Fingerprint, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@richard.com');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (twoFactorCode.length < 6) {
      setError("El Token de Seguridad 2FA es requerido.");
      return;
    }

    setLoading(true);
    try {
      await loginAdmin(email, password, twoFactorCode);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas.');
      } else if (err.message.includes('INVALID_2FA')) {
        setError('Token de seguridad inválido.');
      } else if (err.message.includes('ACCESS_DENIED')) {
        setError('Acceso denegado. Esta cuenta no es de administrador.');
      } else {
        setError('Error de autenticación. Contacte a soporte.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl shadow-black/30 p-10 relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 border-2 border-red-500/30 bg-red-500/10 text-red-500">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Admin Portal</h2>
          <p className="text-sm text-slate-500 mt-2">Acceso restringido a personal autorizado.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input icon={<ShieldCheck size={18} />} type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="Email de Staff" required />
          <Input icon={<Lock size={18} />} type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="Contraseña" required />
          <Input icon={<Fingerprint size={18} />} type="text" value={twoFactorCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Token de Seguridad 2FA" required />

          {error && <div className="p-3 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 border border-slate-600 rounded-lg font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
            {loading ? <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" /> : <>Verificar Acceso <ArrowRight size={16} /></>}
          </button>
        </form>
        <div className="text-center mt-8">
          <a href="/#/" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400">
            Volver a la Tienda
          </a>
        </div>
      </div>
      <style>{`.bg-grid-slate-800 { background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px); background-size: 2rem 2rem; background-color: #1e293b; opacity: 0.1; }`}</style>
    </div>
  );
};

const Input = ({ icon, ...props }: any) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>
    <input {...props} className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all" />
  </div>
);

export default AdminLogin;
