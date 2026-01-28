import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Car, Shield } from 'lucide-react';

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
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#00aed9] to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                            <Car size={18} strokeWidth={3} />
                        </div>
                        <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                            RICHARD<span className="text-[#00aed9]">AUTO</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#00aed9] transition-colors">Inventario</Link>
                        <Link to="/ai-lab" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#00aed9] transition-colors">AI Lab</Link>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#00aed9]">
                                        <User size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                                            {user?.email?.split('@')[0] || 'Usuario'}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-500 uppercase">
                                            {user?.role || 'Cliente'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#00aed9]">
                                    Ingresar
                                </Link>
                                <Link to="/login" className="px-4 py-2 bg-[#00aed9] hover:bg-[#009ac0] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-cyan-500/20">
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-slate-600 dark:text-slate-300"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 space-y-4">
                    <Link to="/" className="block text-sm font-bold text-slate-600 dark:text-slate-300">Inventario</Link>
                    <Link to="/ai-lab" className="block text-sm font-bold text-slate-600 dark:text-slate-300">AI Lab</Link>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                        {isAuthenticated ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#00aed9]">
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-bold dark:text-white">{user?.email}</span>
                                </div>
                                <button onClick={handleLogout} className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                                    <LogOut size={16} /> Cerrar Sesión
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/login" className="text-center py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-600 dark:text-slate-300">
                                    Ingresar
                                </Link>
                                <Link to="/login" className="text-center py-2 bg-[#00aed9] text-white rounded-lg font-bold">
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
