import React from 'react';
import { PriceForecastResult } from '../../types/forecast';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ConfidenceScoreBadge } from '../valuation/ConfidenceScoreBadge';
import { PriceForecastChart } from './PriceForecastChart';

interface Props {
  forecast: PriceForecastResult;
  className?: string;
}

export const ForecastPanel: React.FC<Props> = ({ forecast, className }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(val);
  };

  const TrendIcon = forecast.trendDirection === 'Increasing' ? TrendingUp : forecast.trendDirection === 'Decreasing' ? TrendingDown : Minus;
  const trendColor = forecast.trendDirection === 'Increasing' ? 'text-emerald-600' : forecast.trendDirection === 'Decreasing' ? 'text-rose-600' : 'text-slate-500';

  return (
    <div className={cn("bg-surface-50 p-4 rounded-lg border border-surface-200 mt-4", className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5">
          <TrendIcon className={cn("h-3 w-3", trendColor)} /> 5-Year Price Forecast
        </span>
        <ConfidenceScoreBadge 
          score={forecast.forecastConfidence} 
          category={forecast.forecastConfidence >= 80 ? 'High' : forecast.forecastConfidence >= 50 ? 'Moderate' : 'Low'} 
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white border border-surface-100 rounded px-2.5 py-2 flex flex-col justify-center items-center">
            <span className="text-[9px] font-bold text-surface-400 uppercase">1 Year</span>
            <span className={cn("text-xs font-bold mt-0.5", trendColor)}>{formatCurrency(forecast.forecastValue1Year)}</span>
        </div>
        <div className="bg-white border border-surface-100 rounded px-2.5 py-2 flex flex-col justify-center items-center">
            <span className="text-[9px] font-bold text-surface-400 uppercase">3 Years</span>
            <span className={cn("text-xs font-bold mt-0.5", trendColor)}>{formatCurrency(forecast.forecastValue3Year)}</span>
        </div>
        <div className="bg-white border border-surface-100 rounded px-2.5 py-2 flex flex-col justify-center items-center">
            <span className="text-[9px] font-bold text-surface-400 uppercase">5 Years</span>
            <span className={cn("text-xs font-bold mt-0.5", trendColor)}>{formatCurrency(forecast.forecastValue5Year)}</span>
        </div>
      </div>

      <div className="h-32 mb-3 bg-white p-2 rounded border border-surface-100">
        <PriceForecastChart forecast={forecast} />
      </div>

      <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded flex gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
        <div className="text-[9px] text-slate-500 leading-relaxed">
          <p className="mb-1"><span className="font-semibold text-slate-700">Methodology:</span> {forecast.method}</p>
          <p>This is a purely algorithmic estimation for educational purposes and does not constitute financial advice. Predictions become highly uncertain over longer horizons.</p>
        </div>
      </div>
      
      <div className="mt-3 pt-2 pl-1 border-t border-surface-200 flex justify-end items-center">
         <span className="text-[9px] text-surface-400">{new Date(forecast.evaluatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
};
