'use client';

import React, { useState } from 'react';
import { Star, Loader2, Zap } from 'lucide-react';
import { localSEOAgent } from '@/features/marketing/application/LocalSEOAgent';
import { type GBPReview, defaultReviews } from './sentinelReviewsTypes';

interface Props {
  reviews: GBPReview[];
  gbpConnected: boolean;
}

/**
 * Tab de reseñas GBP extraído de SentinelLocalSEO.
 * Gestiona su propio estado de respuestas propuestas/publicadas.
 */
export function SentinelReviewsTab({ reviews, gbpConnected }: Props) {
  const [isReplying, setIsReplying] = useState<string | null>(null);
  const [reviewReplies, setReviewReplies] = useState<Record<string, string>>({});

  const proposeReply = async (review: GBPReview) => {
    setIsReplying(review.id);
    try {
      const reply = await localSEOAgent.generateReviewReply(review.text, review.stars, review.name);
      setReviewReplies((prev) => ({ ...prev, [review.id]: reply }));
    } catch {
      console.error('Reply generation failed');
    } finally {
      setIsReplying(null);
    }
  };

  const handlePostReply = async (reviewId: string) => {
    const replyText = reviewReplies[reviewId];
    if (!replyText) return;
    try {
      const res = await fetch(`/api/gbp/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      });
      if (res.ok) {
        setReviewReplies((prev) => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
      }
    } catch {
      console.error('Failed to post reply');
    }
  };

  return (
    <div className="space-y-3">
      {(reviews.length > 0 ? reviews : defaultReviews).map((review, i) => (
        <div
          key={review.id || i}
          className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 transition-all hover:bg-white/10"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400">
                {review.name[0]}
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {review.name}
              </span>
            </div>
            <div className="flex text-amber-500 gap-0.5">
              {[...Array(5)].map((_, s) => (
                <Star
                  key={s}
                  size={8}
                  fill={s < review.stars ? 'currentColor' : 'none'}
                  stroke="currentColor"
                />
              ))}
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-medium italic">"{review.text}"</p>

          {reviewReplies[review.id] ? (
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-2 animate-in fade-in zoom-in-95 duration-300">
              <p className="text-[9px] text-primary-200 leading-relaxed font-medium">
                {reviewReplies[review.id]}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setReviewReplies((prev) => {
                      const next = { ...prev };
                      delete next[review.id];
                      return next;
                    })
                  }
                  className="flex-1 py-1.5 bg-slate-800 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handlePostReply(review.id)}
                  className="flex-1 py-1.5 bg-primary text-black text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all"
                >
                  {gbpConnected ? 'Publicar en Google' : 'Guardar Respuesta'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => proposeReply(review)}
              disabled={isReplying === review.id}
              className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-primary text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2"
            >
              {isReplying === review.id ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Zap size={10} />
              )}
              Proponer Respuesta IA
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
