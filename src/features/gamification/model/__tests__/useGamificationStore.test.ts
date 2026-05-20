import { describe, it, expect, beforeEach } from 'vitest';
import { useGamificationStore, PREMIUM_DELIVERY_GIFTS } from '../useGamificationStore';

describe('useGamificationStore - Gamificación VIP RACC', () => {
  beforeEach(() => {
    useGamificationStore.getState().resetGamification();
  });

  it('debe iniciar con el estado por defecto correcto', () => {
    const state = useGamificationStore.getState();
    expect(state.selectedRewards).toEqual([]);
    expect(state.prontoBonus).toBeNull();
    expect(state.countdownSeconds).toBe(900);
    expect(state.isKeySpun).toBe(false);
    expect(state.rewardToken).toBeNull();
    expect(state.timerActive).toBe(false);
  });

  it('debe permitir seleccionar máximo 2 regalos de entrega premium', () => {
    const store = useGamificationStore.getState();

    // Seleccionar primer regalo
    store.selectReward('gasolina');
    expect(useGamificationStore.getState().selectedRewards).toEqual(['gasolina']);

    // Seleccionar segundo regalo
    store.selectReward('asistencia');
    expect(useGamificationStore.getState().selectedRewards).toEqual(['gasolina', 'asistencia']);

    // Intentar seleccionar un tercer regalo (no debe permitirlo)
    store.selectReward('lavado');
    expect(useGamificationStore.getState().selectedRewards).toEqual(['gasolina', 'asistencia']);
  });

  it('debe permitir deseleccionar regalos correctamente', () => {
    const store = useGamificationStore.getState();
    store.selectReward('gasolina');
    store.selectReward('asistencia');

    store.deselectReward('gasolina');
    expect(useGamificationStore.getState().selectedRewards).toEqual(['asistencia']);

    store.deselectReward('asistencia');
    expect(useGamificationStore.getState().selectedRewards).toEqual([]);
  });

  it('debe girar la llave de pronto inyectando un bono ponderado y congelar el resultado', () => {
    const store = useGamificationStore.getState();
    expect(store.isKeySpun).toBe(false);

    const bonus = store.spinKey();
    const state = useGamificationStore.getState();

    // Validar inyección del bono
    expect(state.isKeySpun).toBe(true);
    expect(state.prontoBonus).toBe(bonus);
    expect([200, 450, 600, 800]).toContain(bonus);

    // Validar generación de token de seguridad
    expect(state.rewardToken).toMatch(/^RA-REWARD-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(state.timerActive).toBe(true);

    // Intentar girar la llave por segunda vez no debe alterar el bono original
    const secondBonus = state.spinKey();
    expect(secondBonus).toBe(bonus);
    expect(useGamificationStore.getState().prontoBonus).toBe(bonus);
  });

  it('debe descontar el temporizador de cuenta regresiva al hacer tick', () => {
    const store = useGamificationStore.getState();

    // No debe descontar si el temporizador no está activo
    store.tickTimer();
    expect(useGamificationStore.getState().countdownSeconds).toBe(900);

    // Activar temporizador
    store.startTimer();
    store.tickTimer();
    expect(useGamificationStore.getState().countdownSeconds).toBe(899);

    // Forzar término de tiempo
    useGamificationStore.setState({ countdownSeconds: 1, timerActive: true });
    useGamificationStore.getState().tickTimer();
    expect(useGamificationStore.getState().countdownSeconds).toBe(0);
    expect(useGamificationStore.getState().timerActive).toBe(false);
  });

  it('debe restaurar el estado original al reiniciar la sesión de gamificación', () => {
    const store = useGamificationStore.getState();
    store.selectReward('gasolina');
    store.spinKey();

    // Reiniciar
    store.resetGamification();
    const state = useGamificationStore.getState();

    expect(state.selectedRewards).toEqual([]);
    expect(state.prontoBonus).toBeNull();
    expect(state.countdownSeconds).toBe(900);
    expect(state.isKeySpun).toBe(false);
    expect(state.rewardToken).toBeNull();
    expect(state.timerActive).toBe(false);
  });
});
