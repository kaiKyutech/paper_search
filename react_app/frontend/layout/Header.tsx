import React, { forwardRef } from "react";
import { Menu, FileText } from "lucide-react";
import { SearchBar } from "../features/search";
import { resultLimitOptions } from "../config/api";

interface HeaderProps {
  onMenuClick: () => void;
  onLogoClick: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  resultLimit: number;
  onLimitChange: (limit: number) => void;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(({
  onMenuClick,
  onLogoClick,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  resultLimit,
  onLimitChange
}, ref) => {
  return (
    <header ref={ref} className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center px-4 py-3">
        <button 
          onClick={onMenuClick} 
          className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <Menu size={24} />
        </button>
        <div
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onLogoClick}
        >
          <FileText className="mr-2 text-blue-600" size={28} />
          <h1 className="text-xl font-normal text-gray-700">Paper Search</h1>
        </div>
        
        <SearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          onSearch={onSearch}
          className="ml-8 flex-grow max-w-2xl"
        />
        
        <div className="ml-4 flex items-center space-x-3">
          <span className="text-sm text-gray-600 whitespace-nowrap">表示件数:</span>
          <select
            value={resultLimit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {resultLimitOptions.map(option => (
              <option key={option} value={option}>{option}件</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
});