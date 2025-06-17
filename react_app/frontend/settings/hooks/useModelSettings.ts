import { useState } from 'react';
import { ModelConfig, AvailableModel } from '../../types';
import { apiEndpoints } from '../../config/api';

export const useModelSettings = () => {
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const loadModelConfig = async () => {
    try {
      const response = await fetch(apiEndpoints.modelConfig);
      if (response.ok) {
        const config = await response.json();
        setModelConfig(config);
      }
    } catch (error) {
      console.error('モデル設定の取得に失敗:', error);
    }
  };

  const loadAvailableModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await fetch(apiEndpoints.models);
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models);
      }
    } catch (error) {
      console.error('利用可能モデルの取得に失敗:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const updateModelConfig = async (functionName: string, modelName: string) => {
    try {
      const response = await fetch(apiEndpoints.modelConfig, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function_name: functionName,
          model_name: modelName,
        }),
      });

      if (response.ok) {
        await loadModelConfig(); // Reload config after update
      } else {
        const errorData = await response.json();
        alert(`設定の更新に失敗しました: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('モデル設定の更新に失敗:', error);
      alert('モデル設定の更新に失敗しました');
    }
  };

  return {
    modelConfig,
    availableModels,
    isLoadingModels,
    loadModelConfig,
    loadAvailableModels,
    updateModelConfig,
  };
};