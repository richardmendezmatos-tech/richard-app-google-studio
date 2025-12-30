
import React, { useState, useEffect, useRef } from 'react';
import { generateCode } from '../services/geminiService';
import hljs from 'highlight.js';

// Un conversor simple de Markdown a HTML para renderizar la respuesta de la IA.
// Nota: Para un entorno de producción, una librería como 'marked' o 'DOMPurify' sería más robusta.
const simpleMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  return markdown
    // Bloques de código (con sanitización básica)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => 
      `<pre><code class="language-${lang || 'plaintext'}">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    )
    // Encabezados
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Negrita
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Itálica
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Listas (manejo simple para elementos consecutivos)
    .replace(/^\s*-\s(.*$)/gim, '<li>$1</li>')
    .replace(/<\/li>\s*<li>/g, '</li><li>') // Corrige saltos entre LIs con regex más flexible
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    // Reemplazar saltos de línea por <br>, excepto dentro de <pre>
    .split('\n').map(line => {
      // Evitar romper estructura si la línea empieza con tag HTML generado
      if (line.trim().startsWith('<') || line.trim().length === 0) return line;
      return line + '<br />';
    }).join('\n')
    // Limpieza final de <br> dentro de bloques pre/code y listas
    .replace(/<pre>((.|\n)*?)<\/pre>/g, (match) => match.replace(/<br \/>/g, ''))
    .replace(/<br \/>\s*<ul>/g, '<ul>')
    .replace(/<\/ul>\s*<br \/>/g, '</ul>');
};


const CodeLab: React.FC = () => {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Efecto para aplicar resaltado de sintaxis cuando el contenido cambia
  useEffect(() => {
    if (contentRef.current) {
        contentRef.current.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }
  }, [analysis]);

  const handleAnalyze = async (mode: 'optimize' | 'debug' | 'explain') => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setAnalysis('');

    const prompt = `Mode: ${mode.toUpperCase()}\n\nPlease process the following code:\n\n\`\`\`\n${code}\n\`\`\``;
    const instruction = `You are a world-class senior software engineer. Based on the mode provided, analyze the code. If optimizing, provide the improved version and explain why. If debugging, find issues. If explaining, break down the logic step-by-step. Format your response in Markdown with code blocks using correct language tags.`;

    const result = await generateCode(prompt, instruction);
    setAnalysis(simpleMarkdownToHtml(result));
    setLoading(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6 h-full min-h-0">
      <div className="flex-1 flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">Editor</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => handleAnalyze('explain')}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200"
            >
              Explicar
            </button>
            <button 
              onClick={() => handleAnalyze('debug')}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold"
            >
              Depurar
            </button>
            <button 
              onClick={() => handleAnalyze('optimize')}
              className="px-3 py-1.5 bg-[#00aed9] hover:bg-cyan-500 rounded-lg text-xs font-semibold text-white shadow-lg"
            >
              Optimizar
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Pega tu código aquí para analizarlo..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-sm text-cyan-300 focus:ring-2 focus:ring-[#00aed9] outline-none resize-none shadow-inner"
        />
      </div>

      <div className="flex-1 flex flex-col min-h-[400px]">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Análisis</h2>
        <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-xl p-6 overflow-y-auto backdrop-blur-sm relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px] rounded-xl z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-xs font-medium text-cyan-400">Procesando lógica...</span>
              </div>
            </div>
          )}
          {!analysis && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4">
              <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-sm">Selecciona un modo de análisis para comenzar.</p>
            </div>
          ) : (
            <div 
              ref={contentRef}
              className="prose prose-invert prose-sm max-w-none prose-pre:bg-[#282c34] prose-pre:border prose-pre:border-slate-700 prose-pre:p-0"
              dangerouslySetInnerHTML={{ __html: analysis }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeLab;
