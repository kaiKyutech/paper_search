"use client";

import React, { useState } from "react";
import { 
  X, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Tag,
  Zap,
  Target,
  Brain,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { StructuredSummary, SummaryData } from "../../types";

interface StructuredSummaryDisplayProps {
  summary: StructuredSummary;
  onClose: () => void;
}

const StructuredSummaryDisplay: React.FC<StructuredSummaryDisplayProps> = ({ summary, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-3 relative border border-teal-200 bg-teal-50 rounded-lg shadow-lg">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
      >
        <X size={14} className="text-gray-600" />
      </button>
      
      {/* ヘッダー部分（常に表示） */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-semibold text-teal-800 hover:text-teal-900 transition-colors cursor-pointer"
          >
            <FileText className="mr-1" size={16} />
            詳細要約
            {isExpanded ? (
              <ChevronUp className="ml-2" size={14} />
            ) : (
              <ChevronDown className="ml-2" size={14} />
            )}
          </button>
        </div>
        
        {/* キーワード（常に表示） */}
        {summary.keywords && summary.keywords.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center mb-1">
              <Tag className="mr-1" size={12} />
              <span className="text-xs font-medium text-gray-600">キーワード</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {summary.keywords.map((keyword, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* 背景（常に表示） */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center mb-1">
            <Target className="mr-1 text-blue-600" size={14} />
            <span className="text-sm font-semibold text-blue-800">背景</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">{summary.background}</p>
        </div>
      </div>
      
      {/* 詳細セクション（展開時のみ表示） */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* 手法 */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center mb-1">
              <Brain className="mr-1 text-purple-600" size={14} />
              <span className="text-sm font-semibold text-purple-800">手法</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.method}</p>
          </div>
          
          {/* 結果 */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center mb-1">
              <BarChart3 className="mr-1 text-green-600" size={14} />
              <span className="text-sm font-semibold text-green-800">結果</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.results}</p>
          </div>
          
          {/* 結論 */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center mb-1">
              <CheckCircle className="mr-1 text-teal-600" size={14} />
              <span className="text-sm font-semibold text-teal-800">結論</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.conclusion}</p>
          </div>
        </div>
      )}
      
      {/* 矢印 */}
      <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-teal-200"></div>
    </div>
  );
};

interface DetailedSummaryProps {
  paperId: string;
  summaryData: SummaryData | null;
  showPopup: boolean;
  onClose: () => void;
  expandedSummaries: Set<string>;
  onToggleExpanded: (paperId: string) => void;
}

export const DetailedSummary: React.FC<DetailedSummaryProps> = ({
  paperId,
  summaryData,
  showPopup,
  onClose,
  expandedSummaries,
  onToggleExpanded
}) => {
  if (!showPopup || !summaryData) {
    return null;
  }

  if (summaryData.structured) {
    return (
      <StructuredSummaryDisplay 
        summary={summaryData.structured} 
        onClose={onClose}
      />
    );
  }

  return (
    <div className="mt-3 relative">
      <div className="bg-teal-50 border border-teal-200 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-teal-100 rounded-full transition-colors z-10"
        >
          <X size={14} className="text-teal-600" />
        </button>
        <div className="p-4">
          <button
            onClick={() => onToggleExpanded(paperId)}
            className="flex items-center text-sm font-semibold text-teal-800 hover:text-teal-900 transition-colors cursor-pointer mb-2"
          >
            <FileText className="mr-1" size={16} />
            論文要約
            {expandedSummaries.has(paperId) ? (
              <ChevronUp className="ml-2" size={14} />
            ) : (
              <ChevronDown className="ml-2" size={14} />
            )}
          </button>
          {expandedSummaries.has(paperId) && (
            <p className="text-sm text-teal-900 leading-relaxed">
              {summaryData.summary}
            </p>
          )}
        </div>
      </div>
      {/* 矢印 */}
      <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-teal-200"></div>
    </div>
  );
};