import React, { useState, useRef } from 'react';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { useContext } from 'react';
import { updateUserProfile, updateUserPassword } from '@/features/auth/services/authService';
import { usePrivacy } from '@/features/privacy/context/PrivacyContext';

import { uploadImage } from '@/services/firebaseService';
import { Camera, Lock, Save, Loader2, ShieldCheck, Mail, Smartphone, Edit2 } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

const UserProfile: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { settings, updateSettings } = usePrivacy();
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
                await updateUserProfile(user as any, { photoURL: url });
                addNotification('success', 'Foto de perfil actualizada');
            } catch {
                addNotification('error', 'Error subiendo imagen');
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
            await updateUserProfile(user as any, { displayName });
            addNotification('success', 'Perfil actualizado correctamente');
        } catch (_error: any) {
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
            await updateUserPassword(user as any, passwords.new);
            addNotification('success', 'Contraseña actualizada. Mantén tu cuenta segura.');
            setPasswords({ new: '', confirm: '' });
        } catch {
            addNotification('error', 'Error actualizando contraseña');
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
                                    title="Cambiar Foto de Perfil"
                                    aria-label="Cambiar Foto de Perfil"
                                >
                                    <Camera size={18} />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" title="Subir imagen de perfil" />
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

                        {/* 3. Privacy & Data Form */}
                        <div className="bg-white dark:bg-slate-900 rounded-[30px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Privacidad y Datos</h3>
                                    <p className="text-sm text-slate-500">Gestiona cómo usamos tu información.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PrivacyToggleInProfile
                                        label="Analíticas"
                                        description="Mejora la experiencia con datos de uso anónimos."
                                        enabled={settings.analytics}
                                        onChange={(val) => updateSettings({ analytics: val })}
                                    />
                                    <PrivacyToggleInProfile
                                        label="Marketing"
                                        description="Recibe ofertas basadas en tus intereses."
                                        enabled={settings.marketing}
                                        onChange={(val) => updateSettings({ marketing: val })}
                                    />
                                    <PrivacyToggleInProfile
                                        label="Compartir con Socios"
                                        description="Sincronizar datos con bancos para pre-cualificación."
                                        enabled={settings.partnerSharing}
                                        onChange={(val) => updateSettings({ partnerSharing: val })}
                                    />
                                    <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800 dark:text-white">Aviso de Privacidad</p>
                                            <p className="text-[10px] text-slate-400">Ver documento legal completo.</p>
                                        </div>
                                        <button
                                            onClick={() => window.open('/privacy', '_blank')}
                                            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider"
                                        >
                                            Ver
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};


const PrivacyToggleInProfile: React.FC<{ label: string; description: string; enabled: boolean; onChange: (val: boolean) => void }> = ({ label, description, enabled, onChange }) => {
    return (
        <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-[#00aed9]/30">
            <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{description}</p>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    );
};

export default UserProfile;
