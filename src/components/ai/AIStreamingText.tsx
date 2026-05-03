import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

interface AIStreamingTextProps {
  streamGenerator: AsyncGenerator<string, void, unknown> | null;
  className?: string;
  onComplete?: () => void;
}

export const AIStreamingText: React.FC<AIStreamingTextProps> = ({ 
  streamGenerator, 
  className,
  onComplete
}) => {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const consumeStream = async () => {
      if (!streamGenerator) return;
      setText('');
      setIsStreaming(true);
      try {
        for await (const chunk of streamGenerator) {
          if (!isMounted) break;
          // [BART] Update in chunks directly, works fine for most small summaries.
          setText((prev) => prev + chunk);
        }
      } catch (e) {
        console.error("Stream error:", e);
      } finally {
        if (isMounted) {
          setIsStreaming(false);
          onComplete?.();
        }
      }
    };
    
    consumeStream();
    
    return () => {
      isMounted = false;
    };
  }, [streamGenerator]);

  if (!streamGenerator && !text) return null;

  return (
    <div className={cn("markdown-body text-sm text-surface-700 leading-relaxed", className)}>
      <ReactMarkdown>{text}</ReactMarkdown>
      {isStreaming && (
        <div className="flex items-center gap-2 mt-3 text-indigo-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-[10px] font-medium tracking-wide uppercase italic">Generating Insight...</span>
        </div>
      )}
      {!isStreaming && text && (
         <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-surface-400">
           <Sparkles className="w-3 h-3" />
           <span>AI-generated insight based on available data</span>
         </div>
      )}
    </div>
  );
};
