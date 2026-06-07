'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Save,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  ExternalLink,
  Key,
} from 'lucide-react';

const CARD_CLASSES =
  'relative bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 overflow-hidden hover:border-white/10 transition-all duration-500';

export default function GBPConfigPage() {
  const [config, setConfig] = useState({
    accountId: '',
    locationId: '',
    accessToken: '',
    refreshToken: '',
  });
  const [configured, setConfigured] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/gbp/config');
      if (res.ok) {
        const json = await res.json();
        setConfigured(json.configured);
        setHasToken(json.config?.hasToken || false);
        setConfig((prev) => ({
          ...prev,
          accountId: json.config?.accountId || '',
          locationId: json.config?.locationId || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load GBP config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/gbp/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: config.accountId,
          locationId: config.locationId,
          accessToken: config.accessToken || undefined,
          refreshToken: config.refreshToken || undefined,
        }),
      });
      if (res.ok) {
        setSaveMessage('Configuración guardada correctamente');
        setConfigured(true);
        if (config.accessToken) setHasToken(true);
      } else {
        setSaveMessage('Error al guardar la configuración');
      }
    } catch {
      setSaveMessage('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult('idle');
    try {
      const res = await fetch('/api/gbp/insights');
      if (res.ok) {
        const json = await res.json();
        setTestResult(json.connected ? 'success' : 'error');
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="scanline-overlay" />
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1
                className="text-lg font-black uppercase tracking-[0.25em]"
                style={{ fontFamily: 'var(--font-cinematic)' }}
              >
                Google Business <span className="text-emerald-400">Profile</span>
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase font-bold">
                Configuración de API
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                configured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {configured ? 'Conectado' : 'No configurado'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <motion.div className={CARD_CLASSES} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="font-bold text-sm">Credenciales de API</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Account ID
              </label>
              <input
                type="text"
                value={config.accountId}
                onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-white placeholder-slate-600 focus:border-emerald-500/30 focus:outline-none transition-all font-mono"
                placeholder="Ej: 1234567890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Location ID
              </label>
              <input
                type="text"
                value={config.locationId}
                onChange={(e) => setConfig({ ...config, locationId: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-white placeholder-slate-600 focus:border-emerald-500/30 focus:outline-none transition-all font-mono"
                placeholder="Ej: ChIJ..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Access Token (OAuth 2.0)
              </label>
              <input
                type="password"
                value={config.accessToken}
                onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-white placeholder-slate-600 focus:border-emerald-500/30 focus:outline-none transition-all font-mono"
                placeholder={hasToken ? '•••••••• (token existente)' : 'Pega tu access token aquí'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Refresh Token
              </label>
              <input
                type="password"
                value={config.refreshToken}
                onChange={(e) => setConfig({ ...config, refreshToken: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-white placeholder-slate-600 focus:border-emerald-500/30 focus:outline-none transition-all font-mono"
                placeholder="Refresh token (opcional, para auto-renovación)"
              />
            </div>
          </div>

          {saveMessage && (
            <div className="mt-4 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
              <p className="text-[10px] text-emerald-400 font-bold">{saveMessage}</p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Guardar Configuración
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !configured}
              className="px-6 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {testing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCcw className="w-3.5 h-3.5" />
              )}
              Probar Conexión
            </button>
          </div>

          {testResult === 'success' && (
            <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-bold">Conexión exitosa con GBP API</span>
            </div>
          )}
          {testResult === 'error' && (
            <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-[10px] text-red-400 font-bold">
                Error de conexión. Verifica tus credenciales.
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          className={CARD_CLASSES}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="font-bold text-sm">Instrucciones</h2>
          </div>
          <div className="space-y-3 text-[10px] text-slate-400 leading-relaxed">
            <p>
              1. Ve a{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
              >
                Google Cloud Console <ExternalLink className="w-3 h-3" />
              </a>{' '}
              y crea un proyecto.
            </p>
            <p>2. Habilita la API de Business Profile (mybusinessbusinessinformation.googleapis.com).</p>
            <p>3. Configura la pantalla de consentimiento OAuth y agrega el scope business.manage.</p>
            <p>4. Crea credenciales OAuth 2.0 (tipo: aplicación web).</p>
            <p>5. Usa el código de autorización para obtener un refresh token y access token.</p>
            <p>6. Copia el Account ID y Location ID desde el panel de GBP.</p>
          </div>
        </motion.div>

        <div className="hidden md:flex p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl items-center justify-center gap-3">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <p className="text-[10px] text-emerald-300 uppercase tracking-[0.2em] font-bold">
            Google Business Profile API • Richard Automotive
          </p>
        </div>
      </main>
    </div>
  );
}
