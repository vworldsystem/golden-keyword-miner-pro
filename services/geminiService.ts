
import { GoogleGenAI, Type } from "@google/genai";
import { KeywordData } from "../types";

// API 키가 있을 때만 초기화 (지연 초기화)
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Gemini API 키가 설정되지 않았습니다. .env.local 파일에 GEMINI_API_KEY를 설정해주세요.'
      );
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const mineKeywords = async (seedKeyword: string, count: number = 20): Promise<KeywordData[]> => {
  const prompt = `
    Target Keyword: "${seedKeyword}"
    Task: Generate ${count} related long-tail keywords that would be valuable for SEO/Marketing in the Korean market.
    For each keyword, provide estimated monthly search volume and document count (simulated but realistic for the Korean market like Naver/Google).
    Calculate a 'goldScore' from 0 to 100 where higher means better opportunity (high search, low competition).
  `;

  const response = await getAI().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING },
            searchVolume: { type: Type.NUMBER },
            documentCount: { type: Type.NUMBER },
            competitionRatio: { type: Type.NUMBER },
            goldScore: { type: Type.NUMBER },
            trend: { type: Type.STRING, description: "up, down, or stable" },
            category: { type: Type.STRING }
          },
          required: ["keyword", "searchVolume", "documentCount", "goldScore", "trend", "category"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '[]');
    return data.map((item: any, index: number) => ({
      ...item,
      id: `kw-${Date.now()}-${index}`,
      competitionRatio: Number((item.documentCount / item.searchVolume).toFixed(2))
    }));
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return [];
  }
};

export const expandLongTail = async (keyword: string) => {
  const prompt = `
    Base Keyword: "${keyword}"
    Generate 10 highly profitable long-tail keywords (3-5 words) starting with or including this base.
    Focus on phrases used by people ready to buy or seeking urgent information.
    Categories: 'Transactional', 'Informational', 'Comparison'.
  `;

  const response = await getAI().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            phrase: { type: Type.STRING },
            intent: { type: Type.STRING, description: "Transactional, Informational, Comparison" },
            why: { type: Type.STRING, description: "Why this is a good keyword" }
          },
          required: ["phrase", "intent", "why"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const getSearchInsights = async (keyword: string) => {
  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the current search intent and market competitiveness for the keyword: "${keyword}" in the Korean market. provide a summary.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
