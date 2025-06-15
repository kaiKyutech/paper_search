"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  FileText,
  Settings,
  User,
  Clock,
  Bookmark,
  TrendingUp,
  ChevronDown,
  Loader2,
  Brain,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// 型定義
interface PaperField {
  name: string;
  score: number;
}

interface Label {
  ja: string;
  en: string;
}

interface PaperAnalysisResult {
  title?: string;
  fields: PaperField[];
  target: Label;
  methods: Label[];
  factors: Label[];
  metrics: Label[];
  search_keywords: Label[];
}

const ResultsPage: React.FC = () => {
  const params = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(params.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState<"relevance" | "date" | "citations">(
    "relevance"
  );
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [resultLimit, setResultLimit] = useState<number>(10);
  const [analysisResult, setAnalysisResult] = useState<PaperAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    const q = params.get("q");
    if (!q) return;
    
    setIsLoading(true);
    const startTime = performance.now();
    
    const limit = params.get("limit") || "10";
    setResultLimit(Number(limit));
    const searchUrl = `http://localhost:8000/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    
    fetch(searchUrl)
      .then((res) => res.json())
      .then((data) => {
        const endTime = performance.now();
        setSearchTime((endTime - startTime) / 1000);
        setResults(data.papers || []);
      })
      .catch((err) => {
        console.error(err);
        setResults([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [params]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams(params.toString());
      newParams.set("q", searchQuery);
      router.push(`/results?${newParams.toString()}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleLimitChange = (newLimit: number) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("limit", newLimit.toString());
    router.push(`/results?${newParams.toString()}`);
  };

  const handleAnalyzePaper = async (paper: any) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: paper.title,
          abstract: paper.abstract || ""
        }),
      });

      if (!response.ok) {
        throw new Error('解析に失敗しました');
      }

      const analysisData = await response.json();
      setAnalysisResult(analysisData);
      setShowAnalysisModal(true);
    } catch (error) {
      console.error('解析エラー:', error);
      alert('論文解析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const drawerItems = [
    { text: "アカウント", icon: User, id: "account" },
    { text: "設定", icon: Settings, id: "settings" },
    { text: "検索履歴", icon: Clock, id: "history" },
    { text: "ブックマーク", icon: Bookmark, id: "bookmarks" },
    { text: "論文ネットワーク", icon: TrendingUp, id: "network" },
  ];

  const sortOptions = [
    { value: "relevance", label: "関連度順" },
    { value: "date", label: "新しい順" },
    { value: "citations", label: "引用数順" },
  ];

  return (
    <div className="flex">
      <div
        className={`fixed left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ top: headerHeight, height: `calc(100% - ${headerHeight}px)` }}
      >
        <nav className="p-4 space-y-2">
          {drawerItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-all duration-200 hover:translate-x-1 hover:shadow-sm"
                style={{
                  animationDelay: drawerOpen ? `${index * 50}ms` : "0ms",
                  animation: drawerOpen ? "slideInLeft 0.3s ease-out forwards" : "none",
                }}
              >
                <IconComponent className="mr-3 text-gray-600 transition-colors duration-200" size={20} />
                <span className="text-sm text-gray-700">{item.text}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col flex-grow min-h-screen bg-gray-50">
        <header ref={headerRef} className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center px-4 py-3">
            <button onClick={toggleDrawer} className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <Menu size={24} />
            </button>
            <div
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <FileText className="mr-2 text-blue-600" size={28} />
              <h1 className="text-xl font-normal text-gray-700">Paper Search</h1>
            </div>
            <div className="ml-8 flex-grow max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="論文を検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
            </div>
            <div className="ml-4 flex items-center space-x-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">表示件数:</span>
              <select
                value={resultLimit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <option value={5}>5件</option>
                <option value={10}>10件</option>
                <option value={20}>20件</option>
                <option value={50}>50件</option>
                <option value={100}>100件</option>
              </select>
            </div>
          </div>
        </header>

        <style jsx>{`
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}</style>

        <main className={`flex-grow transition-all duration-300 ${drawerOpen ? "ml-72" : ""}`}
          style={{ width: drawerOpen ? "calc(100% - 18rem)" : "100%" }}
        >
          <div className="max-w-4xl mx-auto px-4 mt-6">
            {sortDropdownOpen && (
              <div className="fixed inset-0 z-30" onClick={() => setSortDropdownOpen(false)}></div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                {isLoading ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <Loader2 className="animate-spin mr-2" size={16} />
                    検索中...
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {results.length > 0 
                      ? `${results.length} 件の結果 (${searchTime.toFixed(2)} 秒)`
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
                            setSortOption(option.value as "relevance" | "date" | "citations");
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${sortOption === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  // ローディング中のスケルトン表示
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse"
                    >
                      <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  results.map((result, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg font-normal text-blue-700 hover:underline flex-1 mr-4"
                        >
                          {result.title}
                        </a>
                        <button
                          onClick={() => handleAnalyzePaper(result)}
                          disabled={isAnalyzing}
                          className="flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="animate-spin mr-1" size={14} />
                          ) : (
                            <Brain className="mr-1" size={14} />
                          )}
                          解析
                        </button>
                      </div>
                      <p className="text-sm text-green-700 mb-2">
                        {result.authors && result.authors.length > 0 
                          ? result.authors.map((author: any) => author.name).join(", ")
                          : "著者不明"
                        }
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {result.abstract || "要約なし"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        {/* 解析結果モーダル */}
        {showAnalysisModal && analysisResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Brain className="mr-3 text-purple-600" size={28} />
                    論文解析結果
                  </h2>
                  <button
                    onClick={() => setShowAnalysisModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                {analysisResult.title && (
                  <h3 className="text-lg text-gray-600 mt-2">{analysisResult.title}</h3>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* 分野分類 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">📊 分野分類</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysisResult.fields.map((field, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <span className="font-medium">{field.name}</span>
                        <div className="flex items-center">
                          <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${field.score * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{(field.score * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 研究対象 */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3">🎯 研究対象</h4>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                      <div>
                        <span className="font-medium text-gray-600">日本語:</span>
                        <span className="ml-2 text-gray-800">{analysisResult.target.ja}</span>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className="font-medium text-gray-600">English:</span>
                        <span className="ml-2 text-gray-800">{analysisResult.target.en}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 技術的アプローチ */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3">🔬 技術的アプローチ</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Methods */}
                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-700 mb-2">手法 (Methods)</h5>
                      <div className="space-y-2">
                        {analysisResult.methods.map((method, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{method.ja}</div>
                            <div className="text-gray-600">{method.en}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Factors */}
                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-700 mb-2">要因 (Factors)</h5>
                      <div className="space-y-2">
                        {analysisResult.factors.map((factor, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{factor.ja}</div>
                            <div className="text-gray-600">{factor.en}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-700 mb-2">指標 (Metrics)</h5>
                      <div className="space-y-2">
                        {analysisResult.metrics.map((metric, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{metric.ja}</div>
                            <div className="text-gray-600">{metric.en}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 検索キーワード */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-3">🔍 検索キーワード</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-semibold text-yellow-700 mb-2">日本語</h5>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.search_keywords.map((keyword, index) => (
                          <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                            {keyword.ja}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-semibold text-yellow-700 mb-2">English</h5>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.search_keywords.map((keyword, index) => (
                          <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                            {keyword.en}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
