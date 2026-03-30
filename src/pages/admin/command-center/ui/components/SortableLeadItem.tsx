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
  onOpenDetail: (lead: Lead) => void;
}

const SortableItemContainer = memo(
  ({ lead, userRole, onOpenDealSheet, onOpenInbox, onOpenDetail }: SortableLeadItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: lead.id,
      data: { lead },
    });

    const innerRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
      if (innerRef.current) {
        innerRef.current.style.setProperty(
          '--translate',
          CSS.Translate.toString(transform) || 'none',
        );
        innerRef.current.style.setProperty('--transition', transition || 'none');
      }
    }, [transform, transition]);

    // Fusionamos refs de dnd-kit y el nuestro local
    const mergedRef = (node: HTMLDivElement) => {
      setNodeRef(node);
      (innerRef as any).current = node;
    };

    return (
      <div
        ref={mergedRef}
        {...attributes}
        {...listeners}
        className={`mb-4 touch-none transition-opacity duration-200 ${isDragging ? 'opacity-30' : 'opacity-100'} ${styles.dndSortable}`}
      >
        <LeadCard
          lead={lead}
          onPrint={() => {}}
          onOpenDealSheet={onOpenDealSheet}
          onOpenInbox={onOpenInbox}
          onOpenDetail={onOpenDetail}
          userRole={userRole}
        />
      </div>
    );
  },
);

const SortableLeadItem: React.FC<SortableLeadItemProps> = (props) => {
  return <SortableItemContainer {...props} />;
};

// Memoización para evitar ruidos de re-render en las columnas
export default memo(SortableLeadItem);
