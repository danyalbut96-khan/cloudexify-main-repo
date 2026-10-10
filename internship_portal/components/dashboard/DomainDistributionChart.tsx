import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export function DomainDistributionChart({ data }: { data: any }) {
  // Convert object { 'Python': {total: 5}, 'C++': {total: 2} } to array format
  const chartData = Object.keys(data).map((key) => ({
    name: key.replace(' Programming', '').replace(' Fundamentals', ''),
    value: data[key].total
  })).filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center text-slate-400 text-sm">
        No intern data available yet.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
