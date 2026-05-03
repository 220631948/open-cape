import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { ErfRecord } from '@/src/hooks/useErfSearch';
import { geminiService } from '@/src/services/geminiService';
import { AIStreamingText } from './AIStreamingText';

interface InsightPanelProps {
  feature: ErfRecord;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({ feature }) => {
  const [stream, setStream] = useState<AsyncGenerator<string, void, unknown> | null>(null);

  const generateInsight = async () => {
    setStream(null); // Reset
    setTimeout(() => {
      const insightStream = geminiService.streamParcelInsights(feature);
      setStream(insightStream);
    }, 50);
  };

  useEffect(() => {
    generateInsight();
  }, [feature.id]); // Regenerate when a new parcel is selected

  return (
    <Card className="shadow-none border border-surface-200 bg-surface-50 overflow-hidden">
      <div className="p-3 border-b border-surface-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            AI Parcel Synthesis
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-surface-400 hover:text-indigo-600"
          onClick={generateInsight}
          title="Regenerate Insight"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      <div className="p-4">
        {stream ? (
          <AIStreamingText streamGenerator={stream} />
        ) : (
          <div className="text-xs text-surface-400 italic">Initializing AI synthesis...</div>
        )}
      </div>
    </Card>
  );
};
