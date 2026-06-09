import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { ValuationTrend } from '../../types/history';

export interface ValuationTrendChartProps {
  data: ValuationTrend[];
  className?: string;
}

// Memoized to prevent expensive chart re-renders when parent components update but data remains unchanged
export const ValuationTrendChart: React.FC<ValuationTrendChartProps> = React.memo(({ data, className }) => {
  if (!data || data.length < 2) {
    return (
      <div className={cn("flex items-center justify-center h-32 bg-surface-50 border border-surface-200 border-dashed rounded-lg text-surface-400 text-xs", className)}>
        Insufficient data
      </div>
    );
  }

  // Calculate stats
  const stats = useMemo(() => {
    const validValues = data.map(d => d.value).filter(v => typeof v === 'number' && !isNaN(v));
    if (validValues.length === 0) return { avg: 0, median: 0 };
    
    const sum = validValues.reduce((a, b) => a + b, 0);
    const avg = sum / validValues.length;
    const sorted = validValues.slice().sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    return { avg, median };
  }, [data]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R ${(value / 1000000).toFixed(1)}m`;
    }
    if (value >= 1000) {
      return `R ${(value / 1000).toFixed(0)}k`;
    }
    return `R ${value}`;
  };

  return (
    <div className={cn("w-full flex flex-col", className)}>
       <div className={"h-32 w-full"}>
        <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              dy={5}
            />
            <YAxis 
              hide 
              domain={['dataMin - 100000', 'dataMax + 100000']} 
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
              itemStyle={{ color: '#c4b5fd' }}
              formatter={(value: number) => [formatCurrency(value), 'Valuation']}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-surface-500 mt-2 px-1">
        <span>Avg: {formatCurrency(stats.avg)}</span>
        <span>Median: {formatCurrency(stats.median)}</span>
      </div>
    </div>
  );
});
