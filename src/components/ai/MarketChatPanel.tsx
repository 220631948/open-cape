 
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { geminiService } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

interface MarketChatPanelProps {
  onClose: () => void;
  viewportStats: Record<string, unknown>; // Ideally typed based on map bounds
  getVisibleFeatures?: () => Record<string, any>[];
}

export const MarketChatPanel: React.FC<MarketChatPanelProps> = ({ onClose, viewportStats, getVisibleFeatures }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'ai', content: 'Hello! I am your AI Market Analyst. I can answer questions based on the geographical area currently visible on your map. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearChat = () => {
    setMessages([{ id: Date.now().toString(), role: 'ai', content: 'Chat history cleared. How can I help you today?' }]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, role: 'ai', content: '', isStreaming: true }]);

    try {
      const currentContext = {
        ...viewportStats,
        features: getVisibleFeatures ? getVisibleFeatures().slice(0, 50) : [], // limit to 50 for context size
        note: "Top 50 feature properties visible on map",
        chatHistory: messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n') // Context history
      };
      const stream = geminiService.streamMarketChat(userMessage.content, currentContext);
      for await (const chunk of stream) {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: msg.content + chunk }
            : msg
        ));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: 'Sorry, I encountered an error analyzing the market data.', isStreaming: false }
          : msg
      ));
    } finally {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
      ));
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex flex-col w-full h-full shadow-2xl border-surface-200 overflow-hidden bg-white">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-surface-200 bg-indigo-50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-sm font-semibold text-indigo-900">Market Analyst AI</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleClearChat} className="h-6 w-6 text-indigo-400 hover:text-indigo-600" title="Clear Chat" aria-label="Clear Chat">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-indigo-400 hover:text-indigo-600" title="Close chat" aria-label="Close chat">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
              <div className={cn("px-3 py-2 rounded-2xl text-sm", 
                msg.role === 'user' ? "bg-indigo-600 text-white rounded-br-none" : "bg-surface-100 text-surface-900 rounded-bl-none"
              )}>
                {msg.role === 'ai' ? (
                  <div className="markdown-body text-xs prose prose-sm prose-p:my-1 prose-headings:my-1">
                     <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.isStreaming && (
                <div className="mt-1 flex gap-1 items-center px-2">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSend} className="p-3 border-t border-surface-200 bg-surface-50 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about local trends..."
            className="flex-1 bg-white text-sm h-9"
            disabled={isTyping}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700" title="Send message" aria-label="Send message">
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4 text-white" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
