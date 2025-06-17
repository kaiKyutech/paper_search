"use client";

import React from "react";
import { Eye, Brain, Languages, BarChart3, Lightbulb, FileText } from "lucide-react";
import { Paper, QuickSummary as QuickSummaryType, StreamingQuickSummary, SummaryData } from "../types";
import { ExpandableText, LoadingSpinner } from "../ui";
import { DetailedSummary } from "../features/summary";
import { PdfViewer } from "../features/pdf";

interface PaperCardProps {
  paper: Paper;
  isSelected: boolean;
  hasAnalysis: boolean;
  hasTranslation: boolean;
  onAnalyze: () => void;
  onTranslate: () => void;
  onSummarize: () => void;
  onQuickSummary: () => void;
  isAnalyzing: boolean;
  isTranslating: boolean;
  isSummarizing: boolean;
  isQuickSummarizing: boolean;
  analyzingPaperId: string | null;
  translatingPaperId: string | null;
  summarizingPaperId: string | null;
  quickSummarizingPaperId: string | null;
  getPaperId: (paper: Paper) => string;
  // Summary related props
  quickSummary: QuickSummaryType | null;
  streamingSummary: StreamingQuickSummary | null;
  summaryData: SummaryData | null;
  showSummaryPopup: boolean;
  onCloseSummary: () => void;
  expandedSummaries: Set<string>;
  onToggleExpanded: (paperId: string) => void;
  // PDF viewer props
  showPdfViewer: boolean;
  onClosePdfViewer: () => void;
  onOpenPdfViewer: () => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isSelected,
  hasAnalysis,
  hasTranslation,
  onAnalyze,
  onTranslate,
  onSummarize,
  onQuickSummary,
  isAnalyzing,
  isTranslating,
  isSummarizing,
  isQuickSummarizing,
  analyzingPaperId,
  translatingPaperId,
  summarizingPaperId,
  quickSummarizingPaperId,
  getPaperId,
  quickSummary,
  summaryData,
  showSummaryPopup,
  onCloseSummary,
  expandedSummaries,
  onToggleExpanded,
  showPdfViewer,
  onClosePdfViewer,
  onOpenPdfViewer
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

      <div className="mb-2">
        <div className="flex items-start">
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
      </div>
      
      <ExpandableText
        text={paper.authors && paper.authors.length > 0 
          ? paper.authors.map((author) => author.name).join(", ")
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
      
      {/* メタデータ情報 */}
      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-600">
        {paper.year && (
          <span className="flex items-center">
            📅 {paper.year}年
          </span>
        )}
        {paper.venue && (
          <span className="flex items-center">
            🏛️ {paper.venue}
          </span>
        )}
        {paper.citationCount !== undefined && paper.citationCount > 0 && (
          <span className="flex items-center">
            📊 引用:{paper.citationCount}
          </span>
        )}
        {paper.influentialCitationCount !== undefined && paper.influentialCitationCount > 0 && (
          <span className="flex items-center">
            ⭐ 影響力{paper.influentialCitationCount}回
          </span>
        )}
        {paper.referenceCount !== undefined && paper.referenceCount > 0 && (
          <span className="flex items-center">
            🔗 参考文献{paper.referenceCount}本
          </span>
        )}
        {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {paper.fieldsOfStudy.slice(0, 3).map((field, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {field}
              </span>
            ))}
            {paper.fieldsOfStudy.length > 3 && (
              <span className="text-gray-500">+{paper.fieldsOfStudy.length - 3}</span>
            )}
          </div>
        )}
        {paper.isOpenAccess && (
          <span className="flex items-center text-green-600">
            🔓 オープンアクセス
          </span>
        )}
      </div>
      
      {/* アクションボタン */}
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={onQuickSummary}
          disabled={(isQuickSummarizing && quickSummarizingPaperId === paperId) || !paper.abstract}
          className={`flex items-center px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 ${
            quickSummary
              ? 'bg-gray-400 hover:bg-gray-500 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isQuickSummarizing && quickSummarizingPaperId === paperId ? (
            <LoadingSpinner size={14} />
          ) : (
            <Lightbulb className="mr-1" size={14} />
          )}
          かんたん要約
        </button>
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
        {/* PDF表示ボタン - 一番右に配置 */}
        {paper.openAccessPdf?.url && paper.openAccessPdf.url.trim() && (
          <button
            onClick={onOpenPdfViewer}
            className="flex items-center px-3 py-1.5 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200 flex-shrink-0 ml-auto"
            title="PDFを表示"
          >
            <FileText className="mr-1" size={14} />
            PDF
          </button>
        )}
      </div>
      
      {/* 簡易要約表示 */}
      {quickSummary && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">かんたん要約</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">要約: </span>
              <span className="text-gray-600">{quickSummary.summary}</span>
            </div>
            {quickSummary.keywords && quickSummary.keywords.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">キーワード: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {quickSummary.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 詳細要約ポップアップ */}
      <DetailedSummary
        paperId={paperId}
        summaryData={summaryData}
        showPopup={showSummaryPopup}
        onClose={onCloseSummary}
        expandedSummaries={expandedSummaries}
        onToggleExpanded={onToggleExpanded}
      />
      
      {/* PDFビューアー */}
      {paper.openAccessPdf?.url && paper.openAccessPdf.url.trim() && (
        <PdfViewer
          pdfUrl={paper.openAccessPdf.url}
          paperTitle={paper.title}
          isOpen={showPdfViewer}
          onClose={onClosePdfViewer}
        />
      )}
    </div>
  );
};