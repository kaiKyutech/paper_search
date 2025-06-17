import { useState, useEffect } from 'react';
import { ModelConfig, AvailableModel } from '../../types';
import { apiEndpoints } from '../../config/api';

const INITIAL_MODEL_CONFIG: ModelConfig = {
  analysis_model: 'gemma-textonly_v3:latest',
  translation_model: 'gemma-textonly_v3:latest', 
  quick_summary_model: 'gemma-textonly_v3:latest',
  detailed_summary_model: 'gemma-textonly_v3:latest'
};

export const useModelSettings = () => {
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const loadModelConfig = async () => {
    try {
      // ローカルストレージから初期設定を読み込み
      const savedConfig = localStorage.getItem('modelConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setModelConfig(parsedConfig);
      } else {
        // 初回起動時はデフォルト設定を使用
        setModelConfig(INITIAL_MODEL_CONFIG);
        localStorage.setItem('modelConfig', JSON.stringify(INITIAL_MODEL_CONFIG));
      }
      
      // バックエンドからも設定を取得して同期
      const response = await fetch(apiEndpoints.modelConfig);
      if (response.ok) {
        const config = await response.json();
        setModelConfig(config);
        localStorage.setItem('modelConfig', JSON.stringify(config));
      }
    } catch (error) {
      console.error('モデル設定の取得に失敗:', error);
      // エラー時はローカルストレージまたはデフォルト設定を使用
      const savedConfig = localStorage.getItem('modelConfig');
      if (savedConfig) {
        setModelConfig(JSON.parse(savedConfig));
      } else {
        setModelConfig(INITIAL_MODEL_CONFIG);
      }
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
      // まずローカルの設定を更新
      const updatedConfig = {
        ...modelConfig,
        [functionName]: modelName
      } as ModelConfig;
      
      setModelConfig(updatedConfig);
      localStorage.setItem('modelConfig', JSON.stringify(updatedConfig));
      
      // バックエンドにも送信
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
        // エラー時は前の設定に戻す
        if (modelConfig) {
          setModelConfig(modelConfig);
          localStorage.setItem('modelConfig', JSON.stringify(modelConfig));
        }
      }
    } catch (error) {
      console.error('モデル設定の更新に失敗:', error);
      alert('モデル設定の更新に失敗しました');
      // エラー時は前の設定に戻す
      if (modelConfig) {
        setModelConfig(modelConfig);
        localStorage.setItem('modelConfig', JSON.stringify(modelConfig));
      }
    }
  };

  // 初回読み込み時にローカルストレージから設定を復元
  useEffect(() => {
    loadModelConfig();
  }, []);

  return {
    modelConfig,
    availableModels,
    isLoadingModels,
    loadModelConfig,
    loadAvailableModels,
    updateModelConfig,
  };
};