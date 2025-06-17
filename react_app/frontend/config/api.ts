export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiEndpoints = {
  search: `${API_BASE_URL}/search`,
  analyze: `${API_BASE_URL}/analyze`,
  translate: `${API_BASE_URL}/translate-stream`,
  quickSummary: `${API_BASE_URL}/quick-summary`,
  detailedSummary: `${API_BASE_URL}/summarize`,
  models: `${API_BASE_URL}/models`,
  modelConfig: `${API_BASE_URL}/models/config`,
} as const;

export const sortOptions = [
  { value: "relevance", label: "関連度順" },
  { value: "date", label: "新しい順" },
  { value: "citations", label: "引用数順" },
] as const;

export const resultLimitOptions = [5, 10, 20, 50, 100] as const;