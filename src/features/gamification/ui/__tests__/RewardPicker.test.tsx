import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RewardPicker } from '../RewardPicker';
import { useGamificationStore } from '../../model/useGamificationStore';

// Mock framer-motion strictly to bypass JSDOM animation limitations
vi.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    useAnimation: () => ({
      start: vi.fn().mockResolvedValue({}),
    }),
  };
});

// Mock lucide-react for isolated rendering
vi.mock('lucide-react', () => ({
  Gift: () => <span data-testid="gift-icon" />,
  Key: () => <span data-testid="key-icon" />,
  Timer: () => <span data-testid="timer-icon" />,
  Sparkles: () => <span data-testid="sparkles-icon" />,
  Check: () => <span data-testid="check-icon" />,
  Info: () => <span data-testid="info-icon" />,
  ShieldAlert: () => <span data-testid="shield-alert-icon" />,
}));

describe('RewardPicker Component', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    useGamificationStore.getState().resetGamification();
    mockOnComplete.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('debe renderizar el selector de regalos y sus elementos visuales correctamente', () => {
    render(<RewardPicker onComplete={mockOnComplete} />);

    // Verificar presencia de títulos y copys
    expect(screen.getByText('Tus Regalos Exclusivos')).toBeInTheDocument();
    expect(screen.getByText('Tintes de Cerámica Premium')).toBeInTheDocument();
    expect(screen.getByText('Tratamiento Cerámico de Pintura N24')).toBeInTheDocument();
    expect(screen.getByText('Alfombras Todo Clima Originales')).toBeInTheDocument();
    expect(screen.getByText('Seguro de Vida Richard Protection (1er Año)')).toBeInTheDocument();

    // El temporizador de urgencia no debe estar activo al inicio (se activa tras el giro de ruleta)
    expect(screen.queryByText('Reserva Temporal Activa')).not.toBeInTheDocument();
  });

  it('debe permitir la selección de regalos respetando el máximo de 2 elementos', () => {
    render(<RewardPicker onComplete={mockOnComplete} />);

    const tintesCard = screen.getByText('Tintes de Cerámica Premium').closest('div');
    const ceramicaCard = screen.getByText('Tratamiento Cerámico de Pintura N24').closest('div');
    const carpetsCard = screen.getByText('Alfombras Todo Clima Originales').closest('div');

    expect(tintesCard).toBeInTheDocument();
    expect(ceramicaCard).toBeInTheDocument();

    // Seleccionar primer regalo
    fireEvent.click(tintesCard!);
    expect(useGamificationStore.getState().selectedRewards).toEqual(['tintes']);

    // Seleccionar segundo regalo
    fireEvent.click(ceramicaCard!);
    expect(useGamificationStore.getState().selectedRewards).toEqual(['tintes', 'ceramica']);

    // Intentar seleccionar tercer regalo (debe mantenerse bloqueado en 2)
    fireEvent.click(carpetsCard!);
    expect(useGamificationStore.getState().selectedRewards).toEqual(['tintes', 'ceramica']);
  });

  it('debe mantener deshabilitado el botón siguiente hasta cumplir los requisitos de CRO', () => {
    render(<RewardPicker onComplete={mockOnComplete} />);

    // Botón inicial
    const submitBtn = screen.getByRole('button', { name: /Selecciona tus Regalos/i });
    expect(submitBtn).toBeDisabled();

    // Seleccionar un regalo de entrega
    const tintesCard = screen.getByText('Tintes de Cerámica Premium').closest('div');
    fireEvent.click(tintesCard!);

    // Aún debe estar deshabilitado porque falta girar la llave
    expect(screen.getByRole('button', { name: /Gira la Llave para Continuar/i })).toBeDisabled();
  });

  it('debe simular el temporizador dinámico interactivo cada segundo', () => {
    // Forzar el temporizador activo en el store
    act(() => {
      useGamificationStore.setState({ timerActive: true, countdownSeconds: 900 });
    });

    render(<RewardPicker onComplete={mockOnComplete} />);

    expect(screen.getByText('Reserva Temporal Activa')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();

    // Avanzar 5 segundos en el tiempo ficticio
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText('14:55')).toBeInTheDocument();
  });

  it('debe activar la ruleta, abrir el modal de felicitaciones y completar el flujo VIP', async () => {
    render(<RewardPicker onComplete={mockOnComplete} />);

    // Seleccionar regalo obligatorio
    const tintesCard = screen.getByText('Tintes de Cerámica Premium').closest('div');
    fireEvent.click(tintesCard!);

    // Presionar el botón de girar la Llave de Oro
    const spinBtn = screen.getByRole('button', { name: /Girar Llave de Oro/i });
    expect(spinBtn).toBeInTheDocument();

    // Disparar giro de llave de pronto
    await act(async () => {
      fireEvent.click(spinBtn);
    });

    // Validar aparición de modal de felicitaciones al ganar bono
    expect(screen.getByText('¡Felicidades, Ganador!')).toBeInTheDocument();
    expect(screen.getAllByText(/USD/i).length).toBeGreaterThan(0);

    // Aceptar bono en modal interactivo
    const closeDialogBtn = screen.getByRole('button', { name: /Excelente, Continuar/i });
    fireEvent.click(closeDialogBtn);

    // El botón final de confirmación debe estar disponible y activable
    const finalSubmitBtn = screen.getByRole('button', { name: /Confirmar Recompensas VIP/i });
    expect(finalSubmitBtn).toBeEnabled();

    // Completar el flujo de gamificación
    fireEvent.click(finalSubmitBtn);
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });
});
