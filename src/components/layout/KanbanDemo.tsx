
import React from 'react';
import { KanbanBoard } from '@/features/admin/components/KanbanBoard';
import { Lead } from '@/types/types';

const mockLeads: Lead[] = [
    {
        id: '1',
        type: 'finance',
        status: 'new',
        firstName: 'Juan',
        lastName: 'Del Pueblo',
        email: 'juan@example.com',
        phone: '555-555-5555',
        timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
        vehicleOfInterest: 'Hyundai Tucson',
        aiScore: 85,
        aiSummary: 'Interesado en financiamiento.'
    },
    {
        id: '2',
        type: 'trade-in',
        status: 'contacted',
        firstName: 'Maria',
        lastName: 'Rivera',
        email: 'maria@example.com',
        timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
        vehicleOfInterest: 'Hyundai Elantra',
        aiScore: 92,
        aiSummary: 'Quiere cambiar su auto actual.'
    }
];

const KanbanDemo: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <h1 className="text-3xl text-white font-black mb-8">Kanban Demo</h1>
            <div className="h-[600px]">
                <KanbanBoard leads={mockLeads} onPrint={(lead) => console.log('Print', lead)} userRole="admin" />
            </div>
        </div>
    );
};

export default KanbanDemo;
