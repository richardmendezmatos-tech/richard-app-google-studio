'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Car } from '@/entities/inventory';

interface Props {
  car: Car | null;
}

/**
 * Campos básicos del formulario de vehículo (nombre, marca, modelo, año,
 * kilometraje, precio, badge, categoría, características) extraídos de
 * CommandCenterModal. Inputs no controlados — el padre los lee vía FormData
 * en el submit, así que este componente solo necesita `car` para los defaults.
 */
export function VehicleBasicInfoFields({ car }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
            Nombre de la Unidad
          </label>
          <input
            name="name"
            defaultValue={car?.name}
            required
            className="w-full h-[56px] px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 transition-all text-slate-800 dark:text-white"
            placeholder="Ej. Toyota Corolla GR"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
              Marca (Make)
            </label>
            <input
              name="make"
              defaultValue={car?.make}
              required
              className="w-full h-[56px] px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 transition-all text-slate-800 dark:text-white"
              placeholder="Ej. Toyota"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
              Modelo (Model)
            </label>
            <input
              name="model"
              defaultValue={car?.model}
              required
              className="w-full h-[56px] px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 transition-all text-slate-800 dark:text-white"
              placeholder="Ej. Corolla"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
              Año (Year)
            </label>
            <input
              name="year"
              type="number"
              defaultValue={car?.year}
              required
              className="w-full h-[56px] px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 transition-all text-slate-800 dark:text-white"
              placeholder="2024"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
              Kilometraje (Mileage)
            </label>
            <input
              name="mileage"
              type="number"
              defaultValue={car?.mileage}
              required
              className="w-full h-[56px] px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 transition-all text-slate-800 dark:text-white"
              placeholder="0"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
              Precio (USD)
            </label>
            <input
              name="price"
              type="number"
              defaultValue={car?.price}
              required
              className="w-full h-[56px] px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 transition-all text-slate-800 dark:text-white"
              placeholder="25000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
              Etiqueta (Badge)
            </label>
            <input
              name="badge"
              defaultValue={car?.badge}
              className="w-full h-[56px] px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 transition-all text-slate-800 dark:text-white"
              placeholder="Ej. Recién Llegado"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
            Categoría
          </label>
          <div className="relative">
            <select
              name="type"
              defaultValue={car?.type || 'suv'}
              aria-label="Tipo de vehículo"
              className="w-full h-[56px] px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 transition-all text-slate-800 dark:text-white appearance-none"
            >
              <option value="suv">🚙 SUV / Crossover</option>
              <option value="sedan">🚗 Sedan / Coupe</option>
              <option value="pickup">🛻 Pickup / Truck</option>
              <option value="luxury">💎 Luxury / Sport</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <X size={16} className="rotate-45" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
            Características (Separadas por coma)
          </label>
          <input
            name="features"
            defaultValue={car?.features?.join(', ')}
            className="w-full h-[56px] px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 transition-all text-slate-800 dark:text-white"
            placeholder="GPS, Cuero, Techo Panorámico..."
          />
        </div>
      </div>
    </>
  );
}
