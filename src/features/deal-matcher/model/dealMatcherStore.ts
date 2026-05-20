import { useState, useMemo } from 'react';
import { initialInventoryData } from '@/entities/inventory/model/initialInventory';
import { Car } from '@/entities/inventory/model/types';

export type LifestyleType = 'all' | 'chinchorreo' | 'daily' | 'familiar' | 'ahorro';

export interface FilterCriteria {
  maxMonthlyBudget: number;
  downPayment: number;
  lifestyle: LifestyleType;
}

export interface MatchCar extends Car {
  monthlyPayment: number;
  matchScore: number;
  lifestyleHook: string;
}

// Map cars to lifestyle categories and local PR dialect hooks
const LIFESTYLE_MAP: Record<string, { type: LifestyleType; hooks: string[] }> = {
  'F-150 Raptor': {
    type: 'chinchorreo',
    hooks: [
      '¡La bestia de la carretera! Lista para cruzar ríos y chinchorrear de show en la montaña.',
      'Fuerza de sobra para trepar cualquier monte y ser el centro de atención en el negocio.',
    ],
  },
  Bronco: {
    type: 'chinchorreo',
    hooks: [
      'Techo fuera, música a tope y directo pa\' la parcha de Cabo Rojo este fin de semana.',
      'Tracción de show para la playa y la montaña. La verdadera máquina de aventura.',
    ],
  },
  'Bronco Sport': {
    type: 'chinchorreo',
    hooks: [
      'Aventura compacta de show. Ideal para chinchorrear con estilo y buena economía.',
      'Lista para la playa, el monte y el tapón con tracción inteligente.',
    ],
  },
  Mustang: {
    type: 'daily',
    hooks: [
      'Rugido puro en el expreso. Para los que saben que el estilo y la potencia van de la mano.',
      'Siente la adrenalina VIP. La máquina definitiva para robar miradas en el chinchorreo de la costa.',
    ],
  },
  Explorer: {
    type: 'familiar',
    hooks: [
      'Comodidad presidencial para toda la familia. Espacio de show para las maletas y la neverita.',
      'Seguridad Sentinel de show. Tres filas de asientos para llevar a todo el corillo de paseo.',
    ],
  },
  'Santa Fe': {
    type: 'familiar',
    hooks: [
      'Diseño futurista de show con espacio gigante para las compras y los viajes familiares.',
      'Confort premium con tecnología de punta para disfrutar el paseo sin estrés.',
    ],
  },
  Palisade: {
    type: 'familiar',
    hooks: [
      'El verdadero lujo familiar. Tres filas de asientos premium para viajar como en primera clase.',
      'Espacio VIP y tecnología Sentinel para que cada viaje sea de show.',
    ],
  },
  Tucson: {
    type: 'daily',
    hooks: [
      'El balance perfecto entre economía y lujo. Tu compañera ideal para el jangueo diario.',
      'Tecnología de show y espacio perfecto para moverte por toda la isla con estilo.',
    ],
  },
  Elantra: {
    type: 'ahorro',
    hooks: [
      'Olvídate de la gasolinera. Súper económico para ganarle la batalla al tapón del expreso.',
      'Estilo deportivo de show que rinde gasolina como ningún otro. Ideal para el día a día.',
    ],
  },
  Venue: {
    type: 'ahorro',
    hooks: [
      'La SUV compacta más inteligente de la isla. Estacionamiento fácil y consumo ridículamente bajo.',
      'Ideal para moverte por la zona metro esquivando el tapón con máxima economía.',
    ],
  },
  Kona: {
    type: 'ahorro',
    hooks: [
      'Diseño electrizante y ágil. Rinde gasolina al máximo mientras luces un estilo premium de show.',
      'Compacta, moderna y súper económica para tus viajes diarios de punta a punta en la isla.',
    ],
  },
  Ranger: {
    type: 'chinchorreo',
    hooks: [
      'Lista para el trabajo duro en la semana y el chinchorreo pesado el domingo.',
      'El tamaño perfecto para la isla con toda la fuerza del linaje Ford Tough.',
    ],
  },
};

// Default mapping function if not explicit
const getCarLifestyle = (car: Omit<Car, 'id'>): { type: LifestyleType; hook: string } => {
  const modelKey = Object.keys(LIFESTYLE_MAP).find((key) =>
    car.name.toLowerCase().includes(key.toLowerCase())
  );
  if (modelKey) {
    const data = LIFESTYLE_MAP[modelKey];
    const hook = data.hooks[Math.floor(Math.random() * data.hooks.length)];
    return { type: data.type, hook };
  }
  // Fallback default
  return {
    type: 'daily',
    hook: 'Unidad de show con la garantía y respaldo premium de Richard Automotive.',
  };
};

