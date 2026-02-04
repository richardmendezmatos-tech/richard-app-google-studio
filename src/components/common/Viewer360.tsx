import React, { useState, useEffect, useRef } from 'react';
import { Rotate3D, Maximize2, MousePointer2, Smartphone, ZoomIn } from 'lucide-react';

interface Props {
    images: string[];
    alt: string;
    badge?: string;
    onFullscreen?: () => void;
}

const Viewer360: React.FC<Props> = ({ images, alt, badge, onFullscreen }) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [activeMode, setActiveMode] = useState<'360' | 'cinematic'>(images.length > 1 ? '360' : 'cinematic');
    const containerRef = useRef<HTMLDivElement>(null);
    const [hintVisible, setHintVisible] = useState(true);

    // 360 Rotation Logic
    const handleStart = (clientX: number) => {
        if (activeMode !== '360') return;
        setIsDragging(true);
        setStartX(clientX);
        setHintVisible(false);
    };

    const handleMove = (clientX: number) => {
        if (!isDragging || activeMode !== '360') return;
        const delta = clientX - startX;
        const sensitivity = 5; // Pixels per frame

        if (Math.abs(delta) > sensitivity) {
            const framesToAdvance = Math.floor(delta / sensitivity);
            const totalFrames = images.length;

            setStartX(clientX); // Reset start to prevent speed ramping

            setCurrentFrame(prev => {
                let next = prev - framesToAdvance; // Drag left = rotate right
                if (next < 0) next = totalFrames - 1;
                if (next >= totalFrames) next = 0;
                return next;
            });
        }
    };

    const handleEnd = () => setIsDragging(false);

    // Cinematic Parallax Effect (for single image)
    const [parallax, setParallax] = useState({ x: 0, y: 0 });
    const handleCinematicMove = (e: React.MouseEvent) => {
        if (activeMode !== 'cinematic' || !containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setParallax({ x: x * 20, y: y * 20 }); // 20px shift
        setHintVisible(false);
    };

    const handleCinematicLeave = () => {
        setParallax({ x: 0, y: 0 });
    };

    // Auto-hide hint after 3s
    useEffect(() => {
        const timer = setTimeout(() => setHintVisible(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            ref={containerRef}
            className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 rounded-[40px] shadow-2xl relative overflow-hidden group select-none cursor-grab active:cursor-grabbing border border-white/10"
            onMouseDown={e => handleStart(e.clientX)}
            onMouseMove={e => activeMode === '360' ? handleMove(e.clientX) : handleCinematicMove(e)}
            onMouseUp={handleEnd}
            onMouseLeave={() => { handleEnd(); handleCinematicLeave(); }}
            onTouchStart={e => handleStart(e.touches[0].clientX)}
            onTouchMove={e => handleMove(e.touches[0].clientX)}
            onTouchEnd={handleEnd}
        >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
                {badge && (
                    <span className="bg-[#00aed9] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg animate-in slide-in-from-left">
                        {badge}
                    </span>
                )}
                {activeMode === '360' ? (
                    <span className="bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit border border-white/10">
                        <Rotate3D size={12} className="text-[#00aed9]" /> 360° Interactive
                    </span>
                ) : (
                    <span className="bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit border border-white/10">
                        <ZoomIn size={12} className="text-[#00aed9]" /> AI Enhanced
                    </span>
                )}
            </div>

            {/* Main Image Layer */}
            <div
                className={`w-full h-full flex items-center justify-center transition-transform duration-100 ease-out`}
                style={activeMode === 'cinematic' ? { transform: `scale(1.1) translate(${parallax.x}px, ${parallax.y}px)` } : {}}
            >
                <img
                    src={images[currentFrame]}
                    alt={alt}
                    className={`max-w-full max-h-full object-contain drop-shadow-2xl transition-opacity duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    draggable={false}
                />
            </div>

            {/* Floor Reflection/Shadow */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-black/40 blur-xl rounded-[100%] pointer-events-none z-0"></div>

            {/* Hints Overlay */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-700 ${hintVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-3 animate-pulse">
                    {activeMode === '360' ? (
                        <>
                            <MousePointer2 size={20} className="text-[#00aed9]" />
                            <span className="font-bold text-sm uppercase tracking-widest">Arrastra para girar</span>
                        </>
                    ) : (
                        <>
                            <Smartphone size={20} className="text-[#00aed9]" />
                            <span className="font-bold text-sm uppercase tracking-widest">Mueve para explorar</span>
                        </>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                <button
                    onClick={onFullscreen}
                    className="p-3 bg-white/10 hover:bg-[#00aed9] backdrop-blur-md rounded-full text-white transition-all border border-white/10 hover:scale-110 active:scale-95"
                    title="Pantalla Completa"
                >
                    <Maximize2 size={20} />
                </button>
            </div>

            {/* Progress Indicator (for 360) */}
            {activeMode === '360' && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm pointer-events-none">
                    <div
                        className="h-full bg-[#00aed9] transition-all duration-75"
                        style={{ width: `${((currentFrame + 1) / images.length) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export default Viewer360;
