export interface StructuredSummary {
  title?: string;
  keywords: string[];
  what_they_did: string;
  background: string;
  method: string;
  results: string;
  conclusion: string;
  importance_level: 'high' | 'medium' | 'low';
}

export interface SummaryData {
  summary?: string;
  structured?: StructuredSummary;
}

export interface QuickSummary {
  summary: string;
  keywords: string[];
}

export interface StreamingQuickSummary {
  streamingText: string;
  isComplete: boolean;
  keywords: string[];
  what_they_did: string;
}