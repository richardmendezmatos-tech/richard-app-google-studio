'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Search,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCcw,
  ExternalLink,
} from 'lucide-react';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

interface SitemapInfo {
  path: string;
  lastSubmitted: string | null;
  lastDownloaded: string | null;
  isPending: boolean;
  warnings: number;
  errors: number;
  contents?: { type: string; submitted: number; indexed: number }[];
}

interface AnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCData {
  sitemap: SitemapInfo | null;
  sitemapCount: number;
  analytics: AnalyticsRow[];
  analyticsPrevious: AnalyticsRow[];
  lastUpdated: string;
}

export const GSCDashboard: React.FC = () => {
  const [data, setData] = useState<GSCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const res = await fetch('/api/seo/gsc');
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || body.message || 'Failed to fetch GSC data');
      }
      setData(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-PR', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalClicks = data?.analytics.reduce((s, r) => s + r.clicks, 0) || 0;
  const totalImpressions = data?.analytics.reduce((s, r) => s + r.impressions, 0) || 0;
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';
  const avgPosition = data && data.analytics.length > 0
    ? (data.analytics.reduce((s, r) => s + r.position, 0) / data.analytics.length).toFixed(1)
    : '—';

  const prevClicks = data?.analyticsPrevious.reduce((s, r) => s + r.clicks, 0) || 1;
  const clickChange = prevClicks > 0 ? (((totalClicks - prevClicks) / prevClicks) * 100).toFixed(1) : '0';

  const isConfigured = !error?.includes('not configured') && !error?.includes('UNAUTHENTICATED');

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Globe size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">
              Google Search Console
            </h3>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">
              {SITE_CONFIG.url}
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={isRefreshing}
          className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Refrescar"
        >
          <RefreshCcw size={16} className={`text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-primary animate-spin" />
        </div>
      )}

      {!loading && !isConfigured && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-amber-400" />
          </div>
          <p className="text-slate-300 font-bold mb-1">GSC no configurado</p>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Para conectar Google Search Console, crea una service account en Google Cloud Console,
            habilita la API, y configura las env vars <code className="text-primary">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> y{' '}
            <code className="text-primary">GOOGLE_PRIVATE_KEY</code>.
          </p>
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ExternalLink size={14} /> Ir a Google Cloud Console
          </a>
        </div>
      )}

      {!loading && error && isConfigured && (
        <div className="text-center py-8">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!loading && data && isConfigured && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Clicks (28d)', value: totalClicks.toLocaleString(), change: `${clickChange}%`, icon: TrendingUp },
              { label: 'Impresiones', value: totalImpressions.toLocaleString(), icon: Search },
              { label: 'CTR Promedio', value: `${avgCtr}%`, icon: TrendingUp },
              { label: 'Posición Prom.', value: avgPosition, icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <stat.icon size={12} className="text-slate-500 mb-2" />
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Sitemap Status */}
          <div className="bg-slate-800/50 rounded-3xl border border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-cyan-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Sitemap
                </span>
              </div>
              <span className="text-[8px] text-slate-500 font-mono">
                {data.sitemapCount} sitemaps
              </span>
            </div>
            {data.sitemap ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {data.sitemap.errors > 0 ? (
                    <AlertTriangle size={14} className="text-red-400" />
                  ) : (
                    <CheckCircle size={14} className="text-emerald-400" />
                  )}
                  <span className="text-xs text-slate-300 font-mono truncate">{data.sitemap.path}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px]">
                  <div>
                    <span className="text-slate-500">Submitted</span>
                    <p className="text-white font-mono">{formatDate(data.sitemap.lastSubmitted)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Last Downloaded</span>
                    <p className="text-white font-mono">{formatDate(data.sitemap.lastDownloaded)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Warnings</span>
                    <p className="text-white font-mono">{data.sitemap.warnings}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Errors</span>
                    <p className={`font-mono ${data.sitemap.errors > 0 ? 'text-red-400' : 'text-white'}`}>
                      {data.sitemap.errors}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-[10px]">No sitemap data available</p>
            )}
          </div>

          {/* Top Queries */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Search size={14} className="text-primary" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Top Queries (28 días)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-slate-500 font-bold uppercase tracking-wider border-b border-white/5">
                    <th className="text-left py-2 pr-4">Query</th>
                    <th className="text-right px-2">Clicks</th>
                    <th className="text-right px-2">Impresiones</th>
                    <th className="text-right px-2">CTR</th>
                    <th className="text-right pl-2">Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.analytics.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 pr-4 text-white font-medium truncate max-w-[200px]">
                        {row.keys[0]}
                      </td>
                      <td className="text-right px-2 text-white font-mono">{row.clicks}</td>
                      <td className="text-right px-2 text-white font-mono">{row.impressions}</td>
                      <td className="text-right px-2 text-emerald-400 font-mono">
                        {(row.ctr * 100).toFixed(1)}%
                      </td>
                      <td className="text-right pl-2 text-slate-400 font-mono">{row.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[8px] text-slate-600 text-center font-mono">
            Updated {formatDate(data.lastUpdated)}
          </p>
        </>
      )}
    </div>
  );
};


