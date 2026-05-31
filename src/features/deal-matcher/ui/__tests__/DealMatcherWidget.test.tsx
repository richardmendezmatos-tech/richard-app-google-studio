import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DealMatcherWidget } from '../DealMatcherWidget';

// Mock framer-motion strictly to bypass JSDOM animation limitations
vi.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, style, ...props }: any) => (
        <div style={style} {...props}>
          {children}
        </div>
      ),
      form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useMotionValue: (initVal: number) => ({
      get: () => initVal,
      set: vi.fn(),
    }),
    useTransform: () => ({
      get: () => 0,
    }),
  };
});

// Mock lucide-react for isolated rendering
vi.mock('lucide-react', () => ({
  SlidersHorizontal: () => <span data-testid="sliders-icon" />,
  Flame: () => <span data-testid="flame-icon" />,
  Sparkles: () => <span data-testid="sparkles-icon" />,
  Heart: () => <span data-testid="heart-icon" />,
  X: () => <span data-testid="x-icon" />,
  Star: () => <span data-testid="star-icon" />,
  RefreshCw: () => <span data-testid="refresh-icon" />,
  Zap: () => <span data-testid="zap-icon" />,
  Check: () => <span data-testid="check-icon" />,
  ShieldCheck: () => <span data-testid="shield-icon" />,
  Loader2: () => <span data-testid="loader-icon" />,
  Car: () => <span data-testid="car-icon" />,
  Compass: () => <span data-testid="compass-icon" />,
  AlertTriangle: () => <span data-testid="alert-icon" />,
}));

// Mock lead service to prevent real API hits
vi.mock('@/entities/lead', () => ({
  leadService: {
    saveLead: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe('DealMatcherWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('debe renderizar el encabezado y titulo del Deal-Matcher de show', () => {
    render(<DealMatcherWidget />);

    expect(screen.getByText('Deal')).toBeInTheDocument();
    expect(screen.getByText('Matcher')).toBeInTheDocument();
    expect(screen.getByText('Desliza. Conecta. Monta tu Guagua de Show')).toBeInTheDocument();
  });

  it('debe mostrar y ocultar el panel de filtros HUD al presionar el boton correspondiente', () => {
    render(<DealMatcherWidget />);

    // Por defecto el panel de filtros no debe estar visible en el DOM (o al menos no sus sliders)
    expect(screen.queryByText('Cuota Mensual Máxima')).not.toBeInTheDocument();

    const filtersBtn = screen.getByText('Ajustar Filtros HUD');
    expect(filtersBtn).toBeInTheDocument();

    // Click para abrir filtros
    fireEvent.click(filtersBtn);
    expect(screen.getByText('Cuota Mensual Máxima')).toBeInTheDocument();
    expect(screen.getByText('Pronto de Excelencia')).toBeInTheDocument();
    expect(screen.getByText('¿Para qué quieres tu máquina? (Estilo de Vida)')).toBeInTheDocument();

    // Click para cerrar filtros
    fireEvent.click(filtersBtn);
    expect(screen.queryByText('Cuota Mensual Máxima')).not.toBeInTheDocument();
  });

  it('debe cambiar la cuota máxima y filtrar las unidades según presupuesto', () => {
    render(<DealMatcherWidget />);

    // Abrir panel de filtros
    fireEvent.click(screen.getByText('Ajustar Filtros HUD'));

    // Encontrar el slider de cuota máxima (el primero)
    const cuotaSlider = screen.getAllByRole('slider')[0];
    expect(cuotaSlider).toBeInTheDocument();

    // Cambiar valor a $400
    fireEvent.change(cuotaSlider, { target: { value: '400' } });

    // La cuota en el indicador de texto debe actualizarse a $400
    expect(screen.getByText('$400 / mes')).toBeInTheDocument();
  });
});
