"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LoadingSpinner } from "../../ui";
import { sortOptions } from "../../config/api";

interface ResultsHeaderProps {
  isLoading: boolean;
  resultsCount: number;
  searchTime: number;
  sortOption: "relevance" | "date" | "citations";
  onSortChange: (option: "relevance" | "date" | "citations") => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  isLoading,
  resultsCount,
  searchTime,
  sortOption,
  onSortChange
}) => {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-4">
      {sortDropdownOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setSortDropdownOpen(false)}></div>
      )}
      
      {isLoading ? (
        <LoadingSpinner text="検索中..." className="text-sm text-gray-600" />
      ) : (
        <p className="text-sm text-gray-600">
          {resultsCount > 0 
            ? `${resultsCount} 件の結果 (${searchTime.toFixed(2)} 秒)`
            : "検索結果がありません"
          }
        </p>
      )}
      
      <div className="relative">
        <button
          onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          ソート: {sortOptions.find((opt) => opt.value === sortOption)?.label}
          <ChevronDown size={16} className="ml-1" />
        </button>
        {sortDropdownOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value as "relevance" | "date" | "citations");
                  setSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  sortOption === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};