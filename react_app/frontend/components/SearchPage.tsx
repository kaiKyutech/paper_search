"use client";
import React, { useState } from "react";
import { Search, FileText, Upload, File, X, ChevronDown, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const SearchPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"keyword" | "ai">("keyword");
  const [searchEngine, setSearchEngine] = useState<"semantic" | "google">(
    "semantic"
  );
  const [resultLimit, setResultLimit] = useState<number>(10);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [animationState, setAnimationState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      params.set("type", searchType);
      params.set("engine", searchEngine);
      params.set("limit", resultLimit.toString());
      router.push(`/results?${params.toString()}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleOptions = () => {
    if (showAdvancedOptions) {
      setAnimationState('closing');
      setTimeout(() => {
        setShowAdvancedOptions(false);
        setAnimationState('closed');
      }, 600);
    } else {
      setShowAdvancedOptions(true);
      setAnimationState('opening');
      setTimeout(() => {
        setAnimationState('open');
      }, 800);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes smoothExpand {
          0% {
            max-height: 0;
            opacity: 0;
            transform: translate3d(0, -10px, 0);
          }
          15% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
          85% {
            max-height: 450px;
            opacity: 0.95;
          }
          100% {
            max-height: 500px;
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes smoothCollapse {
          0% {
            max-height: 500px;
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          15% {
            opacity: 0.95;
          }
          50% {
            opacity: 0.5;
            max-height: 250px;
          }
          85% {
            opacity: 0.1;
            max-height: 50px;
          }
          100% {
            max-height: 0;
            opacity: 0;
            transform: translate3d(0, -10px, 0);
          }
        }
        
        .expand-animation {
          animation: smoothExpand 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: max-height, opacity, transform;
          transform: translateZ(0);
        }
        
        .collapse-animation {
          animation: smoothCollapse 600ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
          will-change: max-height, opacity, transform;
          transform: translateZ(0);
        }
        
        .expand-static {
          max-height: 500px;
          opacity: 1;
          transform: translate3d(0, 0, 0);
          will-change: auto;
        }
        
        .collapse-static {
          max-height: 0;
          opacity: 0;
          transform: translate3d(0, -10px, 0);
          will-change: auto;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-4xl transition-all duration-700 ease-out">
        <div className="text-center mb-12">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <FileText className="mx-auto text-blue-600 relative z-10" size={72} />
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-3 tracking-tight">
            Paper Search
          </h1>
          <p className="text-lg text-gray-600 font-light">
            学術論文を検索・発見しましょう
          </p>
        </div>
        {/* メイン検索ボックス */}
        <div className="w-full mb-6">
          <div className="relative group">
            <Search
              className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={22}
            />
            <input
              type="text"
              placeholder={
                searchType === "keyword"
                  ? "論文のタイトル、著者、キーワードを入力..."
                  : "どのような論文をお探しですか？（自然言語で入力）"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full pl-16 pr-32 py-5 text-lg rounded-2xl focus:outline-none text-black bg-white/90 backdrop-blur-sm shadow-lg border border-white/40 focus:bg-white focus:shadow-xl focus:border-blue-300 transition-all duration-300"
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
            >
              {searchType === "keyword" ? "検索" : "AI検索"}
            </button>
          </div>
        </div>

        {/* 高度なオプション */}
        <div className="w-full mb-8">
          <button
            onClick={handleToggleOptions}
            className="flex items-center justify-center w-full py-3 px-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300 text-gray-700 hover:text-blue-600 group"
          >
            <Settings className="mr-2" size={18} />
            <span className="font-medium">検索オプション</span>
            <ChevronDown 
              className={`ml-2 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${showAdvancedOptions ? 'rotate-180' : ''}`} 
              size={18} 
            />
          </button>
          
          {showAdvancedOptions && (
            <div className={`overflow-hidden mt-4 ${
              animationState === 'opening' ? 'expand-animation' :
              animationState === 'open' ? 'expand-static' :
              animationState === 'closing' ? 'collapse-animation' :
              'collapse-static'
            }`}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">検索エンジン</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="searchEngine"
                        value="semantic"
                        checked={searchEngine === "semantic"}
                        onChange={(e) =>
                          setSearchEngine(e.target.value as "semantic" | "google")
                        }
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        Semantic Scholar
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="searchEngine"
                        value="google"
                        checked={searchEngine === "google"}
                        onChange={(e) =>
                          setSearchEngine(e.target.value as "semantic" | "google")
                        }
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        Google Scholar
                      </span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">検索タイプ</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="searchType"
                        value="keyword"
                        checked={searchType === "keyword"}
                        onChange={(e) =>
                          setSearchType(e.target.value as "keyword" | "ai")
                        }
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">キーワード検索</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="searchType"
                        value="ai"
                        checked={searchType === "ai"}
                        onChange={(e) =>
                          setSearchType(e.target.value as "keyword" | "ai")
                        }
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">AI検索</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-semibold text-gray-700">検索結果数:</label>
                    <select
                      value={resultLimit}
                      onChange={(e) => setResultLimit(Number(e.target.value))}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <option value={5}>5件</option>
                      <option value={10}>10件</option>
                      <option value={20}>20件</option>
                      <option value={50}>50件</option>
                      <option value={100}>100件</option>
                    </select>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 max-w-xs">
                      {searchType === "keyword"
                        ? "キーワードに完全一致する論文を検索"
                        : "AIが内容を理解して関連論文を検索"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
        {/* ファイルアップロード（オプション） */}
        <div className="w-full mt-8 transition-all duration-700 ease-in-out">
          <div className="text-center mb-4">
            <p className="text-gray-600 font-light">
              または、論文ファイルをアップロード
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-white/80 transition-all duration-300">
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center cursor-pointer group"
            >
              <Upload className="text-gray-400 group-hover:text-blue-500 transition-colors mr-3" size={24} />
              <div className="text-center">
                <p className="text-gray-600 group-hover:text-blue-600 transition-colors">ファイルを選択</p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT</p>
              </div>
            </label>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-white/40 shadow-sm"
                >
                  <div className="flex items-center">
                    <File className="mr-2 text-blue-600" size={16} />
                    <div>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-xs block">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
