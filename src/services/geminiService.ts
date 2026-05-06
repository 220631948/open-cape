import { ErfRecord } from "../hooks/useErfSearch";

const SYSTEM_INSTRUCTION = "You are a factual property analyst. Base all answers strictly on the provided JSON context. If the data is missing, state 'Insufficient data'. Do not guess property values. AI estimates must be clearly labeled: 'AI-generated insight based on available data.'";

export interface SpatialQueryFilters {
  priceMin?: number;
  priceMax?: number;
  municipality?: string;
  zoning?: string[];
  propertyExtentsMin?: number;
  propertyExtentsMax?: number;
  keyword?: string;
}

export const geminiService = {
  /**
   * PII Scrubber: Strips protected owner data before passing to LLM.
   */
  scrubParcelData(parcel: Partial<ErfRecord>): Partial<ErfRecord> {
    const cleanData = { ...parcel };
    delete (cleanData as any).ownerName;
    delete (cleanData as any).ownerType;
    delete (cleanData as any).ownershipCategory;
    delete (cleanData as any).idNumber;
    return cleanData;
  },

  /**
   * Parses natural language into strict JSON filters via server proxy.
   */
  async parseSpatialQuery(query: string): Promise<SpatialQueryFilters | null> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parseQuery',
          payload: { query }
        })
      });
      
      const data = await response.json();
      if (data.text) {
        return JSON.parse(data.text) as SpatialQueryFilters;
      }
      return null;
    } catch (e) {
      console.error("Failed to parse spatial query:", e);
      return null;
    }
  },

  /**
   * Generates a conversational response about market trends via server proxy.
   */
  async *streamMarketChat(query: string, viewportStats: Record<string, unknown>) {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          payload: {
            prompt: `User Context & Viewport Stats: ${JSON.stringify(viewportStats)}\n\nUser Question: ${query}`,
            systemInstruction: SYSTEM_INSTRUCTION + " Provide a short, highly analytical response regarding current market trends based ONLY on the viewport stats provided."
          }
        })
      });
      
      const data = await response.json();
      if (data.text) {
        yield data.text;
      }
    } catch (e: any) {
      console.error("Failed to stream market chat:", e);
      yield "Error analyzing market trends: " + e.message;
    }
  },

  /**
   * Generic text generation utility via server proxy.
   */
  async generateText(prompt: string, systemInstruction: string = SYSTEM_INSTRUCTION): Promise<string | null> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'insights',
          payload: { prompt, systemInstruction }
        })
      });
      
      const data = await response.json();
      return data.text || null;
    } catch (e: any) {
      console.error("Failed to generate text:", e);
      return null;
    }
  },

  /**
   * Streams a parcel insights summary via server proxy.
   */
  async *streamParcelInsights(parcel: Partial<ErfRecord>, context?: { valuationResult?: any, riskAssessment?: any }) {
    const safeData = this.scrubParcelData(parcel);
    const contextPrompt = context ? `
Calculated Valuation Context: ${JSON.stringify(context.valuationResult)}
Risk & Compliance Assessment: ${JSON.stringify(context.riskAssessment)}
` : '';

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'insights',
          payload: {
            prompt: `
            Analyze this property for investment potential and market context. 
            Property Data: ${JSON.stringify(safeData)}
            ${contextPrompt}
            
            Focus on:
            1. Investment Yield Potential.
            2. Local Area Trends.
            3. Development Constraints or Risks.
            
            Use Markdown formatting with bold headers.
            `,
            systemInstruction: SYSTEM_INSTRUCTION,
          }
        })
      });
      
      const data = await response.json();
      if (data.text) {
        yield data.text;
      }
    } catch (e: any) {
      console.error("Failed to extract parcel insights:", e);
      yield "Error generating insights: " + e.message;
    }
  }
};
