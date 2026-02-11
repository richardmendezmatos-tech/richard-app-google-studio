import React from 'react';

interface SandboxEnvironmentProps {
    files?: Record<string, string>;
    template?: "vite-react" | "react";
}

const SandboxEnvironment: React.FC<SandboxEnvironmentProps> = ({
    files = {},
    template = "vite-react"
}) => {
    const sandboxFiles = React.useMemo<Record<string, string>>(() => ({
        "App.tsx": `import React, { useState, useEffect } from "react";

const useVehicleTelemetry = () => {
    const [data, setData] = useState({ rpm: 900, temp: 88, battery: 100, boost: 12 });
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => ({
                rpm: Math.max(700, Math.min(7800, prev.rpm + (Math.random() - 0.5) * 420)),
                temp: Math.max(78, Math.min(118, prev.temp + (Math.random() - 0.5) * 1.8)),
                battery: Math.max(0, prev.battery - 0.03),
                boost: Math.max(0, Math.min(28, prev.boost + (Math.random() - 0.5) * 2.4))
            }));
        }, 900);
        return () => clearInterval(interval);
    }, []);
    return data;
};

const Gauge = ({ value, max, color, label, unit }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl">
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <span>{label}</span>
        <span style={{ color }}>{value.toFixed(0)} {unit}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + "%", background: color }} />
      </div>
    </div>
  );
};

export default function App() {
  const telemetry = useVehicleTelemetry();
  const health = Math.max(0, 100 - (telemetry.temp - 80) * 1.4 - (100 - telemetry.battery) * 0.6);
  return (
    <div className="h-screen w-full bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="relative z-10 grid h-full grid-cols-1 gap-5 p-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-6 backdrop-blur-xl">
          <h1 className="text-2xl font-black uppercase tracking-tight">Digital Twin Lite</h1>
          <p className="mt-1 text-xs font-mono text-slate-400">CONNECTED: EDGE_NODE_PR_01</p>
          <div className="mt-8 space-y-4">
            <Gauge value={telemetry.rpm} max={8000} color="#06b6d4" label="Engine RPM" unit="rpm" />
            <Gauge value={telemetry.temp} max={130} color={telemetry.temp > 105 ? "#ef4444" : "#22c55e"} label="Core Temp" unit="C" />
            <Gauge value={telemetry.boost} max={30} color="#f59e0b" label="Turbo Boost" unit="psi" />
            <Gauge value={telemetry.battery} max={100} color="#60a5fa" label="Battery" unit="%" />
          </div>
        </div>
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/45 p-6 backdrop-blur-xl">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">Health Matrix</div>
          <div className="mb-6 text-5xl font-black tracking-tighter text-cyan-200">{health.toFixed(1)}%</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-slate-500">Combustion</div>
              <div className="mt-1 font-mono text-emerald-400">{(telemetry.rpm / 80).toFixed(1)}%</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-slate-500">Thermal Load</div>
              <div className="mt-1 font-mono text-amber-400">{(telemetry.temp / 1.2).toFixed(1)}%</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-slate-500">Power Reserve</div>
              <div className="mt-1 font-mono text-sky-400">{telemetry.battery.toFixed(1)}%</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-slate-500">Boost Pressure</div>
              <div className="mt-1 font-mono text-orange-400">{telemetry.boost.toFixed(1)} psi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
        ...files
    }), [files]);

    const [activeFile, setActiveFile] = React.useState<string>(Object.keys(sandboxFiles)[0] || "App.tsx");
    const [code, setCode] = React.useState<string>(sandboxFiles[activeFile] || "");

    React.useEffect(() => {
        setCode(sandboxFiles[activeFile] || "");
    }, [activeFile, sandboxFiles]);

    const safeCode = React.useMemo(() => code.replace(/<\/script/gi, '<\\/script'), [code]);

    const srcDoc = React.useMemo(() => {
        const reactSandbox = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      html,body,#root{height:100%;margin:0}
      body{background:#020617;color:#e2e8f0;font-family:ui-sans-serif,system-ui}
      #error{position:fixed;right:8px;bottom:8px;max-width:60ch;background:#7f1d1d;color:#fecaca;padding:8px;border-radius:8px;font-size:12px;display:none}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <pre id="error"></pre>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel" data-type="module">
      try {
        ${safeCode}
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
      } catch (e) {
        const err = document.getElementById('error');
        err.style.display = 'block';
        err.textContent = e && e.message ? e.message : String(e);
      }
    </script>
  </body>
</html>`;

        const vanillaSandbox = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>body{margin:0;background:#020617;color:#e2e8f0;font-family:ui-sans-serif,system-ui;padding:16px}</style>
  </head>
  <body>
    <script>
      try {
        ${safeCode}
      } catch (e) {
        document.body.innerHTML = '<pre style="color:#fecaca">' + (e && e.message ? e.message : String(e)) + '</pre>';
      }
    </script>
  </body>
</html>`;

        return template === "react" || template === "vite-react" ? reactSandbox : vanillaSandbox;
    }, [safeCode, template]);

    return (
        <div className="w-full h-[600px] border border-white/10 rounded-xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">
            <div className="h-full flex flex-col bg-[#040810] border-r border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                    <div className="flex gap-2">
                        {Object.keys(sandboxFiles).map((fileName) => (
                            <button
                                key={fileName}
                                onClick={() => setActiveFile(fileName)}
                                className={`px-3 py-1 rounded-md text-[11px] font-bold ${activeFile === fileName ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/20' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                {fileName}
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Light Sandbox</span>
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-full w-full resize-none bg-[#040810] p-4 font-mono text-[12px] text-slate-200 outline-none"
                    spellCheck={false}
                />
            </div>
            <div className="h-full bg-black">
                <iframe
                    title="live-sandbox-preview"
                    sandbox="allow-scripts allow-same-origin"
                    className="h-full w-full border-0"
                    srcDoc={srcDoc}
                />
            </div>
        </div>
    );
};

export default SandboxEnvironment;
