import React from "react";
import { Brain } from "lucide-react";
import { PaperAnalysisResult } from "../../types";

interface AnalysisResultProps {
  analysisResult: PaperAnalysisResult | null;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysisResult }) => {
  if (!analysisResult) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <Brain className="mx-auto mb-2" size={48} />
        解析結果がありません
        <p className="text-xs mt-2">解析ボタンを押して分析を開始してください</p>
      </div>
    );
  }

  return (
    <>
      {/* 分野分類 */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 分野分類</h4>
        <div className="space-y-1">
          {analysisResult.fields.map((field, index) => (
            <div key={index} className="flex justify-between items-center bg-white p-2 rounded text-xs">
              <span className="font-medium">{field.name}</span>
              <div className="flex items-center">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mr-1">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${field.score * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{(field.score * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 研究対象 */}
      <div className="bg-green-50 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-green-800 mb-2">🎯 研究対象</h4>
        <div className="bg-white p-2 rounded text-xs">
          <div className="mb-1">
            <span className="font-medium text-gray-600">日本語:</span>
            <span className="ml-1 text-gray-800">{analysisResult.target.ja}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">English:</span>
            <span className="ml-1 text-gray-800">{analysisResult.target.en}</span>
          </div>
        </div>
      </div>

      {/* 技術的アプローチ */}
      <div className="bg-purple-50 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-purple-800 mb-2">🔬 技術的アプローチ</h4>
        
        {/* Methods */}
        <div className="bg-white p-2 rounded mb-2">
          <h5 className="text-xs font-semibold text-purple-700 mb-1">手法</h5>
          <div className="space-y-1">
            {analysisResult.methods.map((method, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium">{method.ja}</div>
                <div className="text-gray-600">{method.en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Factors */}
        <div className="bg-white p-2 rounded mb-2">
          <h5 className="text-xs font-semibold text-purple-700 mb-1">要因</h5>
          <div className="space-y-1">
            {analysisResult.factors.map((factor, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium">{factor.ja}</div>
                <div className="text-gray-600">{factor.en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white p-2 rounded">
          <h5 className="text-xs font-semibold text-purple-700 mb-1">指標</h5>
          <div className="space-y-1">
            {analysisResult.metrics.map((metric, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium">{metric.ja}</div>
                <div className="text-gray-600">{metric.en}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 検索キーワード */}
      <div className="bg-yellow-50 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">🔍 検索キーワード</h4>
        <div className="space-y-2">
          <div className="bg-white p-2 rounded">
            <h5 className="text-xs font-semibold text-yellow-700 mb-1">日本語</h5>
            <div className="flex flex-wrap gap-1">
              {analysisResult.search_keywords.map((keyword, index) => (
                <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                  {keyword.ja}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white p-2 rounded">
            <h5 className="text-xs font-semibold text-yellow-700 mb-1">English</h5>
            <div className="flex flex-wrap gap-1">
              {analysisResult.search_keywords.map((keyword, index) => (
                <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                  {keyword.en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};