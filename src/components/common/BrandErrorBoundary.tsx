import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Terminal, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class BrandErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
        // Here you could send to logging service like Sentry or Firebase Crashlytics
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050b14] text-cyan-500 font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_100%)] pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                    <div className="z-10 max-w-2xl w-full bg-[#0a1625] border border-cyan-900/50 rounded-lg p-8 shadow-[0_0_50px_rgba(0,174,217,0.1)] relative">
                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500" />

                        <div className="flex items-center gap-4 mb-6 border-b border-cyan-900/50 pb-4">
                            <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
                            <div>
                                <h1 className="text-2xl font-black tracking-widest text-white">SYSTEM FAILURE</h1>
                                <p className="text-xs uppercase tracking-[0.3em] text-red-400">Critical Error Detected</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-black/50 p-4 rounded border border-cyan-900/30 font-mono text-xs text-red-300 overflow-x-auto">
                                <p className="mb-2 opacity-50">// DIAGNOSTIC LOG:</p>
                                <p>{this.state.error?.toString()}</p>
                                {this.state.errorInfo && (
                                    <pre className="mt-2 opacity-50 text-[10px] whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                            <p className="text-sm text-cyan-400/80">
                                El núcleo del sistema ha encontrado una anomalía inesperada. Los protocolos de seguridad han detenido la ejecución para proteger la integridad de los datos.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-6 rounded flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(0,174,217,0.4)]"
                            >
                                <RefreshCw size={18} /> INICIAR REINICIO
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 bg-transparent border border-cyan-700 hover:bg-cyan-900/20 text-cyan-400 font-bold py-3 px-6 rounded flex items-center justify-center gap-2 transition-all"
                            >
                                <Home size={18} /> VOLVER AL DASHBOARD
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[10px] text-cyan-900 uppercase tracking-widest flex items-center justify-center gap-2">
                                <Terminal size={12} /> Richard Automotive OS v2.7
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
