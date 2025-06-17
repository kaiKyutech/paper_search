export interface Label {
  ja: string;
  en: string;
}

export interface PaperAnalysisResult {
  title?: string;
  fields: Array<{
    name: string;
    score: number;
  }>;
  target: Label;
  methods: Label[];
  factors: Label[];
  metrics: Label[];
  search_keywords: Label[];
}