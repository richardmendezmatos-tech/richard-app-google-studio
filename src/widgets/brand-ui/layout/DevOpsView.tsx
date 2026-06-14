'use client';

import React, { useState } from 'react';
import { generateText } from '@/shared/api/ai/client';
import { Terminal, Copy, Check, Zap, AlertCircle, Wrench } from 'lucide-react';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';

const DevOpsView: React.FC = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState('');
  const [copied, setCopied] = useState(false);
  const { addNotification } = useNotification();

  const handleGeneratePush = async () => {
    if (!description.trim() || loading) return;

    setLoading(true);
    const prompt = `Actúa como un Senior DevOps Engineer. Genera un comando de terminal único para Git que realice:
    1. git add .
    2. git commit con un mensaje semántico basado en esta descripción: "${description}"
    3. git push origin main
    
    Devuelve SOLO el comando de terminal en una sola línea. Ejemplo: git add . && git commit -m "feat: add login flow" && git push origin main`;

    try {
      const response = await generateText(
        prompt,
        'Eres un experto en Git y automatización. Solo respondes con comandos de terminal válidos.',
      );
      setCommand(response.trim().replace(/`/g, ''));
      addNotification('success', '¡Comando generado con éxito!');
    } catch {
      addNotification('error', 'Error al generar el comando.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addNotification('info', 'Copiado al portapapeles.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 lg:p-12 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white flex items-center justify-center gap-3 uppercase tracking-tighter">
          <svg className="text-primary" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> DevOps Architect
        </h2>
        <p className="text-slate-400 font-medium">
          Automatiza tus despliegues a GitHub con mensajes inteligentes.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[35px] p-8 shadow-2xl space-y-6">
        <div className="space-y-4">
          <label
            htmlFor="devops-description"
            className="text-xs font-black text-primary uppercase tracking-widest block ml-2"
          >
            ¿Qué cambios realizaste?
          </label>
          <textarea
            id="devops-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Agregué el .gitignore y configuré el PWA..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-100 focus:ring-2 focus:ring-primary outline-none min-h-[120px] resize-none font-medium"
          />
        </div>

        <button
          onClick={handleGeneratePush}
          disabled={loading || !description.trim()}
          className="w-full py-5 bg-linear-to-r from-primary to-blue-600 hover:scale-[1.01] active:scale-95 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Zap size={20} /> Generar Comando Auto-Push
            </>
          )}
        </button>
      </div>

      {command && (
        <div className="bg-black rounded-4xl p-8 border border-slate-800 shadow-inner animate-in zoom-in">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
              <Terminal size={14} /> ready_to_execute.sh
            </div>
            <button
              onClick={() => copyToClipboard(command)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
            </button>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-xl font-mono text-primary break-all border border-slate-800/50 relative group overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {command}
          </div>
        </div>
      )}

      {/* Git Doctor / Troubleshooting */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-[35px] p-8 space-y-6">
        <div className="flex items-center gap-3 text-amber-500">
          <Wrench size={24} />
          <h3 className="font-black uppercase tracking-widest text-sm">
            Git Doctor: Solución de Problemas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-white font-bold text-xs uppercase mb-2">
              1. Si Git está bloqueado
            </h4>
            <p className="text-[10px] text-slate-500 mb-3">
              Elimina el archivo de bloqueo si el stage no responde:
            </p>
            <code className="block bg-black p-3 rounded-lg text-rose-400 text-[10px] font-mono mb-2">
              rm -f .git/index.lock
            </code>
            <button
              onClick={() => copyToClipboard('rm -f .git/index.lock')}
              className="text-[10px] text-primary font-bold hover:underline"
            >
              Copiar Comando
            </button>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-white font-bold text-xs uppercase mb-2">2. Si es tu primer Push</h4>
            <p className="text-[10px] text-slate-500 mb-3">
              Ejecuta esto para vincular tu repo local con GitHub:
            </p>
            <code className="block bg-black p-3 rounded-lg text-cyan-400 text-[10px] font-mono mb-2">
              git init && git remote add origin TU_URL_REPO
            </code>
            <button
              onClick={() => copyToClipboard('git init && git remote add origin ')}
              className="text-[10px] text-primary font-bold hover:underline"
            >
              Copiar Base
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <AlertCircle size={18} className="text-blue-400 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            <strong className="text-blue-400">IMPORTANTE:</strong> He agregado un archivo{' '}
            <code className="text-white">.gitignore</code>. Esto evitará que Git intente subir la
            carpeta <code className="text-white">node_modules</code>, que es la causa principal de
            que el sistema se congele al intentar dar a "Stage".
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevOpsView;
