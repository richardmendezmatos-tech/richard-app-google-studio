import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Lead } from '@/entities/lead';
import { AnalyticsService } from '@/entities/lead';

interface Props {
  leads: Lead[];
}

export const LeadSourceChart: React.FC<Props> = ({ leads }) => {
  const data = React.useMemo(() => AnalyticsService.getLeadSourceData(leads), [leads]);

  const COLORS = ['#00aed9', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
