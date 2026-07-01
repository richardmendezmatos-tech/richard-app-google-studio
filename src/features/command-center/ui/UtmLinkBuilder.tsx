'use client';

import React, { useState } from 'react';
import { Car } from '@/shared/types/types';
import { Link, Check, Copy } from 'lucide-react';

interface Props {
  car: Car;
}

/**
 * UTM Link Builder — extraído de MarketingCreativeStudio.
 * Autónomo: gestiona sus propios utmParams y el estado de "copiado".
 */
export function UtmLinkBuilder({ car }: Props) {
  const [utmParams, setUtmParams] = useState({
    source: 'facebook',
    medium: 'social',
    campaign: `${car.make?.toLowerCase() || 'ford'}_${car.model?.toLowerCase() || 'auto'}`,
    term: car.name?.toLowerCase().replace(/\s+/g, '_') || '',
    content: 'hero_image',
  });
  const [copied, setCopied] = useState(false);

  return (
                      <div className="bg-white/3 p-8 rounded-[38px] border border-white/5 space-y-6 hover:border-emerald-500/20 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 flex items-center justify-center shadow-lg border border-emerald-500/30">
                              <Link size={20} className="text-emerald-400" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white uppercase tracking-widest">
                                UTM Link Builder
                              </h4>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                Tracking para campañas
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const baseUrl =
                                typeof window !== 'undefined'
                                  ? `${window.location.origin}/inventario/${car.id || car.vin || car.name?.toLowerCase().replace(/\s+/g, '-')}`
                                  : `https://www.richard-automotive.com/inventario/${car.id || car.vin || car.name?.toLowerCase().replace(/\s+/g, '-')}`;
                              const url = new URL(baseUrl);
                              url.searchParams.set('utm_source', utmParams.source);
                              url.searchParams.set('utm_medium', utmParams.medium);
                              url.searchParams.set('utm_campaign', utmParams.campaign);
                              if (utmParams.term) url.searchParams.set('utm_term', utmParams.term);
                              if (utmParams.content) url.searchParams.set('utm_content', utmParams.content);
                              navigator.clipboard.writeText(url.toString());
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-4 bg-white/5 hover:bg-emerald-500/20 rounded-2xl text-slate-400 hover:text-emerald-400 transition-all"
                            title="Copiar UTM Link"
                            aria-label="Copiar UTM Link"
                          >
                            {copied ? (
                              <Check size={20} className="text-emerald-500" />
                            ) : (
                              <Copy size={20} />
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              utm_source
                            </label>
                            <input
                              type="text"
                              value={utmParams.source}
                              onChange={(e) => setUtmParams({ ...utmParams, source: e.target.value })}
                              className="w-full px-4 py-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-white placeholder-slate-600 focus:border-emerald-500/30 focus:outline-none transition-all"
                              placeholder="facebook"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              utm_medium
                            </label>
                            <input
                              type="text"
                              value={utmParams.medium}
                              onChange={(e) => setUtmParams({ ...utmParams, medium: e.target.value })}
                              className="w-full px-4 py-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-white placeholder-slate-600 focus:border-emerald-500/30 focus:outline-none transition-all"
                              placeholder="social"
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              utm_campaign
                            </label>
                            <input
                              type="text"
                              value={utmParams.campaign}
                              onChange={(e) => setUtmParams({ ...utmParams, campaign: e.target.value })}
                              className="w-full px-4 py-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-white placeholder-slate-600 focus:border-emerald-500/30 focus:outline-none transition-all"
                              placeholder="ford_explorer_2025"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              utm_term
                            </label>
                            <input
                              type="text"
                              value={utmParams.term}
                              onChange={(e) => setUtmParams({ ...utmParams, term: e.target.value })}
                              className="w-full px-4 py-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-white placeholder-slate-600 focus:border-emerald-500/30 focus:outline-none transition-all"
                              placeholder="ford_explorer_2025"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              utm_content
                            </label>
                            <input
                              type="text"
                              value={utmParams.content}
                              onChange={(e) => setUtmParams({ ...utmParams, content: e.target.value })}
                              className="w-full px-4 py-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-white placeholder-slate-600 focus:border-emerald-500/30 focus:outline-none transition-all"
                              placeholder="hero_image"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mr-1">
                            Prefill:
                          </span>
                          {[
                            { label: 'Facebook', src: 'facebook', med: 'social', content: 'feed_ad' },
                            { label: 'Instagram', src: 'instagram', med: 'social', content: 'story_ad' },
                            { label: 'Google', src: 'google', med: 'cpc', content: 'search_ad' },
                            { label: 'WhatsApp', src: 'whatsapp', med: 'messaging', content: 'direct_share' },
                            { label: 'Email', src: 'email', med: 'email', content: 'newsletter' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() =>
                                setUtmParams({
                                  ...utmParams,
                                  source: preset.src,
                                  medium: preset.med,
                                  content: preset.content,
                                })
                              }
                              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                utmParams.source === preset.src
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        <div className="p-4 bg-black/30 rounded-3xl border border-white/5">
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-2">
                            Preview
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono break-all">
                            {(() => {
                              const baseUrl = `https://www.richard-automotive.com/inventario/${car.id || car.vin || 'auto'}`;
                              const url = new URL(baseUrl);
                              url.searchParams.set('utm_source', utmParams.source);
                              url.searchParams.set('utm_medium', utmParams.medium);
                              url.searchParams.set('utm_campaign', utmParams.campaign);
                              if (utmParams.term) url.searchParams.set('utm_term', utmParams.term);
                              if (utmParams.content) url.searchParams.set('utm_content', utmParams.content);
                              return url.toString();
                            })()}
                          </p>
                        </div>
                      </div>
  );
}
