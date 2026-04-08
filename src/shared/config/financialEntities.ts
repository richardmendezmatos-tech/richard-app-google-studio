/**
 * Configuration for Puerto Rico Banks and Cooperatives.
 * Priority: Major Banks (Popular/FirstBank) for floorplan control and process speed.
 * Cooperatives are kept as a last resort.
 */

export interface FinancialEntity {
  id: string;
  name: string;
  type: 'coop' | 'bank';
  baseRate: number; // Estimated base APR
  description: string;
  tier: 1 | 2 | 3; // 1 = Highest Priority
}

export const FINANCIAL_ENTITIES_PR: FinancialEntity[] = [
  {
    id: 'coop-vega-alta',
    name: 'Cooperativa de Vega Alta',
    type: 'coop',
    baseRate: 4.89,
    description: 'Opción secundaria para socios existentes (Proceso lento).',
    tier: 3
  },
  {
    id: 'coop-zeno-gandia',
    name: 'Cooperativa Zeno Gandía',
    type: 'coop',
    baseRate: 4.95,
    description: 'Opción externa (Último recurso).',
    tier: 3
  },
  {
    id: 'coop-cipeg',
    name: 'Cooperativa CIPEG',
    type: 'coop',
    baseRate: 5.25,
    description: 'Alternativa sólida para financiamiento de autos.',
    tier: 2
  },
  {
    id: 'banco-popular',
    name: 'Banco Popular de PR',
    type: 'bank',
    baseRate: 6.95,
    description: 'Socio prioritario (Floorplan). Aprobación inmediata y control total.',
    tier: 1
  },
  {
    id: 'oriental-bank',
    name: 'Oriental Bank',
    type: 'bank',
    baseRate: 7.25,
    description: 'Especialistas en financiamiento de autos y seguros.',
    tier: 2
  },
  {
    id: 'first-bank',
    name: 'FirstBank PR',
    type: 'bank',
    baseRate: 7.15,
    description: 'Socio prioritario. Excelente servicio y rapidez en cierre.',
    tier: 1
  },
  {
    id: 'penfed',
    name: 'PenFed Credit Union',
    type: 'bank',
    baseRate: 5.49,
    description: 'Alternativa rápida para militares.',
    tier: 2
  }
];

export const getPreferredEntity = (type: 'coop' | 'bank' = 'coop') => {
  return FINANCIAL_ENTITIES_PR
    .filter(e => e.type === type)
    .sort((a, b) => a.baseRate - b.baseRate)[0];
};
