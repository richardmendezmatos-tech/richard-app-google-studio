import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, BrainCircuit, DollarSign, Zap, Shield, Clock } from 'lucide-react';
import OptimizedImage from '@/components/common/OptimizedImage';

interface HeroSectionProps {
    onNeuralMatch: () => void;
    onBrowseInventory: () => void;
    onSellCar: () => void;
}

const HEADLINES = [
    {
        eyebrow: 'Showroom en Vivo',
        line1: 'CONDUCE',
        line2: 'LO MEJOR',
        accent: 'DE PR',
        sub: 'Inventario curado con IA. Financiamiento inteligente. El estándar de oro en movilidad.',
    },
    {
        eyebrow: 'Colección Curada',
        line1: 'SEÑAL',
        line2: 'SOBRE',
        accent: 'RUIDO',
        sub: 'Precio, estado y contexto en una lectura rápida para comprar con ventaja real.',
    },
    {
        eyebrow: 'Trade‑In Elite',
        line1: 'MEJORA',
        line2: 'SIN',
        accent: 'FRICCIÓN',
        sub: 'Valora tu vehículo, compara y cierra en una experiencia premium de principio a fin.',
    },
];

const TICKER_ITEMS = [
    '⚡ Financiamiento desde 4.9% APR',
    '🛡 Garantía certificada incluida',
    '🔁 Trade-In digital en 90 segundos',
    '📍 San Juan, Puerto Rico',
    '🤖 Richard AI disponible 24/7',
    '✅ Sin costos ocultos',
];

