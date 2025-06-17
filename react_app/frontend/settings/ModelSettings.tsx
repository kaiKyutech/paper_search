import React from "react";
import { X, Settings, Brain, Languages, Zap, BarChart3, Loader2 } from "lucide-react";
import { ModelConfig, AvailableModel } from "../types";

interface ModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  modelConfig: ModelConfig | null;
  availableModels: AvailableModel[];
  isLoadingModels: boolean;
  onUpdateModel: (functionName: string, modelName: string) => void;
}

export const ModelSettings: React.FC<ModelSettingsProps> = ({
  isOpen,
  onClose,
  modelConfig,
  availableModels,
  isLoadingModels,
  onUpdateModel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Settings className="mr-3 text-blue-600" size={28} />
              言語モデル設定
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            各機能で使用する言語モデルを個別に設定できます
          </p>
        </div>

        <div className="p-6 space-y-6">
          {isLoadingModels ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin mr-2" size={24} />
              モデル情報を読み込み中...
            </div>
          ) : (
            modelConfig && (
              <div className="space-y-4">
                {/* Analysis Model */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <Brain className="mr-2" size={20} />
                    論文解析
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">論文の分野分類や技術要素の抽出に使用</p>
                  <select
                    value={modelConfig.analysis_model}
                    onChange={(e) => onUpdateModel('analysis', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {availableModels.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name} ({(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Translation Model */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                    <Languages className="mr-2" size={20} />
                    翻訳
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">英語論文の日本語翻訳（通常・ストリーミング共通）</p>
                  <select
                    value={modelConfig.translation_model}
                    onChange={(e) => onUpdateModel('translation', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {availableModels.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name} ({(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Summary Model */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                    <Zap className="mr-2" size={20} />
                    簡潔要約
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">一言要約・キーワード抽出（自動実行）</p>
                  <select
                    value={modelConfig.quick_summary_model}
                    onChange={(e) => onUpdateModel('quick_summary', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {availableModels.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name} ({(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Detailed Summary Model */}
                <div className="bg-teal-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-teal-800 mb-3 flex items-center">
                    <BarChart3 className="mr-2" size={20} />
                    詳細要約
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">構造化された詳細要約（ボタン押下時）</p>
                  <select
                    value={modelConfig.detailed_summary_model}
                    onChange={(e) => onUpdateModel('detailed_summary', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {availableModels.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name} ({(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          )}

          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">注意事項</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• モデルの変更は即座に反映されます</li>
              <li>• 大きなモデルほど高精度ですが、処理時間が長くなります</li>
              <li>• 各機能に最適化されたモデルを選択することを推奨します</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};