import React from 'react';
import { Lead, Car } from '@/types/types';

interface DealSheetProps {
    lead: Lead;
    car?: Car;
}

const DealSheet = React.forwardRef<HTMLDivElement, DealSheetProps>(({ lead, car }, ref) => {
    const dateStr = new Date().toLocaleDateString('es-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div ref={ref} className="p-12 max-w-[210mm] mx-auto bg-white text-slate-900 print:p-0">
            {/* Header */}
            <header className="flex justify-between items-end border-b-4 border-[#00aed9] pb-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-[#00aed9] font-black text-sm uppercase tracking-[0.2em] mb-2">
                        Richard Automotive
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                        Hoja de <span className="text-[#00aed9]">Trato</span>
                    </h1>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fecha</div>
                    <div className="text-xl font-bold">{dateStr}</div>
                </div>
            </header>

            {/* Customer & Vehicle Info Grid */}
            <div className="grid grid-cols-2 gap-12 mb-10">
                {/* Customer Info */}
                <div className="space-y-4">
                    <div className="uppercase tracking-widest text-xs font-black text-slate-400 border-b border-slate-200 pb-2 mb-4">
                        Información del Cliente
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Nombre</div>
                        <div className="text-lg font-bold">{lead.firstName} {lead.lastName}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Email</div>
                        <div className="text-lg font-bold">{lead.email || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Teléfono</div>
                        <div className="text-lg font-bold">{lead.phone || 'N/A'}</div>
                    </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-4">
                    <div className="uppercase tracking-widest text-xs font-black text-slate-400 border-b border-slate-200 pb-2 mb-4">
                        Vehículo de Interés
                    </div>
                    {car ? (
                        <>
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold">Unidad</div>
                                <div className="text-xl font-black text-[#173d57]">{car.year || '2024'} {car.name}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-slate-400 uppercase font-bold">Precio Lista</div>
                                    <div className="text-lg font-bold">${car.price.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 uppercase font-bold">Categoría</div>
                                    <div className="text-lg font-bold capitalize">{car.type}</div>
                                </div>
                            </div>
                            {car.img && (
                                <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden h-32 w-full">
                                    <img src={car.img} alt={car.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-xl text-slate-400 italic">
                            Vehículo no identificado en inventario ({lead.vehicleOfInterest || 'Desconocido'})
                        </div>
                    )}
                </div>
            </div>

            {/* Financial Breakdown (Mockup Structure) */}
            <div className="bg-slate-50 p-8 rounded-[30px] border border-slate-200 mb-12">
                <div className="uppercase tracking-widest text-xs font-black text-slate-400 mb-6">
                    Propuesta Económica
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-slate-600">Precio de Venta</span>
                        <span className="font-bold">${car ? car.price.toLocaleString() : '0.00'}</span>
                    </div>

                    {lead.type === 'trade-in' && (
                        <div className="flex justify-between items-center text-lg text-emerald-600">
                            <span className="font-bold flex items-center gap-2">Trade-In (Estimado)</span>
                            <span className="font-bold">Originalidad Pendiente</span>
                        </div>
                    )}

                    <div className="border-t border-slate-200 my-4"></div>

                    <div className="flex justify-between items-center text-2xl font-black text-[#173d57]">
                        <span>Balance Total</span>
                        <span>${car ? car.price.toLocaleString() : '0.00'}*</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">
                        * No incluye impuestos, registro ni seguros. Sujeto a aprobación de crédito.
                    </p>
                </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-20 mt-20">
                <div className="border-t-2 border-slate-300 pt-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Firma del Cliente</div>
                    <div className="h-10"></div>
                </div>
                <div className="border-t-2 border-slate-300 pt-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Firma del Gerente</div>
                    <div className="h-10"></div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-20 pt-8 border-t border-slate-100 text-center text-[10px] text-slate-300 uppercase tracking-widest">
                Generado por Richard Automotive Command Center • {dateStr}
            </footer>
        </div>
    );
});

export default DealSheet;
