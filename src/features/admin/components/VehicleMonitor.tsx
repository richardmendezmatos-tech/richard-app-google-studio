import React, { useEffect, useState } from 'react';
import { useVehicleTelemetry, useVehicleHealth } from '@/services/telemetryService';
import { TelemetrySimulator } from '@/utils/TelemetrySimulator';
import { Gauge, Thermometer, Fuel, MapPin, Zap, Activity, Radio, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VehicleMonitor: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
    const { telemetry, loading: telemetryLoading, error: telemetryError } = useVehicleTelemetry(vehicleId);
    const { health, loading: healthLoading, error: healthError } = useVehicleHealth(vehicleId);
    const [simulator, setSimulator] = useState<TelemetrySimulator | null>(null);

    const loading = telemetryLoading || (healthLoading && !health);
    const error = telemetryError || healthError;

    const startSimulation = () => {
        const sim = new TelemetrySimulator(vehicleId);
        sim.start();
        setSimulator(sim);
    };

    const stopSimulation = () => {
        simulator?.stop();
        setSimulator(null);
    };

    useEffect(() => {
        return () => simulator?.stop();
    }, [simulator]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-blue-500"
            >
                <Radio size={48} />
            </motion.div>
            <p className="font-bold text-slate-500 animate-pulse">Sincronizando con Richard IoT Bridge...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 bg-red-50 text-red-600 rounded-3xl border border-red-200">
            <h3 className="font-bold text-lg mb-2">Error de Sincronización</h3>
            <p className="text-sm">{error}</p>
        </div>
    );

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl">
                            <Activity className="text-white" size={24} />
                        </div>
                        Digital Twin Telemetry
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">VIN: {vehicleId}</span>
                        <div className={`w-2 h-2 rounded-full ${telemetry ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span className="text-[10px] font-black uppercase text-slate-400">{telemetry ? 'Live Data Active' : 'Disconnected'}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    {!simulator ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startSimulation}
                            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                            <Zap size={18} /> INITIALIZE SIMULATOR
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={stopSimulation}
                            className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
                        >
                            <Zap size={18} className="animate-pulse" /> TERMINATE UPLINK
                        </motion.button>
                    )}
                </div>
            </div>

            {!telemetry && !simulator && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-white dark:bg-slate-800/80 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700"
                >
                    <div className="bg-slate-100 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Radio className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Awaiting Signal</h3>
                    <p className="text-slate-400 max-w-md mx-auto px-6">
                        There is no active telemetry data for this unit. Start the simulator above or verify the hardware dongle connection.
                    </p>
                </motion.div>
            )}

            {telemetry && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<Gauge className="text-blue-500" />}
                        label="Velocity"
                        value={Math.round(telemetry.speed)}
                        unit="km/h"
                        color="blue"
                        percentage={(telemetry.speed / 120) * 100}
                    />
                    <StatCard
                        icon={<Activity className="text-purple-500" />}
                        label="Engine Revs"
                        value={Math.round(telemetry.rpm)}
                        unit="RPM"
                        color="purple"
                        percentage={(telemetry.rpm / 6000) * 100}
                    />
                    <StatCard
                        icon={<Fuel className={telemetry.fuelLevel < 20 ? "text-red-500" : "text-green-500"} />}
                        label="Fuel Energy"
                        value={Math.round(telemetry.fuelLevel)}
                        unit="%"
                        color={telemetry.fuelLevel < 20 ? "red" : "green"}
                        percentage={telemetry.fuelLevel}
                    />
                    <StatCard
                        icon={<Thermometer className="text-amber-500" />}
                        label="Core Temp"
                        value={telemetry.temp.toFixed(1)}
                        unit="°C"
                        color="amber"
                        percentage={(telemetry.temp / 120) * 100}
                    />

                    {/* AI Smart Alerts Panel */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${health?.overallStatus === 'critical' ? 'bg-red-500' : health?.overallStatus === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                    {health?.overallStatus === 'healthy' ? <CheckCircle size={20} className="text-white" /> : <AlertTriangle size={20} className="text-white" />}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Predictive Health Engine</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Status: <span className={health?.overallStatus === 'critical' ? 'text-red-500' : health?.overallStatus === 'warning' ? 'text-amber-500' : 'text-emerald-500'}>{health?.overallStatus}</span></p>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                                Last AI Audit: {health ? new Date(health.lastCheck).toLocaleTimeString() : 'N/A'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {health?.alerts && health.alerts.length > 0 ? (
                                    health.alerts.map((alert) => (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`p-4 rounded-2xl border flex gap-4 items-start ${alert.type === 'critical' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}
                                        >
                                            <div className={`p-2 rounded-lg mt-0.5 ${alert.type === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                <AlertTriangle size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{alert.category}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">
                                                    {alert.message}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-8 text-center bg-emerald-500/5 border border-dashed border-emerald-500/20 rounded-2xl">
                                        <div className="p-3 bg-emerald-500 text-white rounded-full w-fit mx-auto mb-3">
                                            <CheckCircle size={24} />
                                        </div>
                                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sistemas Operando con Normalidad</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">No se detectan anomalías predictivas en los componentes core.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-slate-200 dark:text-slate-700 -z-0">
                            <MapPin size={120} strokeWidth={1} />
                        </div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <MapPin className="text-red-500" size={20} />
                            </div>
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Geospatial Projection</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                            <div className="lg:col-span-2 h-64 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#00aed9_1.5px,transparent_1.5px)] bg-[length:30px_30px]" />
                                {/* Moving Crosshair */}
                                <motion.div
                                    animate={{
                                        x: (telemetry.location.lng + 69.9312) * 1000000 % 100 - 50,
                                        y: (telemetry.location.lat - 18.4861) * 1000000 % 100 - 50
                                    }}
                                    className="relative flex items-center justify-center"
                                >
                                    <div className="absolute w-12 h-12 border border-blue-500/30 rounded-full animate-ping" />
                                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 shadow-lg" />
                                </motion.div>
                            </div>

                            <div className="flex flex-col justify-center gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Last Transmission</p>
                                    <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">
                                        {new Date(telemetry.lastUpdate).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Precision Lat/Lng</p>
                                    <p className="text-xs font-mono font-bold text-blue-500">
                                        {telemetry.location.lat.toFixed(6)}, {telemetry.location.lng.toFixed(6)}
                                    </p>
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap size={14} className="text-emerald-500" />
                                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Battery System</p>
                                    </div>
                                    <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                                        {telemetry.batteryVoltage.toFixed(1)}V <span className="text-xs font-bold text-emerald-500 opacity-60">Stable</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, unit, color, percentage }: { icon: React.ReactNode, label: string, value: string | number, unit: string, color: string, percentage: number }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2 group"
    >
        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
            {icon} {label}
        </div>
        <div className="flex items-baseline gap-1 mt-1">
            <div className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                {value}
            </div>
            <div className="text-xs font-bold text-slate-400">{unit}</div>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full mt-4 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                className={`h-full bg-${color}-500 shadow-[0_0_10px_rgba(var(--tw-color-${color}-500-rgb),0.5)]`}
            />
        </div>
    </motion.div>
);

export default VehicleMonitor;
