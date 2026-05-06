import React from 'react';
import { PriceForecastResult } from '../../types/forecast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
  forecast: PriceForecastResult;
  className?: string;
}

export const PriceForecastChart: React.FC<Props> = ({ forecast, className }) => {
  const currentYear = new Date().getFullYear();
  
  const chartData = forecast.historicalData.map(d => ({ year: d.year, Historical: d.value, Forecast: null }))
    .concat([
      { year: currentYear, Historical: forecast.historicalData.find(h => h.year === currentYear)?.value || null, Forecast: forecast.historicalData.find(h => h.year === currentYear)?.value || null }
    ])
    .concat(forecast.forecastData.map(d => ({ year: d.year, Historical: null, Forecast: d.value })))
    .filter(d => d.Historical !== null || d.Forecast !== null)
    .sort((a, b) => a.year - b.year);

  // Remove duplicates in same year (keep logic simple for chart)
  const uniqueData = Array.from(new Map(chartData.map(item => [item.year, item])).values());

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `R${(val / 1000000).toFixed(1)}m`;
    if (val >= 1000) return `R${(val / 1000).toFixed(0)}k`;
    return `R${val}`;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
        <LineChart data={uniqueData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(tick) => `${tick}`}
          />
          <YAxis 
            tickFormatter={formatCurrency} 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
            width={45}
          />
          <Tooltip 
            formatter={(value: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(value)}
            labelFormatter={(label) => `Year: ${label}`}
            contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
          />
          <ReferenceLine x={currentYear} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Now', fill: '#94a3b8', fontSize: 10 }} />
          <Line type="monotone" dataKey="Historical" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: '#0ea5e9' }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
