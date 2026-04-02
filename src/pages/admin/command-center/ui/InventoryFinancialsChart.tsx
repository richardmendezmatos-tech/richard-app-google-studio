"use client";

"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Car as CarType } from '@/shared/lib/analytics/AnalyticsService';
import { AnalyticsService } from '@/shared/lib/analytics/AnalyticsService';

interface Props {
  inventory: CarType[];
}

export const InventoryFinancialsChart: React.FC<Props> = ({ inventory }) => {
  const data = React.useMemo(
    () => AnalyticsService.getInventoryFinancialsData(inventory),
    [inventory],
  );

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              fontSize: '12px',
              color: '#fff',
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {value}
              </span>
            )}
          />
          <Bar dataKey="Costo" fill="#475569" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="Margen" fill="#00aed9" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
