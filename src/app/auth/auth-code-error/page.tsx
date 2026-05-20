'use client';

import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1118] p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-black text-white">Error de Autenticación</h1>
        <p className="text-slate-400 text-sm">
          Ocurrió un error al procesar tu solicitud. El enlace puede haber expirado o ser inválido.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm transition-all"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
