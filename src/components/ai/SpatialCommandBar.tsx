import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { geminiService, SpatialQueryFilters } from '@/services/geminiService';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface SpatialCommandBarProps {
  onFiltersApplied: (filters: SpatialQueryFilters) => void;
  className?: string;
}

export const SpatialCommandBar: React.FC<SpatialCommandBarProps> = ({
  onFiltersApplied,
  className
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    try {
      const filters = await geminiService.parseSpatialQuery(query);
      if (filters && Object.keys(filters).length > 0) {
        onFiltersApplied(filters);
        setQuery('');
      } else {
        setError("Could not extract mapping filters from query.");
        triggerShake();
      }
    } catch (e) {
      setError("Failed to parse spatial query.");
      triggerShake();
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className={cn(
      "relative z-30 shadow-2xl rounded-full overflow-hidden border bg-white/90 backdrop-blur-xl w-full max-w-2xl mx-auto flex items-center p-1.5 transition-all focus-within:ring-2 focus-within:ring-indigo-500/50", 
      error ? "border-rose-300 ring-rose-100" : "border-surface-200/50",
      shake && "animate-shake",
      className
    )}>
       <div className="pl-3 pr-2 flex items-center gap-2 pointer-events-none text-indigo-500">
         {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 
          error ? <AlertCircle className="w-5 h-5 text-rose-500" /> : <Sparkles className="w-5 h-5" />}
       </div>
       <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
         <Input 
           value={query}
           onChange={(e) => { setQuery(e.target.value); setError(null); }}
           placeholder="e.g. Show me commercial properties under R 5,000,000 in Cape Town..."
           className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-surface-900 flex-1 px-1 h-10 w-full placeholder:text-surface-400"
           disabled={isProcessing}
         />
         <Button 
           type="submit" 
           size="sm" 
           disabled={!query.trim() || isProcessing}
           className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all px-6 h-10"
         >
           Query AI
         </Button>
       </form>
       <style>{`
         @keyframes shake {
           0%, 100% { transform: translateX(0); }
           25% { transform: translateX(-4px); }
           75% { transform: translateX(4px); }
         }
         .animate-shake {
           animation: shake 0.2s ease-in-out 0s 2;
         }
       `}</style>
    </div>
  );
};
