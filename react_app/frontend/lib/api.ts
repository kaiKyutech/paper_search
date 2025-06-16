const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);
  return response;
}

export async function searchPapers(query: string, limit: number = 10): Promise<any> {
  const encoded = encodeURIComponent(query);
  const res = await apiFetch(`/search?q=${encoded}&limit=${limit}`);
  if (!res.ok) {
    throw new Error('検索に失敗しました');
  }
  return res.json();
}

export async function getModelConfig(): Promise<any> {
  const res = await apiFetch('/models/config');
  if (!res.ok) {
    throw new Error('モデル設定の取得に失敗しました');
  }
  return res.json();
}

export async function getAvailableModels(): Promise<any> {
  const res = await apiFetch('/models');
  if (!res.ok) {
    throw new Error('モデル一覧の取得に失敗しました');
  }
  return res.json();
}

export async function updateModelConfig(functionName: string, modelName: string): Promise<void> {
  const res = await apiFetch('/models/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ function_name: functionName, model_name: modelName })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'モデル設定の更新に失敗しました');
  }
}

export async function quickSummary(title: string, abstract: string): Promise<any> {
  const res = await apiFetch('/quick-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, abstract })
  });
  if (!res.ok) {
    throw new Error('簡潔要約に失敗しました');
  }
  return res.json();
}

export async function analyzePaper(title: string, abstract: string): Promise<any> {
  const res = await apiFetch('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, abstract })
  });
  if (!res.ok) {
    throw new Error('解析に失敗しました');
  }
  return res.json();
}

export async function translatePaperStream(text: string): Promise<Response> {
  return apiFetch('/translate-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
}

export async function summarizePaper(title: string, abstract: string): Promise<any> {
  const res = await apiFetch('/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, abstract })
  });
  if (!res.ok) {
    throw new Error('要約に失敗しました');
  }
  return res.json();
}
