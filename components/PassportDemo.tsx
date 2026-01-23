import React, { useState } from 'react';
import { Shield, Lock, User, LogOut, Key } from 'lucide-react';

const PassportDemo: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('richard2026');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Note: Adjust the URL to your local/cloud function endpoint
    const API_URL = import.meta.env.DEV
        ? 'http://localhost:5001/richard-automotive/us-central1/authApi'
        : '/authApi';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await resp.json();
            if (resp.ok) {
                setUser(data.user);
            } else {
                setError(data.message || 'Error de autenticación');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor de Passport.');
        } finally {
            setLoading(false);
        }
    };

    const checkProfile = async () => {
        setLoading(true);
        try {
            const resp = await fetch(`${API_URL}/profile`, {
                headers: { 'Credentials': 'include' } // Essential for sessions
            });
            const data = await resp.json();
            if (resp.ok) setUser(data);
            else setUser(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/logout`);
            setUser(null);
            setEmail('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="glass-premium p-8 border border-white/10 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[80px] group-hover:bg-amber-500/20 transition-all duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Shield className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Passport.js <span className="text-amber-400">Node</span></h2>
                        <p className="text-[10px] text-amber-400/60 font-black uppercase tracking-widest">Express Auth Layer</p>
                    </div>
                </div>

                {user ? (
                    <div className="space-y-4 animate-in zoom-in duration-500">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase">Authenticated User</p>
                                    <p className="text-white font-bold">{user.email}</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">
                                Esta sesión está siendo manejada por Passport.js en Node, independiente de Firebase Auth.
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} /> Cerrar Sesión Node
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="email"
                                placeholder="Email (ej. admin@richard.com)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600 text-sm"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600 text-sm"
                                required
                            />
                        </div>

                        {error && <p className="text-xs font-bold text-red-500 uppercase px-2">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                        >
                            <Key size={16} /> {loading ? 'Validando...' : 'Login con Passport'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PassportDemo;
