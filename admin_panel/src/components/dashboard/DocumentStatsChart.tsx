import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function DocumentStatsChart({ data }: { data: any }) {
  const chartData = [
    {
      name: 'Offer Ltrs',
      Generated: data.offerLetters?.generated || 0,
      Pending: data.offerLetters?.pending || 0,
    },
    {
      name: 'Certificates',
      Generated: data.certificates?.generated || 0,
      Pending: data.certificates?.pending || 0,
    },
    {
      name: 'Exp Ltrs',
      Generated: data.experienceCertificates?.generated || 0,
      Pending: data.experienceCertificates?.pending || 0,
    },
    {
      name: 'Rec Ltrs',
      Generated: data.recommendationLetters?.generated || 0,
      Pending: data.recommendationLetters?.pending || 0,
    },
  ];

  return (
    <div className="h-[280px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend 
            verticalAlign="top" 
            wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            iconType="circle"
          />
          <Bar dataKey="Generated" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
          <Bar dataKey="Pending" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
