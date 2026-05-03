import { GoogleGenAI, Type } from "@google/genai";
import { ErfRecord } from "../hooks/useErfSearch";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
   * [RALPH] - Ensures POPIA compliance.
   */
  scrubParcelData(parcel: Partial<ErfRecord>): Partial<ErfRecord> {
    // eslint-disable-next-line no-restricted-syntax
    const cleanData = { ...parcel };
    // Explicitly delete sensitive personal information
    delete cleanData.ownerName;
    delete cleanData.ownerType;
    delete cleanData.ownershipCategory;
    return cleanData;
  },

  /**
   * Parses natural language into strict JSON filters.
   * [BART] - Uses Structured Outputs for guaranteed JSON consistency.
   */
  async parseSpatialQuery(query: string): Promise<SpatialQueryFilters | null> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Parse the following search query into spatial mapping filters: "${query}"`,
        config: {
          systemInstruction: "You are a strict spatial query parser. Extract and normalize map filters from the user query into the requested JSON schema. Omit properties if they are not explicitly mentioned.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priceMin: { type: Type.NUMBER, description: "Minimum price limit in ZAR" },
              priceMax: { type: Type.NUMBER, description: "Maximum price limit in ZAR" },
              municipality: { type: Type.STRING, description: "City or municipality name (e.g., Cape Town)" },
              zoning: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific zoning categories mentioned (e.g., Commercial, Residential, Industrial)" },
              propertyExtentsMin: { type: Type.NUMBER, description: "Minimum property size/extent in square meters" },
              propertyExtentsMax: { type: Type.NUMBER, description: "Maximum property size/extent in square meters" },
              keyword: { type: Type.STRING, description: "General search keywords if specific filters do not apply" }
            }
          }
        }
      });
      if (response.text) {
        return JSON.parse(response.text) as SpatialQueryFilters;
      }
      return null;
    } catch (e) {
      console.error("Failed to parse spatial query:", e);
      return null;
    }
  },

  /**
   * Generates a conversational response about market trends based on aggregated bounds data.
   */
  async *streamMarketChat(query: string, viewportStats: Record<string, unknown>) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `User Context & Viewport Stats: ${JSON.stringify(viewportStats)}\n\nUser Question: ${query}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + " Provide a short, highly analytical response regarding current market trends based ONLY on the viewport stats provided.",
        }
      });
      
      if (response.text) {
        yield response.text;
      }
    } catch (e: any) {
      console.error("Failed to stream market chat:", e);
      if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED') || e?.message?.includes('exceeded your current quota')) {
        yield "⚠️ **API Quota Exceeded**\n\nThe AI Assistant has reached its usage limit for the Gemini API. Please check your billing details or try again later.";
      } else {
        yield "Error analyzing market trends.";
      }
    }
  },

  /**
   * Streams a parcel insights summary, effectively using RAG over the parcel's attributes.
   */
  async *streamParcelInsights(parcel: Partial<ErfRecord>) {
    const safeData = this.scrubParcelData(parcel);
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a 2-paragraph Investment & Context Summary for the following property data: ${JSON.stringify(safeData)}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });
      
      if (response.text) {
        yield response.text;
      }
    } catch (e: any) {
      console.error("Failed to stream parcel insights:", e);
      if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED') || e?.message?.includes('exceeded your current quota')) {
        yield "⚠️ **API Quota Exceeded**\n\nThe AI Assistant has reached its usage limit for the Gemini API. Please check your billing details or try again later.";
      } else {
        yield "Error generating insights.";
      }
    }
  }
};
