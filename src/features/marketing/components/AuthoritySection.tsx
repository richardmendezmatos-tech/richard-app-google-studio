import React from 'react';
import { ShieldCheck, TrendingUp, Award, CheckCircle2, ArrowRight, Star } from 'lucide-react';

const CREDENTIALS = [
    { icon: <ShieldCheck size={15} />, label: 'Protección Total', desc: 'Programas de crédito protegidos y seguros certificados.' },
    { icon: <TrendingUp size={15} />, label: 'Optimización de Tasa', desc: 'Estructuramos tu perfil para capturar el APR más bajo.' },
    { icon: <Award size={15} />, label: 'Experto Certificado', desc: 'Líder en la industria automotriz bilingüe en la isla.' },
    { icon: <CheckCircle2 size={15} />, label: 'Aprobación Ágil', desc: 'Conexión directa con la banca local y federal.' },
];

const STATS = [
    { num: '10k+', lbl: 'Ventas Cerradas' },
    { num: '15+', lbl: 'Años Expertiz' },
    { num: '98%', lbl: 'Aprobaciones' },
];

export const AuthoritySection: React.FC = () => {
    return (
        <section className="ra-authority reveal-up">
            {/* ── Left: Text ── */}
            <div className="ra-authority__left">
                <div className="ra-authority__eyebrow">
                    <span className="ra-authority__eyebrow-dot" />
                    El Estándar de Oro en F&amp;I — Puerto Rico
                </div>

                <h2 className="ra-authority__headline">
                    Asesoría que{' '}
                    <em className="ra-authority__headline-em">Acelera</em>
                    <br />Tu Aprobación
                </h2>

                <p className="ra-authority__body">
                    Richard Méndez no solo gestiona préstamos; estructura negocios que los bancos respetan. Con más de una década liderando el sector de F&amp;I en Puerto Rico, su firma es sinónimo de transparencia y resultados.
                </p>

                <div className="ra-authority__grid">
                    {CREDENTIALS.map((c) => (
                        <div key={c.label} className="ra-authority__item">
                            <div className="ra-authority__item-icon">{c.icon}</div>
                            <div>
                                <p className="ra-authority__item-title">{c.label}</p>
                                <p className="ra-authority__item-desc">{c.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="ra-authority__cta">
                    Agendar Consulta Directa
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* ── Right: Portrait card ── */}
            <div className="ra-authority__right">
                {/* Glow blob */}
                <div className="ra-authority__glow" />

                <div className="ra-authority__card">
                    {/* Large portrait */}
                    <div className="ra-authority__portrait-wrap">
                        <img
                            src="/assets/images/richard_real.jpg"
                            alt="Richard Méndez, Founder & F&I Specialist"
                            className="ra-authority__portrait-img"
                            loading="lazy"
                        />
                        {/* gradient overlay */}
                        <div className="ra-authority__portrait-overlay" />

                        {/* Floating badge: verified */}
                        <div className="ra-authority__badge-verified">
                            <ShieldCheck size={12} />
                            <span>Verified Expert</span>
                        </div>

                        {/* Floating stars */}
                        <div className="ra-authority__badge-stars">
                            {[...Array(5)].map((_, i) => <Star key={i} size={10} className="ra-authority__star" />)}
                            <span>5.0</span>
                        </div>
                    </div>

                    {/* Name / title */}
                    <div className="ra-authority__identity">
                        <p className="ra-authority__name">Richard Méndez</p>
                        <p className="ra-authority__title">Founder &amp; F&amp;I Specialist</p>
                    </div>

                    {/* Stats row */}
                    <div className="ra-authority__stats">
                        {STATS.map((s, i) => (
                            <React.Fragment key={s.lbl}>
                                <div className="ra-authority__stat">
                                    <span className="ra-authority__stat-num">{s.num}</span>
                                    <span className="ra-authority__stat-lbl">{s.lbl}</span>
                                </div>
                                {i < STATS.length - 1 && <div className="ra-authority__stat-div" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Embedded styles ── */}
            <style>{`
                /* === AUTHORITY SECTION === */
                .ra-authority {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 3rem;
                    align-items: center;
                }
                @media (min-width: 1024px) {
                    .ra-authority {
                        grid-template-columns: 1fr 1fr;
                        gap: 5rem;
                    }
                }

                /* --- Left --- */
                .ra-authority__left {
                    display: flex; flex-direction: column; gap: 1.75rem;
                }

                .ra-authority__eyebrow {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    font-size: 0.65rem; font-weight: 800;
                    letter-spacing: 0.26em; text-transform: uppercase;
                    color: #00d4ff;
                }
                .ra-authority__eyebrow-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #00d4ff;
                    box-shadow: 0 0 8px #00d4ff;
                    flex-shrink: 0;
                }

                .ra-authority__headline {
                    font-family: 'Bebas Neue', 'Arial Black', sans-serif;
                    font-size: clamp(2.8rem, 5.5vw, 5rem);
                    line-height: 0.95;
                    letter-spacing: 0.01em;
                    color: #fff;
                    margin: 0;
                }
                .ra-authority__headline-em {
                    font-style: normal;
                    color: transparent;
                    -webkit-text-stroke: 2px rgba(0, 210, 255, 0.8);
                }

                .ra-authority__body {
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: rgba(200, 220, 235, 0.75);
                    max-width: 520px;
                }

                /* Benefit grid */
                .ra-authority__grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }
                .ra-authority__item {
                    display: flex; gap: 0.75rem; align-items: flex-start;
                }
                .ra-authority__item-icon {
                    display: flex; align-items: center; justify-content: center;
                    width: 32px; height: 32px; border-radius: 8px;
                    background: rgba(0, 200, 240, 0.1);
                    border: 1px solid rgba(0, 200, 240, 0.2);
                    color: #00d4ff;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .ra-authority__item-title {
                    font-size: 0.78rem; font-weight: 700;
                    letter-spacing: 0.06em; text-transform: uppercase;
                    color: #fff;
                    margin: 0 0 0.2rem;
                }
                .ra-authority__item-desc {
                    font-size: 0.72rem;
                    line-height: 1.55;
                    color: rgba(160, 200, 220, 0.65);
                    margin: 0;
                }

                /* CTA */
                .ra-authority__cta {
                    display: inline-flex; align-items: center; gap: 0.6rem;
                    padding: 0.9rem 2rem;
                    border-radius: 50px;
                    background: linear-gradient(130deg, #00b4d8, #0077a8);
                    color: #fff;
                    font-weight: 800;
                    font-size: 0.8rem;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    border: none; cursor: pointer;
                    box-shadow: 0 12px 32px -8px rgba(0, 180, 216, 0.5);
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                    width: fit-content;
                }
                .ra-authority__cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 18px 40px -8px rgba(0, 180, 216, 0.65);
                }

                /* --- Right: portrait card --- */
                .ra-authority__right {
                    position: relative;
                }
                .ra-authority__glow {
                    position: absolute;
                    inset: -40px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(0, 174, 217, 0.18) 0%, transparent 70%);
                    filter: blur(40px);
                    pointer-events: none;
                    z-index: 0;
                }

                .ra-authority__card {
                    position: relative; z-index: 1;
                    border: 1px solid rgba(0, 200, 240, 0.15);
                    border-radius: 2rem;
                    background: linear-gradient(160deg, rgba(6, 16, 28, 0.95), rgba(3, 8, 16, 0.9));
                    backdrop-filter: blur(24px);
                    overflow: hidden;
                    box-shadow:
                        0 40px 80px -20px rgba(0, 100, 180, 0.4),
                        inset 0 1px 0 rgba(255,255,255,0.06);
                    transition: transform 0.35s ease, box-shadow 0.35s ease;
                }
                .ra-authority__card:hover {
                    transform: translateY(-4px);
                    box-shadow:
                        0 55px 100px -20px rgba(0, 120, 200, 0.5),
                        inset 0 1px 0 rgba(255,255,255,0.08);
                }

                /* Portrait */
                .ra-authority__portrait-wrap {
                    position: relative;
                    aspect-ratio: 4/3;
                    overflow: hidden;
                }
                .ra-authority__portrait-img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    object-position: center top;
                    transition: transform 0.6s ease;
                }
                .ra-authority__card:hover .ra-authority__portrait-img {
                    transform: scale(1.04);
                }
                .ra-authority__portrait-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(
                        to bottom,
                        transparent 30%,
                        rgba(3, 8, 16, 0.6) 70%,
                        rgba(3, 8, 16, 0.98) 100%
                    );
                }

                /* Floating badges */
                .ra-authority__badge-verified {
                    position: absolute; top: 1rem; left: 1rem;
                    display: flex; align-items: center; gap: 0.35rem;
                    padding: 0.35rem 0.8rem;
                    border-radius: 50px;
                    background: rgba(0, 0, 0, 0.55);
                    border: 1px solid rgba(52, 211, 153, 0.4);
                    backdrop-filter: blur(10px);
                    font-size: 0.6rem; font-weight: 700;
                    letter-spacing: 0.16em; text-transform: uppercase;
                    color: #34d399;
                }
                .ra-authority__badge-stars {
                    position: absolute; top: 1rem; right: 1rem;
                    display: flex; align-items: center; gap: 0.2rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 50px;
                    background: rgba(0, 0, 0, 0.55);
                    border: 1px solid rgba(251, 191, 36, 0.3);
                    backdrop-filter: blur(10px);
                    font-size: 0.65rem; font-weight: 800;
                    color: #fbbf24;
                }
                .ra-authority__star { color: #fbbf24; fill: #fbbf24; }

                /* Identity */
                .ra-authority__identity {
                    padding: 1.5rem 1.5rem 0;
                    text-align: center;
                }
                .ra-authority__name {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 2rem;
                    letter-spacing: 0.04em;
                    color: #fff;
                    margin: 0;
                    line-height: 1;
                }
                .ra-authority__title {
                    font-size: 0.62rem; font-weight: 700;
                    letter-spacing: 0.24em; text-transform: uppercase;
                    color: #00d4ff;
                    margin: 0.4rem 0 0;
                }

                /* Stats */
                .ra-authority__stats {
                    display: flex; align-items: center;
                    justify-content: space-around;
                    padding: 1.25rem 1.5rem 1.5rem;
                    margin-top: 1rem;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }
                .ra-authority__stat { text-align: center; }
                .ra-authority__stat-num {
                    display: block;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.8rem;
                    letter-spacing: 0.03em;
                    color: #fff;
                    line-height: 1;
                }
                .ra-authority__stat-lbl {
                    display: block;
                    font-size: 0.55rem; font-weight: 700;
                    letter-spacing: 0.18em; text-transform: uppercase;
                    color: rgba(150, 200, 220, 0.5);
                    margin-top: 0.25rem;
                }
                .ra-authority__stat-div {
                    width: 1px; height: 32px;
                    background: rgba(255,255,255,0.07);
                }
            `}</style>
        </section>
    );
};