const HeroSection: React.FC<HeroSectionProps> = ({ onNeuralMatch, onBrowseInventory, onSellCar }) => {
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    const [tickerPos, setTickerPos] = useState(0);
    const tickerRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number>(0);

    /* ── Headline carousel ── */
    useEffect(() => {
        const iv = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIdx(p => (p + 1) % HEADLINES.length);
                setVisible(true);
            }, 450);
        }, 6500);
        return () => clearInterval(iv);
    }, []);

    /* ── Continuous ticker ── */
    useEffect(() => {
        let pos = 0;
        const speed = 0.45;
        const step = () => {
            if (tickerRef.current) {
                const w = tickerRef.current.scrollWidth / 2;
                pos -= speed;
                if (pos <= -w) pos = 0;
                tickerRef.current.style.transform = `translateX(${pos}px)`;
            }
            animFrameRef.current = requestAnimationFrame(step);
        };
        animFrameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, []);

    const h = HEADLINES[idx];

    return (
        <section className="ra-hero">
            {/* ── Background ── */}
            <div className="ra-hero__bg">
                <OptimizedImage
                    src="/hyundai-kona-hero.avif"
                    alt="Richard Automotive Hero"
                    className="ra-hero__img"
                    priority
                />
                <div className="ra-hero__overlay" />
                <div className="ra-hero__vignette" />

                {/* Decorative grid lines */}
                <div className="ra-hero__grid-line ra-hero__grid-line--v1" />
                <div className="ra-hero__grid-line ra-hero__grid-line--v2" />
                <div className="ra-hero__grid-line ra-hero__grid-line--h1" />

                {/* Glowing orbs */}
                <div className="ra-hero__orb ra-hero__orb--tl" />
                <div className="ra-hero__orb ra-hero__orb--br" />

                {/* Animated speed lines */}
                <div className="ra-hero__speedlines">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="ra-hero__speedline" style={{ '--delay': `${i * 0.4}s`, '--top': `${10 + i * 10}%` } as React.CSSProperties} />
                    ))}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="ra-hero__content">
                {/* Left: Typography */}
                <div className="ra-hero__left">
                    {/* Live badge */}
                    <div className="ra-hero__badge">
                        <span className="ra-hero__badge-dot" />
                        <span>LIVE SHOWROOM</span>
                        <span className="ra-hero__badge-sep">·</span>
                        <span className="ra-hero__badge-eyebrow">{h.eyebrow}</span>
                    </div>

                    {/* Headline */}
                    <div className={`ra-hero__headline ${visible ? 'ra-hero__headline--in' : 'ra-hero__headline--out'}`}>
                        <span className="ra-hero__line ra-hero__line--1">{h.line1}</span>
                        <span className="ra-hero__line ra-hero__line--2">{h.line2}</span>
                        <span className="ra-hero__line ra-hero__line--accent">{h.accent}</span>
                    </div>

                    <p className={`ra-hero__sub ${visible ? 'ra-hero__sub--in' : 'ra-hero__sub--out'}`}>
                        {h.sub}
                    </p>

                    {/* Trust pills */}
                    <div className="ra-hero__pills">
                        <span className="ra-hero__pill"><Shield size={11} /> Certified</span>
                        <span className="ra-hero__pill"><Clock size={11} /> Aprobación Rápida</span>
                        <span className="ra-hero__pill"><Zap size={11} /> 0 Costo Oculto</span>
                    </div>
                </div>

                {/* Right: CTA panel */}
                <div className="ra-hero__right">
                    <div className="ra-hero__panel">
                        {/* Panel header */}
                        <div className="ra-hero__panel-header">
                            <div className="ra-hero__panel-status">
                                <span className="ra-hero__panel-dot" />
                                <span>Sistema Activo</span>
                            </div>
                            <span className="ra-hero__panel-label">Richard IA</span>
                        </div>

                        {/* CTA buttons */}
                        <button onClick={onBrowseInventory} className="ra-cta ra-cta--primary">
                            <div className="ra-cta__shine" />
                            <div className="ra-cta__text">
                                <span className="ra-cta__tag">Live Showroom</span>
                                <span className="ra-cta__label">VER INVENTARIO</span>
                            </div>
                            <div className="ra-cta__icon">
                                <ArrowRight size={18} />
                            </div>
                        </button>

                        <button onClick={onNeuralMatch} className="ra-cta ra-cta--secondary">
                            <div className="ra-cta__text">
                                <span className="ra-cta__tag">Inteligencia Artificial</span>
                                <span className="ra-cta__label">NEURAL MATCH</span>
                            </div>
                            <div className="ra-cta__icon ra-cta__icon--cyan">
                                <BrainCircuit size={18} />
                            </div>
                        </button>

                        <button onClick={onSellCar} className="ra-cta ra-cta--tertiary">
                            <div className="ra-cta__text">
                                <span className="ra-cta__tag">Trade‑In / Vender</span>
                                <span className="ra-cta__label">TASAR MI AUTO</span>
                            </div>
                            <div className="ra-cta__icon ra-cta__icon--green">
                                <DollarSign size={18} />
                            </div>
                        </button>

                        {/* Stat bar */}
                        <div className="ra-hero__stats">
                            <div className="ra-hero__stat">
                                <span className="ra-hero__stat-num">240+</span>
                                <span className="ra-hero__stat-lbl">Unidades</span>
                            </div>
                            <div className="ra-hero__stat-div" />
                            <div className="ra-hero__stat">
                                <span className="ra-hero__stat-num">98%</span>
                                <span className="ra-hero__stat-lbl">Aprobados</span>
                            </div>
                            <div className="ra-hero__stat-div" />
                            <div className="ra-hero__stat">
                                <span className="ra-hero__stat-num">24/7</span>
                                <span className="ra-hero__stat-lbl">IA Activa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom ticker ── */}
            <div className="ra-hero__ticker-wrap" aria-hidden>
                <div className="ra-hero__ticker-inner" ref={tickerRef}>
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span key={i} className="ra-hero__ticker-item">{item}</span>
                    ))}
                </div>
            </div>

            {/* ── Embedded styles ── */}
            <style>{`
                /* === HERO SECTION === */
                .ra-hero {
                    position: relative;
                    min-height: 92vh;
                    width: 100%;
                    overflow: hidden;
                    background: #03060c;
                    display: flex;
                    flex-direction: column;
                }

                /* --- Background --- */
                .ra-hero__bg { position: absolute; inset: 0; z-index: 0; }
                .ra-hero__img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    object-position: center 30%;
                    opacity: 0.28;
                    transform: scale(1.08);
                }
                .ra-hero__overlay {
                    position: absolute; inset: 0;
                    background:
                        radial-gradient(ellipse 70% 60% at 80% 20%, rgba(0,180,220,0.18), transparent 60%),
                        radial-gradient(ellipse 60% 50% at 10% 80%, rgba(0,80,120,0.15), transparent 55%),
                        linear-gradient(175deg, rgba(3,6,12,0.1) 0%, rgba(3,6,12,0.98) 78%);
                }
                .ra-hero__vignette {
                    position: absolute; inset: 0;
                    background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(2,5,10,0.85) 100%);
                }

                /* Grid lines */
                .ra-hero__grid-line {
                    position: absolute;
                    background: linear-gradient(to bottom, transparent, rgba(0,200,240,0.12) 40%, rgba(0,200,240,0.12) 60%, transparent);
                }
                .ra-hero__grid-line--v1 { top: 0; bottom: 0; left: 60%; width: 1px; }
                .ra-hero__grid-line--v2 { top: 0; bottom: 0; right: 18%; width: 1px; opacity: 0.4; }
                .ra-hero__grid-line--h1 {
                    left: 0; right: 0; top: 62%; height: 1px;
                    background: linear-gradient(to right, transparent, rgba(0,200,240,0.08) 20%, rgba(0,200,240,0.08) 80%, transparent);
                }

                /* Orbs */
                .ra-hero__orb {
                    position: absolute; border-radius: 50%;
                    filter: blur(80px); pointer-events: none;
                }
                .ra-hero__orb--tl {
                    top: -80px; left: -80px;
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(0,174,217,0.22) 0%, transparent 70%);
                    animation: orb-pulse 8s ease-in-out infinite;
                }
                .ra-hero__orb--br {
                    bottom: -100px; right: 200px;
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(0,100,180,0.14) 0%, transparent 70%);
                    animation: orb-pulse 11s ease-in-out infinite reverse;
                }
                @keyframes orb-pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.15); opacity: 0.7; }
                }

                /* Speed lines */
                .ra-hero__speedlines {
                    position: absolute; inset: 0; overflow: hidden; pointer-events: none;
                }
                .ra-hero__speedline {
                    position: absolute;
                    left: -10%; right: 50%;
                    top: var(--top);
                    height: 1px;
                    background: linear-gradient(to right, transparent, rgba(0,200,240,0.35), transparent);
                    animation: speedline 4s ease-out infinite;
                    animation-delay: var(--delay);
                    transform-origin: left center;
                }
                @keyframes speedline {
                    0% { opacity: 0; transform: scaleX(0); }
                    30% { opacity: 1; transform: scaleX(1); }
                    100% { opacity: 0; transform: scaleX(1) translateX(60%); }
                }

                /* --- Content layout --- */
                .ra-hero__content {
                    position: relative; z-index: 10;
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    max-width: 1400px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 5.5rem 1.25rem 6rem;
                }
                @media (min-width: 1024px) {
                    .ra-hero__content {
                        grid-template-columns: 1.15fr 0.85fr;
                        align-items: end;
                        padding: 7rem 3rem 7.5rem;
                        gap: 3rem;
                    }
                }

                /* --- Left: Typography --- */
                .ra-hero__left { display: flex; flex-direction: column; gap: 1.5rem; }

                /* Badge */
                .ra-hero__badge {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    padding: 0.375rem 1.1rem;
                    border: 1px solid rgba(0,200,240,0.25);
                    border-radius: 50px;
                    background: rgba(0,20,35,0.6);
                    backdrop-filter: blur(12px);
                    font-size: 0.625rem;
                    font-weight: 700;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(200,240,255,0.8);
                    width: fit-content;
                    animation: badge-in 0.8s cubic-bezier(0.16,1,0.3,1) both;
                }
                .ra-hero__badge-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #00d4ff;
                    box-shadow: 0 0 8px #00d4ff;
                    animation: blink 2s ease-in-out infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                .ra-hero__badge-sep { opacity: 0.4; }
                .ra-hero__badge-eyebrow { color: #00d4ff; }
                @keyframes badge-in {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Headline */
                .ra-hero__headline {
                    display: flex; flex-direction: column;
                    line-height: 0.88;
                    transition: opacity 0.4s ease, transform 0.4s ease;
                }
                .ra-hero__headline--in { opacity: 1; transform: translateY(0); }
                .ra-hero__headline--out { opacity: 0; transform: translateY(-16px); }

                .ra-hero__line {
                    display: block;
                    font-family: 'Bebas Neue', 'Arial Black', sans-serif;
                    font-weight: 900;
                    letter-spacing: 0.02em;
                    color: #fff;
                    text-shadow: 0 0 80px rgba(0,174,217,0.3);
                    font-size: clamp(3.5rem, 10vw, 9rem);
                    animation: line-in 0.7s cubic-bezier(0.16,1,0.3,1) both;
                }
                .ra-hero__line--2 { animation-delay: 0.07s; }
                .ra-hero__line--accent {
                    animation-delay: 0.14s;
                    color: transparent;
                    -webkit-text-stroke: 2px rgba(0,210,255,0.75);
                }
                @keyframes line-in {
                    from { opacity: 0; transform: translateX(-24px) skewX(-4deg); }
                    to { opacity: 1; transform: translateX(0) skewX(0deg); }
                }

                /* Sub */
                .ra-hero__sub {
                    font-size: clamp(0.95rem, 1.6vw, 1.15rem);
                    line-height: 1.6;
                    color: rgba(200,220,235,0.78);
                    max-width: 560px;
                    transition: opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s;
                }
                .ra-hero__sub--in { opacity: 1; transform: translateY(0); }
                .ra-hero__sub--out { opacity: 0; transform: translateY(8px); }

                /* Pills */
                .ra-hero__pills {
                    display: flex; flex-wrap: wrap; gap: 0.5rem;
                    animation: pills-in 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s both;
                }
                .ra-hero__pill {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    padding: 0.35rem 0.9rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 50px;
                    background: rgba(255,255,255,0.04);
                    font-size: 0.625rem;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: rgba(180,210,230,0.7);
                }
                @keyframes pills-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* --- Right: Panel --- */
                .ra-hero__right {
                    animation: panel-in 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s both;
                }
                @keyframes panel-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .ra-hero__panel {
                    border: 1px solid rgba(0,200,240,0.15);
                    border-radius: 1.75rem;
                    background: linear-gradient(160deg, rgba(5,14,25,0.95), rgba(3,8,16,0.92));
                    backdrop-filter: blur(28px);
                    padding: 1rem;
                    box-shadow: 0 40px 80px -20px rgba(0,120,200,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }

                /* Panel header */
                .ra-hero__panel-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(255,255,255,0.07);
                    background: rgba(0,0,0,0.3);
                    margin-bottom: 0.25rem;
                }
                .ra-hero__panel-status {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-size: 0.625rem; font-weight: 700;
                    letter-spacing: 0.2em; text-transform: uppercase;
                    color: #34d399;
                }
                .ra-hero__panel-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #34d399; box-shadow: 0 0 8px #34d399;
                    animation: blink 1.8s ease-in-out infinite;
                }
                .ra-hero__panel-label {
                    font-size: 0.625rem; font-weight: 700;
                    letter-spacing: 0.24em; text-transform: uppercase;
                    color: rgba(0,200,240,0.6);
                }

                /* CTA buttons */
                .ra-cta {
                    position: relative; overflow: hidden;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 1.1rem 1.25rem;
                    border-radius: 1.25rem;
                    border: none; cursor: pointer;
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                    text-align: left;
                }
                .ra-cta:hover { transform: translateY(-2px); }
                .ra-cta:active { transform: scale(0.98); }

                .ra-cta--primary {
                    background: linear-gradient(130deg, #00b4d8 0%, #0077a8 100%);
                    box-shadow: 0 12px 32px -8px rgba(0,180,216,0.55);
                    color: #fff;
                }
                .ra-cta--primary:hover { box-shadow: 0 18px 40px -8px rgba(0,180,216,0.7); }

                .ra-cta--secondary {
                    background: rgba(0,30,50,0.8);
                    border: 1px solid rgba(0,200,240,0.2);
                    color: #fff;
                }
                .ra-cta--secondary:hover { background: rgba(0,40,65,0.9); border-color: rgba(0,200,240,0.4); }

                .ra-cta--tertiary {
                    background: rgba(6,35,20,0.8);
                    border: 1px solid rgba(52,211,153,0.2);
                    color: #fff;
                }
                .ra-cta--tertiary:hover { background: rgba(6,45,25,0.9); border-color: rgba(52,211,153,0.4); }

                /* Shine overlay for primary */
                .ra-cta__shine {
                    position: absolute; top: 0; left: -75%;
                    width: 50%; height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
                    transform: skewX(-20deg);
                    animation: shine 4s ease-in-out infinite 1s;
                }
                @keyframes shine {
                    0%, 85%, 100% { left: -75%; }
                    50% { left: 125%; }
                }

                .ra-cta__text { display: flex; flex-direction: column; gap: 0.2rem; position: relative; }
                .ra-cta__tag {
                    font-size: 0.6rem; font-weight: 700;
                    letter-spacing: 0.22em; text-transform: uppercase;
                    opacity: 0.65;
                }
                .ra-cta--primary .ra-cta__tag { color: rgba(200,240,255,0.9); }
                .ra-cta--secondary .ra-cta__tag { color: #00d4ff; }
                .ra-cta--tertiary .ra-cta__tag { color: #34d399; }

                .ra-cta__label {
                    font-family: 'Bebas Neue', 'Arial Black', sans-serif;
                    font-size: 1.4rem;
                    letter-spacing: 0.06em;
                    line-height: 1;
                }

                .ra-cta__icon {
                    display: flex; align-items: center; justify-content: center;
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    flex-shrink: 0;
                    position: relative;
                }
                .ra-cta__icon--cyan { background: rgba(0,200,240,0.15); color: #00d4ff; }
                .ra-cta__icon--green { background: rgba(52,211,153,0.15); color: #34d399; }

                /* Stats bar */
                .ra-hero__stats {
                    display: flex; align-items: center; justify-content: space-around;
                    padding: 0.75rem 0.5rem 0.25rem;
                }
                .ra-hero__stat { text-align: center; }
                .ra-hero__stat-num {
                    display: block;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.5rem; letter-spacing: 0.04em;
                    color: #fff;
                    line-height: 1;
                }
                .ra-hero__stat-lbl {
                    display: block;
                    font-size: 0.575rem; font-weight: 700;
                    letter-spacing: 0.18em; text-transform: uppercase;
                    color: rgba(150,200,220,0.5);
                    margin-top: 0.2rem;
                }
                .ra-hero__stat-div {
                    width: 1px; height: 28px;
                    background: rgba(255,255,255,0.08);
                }

                /* --- Ticker --- */
                .ra-hero__ticker-wrap {
                    position: relative; z-index: 10;
                    overflow: hidden;
                    border-top: 1px solid rgba(255,255,255,0.07);
                    background: rgba(0,0,0,0.45);
                    backdrop-filter: blur(12px);
                    padding: 0.5rem 0;
                }
                .ra-hero__ticker-inner {
                    display: flex; align-items: center;
                    gap: 2.5rem;
                    white-space: nowrap;
                    will-change: transform;
                    padding: 0.2rem 0;
                }
                .ra-hero__ticker-item {
                    font-size: 0.65rem; font-weight: 700;
                    letter-spacing: 0.18em; text-transform: uppercase;
                    color: rgba(160,210,230,0.65);
                    flex-shrink: 0;
                }
                .ra-hero__ticker-item:nth-child(odd) { color: rgba(0,210,255,0.55); }
            `}</style>
        </section>
    );
};

export default HeroSection;
