import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Car } from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-cyan-300/15 bg-[rgba(6,15,24,0.82)] backdrop-blur-2xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-700 text-white shadow-lg shadow-cyan-500/25">
                            <Car size={18} strokeWidth={2.6} />
                        </div>
                        <span className="font-cinematic text-2xl tracking-[0.12em] text-white">
                            RICHARD <span className="text-cyan-300">AUTO</span>
                        </span>
                    </Link>

                    <div className="hidden items-center space-x-8 md:flex">
                        <Link to="/" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:text-cyan-200">Inventario</Link>
                        <Link to="/ai-lab" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:text-cyan-200">AI Lab</Link>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-cyan-300">
                                        <User size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold leading-none text-white">
                                            {user?.email?.split('@')[0] || 'Usuario'}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300">
                                            {user?.role || 'Cliente'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 transition-colors hover:text-rose-400"
                                    title="Cerrar Sesion"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300 hover:text-cyan-200">
                                    Ingresar
                                </Link>
                                <Link to="/login" className="rounded-lg bg-cyan-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-cyan-400">
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-200">
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="space-y-4 border-t border-cyan-300/15 bg-[#07111b] p-4 md:hidden">
                    <Link to="/" className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-200">Inventario</Link>
                    <Link to="/ai-lab" className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-200">AI Lab</Link>
                    <div className="border-t border-white/10 pt-4">
                        {isAuthenticated ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-cyan-300">
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-white">{user?.email}</span>
                                </div>
                                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-rose-400">
                                    <LogOut size={16} /> Cerrar Sesion
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/login" className="rounded-lg border border-white/10 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-200">
                                    Ingresar
                                </Link>
                                <Link to="/login" className="rounded-lg bg-cyan-500 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-white">
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
