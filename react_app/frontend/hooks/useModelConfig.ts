import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../utils/config';

export interface ModelConfig {
  analysis_model: string;
  translation_model: string;
  quick_summary_model: string;
  detailed_summary_model: string;
}

export function useModelConfig() {
  const [config, setConfig] = useState<ModelConfig | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/models/config`);
      if (!res.ok) throw new Error('failed to fetch');
      setConfig(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { config, reload: load };
}
