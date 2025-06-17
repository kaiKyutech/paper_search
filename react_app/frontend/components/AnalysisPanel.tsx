"use client";

import React from "react";
import { X, Brain, Languages } from "lucide-react";
import { Paper, PaperAnalysisResult } from "../types";
import { ResizablePanel } from "../ui";
import { AnalysisResult } from "../features/analysis";
import { TranslationResult } from "../features/translation";

interface AnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPaper: Paper | null;
  headerHeight: number;
  activeTab: 'analysis' | 'translation';
  onTabChange: (tab: 'analysis' | 'translation') => void;
  analysisResult: PaperAnalysisResult | null;
  translationResult: string | null;
  streamingTranslation: string;
  isStreamingTranslation: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  isOpen,
  onClose,
  selectedPaper,
  headerHeight,
  activeTab,
  onTabChange,
  analysisResult,
  translationResult,
  streamingTranslation,
  isStreamingTranslation
}) => {
  return (
    <ResizablePanel
      isOpen={isOpen}
      onClose={onClose}
      headerHeight={headerHeight}
    >
      <div className="sticky top-0 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center p-4 pb-0">
          <h2 className="text-lg font-bold text-gray-800">
            論文情報
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {selectedPaper && (
          <h3 className="text-sm text-gray-600 px-4 line-clamp-2">{selectedPaper.title}</h3>
        )}
        
        {/* タブ */}
        <div className="flex mt-3">
          <button
            onClick={() => onTabChange('analysis')}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analysis'
                ? 'border-purple-500 text-purple-600 bg-purple-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Brain className="mr-1" size={16} />
            解析結果
          </button>
          <button
            onClick={() => onTabChange('translation')}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'translation'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Languages className="mr-1" size={16} />
            翻訳
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'analysis' ? (
          <AnalysisResult analysisResult={analysisResult} />
        ) : (
          <TranslationResult
            translationResult={translationResult}
            streamingTranslation={streamingTranslation}
            isStreamingTranslation={isStreamingTranslation}
          />
        )}
      </div>
    </ResizablePanel>
  );
};