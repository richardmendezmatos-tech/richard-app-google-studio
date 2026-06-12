'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ROIChartProps {
  data: { name: string; 'F&I Yield': number; 'Net Return': number }[];
}

export const ROIChart: React.FC<ROIChartProps> = ({ data }) => {
  return (
    <div className="h-[120px] w-full bg-slate-950/80 border border-white/5 rounded-2xl p-2 relative overflow-hidden flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={7} tickLine={false} />
          <YAxis stroke="rgba(255,255,255,0.2)" fontSize={7} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#090d16',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '8px',
              fontFamily: 'monospace',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Area
            type="monotone"
            dataKey="Net Return"
            stroke="#06b6d4"
            fillOpacity={1}
            fill="url(#colorNet)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="F&I Yield"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorFI)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
