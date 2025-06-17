import React from "react";
import { Tag, Zap } from "lucide-react";
import { QuickSummary as QuickSummaryType } from "../../types";

interface QuickSummaryProps {
  paperId: string;
  quickSummary: QuickSummaryType | null;
}

export const QuickSummary: React.FC<QuickSummaryProps> = ({
  paperId,
  quickSummary
}) => {
  if (!quickSummary) {
    return null;
  }

  return (
    <div className="mt-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
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
      
      {/* 詳細要約 */}
      <div className="bg-white rounded-lg p-2 border border-gray-200">
        <div className="flex items-center mb-1">
          <Zap className="mr-1 text-orange-600" size={12} />
          <span className="text-xs font-semibold text-orange-800">詳細要約</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed font-medium">
          {quickSummary.summary}
        </p>
      </div>
    </div>
  );
};