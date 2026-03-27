import React from 'react';
import { useTelemetry } from '@/features/houston/model/hooks/useTelemetry';
import { HoustonDashboard } from '@/features/houston/ui/HoustonDashboard';

interface CommandCenterWidgetProps {
  connectionState?: 'connected' | 'disconnected' | 'connecting';
}

export const CommandCenterWidget: React.FC<CommandCenterWidgetProps> = ({ 
  connectionState = 'connected' 
}) => {
  const telemetry = useTelemetry(connectionState);

  return (
    <div className="w-full max-w-md mx-auto">
      <HoustonDashboard telemetry={telemetry} />
    </div>
  );
};

export default CommandCenterWidget;
