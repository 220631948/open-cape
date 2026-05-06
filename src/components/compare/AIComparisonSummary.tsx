import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { CompareItem } from '@/contexts/CompareContext';
import { getLiveErfRecordById } from '@/source_connectors/cctOpenDataClient';
import { Button } from '../ui/Button';
import { geminiService } from '@/services/geminiService';

export const AIComparisonSummary = ({ items }: { items: CompareItem[] }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (items.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      // First, gather property data for the items
      const dataPromises = items.map(async (item) => {
        if (item.type === 'parcel') {
          try {
             const record = await getLiveErfRecordById(item.id);
             return `${item.title}: Area ${record?.allotmentArea || 'unknown'} sqm, Zoning ${record?.zoning || 'unknown'}, Value R${record?.lastValuation || 'unknown'}.`;
          } catch(e) {
             return `${item.title}: Basic details unavailable.`;
          }
        }
        return `${item.title} (${item.type})`;
      });

      const summaries = await Promise.all(dataPromises);
      const prompt = `Compare these properties and provide a concise summary of their key differences and similarities, highlighting which might be better for commercial vs residential use based on the data points provided: \n\n${summaries.join('\n')}`;

      const text = await geminiService.generateText(prompt, "You are an expert real estate spatial analyst.");
      if (!text) throw new Error("Failed to generate insight from Gemini");
      setInsight(text);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length < 2) {
     return null;
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 mb-6 shadow-sm">
       <div className="flex items-center justify-between mb-2">
         <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
           <Sparkles className="w-4 h-4 text-indigo-500" />
           AI Comparison Insights
         </h3>
         {!insight && !loading && (
           <Button size="sm" onClick={fetchInsights} className="bg-indigo-600 hover:bg-indigo-700">
             Generate Insight
           </Button>
         )}
       </div>
       
       {loading && (
         <div className="flex items-center gap-2 text-indigo-600 text-sm py-4">
           <Loader2 className="w-4 h-4 animate-spin" /> Analyzing property data...
         </div>
       )}

       {error && (
         <p className="text-red-600 text-sm py-2">Error: {error}</p>
       )}

       {insight && !loading && (
         <div className="prose prose-sm prose-indigo max-w-none text-indigo-800 bg-white p-4 rounded border border-indigo-100 shadow-sm mt-3">
           {insight}
         </div>
       )}
    </div>
  );
};
