import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DealerConfig {
    id: string;
    name: string;
    logo?: string;
    themeColor?: string;
    welcomeMessage?: string;
}

const DEFAULT_DEALER: DealerConfig = {
    id: 'richard-automotive',
    name: 'Richard Automotive',
    themeColor: '#00aed9',
    welcomeMessage: 'Bienvenido a Richard Automotive. ¿En qué vehículo estás interesado hoy?'
};

interface DealerContextType {
    currentDealer: DealerConfig;
    setDealer: (config: DealerConfig) => void;
}

const DealerContext = createContext<DealerContextType | undefined>(undefined);

export const DealerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentDealer, setDealerState] = useState<DealerConfig>(() => {
        const savedId = localStorage.getItem('current_dealer_id');
        const savedName = localStorage.getItem('current_dealer_name');
        const savedLogo = localStorage.getItem('current_dealer_logo');
        const savedWelcome = localStorage.getItem('current_dealer_welcome');

        if (savedId && savedName) {
            return {
                id: savedId,
                name: savedName,
                logo: savedLogo || undefined,
                welcomeMessage: savedWelcome || undefined
            };
        }
        return DEFAULT_DEALER;
    });

    const setDealer = (config: DealerConfig) => {
        localStorage.setItem('current_dealer_id', config.id);
        localStorage.setItem('current_dealer_name', config.name);
        if (config.logo) localStorage.setItem('current_dealer_logo', config.logo);
        if (config.welcomeMessage) localStorage.setItem('current_dealer_welcome', config.welcomeMessage);
        setDealerState(config);
    };

    return (
        <DealerContext.Provider value={{ currentDealer, setDealer }}>
            {children}
        </DealerContext.Provider>
    );
};

export const useDealer = () => {
    const context = useContext(DealerContext);
    if (!context) {
        throw new Error('useDealer must be used within a DealerProvider');
    }
    return context;
};
