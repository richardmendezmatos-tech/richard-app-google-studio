import React, { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PrivacyProvider } from '@/features/privacy/context/PrivacyContext';
import { initGA } from '@/services/analytics';
import { MetaPixel } from '@/components/layout/tracking/MetaPixel';

// --- Router Logic ---
const SmartRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Safe check for Capacitor
    const win = window as Window & { Capacitor?: { isNative: boolean } };
    const isNative = !!(win.Capacitor && win.Capacitor.isNative);
    const Router = isNative ? HashRouter : BrowserRouter;

    useEffect(() => {
        console.log(`[SmartRouter] Active mode: ${isNative ? 'HashRouter (Native/Capacitor)' : 'BrowserRouter (Web)'}`);
        // Initialize Google Analytics 4
        const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
        initGA(gaId);
    }, [isNative]);

    return <Router>{children}</Router>;
};

interface AppProvidersProps {
    children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        <PrivacyProvider>
                            <ComparisonProvider>
                                <SmartRouter>
                                    <MetaPixel />
                                    {children}
                                </SmartRouter>
                            </ComparisonProvider>
                        </PrivacyProvider>
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
};
