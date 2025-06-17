import React from "react";
import { Loader2, Tag, Zap } from "lucide-react";
import { QuickSummary as QuickSummaryType, StreamingQuickSummary } from "../../types";

interface QuickSummaryProps {
  paperId: string;
  quickSummary: QuickSummaryType | null;
  streamingSummary: StreamingQuickSummary | null;
}

export const QuickSummary: React.FC<QuickSummaryProps> = ({
  paperId,
  quickSummary,
  streamingSummary
}) => {
  if (!quickSummary && !streamingSummary) {
    return null;
  }

  return (
    <div className="mt-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
      {streamingSummary ? (
        /* ストリーミング中の表示 */
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center mb-2">
            <Loader2 className="animate-spin mr-2 text-orange-600" size={14} />
            <span className="text-sm font-semibold text-orange-800">要約生成中...</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 min-h-[60px] max-h-[200px] overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
              {streamingSummary.streamingText}
              <span className="animate-pulse">|</span>
            </pre>
          </div>
        </div>
      ) : (
        /* 完了時の表示 */
        quickSummary && (
          <>
            {/* キーワード */}
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {quickSummary.keywords.map((keyword, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            {/* 一言要約 */}
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center mb-1">
                <Zap className="mr-1 text-orange-600" size={12} />
                <span className="text-xs font-semibold text-orange-800">一言要約</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {quickSummary.what_they_did}
              </p>
            </div>
          </>
        )
      )}
    </div>
  );
};