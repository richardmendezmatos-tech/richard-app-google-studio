import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuthListener'; // Assuming hook exists, or Context
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import { updateUserProfile, updateUserPassword } from '../services/authService';
import { uploadImage } from '../services/firebaseService';
import { User, Camera, Lock, Save, Loader2, ShieldCheck, Mail, Smartphone, Edit2, LogOut } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const UserProfile: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { addNotification } = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsLoading(true);
            try {
                const file = e.target.files[0];
                const url = await uploadImage(file);
                setPhotoURL(url); // Optimistic update
                await updateUserProfile(user, { photoURL: url });
                addNotification('success', 'Foto de perfil actualizada');
            } catch (error: any) {
                addNotification('error', 'Error subiendo imagen: ' + error.message);
                setPhotoURL(user.photoURL || ''); // Revert
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateUserProfile(user, { displayName });
            addNotification('success', 'Perfil actualizado correctamente');
        } catch (error: any) {
            addNotification('error', 'Error actualizando perfil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            addNotification('error', 'Las contraseñas no coinciden');
            return;
        }
        if (passwords.new.length < 6) {
            addNotification('error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);
        try {
            await updateUserPassword(user, passwords.new);
            addNotification('success', 'Contraseña actualizada. Mantén tu cuenta segura.');
            setPasswords({ new: '', confirm: '' });
        } catch (error: any) {
            addNotification('error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12 flex flex-col items-center">

            <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        Mi <span className="text-[#00aed9]">Cuenta</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona tu identidad y seguridad personal.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Identity Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-[30px] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#00aed9]/20 to-purple-500/20" />

                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-slate-800 shadow-2xl relative z-10">
                                    <img
                                        src={photoURL || 'https://ui-avatars.com/api/?name=' + (displayName || 'User') + '&background=00aed9&color=fff'}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 z-20 bg-[#00aed9] text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                                >
                                    <Camera size={18} />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{displayName || 'Usuario Sin Nombre'}</h2>
                            <p className="text-xs font-bold text-[#00aed9] uppercase tracking-widest bg-[#00aed9]/10 px-3 py-1 rounded-full mb-6">
                                {user.email?.includes('admin') ? 'Administrador' : 'Miembro Premium'}
                            </p>

                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                                    <Mail className="text-slate-400" size={20} />
                                    <div className="overflow-hidden">
                                        <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Email</div>
                                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl opacity-50 cursor-not-allowed">
                                    <Smartphone className="text-slate-400" size={20} />
                                    <div>
                                        <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Teléfono</div>
                                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No vinculado</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Settings */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Basic Info Form */}
                        <div className="bg-white dark:bg-slate-900 rounded-[30px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-[#00aed9]/10 rounded-xl text-[#00aed9]">
                                    <Edit2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Información Básica</h3>
                                    <p className="text-sm text-slate-500">Actualiza cómo te ven los demás.</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl px-5 py-4 font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-[#00aed9] outline-none transition-all"
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || displayName === user.displayName}
                                    className="h-[56px] px-8 bg-[#0d2232] text-white rounded-2xl font-bold uppercase tracking-wider hover:bg-[#00aed9] disabled:opacity-50 disabled:hover:bg-[#0d2232] transition-colors"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                </button>
                            </form>
                        </div>

                        {/* 2. Security Form */}
                        <div className="bg-white dark:bg-slate-900 rounded-[30px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Seguridad</h3>
                                    <p className="text-sm text-slate-500">Cambiar contraseña y seguridad de cuenta.</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl px-5 py-4 font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Confirmar</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl px-5 py-4 font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !passwords.new}
                                        className="h-[50px] px-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        <Lock size={18} /> {isLoading ? 'Procesando...' : 'Actualizar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