export const useDealMatcherStore = () => {
  const [filters, setFilters] = useState<FilterCriteria>({
    maxMonthlyBudget: 900,
    downPayment: 4000,
    lifestyle: 'all',
  });

  const [likedList, setLikedList] = useState<MatchCar[]>([]);
  const [dislikedList, setDislikedList] = useState<MatchCar[]>([]);
  const [superMatchedList, setSuperMatchedList] = useState<MatchCar[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate enriched inventory cars with unique IDs
  const allCars = useMemo<MatchCar[]>(() => {
    return initialInventoryData.map((car, idx) => {
      const carId = `DM-${idx.toString().padStart(3, '0')}`;
      const { type: lifestyleType, hook: lifestyleHook } = getCarLifestyle(car);
      
      // Calculate a realistic monthly payment using dealer-grade interest math
      // Term: 72 months, APR: 8.9%
      const principal = Math.max(0, car.price - filters.downPayment);
      const monthlyRate = 0.089 / 12;
      const termMonths = 72;
      let monthlyPayment = 0;
      if (principal > 0) {
        monthlyPayment = Math.round(
          (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
            (Math.pow(1 + monthlyRate, termMonths) - 1)
        );
      }

      // Calculate a match score percentage dynamically
      let matchScore = 100;
      // 1. Budget proximity
      if (monthlyPayment > filters.maxMonthlyBudget) {
        const excess = monthlyPayment - filters.maxMonthlyBudget;
        matchScore -= Math.min(40, Math.round((excess / filters.maxMonthlyBudget) * 100));
      } else {
        // Bonus for being comfortably within budget
        const savings = filters.maxMonthlyBudget - monthlyPayment;
        matchScore += Math.min(10, Math.round((savings / filters.maxMonthlyBudget) * 50));
      }

      // 2. Lifestyle match
      if (filters.lifestyle !== 'all' && lifestyleType !== filters.lifestyle) {
        matchScore -= 30;
      } else if (filters.lifestyle !== 'all' && lifestyleType === filters.lifestyle) {
        matchScore += 10; // Match bonus!
      }

      // Cap match score between 40% and 99% (makes it look highly actuarial and realistic)
      matchScore = Math.max(45, Math.min(99, matchScore));

      return {
        ...car,
        id: carId,
        type: lifestyleType,
        monthlyPayment,
        matchScore,
        lifestyleHook,
      } as MatchCar;
    });
  }, [filters.downPayment, filters.maxMonthlyBudget, filters.lifestyle]);

  // Filter cars based on currently active filters
  const filteredCars = useMemo(() => {
    return allCars.filter((car) => {
      // 1. Budget filter: allow slight excess (up to 15%) so they can still see options and choose to raise budget or downpayment
      if (car.monthlyPayment > filters.maxMonthlyBudget * 1.15) {
        return false;
      }
      // 2. Lifestyle filter
      if (filters.lifestyle !== 'all' && car.type !== filters.lifestyle) {
        return false;
      }
      return true;
    });
  }, [allCars, filters]);

  const activeCar = useMemo<MatchCar | null>(() => {
    if (currentIndex >= filteredCars.length) return null;
    return filteredCars[currentIndex];
  }, [filteredCars, currentIndex]);

  const swipeRight = (car: MatchCar) => {
    setLikedList((prev) => [...prev, car]);
    setCurrentIndex((prev) => prev + 1);
  };

  const swipeLeft = (car: MatchCar) => {
    setDislikedList((prev) => [...prev, car]);
    setCurrentIndex((prev) => prev + 1);
  };

  const superMatch = (car: MatchCar) => {
    setSuperMatchedList((prev) => [...prev, car]);
    setCurrentIndex((prev) => prev + 1);
  };

  const updateFilters = (newFilters: Partial<FilterCriteria>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentIndex(0);
  };

  const restartDeck = () => {
    setCurrentIndex(0);
    setLikedList([]);
    setDislikedList([]);
    setSuperMatchedList([]);
  };

  return {
    filters,
    filteredCars,
    activeCar,
    currentIndex,
    likedList,
    dislikedList,
    superMatchedList,
    updateFilters,
    swipeRight,
    swipeLeft,
    superMatch,
    restartDeck,
  };
};
