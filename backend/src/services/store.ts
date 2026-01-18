import crypto from 'crypto';

interface AnalysisCache {
  result: any; // Storing the full analysis object
  timestamp: number;
  persona: string;
}

// Simple in-memory store. 
// In a real production app, this would be Redis or a SQL DB.
class TrustDatabase {
  private cache: Map<string, AnalysisCache> = new Map();
  private trustScores: Map<string, number> = new Map();

  // Generate a key based on URL and Persona, OR Content Hash if URL missing
  // Using Content Hash ensures smart caching even if URL changes but text is same
  private getHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  private getKey(url: string | undefined, text: string, persona: string): string {
    // Priority: Hash of text (most accurate) > URL
    const contentHash = this.getHash(text);
    return `${contentHash}::${persona}`;
  }

  getAnalysis(url: string | undefined, text: string, persona: string): any | null {
    const key = this.getKey(url, text, persona);
    const cached = this.cache.get(key);
    
    // Cache valid for 24 hours
    if (cached && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
      console.log(`[Cache] Hit for ${key}`);
      return cached.result;
    }
    return null;
  }

  saveAnalysis(url: string | undefined, text: string, persona: string, result: any) {
    const key = this.getKey(url, text, persona);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      persona
    });
    
    // Simulate updating a "Trust Score" based on risk
    // Only update trust score if we have a valid URL
    if (url) {
      let currentScore = this.trustScores.get(url) || 50; // Start neutral
      if (result.overall_risk === 'low') currentScore = Math.min(100, currentScore + 10);
      if (result.overall_risk === 'medium') currentScore = Math.max(0, currentScore - 5);
      if (result.overall_risk === 'high') currentScore = Math.max(0, currentScore - 15);
      
      this.trustScores.set(url, currentScore);
    }
  }

  getTrustScore(url: string): string {
    const score = this.trustScores.get(url) || 50; // Default to neutral
    
    if (score > 75) return "Excellent (76-100)";
    if (score >= 46) return "Good (46-75)";
    if (score >= 26) return "Average (26-45)";
    return "Poor (0-25)";
  }
}

export const store = new TrustDatabase();