export type RiskLevel = 'low' | 'medium' | 'high';

export interface Clause {
  title: string;
  risk: RiskLevel;
  explanation: string;
}

export interface AnalysisResult {
  overall_risk: RiskLevel;
  summary: string;
  notable_clauses: Clause[];
}

export type AppStatus = 'idle' | 'reading' | 'thinking' | 'result' | 'error';

export type MascotState = 'idle' | 'reading' | 'thinking' | 'happy' | 'concerned' | 'alert';
