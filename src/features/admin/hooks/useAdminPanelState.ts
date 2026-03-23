import { useState, useEffect, useCallback } from 'react';
import { useDealer } from '@/entities/dealer';
import { DI } from '@/shared/lib/di/registry';
import { Car as CarType, Lead, Subscriber } from '@/shared/types/types';
import { getSubscribers } from '@/shared/api/firebase/firebaseService';

export const useAdminPanelState = (onInitializeDb?: () => Promise<void>) => {
  const { currentDealer } = useDealer();
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'inventory'
    | 'pipeline'
    | 'copilot'
    | 'analytics'
    | 'security'
    | 'marketing'
    | 'billing'
    | 'lab'
    | 'telemetry'
  >(() => {
    return (localStorage.getItem('admin_active_tab') as any) || 'dashboard';
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarType | null>(null);
  const [marketingCar, setMarketingCar] = useState<CarType | null>(null);
  const [viralCar, setViralCar] = useState<CarType | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Widget States
  const [deviceType, setDeviceType] = useState<'Mac' | 'iPhone'>('Mac');
  const securityScore = 98;

  const fetchDashboardData = useCallback(async () => {
    try {
      const dealerId = currentDealer?.id || 'richard-automotive';
      const useCase = DI.getGetLeadsUseCase();
      const updatedLeads = await useCase.execute(dealerId);
      setLeads(updatedLeads as any);
    } catch (e) {
      console.error('Leads Fetch Error:', e);
    }
  }, [currentDealer?.id]);

  useEffect(() => {
    fetchDashboardData();

    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Android')) {
      setDeviceType('iPhone');
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
    if (activeTab === 'marketing') {
      getSubscribers().then(setSubscribers).catch(console.error);
    }
  }, [activeTab]);

  const handleInitClick = useCallback(async () => {
    if (!onInitializeDb) return;
    setIsInitializing(true);
    try {
      await onInitializeDb();
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitializing(false);
    }
  }, [onInitializeDb]);

  const handlePhotoUploaded = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    currentDealer,
    activeTab, setActiveTab,
    leads, setLeads,
    subscribers, setSubscribers,
    isModalOpen, setIsModalOpen,
    editingCar, setEditingCar,
    marketingCar, setMarketingCar,
    viralCar, setViralCar,
    isInitializing, setIsInitializing,
    deviceType, setDeviceType,
    securityScore,
    fetchDashboardData,
    handleInitClick,
    handlePhotoUploaded
  };
};
