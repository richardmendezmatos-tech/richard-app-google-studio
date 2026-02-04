import React from 'react';

const ChaosTest: React.FC = () => {
    const [explode, setExplode] = React.useState(false);

    if (explode) {
        throw new Error("PRUEBA DE PROTOCOLO DE ERROR: Fallo inducido manualmente.");
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-4xl font-black mb-8 text-red-500">ZONA DE PELIGRO</h1>
            <p className="mb-8 text-slate-400">Esta prueba verificará si el sistema de seguridad (Brand Shield) está activo.</p>
            <button
                onClick={() => setExplode(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all transform hover:scale-110 active:scale-95 text-xl tracking-widest"
            >
                ⚠️ DETONAR NÚCLEO
            </button>
        </div>
    );
};

export default ChaosTest;
