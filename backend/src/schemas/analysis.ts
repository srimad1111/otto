import { z } from 'zod';

export const AnalysisResultSchema = z.object({
  overall_risk: z.enum(['low', 'medium', 'high']),
  summary: z.string(),
  notable_clauses: z.array(
    z.object({
      title: z.string(),
      risk: z.enum(['low', 'medium', 'high']),
      explanation: z.string(),
    })
  ),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
