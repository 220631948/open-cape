import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ForecastPoint {
  year: string;
  value: number;
  type: 'historical' | 'projected';
}

interface PriceForecastChartProps {
  currentValue: number;
  growthRate?: number; // annual %
}

export const PriceForecastChart: React.FC<PriceForecastChartProps> = ({ currentValue, growthRate = 0.045 }) => {
  // Generate 5 years historical and 5 years projected
  const data: ForecastPoint[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = -4; i <= 5; i++) {
    const year = currentYear + i;
    const multiplier = Math.pow(1 + (i < 0 ? 0.035 : growthRate), i);
    data.push({
      year: year.toString(),
      value: Math.round(currentValue * multiplier),
      type: i <= 0 ? 'historical' : 'projected'
    });
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <YAxis 
            hide 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ForecastPoint;
                return (
                  <div className="bg-white border border-surface-200 p-2 shadow-xl rounded-lg text-[10px]">
                    <p className="font-bold text-surface-900 mb-1">{item.year} {item.type === 'projected' ? '(Est.)' : ''}</p>
                    <p className="text-indigo-600 font-mono font-bold leading-none">{formatCurrency(item.value)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#4f46e5" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
