export interface ModelConfig {
  analysis_model: string;
  translation_model: string;
  quick_summary_model: string;
  detailed_summary_model: string;
}

export interface AvailableModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

export interface SearchResponse {
  papers: any[];
  total: number;
  time: number;
}

export interface PriorityTask {
  type: 'summarize' | 'analyze' | 'translate';
  paperId: string;
}