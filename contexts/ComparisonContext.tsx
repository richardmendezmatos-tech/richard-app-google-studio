import React, { createContext, useContext, useState, useEffect } from 'react';
import { Car } from '../types';
import { getCookie, setCookie } from '../services/cookieService';

interface ComparisonContextType {
    selectedCars: Car[];
    addCarToCompare: (car: Car) => void;
    removeCarFromCompare: (carId: string) => void;
    isInComparison: (carId: string) => boolean;
    clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedCars, setSelectedCars] = useState<Car[]>([]);

    useEffect(() => {
        // Load initial state (could be from cookies/localstorage)
        const saved = getCookie('richard_compare_cars');
        if (saved) {
            try {
                // We're just storing IDs in cookie usually, but for simplicity here we might need a way to rehydrate
                // For now, let's start empty or simple persistence if we had the full inventory available globally context-free
                // Skipping complex rehydration for this demo step to keep it stateless on refresh for now, 
                // or we could persist the whole object in localstorage (better for this size)
                const stored = localStorage.getItem('richard_compare_cars_full');
                if (stored) setSelectedCars(JSON.parse(stored));
            } catch (e) {
                console.error("Error parsing comparison cookie", e);
            }
        }
    }, []);

    const saveState = (cars: Car[]) => {
        setSelectedCars(cars);
        localStorage.setItem('richard_compare_cars_full', JSON.stringify(cars));
    };

    const addCarToCompare = (car: Car) => {
        if (selectedCars.length >= 3) {
            // Optional: User notification "Max 3 cars"
            // For now, we replace the oldest or just do nothing. Let's do nothing/alert.
            alert("Puedes comparar máximo 3 vehículos.");
            return;
        }
        if (!selectedCars.find(c => c.id === car.id)) {
            saveState([...selectedCars, car]);
        }
    };

    const removeCarFromCompare = (carId: string) => {
        saveState(selectedCars.filter(c => c.id !== carId));
    };

    const isInComparison = (carId: string) => {
        return selectedCars.some(c => c.id === carId);
    };

    const clearComparison = () => {
        saveState([]);
    };

    return (
        <ComparisonContext.Provider value={{ selectedCars, addCarToCompare, removeCarFromCompare, isInComparison, clearComparison }}>
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
};
