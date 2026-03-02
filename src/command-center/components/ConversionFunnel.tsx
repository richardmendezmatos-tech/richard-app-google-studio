import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Lead } from '@/domain/entities';
import { AnalyticsService } from '@/domain/services/AnalyticsService';

interface Props {
  leads: Lead[];
}

export const ConversionFunnel: React.FC<Props> = ({ leads }) => {
  const data = React.useMemo(() => AnalyticsService.getConversionFunnelData(leads), [leads]);

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981'];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
            width={80}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              fontSize: '12px',
              color: '#fff',
            }}
          />
          <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
            {data.map((_, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
