import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lead, getSecureLeadData, subscribeToLeads } from '@/features/leads/services/crmService';
import { LeadLifecycleAnalytics } from './LeadLifecycleAnalytics';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

const LeadAnalyticsPage: React.FC = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const navigate = useNavigate();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!leadId) return;

        // Subscribe to leads to find the specific one in real-time
        // Optimally we would have a single lead subscription, but reusing existing service pattern
        const unsubscribe = subscribeToLeads((leads) => {
            const found = leads.find(l => l.id === leadId);
            if (found) {
                setLead(found);
                setError(null);
            } else {
                // If not found in the main list, try fetching secure data directly (if pertinent)
                // For now, assume if not in list it might be loading or doesn't exist
                setError('Lead no encontrado o acceso denegado.');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [leadId]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-[#00aed9]" size={32} />
            </div>
        );
    }

    if (error || !lead) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error || 'No se pudo cargar la información del lead.'}</p>
                <button
                    onClick={() => navigate('/admin')}
                    className="mt-6 px-6 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                >
                    Volver al CRM
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                            Analytics: <span className="text-[#00aed9]">{lead.name}</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Visualización profunda de ciclo de vida y score
                        </p>
                    </div>
                </header>

                <LeadLifecycleAnalytics lead={lead} />
            </div>
        </div>
    );
};

export default LeadAnalyticsPage;
