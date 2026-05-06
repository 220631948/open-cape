import React from 'react';
import { cn } from '../../lib/utils';
import { TransactionEvent } from '../../types/history';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

export interface TransactionTimelineProps {
  transactions: TransactionEvent[];
  className?: string;
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ transactions, className }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className={cn("text-xs text-surface-500 py-4 text-center border-t border-surface-200 border-dashed", className)}>
        No transaction history available
      </div>
    );
  }

  // Filter and sort by oldest to latest for time series
  const sorted = [...transactions]
    .filter(t => !isNaN(new Date(t.date).getTime()) && typeof t.price === 'number')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sorted.length === 0) {
    return (
      <div className={cn("text-xs text-surface-500 py-4 text-center border-t border-surface-200 border-dashed", className)}>
        No valid transaction history available
      </div>
    );
  }

  const data = sorted.map((t, i) => {
    let anomaly = false;
    if (i > 0) {
       const prev = sorted[i - 1];
       const timeDiffMonths = (new Date(t.date).getTime() - new Date(prev.date).getTime()) / (1000 * 3600 * 24 * 30);
       const priceDelta = Math.abs((t.price - prev.price) / prev.price);
       if (priceDelta > 0.3 && timeDiffMonths <= 6) {
          anomaly = true;
       }
    }
    return {
       date: new Date(t.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' }),
       timestamp: new Date(t.date).getTime(),
       price: t.price,
       type: t.type,
       anomaly
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-surface-200 shadow-md rounded text-xs">
          <p className="font-bold">{point.date}</p>
          <p className="font-semibold text-emerald-600">R {point.price.toLocaleString()}</p>
          <p className="text-surface-500 mt-1">{point.type}</p>
          {point.anomaly && (
             <p className="text-rose-600 font-bold mt-1">⚠ Anomaly Detected</p>
          )}
        </div>
      );
    }
    return null;
  };

  const anomalies = data.filter(d => d.anomaly);

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-[10px] text-surface-500 mb-2">Linear timeline of transactions and price history.</p>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#6B7280' }} 
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              hide={true} 
              domain={['dataMin - 100000', 'dataMax + 100000']} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#059669" 
              strokeWidth={2} 
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
              activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }} 
            />
            {anomalies.map((anomaly, i) => (
              <ReferenceLine key={i} x={anomaly.date} stroke="#e11d48" strokeDasharray="3 3" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {anomalies.length > 0 && (
        <div className="text-[10px] bg-rose-50 text-rose-700 p-2 rounded -mt-2">
           <strong>Flag:</strong> High price volatility within short period (&lt;6 months, &gt;30%).
        </div>
      )}
    </div>
  );
};
