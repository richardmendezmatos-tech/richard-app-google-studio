'use client';

import { useState, useCallback } from 'react';
import { Share2, MessageCircle, Link, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
  onShare?: (method: string) => void;
}

export function ShareButton({ title, url, description, onShare }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} — ${description || ''}`);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        onShare?.('native');
      } catch {
        // user cancelled
      }
    }
    setOpen(false);
  }, [title, description, url, onShare]);

  const handleWhatsApp = useCallback(() => {
    window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
    onShare?.('whatsapp');
    setOpen(false);
  }, [encodedText, encodedUrl, onShare]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.('copy');
    } catch {
      // clipboard unavailable
    }
  }, [url, onShare]);

  const FacebookIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );

  const XIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: handleWhatsApp,
      hoverClass: 'hover:bg-green-500/10 text-green-400',
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      href: `https://facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverClass: 'hover:bg-blue-500/10 text-blue-400',
    },
    {
      name: 'X',
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      hoverClass: 'hover:bg-white/10 text-white',
    },
  ];

  // Mobile: WhatsApp as default action
  if (isMobile && !navigator.share) {
    return (
      <button
        onClick={handleWhatsApp}
        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-full text-sm text-green-400 transition-all backdrop-blur-sm border border-green-500/20"
        aria-label="Compartir en WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Compartir</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white transition-all backdrop-blur-sm border border-white/10"
        aria-label="Compartir"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Compartir</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 min-w-[200px] backdrop-blur-xl">
            {typeof navigator.share !== 'undefined' && (
              <button
                onClick={handleNativeShare}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                Compartir en...
              </button>
            )}

            {shareLinks.map((link) =>
              link.action ? (
                <button
                  key={link.name}
                  onClick={link.action}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-300 rounded-lg transition ${link.hoverClass}`}
                >
                  <link.icon />
                  {link.name}
                </button>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { setOpen(false); onShare?.(link.name.toLowerCase()); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-300 rounded-lg transition ${link.hoverClass}`}
                >
                  <link.icon />
                  {link.name}
                </a>
              ),
            )}

            <div className="h-px bg-white/5 my-1" />

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Link className="w-4 h-4 text-slate-400" />
              )}
              {copied ? '¡Enlace copiado!' : 'Copiar enlace'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
