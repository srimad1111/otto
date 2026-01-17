import { GoogleGenAI } from '@google/genai';
import { AnalysisResultSchema, AnalysisResult } from '../schemas/analysis';

export async function analyzeText(text: string): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const genAI = new GoogleGenAI({ apiKey });
  const prompt = `
    Analyze the following Terms and Conditions text. 
    Identify the overall risk level (low, medium, high) based on user-hostile clauses.
    Provide a brief summary.
    List notable clauses with their titles, risk levels, and explanations.
    
    Return ONLY valid JSON in the following format:
    {
      "overall_risk": "low" | "medium" | "high",
      "summary": "string",
      "notable_clauses": [
        { "title": "string", "risk": "low" | "medium" | "high", "explanation": "string" }
      ]
    }

    Text to analyze:
    ${text}
  `;

  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const responseText = result.text;
  
  if (!responseText) {
    throw new Error('No response text received from Gemini');
  }

  try {
    const json = JSON.parse(responseText);
    const validated = AnalysisResultSchema.parse(json);
    return validated;
  } catch (error) {
    console.error('Gemini validation failed:', error);
    console.error('Raw response:', responseText);
    throw new Error('Failed to parse or validate Gemini response');
  }
}
