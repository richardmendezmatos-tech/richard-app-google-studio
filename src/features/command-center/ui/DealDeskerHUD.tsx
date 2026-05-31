// DealDeskerHUD Component (Admin Panel)
// Capa: Features - Slice: command-center - UI
// Creado: 2026-05-24
// Aesthetics: Sleek Dark Glassmorphism, Harmoneous Neon accents (emerald, amber, violet)

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Save,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Award,
  AlertTriangle,
  User,
  Car,
  Loader2,
  CheckCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  Percent
} from 'lucide-react';
import { supabase } from '@/shared/api/supabase/supabase';
import { DealApi } from '@/entities/deal/api/dealApi';
import { calculateFIDeal, getSuggestedAPR, getResidualPercentage } from '@/features/deal-desker/lib/fiCalculator';
import { FIAdvisor, FIAdvisorAnalysis } from '@/features/deal-desker/api/fiAdvisor';
import { CreditTier, BankRate, BankName } from '@/entities/deal/model/types';

export const DealDeskerHUD: React.FC = () => {
  // State del Inventario, Leads y Tasas de Bancos reales de Supabase
  const [leads, setLeads] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [bankRates, setBankRates] = useState<BankRate[]>([]);
  
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<BankName>('popular');

  // Parámetros Financieros
  const [vehiclePrice, setVehiclePrice] = useState<number>(35000);
  const [vehicleCost, setVehicleCost] = useState<number>(29500);
  const [downPayment, setDownPayment] = useState<number>(3000);
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [tradeInPayoff, setTradeInPayoff] = useState<number>(0);
  const [term, setTerm] = useState<number>(72);
  const [creditTier, setCreditTier] = useState<CreditTier>('tier_2');
  const [apr, setApr] = useState<number>(7.45);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(3500);
  const [structureType, setStructureType] = useState<'conventional' | 'leasing'>('leasing');

  // Coberturas F&I
  const [gapInsurance, setGapInsurance] = useState<boolean>(false);
  const [extendedWarranty, setExtendedWarranty] = useState<boolean>(false);
  const [powerPack, setPowerPack] = useState<boolean>(false);
  const [diamondCeramic, setDiamondCeramic] = useState<boolean>(false);

  // Estados de IA y Guardado
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<FIAdvisorAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Cargar Leads, Inventario y Tasas de Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: dbLeads } = await supabase
          .from('leads')
          .select('id, first_name, last_name, phone, email')
          .order('created_at', { ascending: false })
          .limit(20);
        
        const { data: dbInventory } = await supabase
          .from('inventory')
          .select('vin, make, model, year, price, condition')
          .eq('status', 'AVAILABLE')
          .limit(20);

        const { data: dbRates } = await supabase
          .from('bank_rates')
          .select('*');

        if (dbLeads) {
          // Mapear first_name/last_name a 'name' para compatibilidad retroactiva
          const mappedLeads = dbLeads.map(l => ({
            id: l.id,
            name: `${l.first_name || ''} ${l.last_name || ''}`.trim() || l.email,
            phone: l.phone,
            email: l.email
          }));
          setLeads(mappedLeads);
        }
        if (dbInventory) setInventory(dbInventory);
        if (dbRates) setBankRates(dbRates);
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
      }
    }
    fetchData();
  }, []);

  // Actualizar el APR sugerido cuando cambia el Tier o el Plazo
  useEffect(() => {
    const suggestedApr = getSuggestedAPR(creditTier, term);
    setApr(suggestedApr);
  }, [creditTier, term]);

  // Si se selecciona un vehículo, actualizar el precio de venta sugerido
  useEffect(() => {
    if (selectedCarId) {
      const car = inventory.find(c => c.vin === selectedCarId);
      if (car) {
        setVehiclePrice(Number(car.price) || 35000);
        setVehicleCost(Math.round((Number(car.price) || 35000) * 0.85)); // Estimado de costo
      }
    }
  }, [selectedCarId, inventory]);

  // Lógica Matemática F&I en tiempo real
  const currentCar = inventory.find(c => c.vin === selectedCarId);
  const calculation = calculateFIDeal({
    vehiclePrice,
    vehicleCost,
    downPayment,
    tradeInValue,
    tradeInPayoff,
    term,
    apr,
    gapInsuranceEnabled: gapInsurance,
    extendedWarrantyEnabled: extendedWarranty,
    powerPackEnabled: powerPack,
    diamondCeramicEnabled: diamondCeramic,
    vehicleYear: currentCar?.year || 2024,
    vehicleCondition: (currentCar?.condition?.toLowerCase() === 'new' ? 'new' : 'used'),
    creditTier,
    bankRates,
    structureType,
    selectedBank
  });

  // Si cambia el banco seleccionado, adoptamos su tasa máxima recomendada para que el APR coincida
  const handleSelectBankCard = (bankName: BankName, bankSellRate: number) => {
    setSelectedBank(bankName);
    setApr(bankSellRate);
  };

  // Invocar al Sentinel F&I Advisor (Gemini 2.0-flash)
  const handleConsultSentinel = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await FIAdvisor.analyzeDeal({
        make: currentCar?.make || 'Ford',
        model: currentCar?.model || 'Explorer',
        year: currentCar?.year || 2024,
        price: vehiclePrice,
        mileage: 15,
        creditTier,
        downPayment,
        tradeInValue,
        tradeInPayoff,
        term,
        apr,
        ltv: calculation.ltv,
        estimatedMonthlyPayment: calculation.monthlyPayment,
        gapInsuranceEnabled: gapInsurance,
        extendedWarrantyEnabled: extendedWarranty,
        powerPackEnabled: powerPack,
        diamondCeramicEnabled: diamondCeramic,
        monthlyIncome,
        structureType,
        residualValue: calculation.residualValue,
        bankComparisons: calculation.bankComparisons
      });
      setAnalysis(result);
    } catch (err) {
      console.error('Error calling Sentinel advisor:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Guardar Deal en la Base de Datos Supabase
  const handleSaveDeal = async () => {
    if (!selectedLeadId) {
      alert('⚠️ Por favor selecciona un lead de la lista antes de guardar.');
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await DealApi.createDeal({
        leadId: selectedLeadId,
        inventoryId: selectedCarId || null,
        creditTier,
        downPayment,
        tradeInValue,
        tradeInPayoff,
        term: term as any,
        apr,
        ltv: calculation.ltv,
        estimatedMonthlyPayment: calculation.monthlyPayment,
        frontEndProfit: calculation.frontEndProfit,
        backEndProfit: calculation.backEndProfit,
        bankSelected: selectedBank === 'popular' ? 'Banco Popular de PR' : selectedBank === 'firstbank' ? 'FirstBank PR' : 'Oriental Bank',
        status: 'structured',
        structureType,
        residualValue: calculation.residualValue
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`❌ Error al guardar el Deal: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Encontrar la mejor tasa cliente y el mayor reserve spread profit en la lista
  const bestRateValue = calculation.bankComparisons ? Math.min(...calculation.bankComparisons.map(b => b.sellRate)) : 0;
  const bestReserveValue = calculation.bankComparisons ? Math.max(...calculation.bankComparisons.map(b => b.reserveProfit)) : 0;

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-900 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-900 pb-6">
        <div>
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest bg-violet-950/60 px-3 py-1 rounded-full border border-violet-900/50">
            Sentinel F&I Cockpit (Nivel 13 - Multi-Banco)
          </span>
          <h1 className="text-2xl font-black text-slate-100 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Calculator className="text-violet-400" /> DealDesker HUD
          </h1>
          <p className="text-xs text-slate-400">
            Estructuración de préstamos, optimización de spreads de reserva y cotizador comparativo para Puerto Rico.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleSaveDeal}
            disabled={isSaving || !selectedLeadId}
            className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {saveSuccess ? '¡Guardado!' : 'Guardar en Supabase'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo: Sliders de Entrada */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Asignación de Lead y Auto */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <User size={12} className="text-violet-400" /> Seleccionar Lead (Cliente)
              </label>
              <select
                title="Lead selector"
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="">-- Selecciona un prospecto --</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.phone ? `(${l.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <Car size={12} className="text-violet-400" /> Seleccionar Unidad del Inventario
              </label>
              <select
                title="Car selector"
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="">-- Selecciona una unidad --</option>
                {inventory.map(c => (
                  <option key={c.vin} value={c.vin}>
                    {c.year} {c.make} {c.model} - ${Number(c.price)?.toLocaleString()} ({c.condition || 'USED'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cuadro 1: Variables Financieras */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-900/60 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-violet-400 mb-1">
              Estructuración del Negocio
            </h3>

            {/* Selector de Estructura de Negocio: Leasing vs Convencional */}
            <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 flex gap-2">
              <button
                type="button"
                onClick={() => setStructureType('leasing')}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  structureType === 'leasing'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Sparkles size={12} className={structureType === 'leasing' ? 'animate-pulse text-violet-200' : 'text-slate-500'} />
                <span>Leasing (Mayoría Ford)</span>
              </button>
              <button
                type="button"
                onClick={() => setStructureType('conventional')}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  structureType === 'conventional'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Layers size={12} className={structureType === 'conventional' ? 'text-violet-200' : 'text-slate-500'} />
                <span>Convencional</span>
              </button>
            </div>

             {structureType === 'leasing' && (
              <div className="bg-violet-950/30 border border-violet-900/50 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="text-violet-400 shrink-0 mt-0.5 animate-pulse" size={14} />
                <p className="text-[10px] text-violet-300 leading-normal font-semibold">
                  <span className="font-bold text-violet-200 uppercase tracking-wide">Preferencia Ford en PR:</span> La gran mayoría de los negocios Ford se cierran en <span className="text-violet-100 font-bold underline">Leasing</span> para cuotas súper bajas. Matriz residual de Oriental Bank/American autocalibrada.
                </p>
              </div>
            )}

            {structureType === 'leasing' && vehiclePrice < 35000 && (
              <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle className="text-amber-400 shrink-0 mt-0.5 animate-pulse" size={14} />
                <p className="text-[10px] text-amber-300 leading-normal font-semibold">
                  <span className="font-bold text-amber-200 uppercase tracking-wide">Límite de Residual ($35k):</span> Esta unidad cuesta <span className="font-bold text-amber-100">${vehiclePrice.toLocaleString()}</span>. Solo vehículos de $35,000.00 o más califican para residual en leasing. El residual se ha fijado en $0.
                </p>
              </div>
            )}

            {structureType === 'leasing' && term > 66 && (
              <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle className="text-rose-400 shrink-0 mt-0.5 animate-bounce" size={14} />
                <p className="text-[10px] text-rose-300 leading-normal font-semibold">
                  <span className="font-bold text-rose-200 uppercase tracking-wide">Plazo Excedido (Máx 66m):</span> Has seleccionado {term} meses. El tiempo máximo a financiar en leasing son 66 meses. La cuota se calculará automáticamente a 66 meses.
                </p>
              </div>
            )}

            {/* Precio de Venta */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Precio de Venta Negociado</span>
                <span className="text-violet-400">${vehiclePrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={10000}
                max={150000}
                step={500}
                title="Precio de Venta"
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>

            {/* Pronto Pago */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Pronto Pago (Down Payment)</span>
                <span className="text-emerald-400">${downPayment.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={500}
                title="Pronto Pago"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Trade-in */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Valor de Trade-in</span>
                  <span className="text-slate-200">${tradeInValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40000}
                  step={500}
                  title="Valor Trade-in"
                  value={tradeInValue}
                  onChange={(e) => setTradeInValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-slate-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Deuda de Trade-in</span>
                  <span className="text-rose-400">${tradeInPayoff.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40000}
                  step={500}
                  title="Deuda Trade-in"
                  value={tradeInPayoff}
                  onChange={(e) => setTradeInPayoff(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            {/* Términos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Plazo (Meses)</label>
                <select
                  title="Plazo"
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-violet-500"
                >
                  {[36, 48, 60, 72, 84].map(t => (
                    <option key={t} value={t}>{t} Meses</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Tier de Crédito</label>
                <select
                  title="Credit tier"
                  value={creditTier}
                  onChange={(e) => setCreditTier(e.target.value as CreditTier)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-violet-500"
                >
                  <option value="tier_1">Tier 1 (740+ Excelente)</option>
                  <option value="tier_2">Tier 2 (700-739 Bueno)</option>
                  <option value="tier_3">Tier 3 (640-699 Regular)</option>
                  <option value="tier_4">Tier 4 (&lt;640 Subprime)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Ingresos Mensuales</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-xs font-bold">$</span>
                  <input
                    type="number"
                    title="Ingreso mensual"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-6 pr-3 py-2 text-xs font-bold focus:outline-none focus:border-violet-500 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Ajuste de APR del Cliente (Sell Rate) */}
            <div className="space-y-2 pt-2 border-t border-slate-800/50">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400 flex items-center gap-1">
                  <Percent size={12} className="text-violet-400" /> Tasa Ofrecida al Cliente (Sell Rate APR)
                </span>
                <span className="text-violet-400">{apr}%</span>
              </div>
              <input
                type="range"
                min={3.95}
                max={24.95}
                step={0.05}
                title="Tasa de Interés"
                value={apr}
                onChange={(e) => setApr(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <span className="text-[9px] text-slate-500 block leading-normal">
                Modifica este slider para ajustar la tasa ofrecida al cliente y ver el cambio en el pago mensual y en el Reserve Profit (comisión por spread) de cada banco.
              </span>
            </div>
          </div>

          {/* Matriz Comparativa de Bancos de Puerto Rico */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-900 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
              <Layers size={14} /> Comparativa de Bancos en Puerto Rico
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {calculation.bankComparisons?.map((option) => {
                const isSelected = selectedBank === option.bankName;
                const isBestRate = option.sellRate === bestRateValue;
                const isBestReserve = option.reserveProfit === bestReserveValue && option.reserveProfit > 0;

                return (
                  <div
                    key={option.bankName}
                    onClick={() => handleSelectBankCard(option.bankName, option.sellRate)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-violet-500/70 shadow-lg shadow-violet-950/20 scale-[1.02]'
                        : 'bg-slate-950/70 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    {/* Indicadores de Ventajas */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {isBestRate && (
                        <span className="text-[8px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded">
                          Tasa
                        </span>
                      )}
                      {isBestReserve && (
                        <span className="text-[8px] font-black uppercase bg-amber-950 text-amber-400 border border-amber-900 px-1.5 py-0.5 rounded">
                          $ F&I
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-black text-slate-100 uppercase tracking-wider block">
                        {option.bankName === 'popular' ? 'Banco Popular' : option.bankName === 'firstbank' ? 'FirstBank PR' : 'Oriental Bank'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">
                        T1 {(currentCar?.condition || 'USED').toUpperCase()} ({term}m)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-medium text-slate-400">
                        <span>Buy Rate:</span>
                        <span className="font-bold text-slate-200">{option.buyRate}%</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-400">
                        <span>Sell Rate:</span>
                        <span className="font-bold text-violet-400">{option.sellRate}%</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-400">
                        <span>Pago Cuota:</span>
                        <span className="font-black text-emerald-400">${option.monthlyPayment}/mes</span>
                      </div>
                      {option.residualValue !== undefined && (
                        <div className="flex justify-between text-[11px] font-medium text-slate-400 border-t border-slate-900 pt-1 mt-1">
                          <span className="text-violet-400">Residual ({getResidualPercentage(term)}%):</span>
                          <span className="font-bold text-violet-300">${option.residualValue.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900/60 flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">F&I Reserve</span>
                      <span className="text-xs font-black text-amber-500">${option.reserveProfit.toLocaleString()}</span>
                    </div>

                    <div className="pt-1 flex items-center justify-center text-[10px] font-black uppercase tracking-wider text-slate-400 border-t border-slate-800/40">
                      {isSelected ? (
                        <span className="text-violet-400 flex items-center gap-1.5">
                          <CheckCircle size={10} /> Banco Seleccionado
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1.5 group hover:text-slate-300">
                          Seleccionar <ArrowRight size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cuadro 2: Coberturas Back-End */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contrato de Servicio VIP */}
            <div
              onClick={() => setExtendedWarranty(!extendedWarranty)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                extendedWarranty
                  ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/20 scale-[1.01]'
                  : 'bg-slate-900/40 border-slate-900/60 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <span className="text-xs font-black text-slate-200 block">👑 Contrato de Servicio VIP</span>
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wide">Garantía Premier (Motor, Trans)</span>
              </div>
              <span className={`text-xs font-black ${extendedWarranty ? 'text-amber-500' : 'text-slate-500'}`}>
                {extendedWarranty ? '+$4,216 (Añadido)' : 'NO APLICADO'}
              </span>
            </div>
            
            {/* Seguro GAP Total */}
            <div
              onClick={() => setGapInsurance(!gapInsurance)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                gapInsurance
                  ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-950/20 scale-[1.01]'
                  : 'bg-slate-900/40 border-slate-900/60 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <span className="text-xs font-black text-slate-200 block">🛡️ Cobertura GAP Total</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide">Protección de Pérdida Total</span>
              </div>
              <span className={`text-xs font-black ${gapInsurance ? 'text-emerald-500' : 'text-slate-500'}`}>
                {gapInsurance ? `+$${(term === 84 ? 898 : term === 72 ? 798 : 998).toLocaleString()} (Añadido)` : 'NO APLICADO'}
              </span>
            </div>

            {/* Power Pack */}
            <div
              onClick={() => setPowerPack(!powerPack)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                powerPack
                  ? 'bg-violet-950/20 border-violet-500/60 shadow-lg shadow-violet-950/20 scale-[1.01]'
                  : 'bg-slate-900/40 border-slate-900/60 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <span className="text-xs font-black text-slate-200 block">⚡ Power Pack Avanzado</span>
                <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wide">Asistencia & Coberturas Extra</span>
              </div>
              <span className={`text-xs font-black ${powerPack ? 'text-violet-500' : 'text-slate-500'}`}>
                {powerPack ? '+$895 (Añadido)' : 'NO APLICADO'}
              </span>
            </div>

            {/* Diamond Ceramic */}
            <div
              onClick={() => setDiamondCeramic(!diamondCeramic)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                diamondCeramic
                  ? 'bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/20 scale-[1.01]'
                  : 'bg-slate-900/40 border-slate-900/60 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <span className="text-xs font-black text-slate-200 block">✨ Diamond Ceramic Coat</span>
                <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-wide">Protección de Pintura Premium</span>
              </div>
              <span className={`text-xs font-black ${diamondCeramic ? 'text-cyan-500' : 'text-slate-500'}`}>
                {diamondCeramic ? '+$995 (Añadido)' : 'NO APLICADO'}
              </span>
            </div>
          </div>

        </div>

        {/* Lado Derecho: HUD de Resultados Financieros & AI Advisor */}
        <div className="space-y-6">
          
          {/* Card Principal: Cuota Mensual & OTD */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02]">
              <TrendingUp size={200} />
            </div>

            <div className="relative z-10 space-y-4">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">
                Cierre todo incluido
              </span>
              <div>
                <div className="flex items-start text-white gap-0.5">
                  <span className="text-xl font-bold opacity-40 mt-1">$</span>
                  <span className="text-6xl font-black tracking-tighter text-emerald-400">
                    {calculation.monthlyPayment}
                  </span>
                  <span className="text-xs text-slate-400 self-end mb-2">/mes</span>
                </div>
                <span className="text-[9px] text-slate-500 font-bold block mt-1 uppercase">
                  (Banco: {selectedBank.toUpperCase()}, APR: {apr}%, Plazo: {term} meses)
                </span>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Monto Financiado</span>
                  <span className="font-bold text-slate-200">${calculation.amountFinanced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Gastos de Registro (Pago Aparte en Dealer)</span>
                  <span className="font-bold text-amber-500">$244.00</span>
                </div>
                {structureType === 'leasing' && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Cargo de Originación (Financiado Obligatorio)</span>
                    <span className="font-bold text-violet-400">
                      ${(selectedBank === 'popular' ? 895 : selectedBank === 'firstbank' ? 995 : 895).toLocaleString()}
                    </span>
                  </div>
                )}
                {structureType === 'leasing' && calculation.residualValue !== undefined && (
                  <div className="flex justify-between text-xs border-t border-slate-850 pt-2 text-violet-400 font-bold">
                    <span>Valor Residual ({getResidualPercentage(term)}%)</span>
                    <span className="text-violet-300">${calculation.residualValue.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-400 font-medium">LTV (Riesgo del Banco)</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                    calculation.ltv > 129 ? 'bg-rose-950/60 text-rose-400 border border-rose-900/50' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
                  }`}>
                    {calculation.ltv}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* F&I Profit HUD */}
          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-900/80 space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
              F&I Profit Margin (Utilidades)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Front-End Profit</span>
                <span className="text-sm font-black text-violet-400">${calculation.frontEndProfit.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Back-End (GAP/Gar)</span>
                <span className="text-sm font-black text-amber-500">${calculation.backEndProfit.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Reserve profit del banco actualmente seleccionado */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900/80 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400">Spread Reserve Profit ({selectedBank.toUpperCase()})</span>
              <span className="text-sm font-black text-violet-400">
                +${(calculation.bankComparisons?.find(b => b.bankName === selectedBank)?.reserveProfit || 0).toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900/80 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400">Total Profit (Front + Back + F&I)</span>
              <span className="text-base font-black text-emerald-400">
                ${(
                  calculation.frontEndProfit + 
                  calculation.backEndProfit + 
                  (calculation.bankComparisons?.find(b => b.bankName === selectedBank)?.reserveProfit || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Panel Sentinel AI F&I Advisor */}
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-900 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-pulse" /> Richard Advisor
                </span>
                <button
                  onClick={handleConsultSentinel}
                  disabled={isAnalyzing}
                  className="px-2.5 py-1 bg-violet-950 hover:bg-violet-900 text-violet-300 text-[10px] font-black uppercase rounded-lg border border-violet-900/50 transition-colors disabled:opacity-40"
                >
                  {isAnalyzing ? 'Analizando...' : 'Consultar'}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-6 space-y-2.5"
                  >
                    <Loader2 className="animate-spin text-violet-400" size={32} />
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black animate-pulse">
                      Evaluando Tiers crediticios de PR...
                    </span>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3.5"
                  >
                    {/* Probabilidad */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Probabilidad Aprobación</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        analysis.approvalProbability === 'high' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                        analysis.approvalProbability === 'medium' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                        'bg-rose-950 text-rose-400 border border-rose-900'
                      }`}>
                        {analysis.approvalProbability === 'high' ? 'Alta' :
                         analysis.approvalProbability === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>

                    {/* Bancos */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Bancos Recomendados</span>
                      <span className="font-bold text-slate-200 text-right text-[10px] leading-tight">
                        {analysis.bankRecommendations.join(', ')}
                      </span>
                    </div>

                    {/* Reasoning */}
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-950 font-medium">
                      {analysis.reasoning}
                    </p>

                    {/* Sugerencias */}
                    {analysis.tacticalSuggestions.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-950">
                        <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider">Sugerencias Tácticas</span>
                        {analysis.tacticalSuggestions.map((s, idx) => (
                          <div key={idx} className="text-[10px] text-rose-400 font-bold flex items-start gap-1">
                            <span className="text-rose-500 shrink-0">•</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 space-y-2">
                    <HelpCircle size={32} className="opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                      Presiona "Consultar" para activar el Sentinel F&I Advisor y analizar este negocio con Gemini.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
