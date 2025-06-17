import React from "react";
import { Eye, Brain, Languages, BarChart3 } from "lucide-react";
import { Paper } from "../types";
import { ExpandableText, LoadingSpinner } from "../ui";
import { QuickSummary, DetailedSummary } from "../features/summary";

interface PaperCardProps {
  paper: Paper;
  isSelected: boolean;
  hasAnalysis: boolean;
  hasTranslation: boolean;
  onAnalyze: () => void;
  onTranslate: () => void;
  onSummarize: () => void;
  isAnalyzing: boolean;
  isTranslating: boolean;
  isSummarizing: boolean;
  analyzingPaperId: string | null;
  translatingPaperId: string | null;
  summarizingPaperId: string | null;
  getPaperId: (paper: Paper) => string;
  // Summary related props
  quickSummary: any;
  streamingSummary: any;
  summaryData: any;
  showSummaryPopup: boolean;
  onCloseSummary: () => void;
  expandedSummaries: Set<string>;
  onToggleExpanded: (paperId: string) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isSelected,
  hasAnalysis,
  hasTranslation,
  onAnalyze,
  onTranslate,
  onSummarize,
  isAnalyzing,
  isTranslating,
  isSummarizing,
  analyzingPaperId,
  translatingPaperId,
  summarizingPaperId,
  getPaperId,
  quickSummary,
  streamingSummary,
  summaryData,
  showSummaryPopup,
  onCloseSummary,
  expandedSummaries,
  onToggleExpanded
}) => {
  const paperId = getPaperId(paper);

  return (
    <div
      className={`p-6 rounded-lg border transition-all duration-300 ${
        isSelected 
          ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-400 ring-4 ring-purple-200 z-10 relative selected-paper' 
          : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
      }`}
    >
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(147, 51, 234, 0), 0 25px 30px -5px rgba(0, 0, 0, 0.15);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
        }
        @keyframes border-glow {
          0% { border-color: rgb(168 85 247); }
          50% { border-color: rgb(147 51 234); }
          100% { border-color: rgb(168 85 247); }
        }
        .selected-paper {
          animation: pulse-ring 3s ease-in-out infinite, border-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start flex-1 mr-4">
          {isSelected && (
            <Eye className="mr-2 mt-1 text-purple-600 flex-shrink-0" size={16} />
          )}
          <a 
            href={paper.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg font-normal text-blue-700 hover:underline"
          >
            {paper.title}
          </a>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onSummarize}
            disabled={(isSummarizing && summarizingPaperId === paperId) || !paper.abstract}
            className={`flex items-center px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 ${
              summaryData
                ? 'bg-gray-400 hover:bg-gray-500 text-white'
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
          >
            {isSummarizing && summarizingPaperId === paperId ? (
              <LoadingSpinner size={14} />
            ) : (
              <BarChart3 className="mr-1" size={14} />
            )}
            詳細要約
          </button>
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing && analyzingPaperId === paperId}
            className={`flex items-center px-3 py-1.5 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 ${
              hasAnalysis
                ? 'bg-gray-400 hover:bg-gray-500'
                : isSelected 
                  ? 'bg-purple-700 hover:bg-purple-800 ring-2 ring-purple-300' 
                  : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isAnalyzing && analyzingPaperId === paperId ? (
              <LoadingSpinner size={14} />
            ) : hasAnalysis ? (
              <Eye className="mr-1" size={14} />
            ) : (
              <Brain className="mr-1" size={14} />
            )}
            {hasAnalysis ? '表示' : '解析'}
          </button>
          <button
            onClick={onTranslate}
            disabled={(isTranslating && translatingPaperId === paperId) || !paper.abstract}
            className={`flex items-center px-3 py-1.5 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 ${
              hasTranslation
                ? 'bg-gray-400 hover:bg-gray-500'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {isTranslating && translatingPaperId === paperId ? (
              <LoadingSpinner size={14} />
            ) : (
              <Languages className="mr-1" size={14} />
            )}
            翻訳
          </button>
        </div>
      </div>
      
      <ExpandableText
        text={paper.authors && paper.authors.length > 0 
          ? paper.authors.map((author: any) => author.name).join(", ")
          : "著者不明"
        }
        maxLines={2}
        className="text-sm text-green-700 mb-2"
      />
      
      <ExpandableText
        text={paper.abstract || "要約なし"}
        maxLines={2}
        className="text-sm text-gray-700 leading-relaxed"
      />
      
      {/* 簡潔要約表示 */}
      <QuickSummary
        paperId={paperId}
        quickSummary={quickSummary}
        streamingSummary={streamingSummary}
      />
      
      {/* 詳細要約ポップアップ */}
      <DetailedSummary
        paperId={paperId}
        summaryData={summaryData}
        showPopup={showSummaryPopup}
        onClose={onCloseSummary}
        expandedSummaries={expandedSummaries}
        onToggleExpanded={onToggleExpanded}
      />
    </div>
  );
};