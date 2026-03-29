import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/shared/api/adapters/leads/crmService';
import { UserRole } from '@/shared/lib/utils/privacyUtils';
import LeadCard from './LeadCard';
import styles from '../CRMBoard.module.css';

interface SortableLeadItemProps {
  lead: Lead;
  userRole: UserRole;
  onOpenDealSheet: (lead: Lead) => void;
  onOpenInbox: (lead: Lead) => void;
}

const SortableLeadItem: React.FC<SortableLeadItemProps> = ({ lead, userRole, onOpenDealSheet, onOpenInbox }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead },
  });

  const style = {
    '--translate': CSS.Translate.toString(transform),
    '--transition': transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`mb-4 touch-none transition-opacity duration-200 ${isDragging ? 'opacity-30' : 'opacity-100'} ${styles.dndSortable}`}
    >
      <LeadCard 
        lead={lead} 
        onPrint={() => {}} 
        onOpenDealSheet={onOpenDealSheet} 
        onOpenInbox={onOpenInbox} 
        userRole={userRole} 
      />
    </div>
  );
};

// Memoización para evitar ruidos de re-render en las columnas
export default memo(SortableLeadItem);
