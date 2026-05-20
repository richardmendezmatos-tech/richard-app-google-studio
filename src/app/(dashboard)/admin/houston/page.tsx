'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Zap,
  Shield,
  Cpu,
  Terminal as TerminalIcon,
  ArrowUpRight,
  AlertCircle,
  Server,
  Radio,
  CheckCircle2,
  Car as CarIcon,
  DollarSign,
  Gauge,
  LineChart,
  MessageSquare,
  PackageSearch,
  Sparkles,
  TrendingUp,
  Wifi,
  ChevronRight,
  TrendingDown,
  Atom,
  RefreshCw,
  Search,
  HelpCircle,
} from 'lucide-react';
import { DI } from '@/app/(dashboard)/di/registry';
import { HoustonTelemetry } from '@/entities/houston';
import SEO from '@/shared/ui/seo/SEO';

// ─── Tactical Canvas Radar Sweep ──────────────────────────────────────────────
interface RadarPoint {
  id: string;
  x: number; // -100 to 100 relative to center
  y: number; // -100 to 100 relative to center
  label: string;
  type: 'appraisal' | 'lead' | 'sale';
  intensity: number;
}

const TacticalRadar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<RadarPoint[]>([
    {
      id: '1',
      x: 45,
      y: -30,
      label: 'Vega Alta: Tacoma 2022 Scan',
      type: 'appraisal',
      intensity: 0.9,
    },
    { id: '2', x: -60, y: 50, label: 'Bayamón: Ford Bronco Query', type: 'lead', intensity: 0.7 },
    {
      id: '3',
      x: 20,
      y: 75,
      label: 'San Juan: F-150 Appraisal',
      type: 'appraisal',
      intensity: 0.95,
    },
    { id: '4', x: -80, y: -40, label: 'Ponce: Corolla Deal Closed', type: 'sale', intensity: 0.8 },
    { id: '5', x: -10, y: -20, label: 'Caguas: Explorer Lead Hot', type: 'lead', intensity: 0.65 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;

    const render = () => {
      // Clear canvas with trace amount of trailing opacity
      ctx.fillStyle = 'rgba(2, 6, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 15;

      // Draw outer circle rings
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
      ctx.lineWidth = 1;

      // Multi-layer grids
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw cross-hairs
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.08)';
      ctx.stroke();

      // Radar Sweep line
      angle += 0.015;
      const sweepX = centerX + radius * Math.cos(angle);
      const sweepY = centerY + radius * Math.sin(angle);

      // Sweep gradient line
      const sweepGrad = ctx.createLinearGradient(centerX, centerY, sweepX, sweepY);
      sweepGrad.addColorStop(0, 'rgba(0, 242, 255, 0)');
      sweepGrad.addColorStop(1, 'rgba(0, 242, 255, 0.6)');

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Sweep aura / wedge
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle - 0.25, angle, false);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 242, 255, 0.04)';
      ctx.fill();

      // Draw points with pulsing glow
      points.forEach((pt) => {
        const ptX = centerX + (pt.x / 100) * radius;
        const ptY = centerY + (pt.y / 100) * radius;

        // Calc distance between sweep line angle and point angle
        const ptAngle = Math.atan2(pt.y, pt.x);
        const normalizedSweepAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const normalizedPtAngle = ((ptAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        let diff = Math.abs(normalizedSweepAngle - normalizedPtAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        // Peak shine when sweep hits it
        const brightness = Math.max(0.15, 1 - diff / 1.2);

        // Point color styling
        const color =
          pt.type === 'appraisal'
            ? 'rgba(245, 158, 11,'
            : pt.type === 'sale'
              ? 'rgba(16, 185, 129,'
              : 'rgba(0, 242, 255,';

        // Outer pulse circle
        ctx.beginPath();
        ctx.arc(ptX, ptY, 8 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = `${color} ${brightness * 0.35})`;
        ctx.stroke();

        // Inner solid core
        ctx.beginPath();
        ctx.arc(ptX, ptY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `${color} ${brightness * pt.intensity})`;
        ctx.shadowColor = `${color} 0.8)`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        // Label details (near point)
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
        ctx.font = '7px var(--font-tech)';
        ctx.fillText(pt.label.split(':')[0], ptX + 8, ptY - 2);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [points]);

  // Handle click scan stimulation
  const stimulateScan = () => {
    const locations = [
      'Vega Alta',
      'Vega Baja',
      'San Juan',
      'Bayamón',
      'Guaynabo',
      'Dorado',
      'Ponce',
      'Caguas',
    ];
    const models = [
      'Tacoma',
      'Bronco',
      'F-150',
      'Tesla Model Y',
      'Explorer',
      'Civic Type-R',
      'Mustang GT',
    ];
    const types: ('appraisal' | 'lead' | 'sale')[] = ['appraisal', 'lead', 'sale'];

    const newPt: RadarPoint = {
      id: Date.now().toString(),
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 160,
      label: `${locations[Math.floor(Math.random() * locations.length)]}: ${models[Math.floor(Math.random() * models.length)]} Probe`,
      type: types[Math.floor(Math.random() * types.length)],
      intensity: 0.8 + Math.random() * 0.2,
    };

    setPoints((prev) => [newPt, ...prev.slice(0, 5)]);
  };

  return (
    <div className="relative glass-premium p-6 border border-cyan-500/20 bg-slate-950/45 overflow-hidden flex flex-col items-center">
      {/* HUD Brackets */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-cyan-400/40 select-none">
        GRID // RADAR_04
      </div>
      <div className="absolute top-2 right-2 text-[8px] font-mono text-cyan-400/40 select-none">
        AZIMUTH: AUTO
      </div>

      <div className="flex justify-between items-center w-full mb-4">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
            <Atom className="text-cyan-400 animate-spin-slow" size={14} /> Tactical Scanning Radar
          </h3>
          <p className="text-[8px] text-slate-500 font-mono tracking-widest mt-1">
            SENTINEL LIVE GEOLOCATION ENGINE
          </p>
        </div>
        <button
          onClick={stimulateScan}
          className="flex items-center gap-2 px-3 py-1 border border-cyan-500/30 rounded-lg text-[9px] font-black text-cyan-400 hover:bg-cyan-500/10 transition-all uppercase tracking-widest"
        >
          <RefreshCw size={10} className="animate-spin-slow" /> Stimulate Scan
        </button>
      </div>

      <div className="relative w-full max-w-[280px] aspect-square rounded-full border border-cyan-500/10 overflow-hidden bg-slate-950/60 shadow-[inset_0_0_30px_rgba(6,182,212,0.15)] p-2">
        <canvas ref={canvasRef} width={280} height={280} className="w-full h-full block" />
      </div>

      {/* Dynamic scan alerts */}
      <div className="w-full mt-4 bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 border-b border-white/5 pb-1">
          <span>ACTIVE UPLINK PROBES</span>
          <span className="text-cyan-400 animate-pulse">● SECURE CONNECTION</span>
        </div>
        <div className="space-y-1.5 max-h-[85px] overflow-y-auto custom-scrollbar">
          {points.map((pt) => (
            <div
              key={pt.id}
              className="flex justify-between items-center text-[9px] font-mono leading-none"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className={`w-1 h-1 rounded-full ${pt.type === 'appraisal' ? 'bg-amber-400 animate-pulse' : pt.type === 'sale' ? 'bg-emerald-400' : 'bg-cyan-400 animate-ping'}`}
                />
                {pt.label}
              </span>
              <span className="text-slate-500">[{Math.round(pt.intensity * 100)}%]</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Sourcing Gaps Matrix Component ───────────────────────────────────────────
interface SourcingGap {
  model: string;
  yearRange: string;
  demandIndex: number; // 0-100 searches
  physicalStock: number;
  gap: number;
  priority: 'CRITICAL' | 'HIGH' | 'STABLE';
}

const SourcingGapsWidget: React.FC = () => {
  const gaps: SourcingGap[] = [
    {
      model: 'Toyota Tacoma Double Cab',
      yearRange: '2020 - 2023',
      demandIndex: 94,
      physicalStock: 1,
      gap: 8,
      priority: 'CRITICAL',
    },
    {
      model: 'Ford Bronco Wildtrak',
      yearRange: '2021 - 2024',
      demandIndex: 88,
      physicalStock: 0,
      gap: 5,
      priority: 'CRITICAL',
    },
    {
      model: 'Tesla Model Y Long Range',
      yearRange: '2021 - 2023',
      demandIndex: 78,
      physicalStock: 2,
      gap: 3,
      priority: 'HIGH',
    },
    {
      model: 'Jeep Wrangler Unlimited 4x4',
      yearRange: '2019 - 2022',
      demandIndex: 82,
      physicalStock: 1,
      gap: 4,
      priority: 'HIGH',
    },
    {
      model: 'Toyota Corolla SE',
      yearRange: '2020 - 2023',
      demandIndex: 72,
      physicalStock: 3,
      gap: 2,
      priority: 'STABLE',
    },
  ];

  return (
    <div className="glass-premium border border-white/5 p-6 relative flex flex-col justify-start overflow-hidden group">
      {/* Sweep laser bar overlay */}
      <div className="scanline-overlay" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444] animate-pulse" />{' '}
            Sourcing Gap Matrix
          </h3>
          <p className="text-[8px] text-slate-500 font-mono tracking-widest mt-1">
            VEHICLE DEMAND MULTIPLIERS VS INVENTORY LEVELS
          </p>
        </div>

        <div className="flex items-center gap-3 px-3 py-1 border border-red-500/20 rounded-full bg-red-500/5">
          <div className="flex gap-1 h-3 items-end">
            <div className="w-1 h-2 bg-red-500/70 animate-pulse" />
            <div className="w-1 h-3 bg-red-500/70 animate-pulse" />
            <div className="w-1 h-1.5 bg-red-500/70 animate-pulse animate-delay-100" />
          </div>
          <span className="text-[8px] text-red-400 font-black uppercase tracking-widest">
            GAPS DETECTED
          </span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide z-10">
        <table className="w-full text-left font-mono">
          <thead>
            <tr className="text-[8px] text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">
              <th className="py-2">Vehicle Specs</th>
              <th className="py-2 text-center">Demand Pwr</th>
              <th className="py-2 text-center">Stock</th>
              <th className="py-2 text-center">Gap Vol</th>
              <th className="py-2 text-right font-black">Status Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[10px]">
            {gaps.map((item, index) => {
              const badgeColor =
                item.priority === 'CRITICAL'
                  ? 'border-red-500/20 text-red-400 bg-red-500/5'
                  : item.priority === 'HIGH'
                    ? 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                    : 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5';
              return (
                <tr key={index} className="hover:bg-slate-900/30 transition-all">
                  <td className="py-3 flex flex-col">
                    <span className="font-black text-white">{item.model}</span>
                    <span className="text-[8px] text-slate-500 font-normal">{item.yearRange}</span>
                  </td>
                  <td className="py-3 text-center text-cyan-400 font-black">{item.demandIndex}%</td>
                  <td className="py-3 text-center text-slate-300 font-bold">
                    {item.physicalStock} u
                  </td>
                  <td className="py-3 text-center text-amber-400 font-black">+{item.gap}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}
                    >
                      {item.priority}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-white/5 text-[9px] leading-relaxed flex items-start gap-3">
        <Sparkles size={14} className="text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase tracking-wider block mb-1">
            AI Procurement Recommendation:
          </span>
          Richard, prioritize acquisition of{' '}
          <span className="text-cyan-400 font-bold">Toyota Tacoma (2020-2023)</span> and{' '}
          <span className="text-cyan-400 font-bold">Ford Bronco</span>. Deep intent logs capture +32
          local Puerto Rico buyers query searches using natural language in the last 48 hours
          without matched stock.
        </div>
      </div>
    </div>
  );
};

// ─── Live Sentinel Vision Valuator ───────────────────────────────────────────
const SentinelVisionPanel: React.FC = () => {
  const [activeSession, setActiveSession] = useState({
    id: 'SCAN-9923',
    vehicle: '2021 Toyota Tacoma TRD Off-Road',
    mileage: '38,200 mi',
    marketBase: 34500,
    depreciation: -2750, // Mileage base
    prBrandMultiplier: 2760, // +8% Toyota retention
    pickupBonus: 1200, // 4x4 pickup bonus
    estimatedTradeIn: 35710,
    checkedSteps: ['vin_validation', 'exterior_profile', 'tire_depth_compliance', 'obd_scan'],
  });

  return (
    <div className="glass-premium border border-emerald-500/10 p-6 relative flex flex-col justify-between h-full bg-slate-950/45">
      {/* Brackets */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-emerald-400/40">
        SENTINEL_VISION // LIVE
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Sentinel Vision
              Live
            </h3>
            <p className="text-[8px] text-slate-500 font-mono tracking-widest mt-1">
              REAL-TIME ACTUARIAL DEPRECIATION PROCESSOR
            </p>
          </div>
          <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
            ACTIVE SESSION: {activeSession.id}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              VEHICLE FOCUS
            </span>
            <span className="text-[10px] font-black text-white font-mono">
              {activeSession.vehicle}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              MILEAGE INPUT
            </span>
            <span className="text-[10px] font-black text-emerald-400 font-mono">
              {activeSession.mileage}
            </span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400">Market Base Valuation</span>
            <span className="text-white">${activeSession.marketBase.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingDown size={11} className="text-red-400" /> Mileage Adjustment
            </span>
            <span className="text-red-400">
              -${Math.abs(activeSession.depreciation).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp size={11} className="text-emerald-400" /> Puerto Rico Multiplier (+8%)
            </span>
            <span className="text-emerald-400">
              +${activeSession.prBrandMultiplier.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles size={11} className="text-amber-400" /> Pickup 4x4 Premium Bonus
            </span>
            <span className="text-emerald-400">+${activeSession.pickupBonus.toLocaleString()}</span>
          </div>
          <div className="border-t border-white/5 pt-2 flex justify-between items-center text-[11px] font-black font-mono">
            <span className="text-slate-300 uppercase tracking-wider">Actuarial Assessment</span>
            <span className="text-emerald-400 text-lg text-glow">
              ${activeSession.estimatedTradeIn.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Compliance scan checklist */}
      <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-2">
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-1">
          SENTINEL COMPLIANCE CHECKS
        </span>
        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
          {[
            { key: 'vin_validation', label: 'VIN REGISTRY MATCH' },
            { key: 'exterior_profile', label: 'EXT PROFILE SCAN' },
            { key: 'tire_depth_compliance', label: 'TREAD TIRE COMPL' },
            { key: 'obd_scan', label: 'OBD DIAGNOSTICS' },
          ].map((step) => {
            const isChecked = activeSession.checkedSteps.includes(step.key);
            return (
              <div key={step.key} className="flex items-center gap-2">
                <CheckCircle2
                  size={12}
                  className={isChecked ? 'text-emerald-400' : 'text-slate-600'}
                />
                <span className={isChecked ? 'text-slate-300' : 'text-slate-600'}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Sovereign Live Terminal Component ────────────────────────────────────────
const SovereignTerminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM_INIT] Uplink secured at Vegas Alta Mission Center.',
    '[SENTINEL_AI] Ingesting neural search logs: 42 buyer requests matched.',
    '[VALUATOR_SERVICE] Recalculated dynamic HSL depreciation indices.',
    '[INTELLIGENCE] Tacoma sourcing gap identified: Priority Critical +8 Units.',
    '[DATABASE] Synchronizing checkpoint snapshot: d4cde605-6ad7.',
  ]);

  useEffect(() => {
    const messages = [
      '[SENTINEL_AI] Deep-learning query: "Toyota Corolla 2021 color gris"',
      '[UPLINK] Connected to ClasificadosOnline syndication client.',
      '[VALUATOR] Triggered scan step: TREAD TIRE COMPLIANCE [PASS].',
      '[SYSTEM_HEALTH] Inference latency: 45ms (optimal)',
      '[INTELLIGENCE] Sourcing recommendations updated for Richard Mendez.',
      '[METRIC] Token efficiency score calculated at 98.4%',
    ];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev.slice(-15), `[${timestamp}] ${randomMsg}`]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-premium p-6 border border-white/5 bg-slate-950/45 font-mono text-[9px] flex flex-col justify-start h-full">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <TerminalIcon className="text-cyan-400 animate-pulse" size={12} /> Sovereign Command Feed
        </h3>
        <span className="text-[8px] text-cyan-400/40">SOVEREIGN_V24.06</span>
      </div>

      <div className="flex-1 space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-2 text-slate-300">
        {logs.map((log, index) => (
          <div
            key={index}
            className="leading-relaxed select-text hover:bg-white/5 p-0.5 rounded transition-all"
          >
            <span className="text-cyan-500">{'>'}</span> {log}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Executive Cockpit Dashboard Page ──────────────────────────────────────────
export default function HoustonMissionControlPage() {
  const [telemetry, setTelemetry] = useState<HoustonTelemetry | null>(null);

  useEffect(() => {
    const telemetryUseCase = DI.getHoustonTelemetryUseCase();
    let unsubscribeFn: (() => void) | undefined;

    const init = async () => {
      unsubscribeFn = await telemetryUseCase.subscribe((data) => setTelemetry(data));
    };
    init();

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#02060a] text-white relative overflow-hidden font-manrope">
      <SEO
        title="Sovereign Cockpit Terminal | Richard Automotive"
        description="Premium executive cyberpunk command dashboard for Sentinel AI."
        noIndex={true}
      />

      {/* Scanning Laser Line Overlay */}
      <div className="scanline-overlay" />

      {/* Mesh Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Elite Terminal Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5 relative">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[8px] font-black uppercase rounded tracking-widest">
                COCKPIT TERMINAL N19
              </span>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-3xl font-black font-tech uppercase tracking-[0.25em] text-white mt-2">
              SOVEREIGN <span className="text-gradient-cyan text-glow">COCKPIT</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1">
              VEGA ALTA MISSION CONTROL HUB • SYSTEM TELEMETRY FLOW
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 bg-slate-900/50 border border-white/5 p-3 rounded-2xl">
              <div className="text-right">
                <span className="text-[8px] text-slate-500 font-black block uppercase tracking-widest">
                  SYSTEM UPLINK
                </span>
                <span className="text-xs text-white font-mono font-bold">100% RESPONSIVE</span>
              </div>
              <Wifi className="text-cyan-400" size={20} />
            </div>

            <button
              onClick={() => (window.location.href = '/admin')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:border-cyan-500/40 text-[10px] font-black uppercase tracking-widest transition-all bg-slate-900/40 text-slate-300 hover:text-white"
            >
              Exit Cockpit <ChevronRight size={12} />
            </button>
          </div>
        </header>

        {/* Active Telemetry Stats Bar */}
        {telemetry && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Inference Latency',
                value: telemetry.metrics.inferenceLatency.value,
                unit: telemetry.metrics.inferenceLatency.unit,
                icon: <Zap size={16} className="text-cyan-400 animate-pulse" />,
                isUrgent: false,
              },
              {
                label: 'System Autonomy',
                value: telemetry.metrics.autonomyRate.value,
                unit: telemetry.metrics.autonomyRate.unit,
                icon: <Shield size={16} className="text-cyan-400" />,
                isUrgent: false,
              },
              {
                label: 'API Stability Rate',
                value: telemetry.metrics.apiStability.value,
                unit: telemetry.metrics.apiStability.unit,
                icon: <Server size={16} className="text-cyan-400" />,
                isUrgent: false,
              },
              {
                label: 'Sentinel token speed',
                value: telemetry.metrics.tokenUsage.value,
                unit: telemetry.metrics.tokenUsage.unit,
                icon: <Cpu size={16} className="text-cyan-400" />,
                isUrgent: false,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-premium p-4 border border-white/5 relative flex items-center justify-between group cursor-default"
              >
                <div>
                  <span className="text-[8px] text-slate-500 font-black block uppercase tracking-widest mb-1">
                    {stat.label}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white font-mono tracking-tighter">
                      {stat.value}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-widest">
                      {stat.unit}
                    </span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 group-hover:border-cyan-500/30 transition-all">
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mid Grid Cockpit Panels */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Left section split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TacticalRadar />
              <SentinelVisionPanel />
            </div>

            {/* Bottom logs console */}
            <SovereignTerminal />
          </div>

          {/* Right section: Procurement Matrix */}
          <div className="xl:col-span-1 h-full">
            <SourcingGapsWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
