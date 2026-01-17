import { AnalysisResult } from './types';

const BACKEND_URL = 'http://localhost:3000/analyze';

export async function analyzeText(text: string): Promise<AnalysisResult> {
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze text');
  }

  const result = await response.json();
  return result as AnalysisResult;
}
