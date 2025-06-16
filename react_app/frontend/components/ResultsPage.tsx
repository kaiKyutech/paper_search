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
  Eye,
  Languages,
  ChevronUp,
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

// 展開可能なテキストコンポーネント
interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxLines = 2, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
      const height = textRef.current.scrollHeight;
      const lines = Math.floor(height / lineHeight);
      setShouldShowToggle(lines > maxLines);
    }
  }, [text, maxLines]);

  return (
    <div>
      <p
        ref={textRef}
        className={`${className} transition-all duration-300`}
        style={{
          display: isExpanded ? 'block' : '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: isExpanded ? 'visible' : 'hidden'
        }}
      >
        {text}
      </p>
      {shouldShowToggle && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-xs text-blue-600 hover:text-blue-800 mt-1 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} className="mr-1" />
              表示を少なくする
            </>
          ) : (
            <>
              <ChevronDown size={14} className="mr-1" />
              もっと見る
            </>
          )}
        </button>
      )}
    </div>
  );
};

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
  const [analysisResults, setAnalysisResults] = useState<Record<string, PaperAnalysisResult>>({});
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [analyzingPaperId, setAnalyzingPaperId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'translation'>('analysis');
  const [translationResults, setTranslationResults] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatingPaperId, setTranslatingPaperId] = useState<string | null>(null);
  const [streamingTranslation, setStreamingTranslation] = useState<string>('');
  const [isStreamingTranslation, setIsStreamingTranslation] = useState(false);
  const [summaryResults, setSummaryResults] = useState<Record<string, string>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizingPaperId, setSummarizingPaperId] = useState<string | null>(null);
  const [showSummaryPopup, setShowSummaryPopup] = useState<Set<string>>(new Set());
  const [autoSummarizeQueue, setAutoSummarizeQueue] = useState<string[]>([]);
  const [currentPriorityTask, setCurrentPriorityTask] = useState<{type: 'summarize' | 'analyze' | 'translate', paperId: string} | null>(null);
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
        const papers = data.papers || [];
        setResults(papers);
        
        // 自動要約のためのキューを設定
        const paperIds = papers
          .filter((paper: any) => paper.abstract)
          .map((paper: any) => getPaperId(paper));
        setAutoSummarizeQueue(paperIds);
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

  const getPaperId = (paper: any): string => {
    // 論文のユニークIDを生成（URL、タイトル、または著者情報から）
    return paper.paperId || paper.url || `${paper.title}_${paper.authors?.[0]?.name || 'unknown'}`;
  };

  const handleAnalyzePaper = async (paper: any) => {
    const paperId = getPaperId(paper);
    
    // 優先タスクとして設定
    setCurrentPriorityTask({type: 'analyze', paperId});
    
    // キャッシュされた結果があるかチェック
    if (analysisResults[paperId]) {
      setSelectedPaper(paper);
      setActiveTab('analysis');
      setShowAnalysisPanel(true);
      setCurrentPriorityTask(null);
      return;
    }

    setAnalyzingPaperId(paperId);
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
      
      // 結果をキャッシュ
      setAnalysisResults(prev => ({
        ...prev,
        [paperId]: analysisData
      }));
      
      setSelectedPaper(paper);
      setActiveTab('analysis');
      setShowAnalysisPanel(true);
    } catch (error) {
      console.error('解析エラー:', error);
      alert('論文解析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingPaperId(null);
      setCurrentPriorityTask(null);
    }
  };

  const getAnalysisResult = (): PaperAnalysisResult | null => {
    if (!selectedPaper) return null;
    const paperId = getPaperId(selectedPaper);
    return analysisResults[paperId] || null;
  };

  const handleTranslatePaper = async (paper: any) => {
    const paperId = getPaperId(paper);
    
    // 優先タスクとして設定
    setCurrentPriorityTask({type: 'translate', paperId});
    
    // キャッシュされた翻訳結果があるかチェック
    if (translationResults[paperId]) {
      setSelectedPaper(paper);
      setActiveTab('translation');
      setShowAnalysisPanel(true);
      setCurrentPriorityTask(null);
      return;
    }

    if (!paper.abstract) {
      alert('この論文にはアブストラクトがありません');
      setCurrentPriorityTask(null);
      return;
    }

    // UI状態を設定
    setTranslatingPaperId(paperId);
    setIsTranslating(true);
    setSelectedPaper(paper);
    setActiveTab('translation');
    setShowAnalysisPanel(true);
    setStreamingTranslation('');
    setIsStreamingTranslation(true);
    
    try {
      // ストリーミング翻訳APIを使用
      const response = await fetch('http://localhost:8000/translate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: paper.abstract
        }),
      });

      if (!response.ok) {
        throw new Error('翻訳に失敗しました');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ストリーミングの読み取りに失敗しました');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  setStreamingTranslation('');
                  break;
                  
                case 'chunk':
                  setStreamingTranslation(data.accumulated || '');
                  break;
                  
                case 'complete':
                  setStreamingTranslation(data.content);
                  // 最終結果をキャッシュ
                  setTranslationResults(prev => ({
                    ...prev,
                    [paperId]: data.content
                  }));
                  setIsStreamingTranslation(false);
                  break;
                  
                case 'error':
                  throw new Error(data.content);
              }
            } catch (parseError) {
              console.error('JSON解析エラー:', parseError);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('ストリーミング翻訳エラー:', error);
      alert('翻訳中にエラーが発生しました');
      setIsStreamingTranslation(false);
    } finally {
      setIsTranslating(false);
      setTranslatingPaperId(null);
      setCurrentPriorityTask(null);
    }
  };

  // 自動要約キューの処理
  useEffect(() => {
    if (autoSummarizeQueue.length > 0 && !isSummarizing && !currentPriorityTask) {
      const paperId = autoSummarizeQueue[0];
      const paper = results.find(r => getPaperId(r) === paperId);
      if (paper && !summaryResults[paperId]) {
        handleSummarizePaper(paper, true);
        setAutoSummarizeQueue(prev => prev.slice(1));
      } else {
        setAutoSummarizeQueue(prev => prev.slice(1));
      }
    }
  }, [autoSummarizeQueue, isSummarizing, currentPriorityTask, results, summaryResults]);

  const handleSummarizePaper = async (paper: any, isAutomatic = false) => {
    const paperId = getPaperId(paper);
    
    // キャッシュされた要約結果があるかチェック
    if (summaryResults[paperId]) {
      if (!isAutomatic) {
        setShowSummaryPopup(prev => new Set([...prev, paperId]));
      }
      return;
    }

    if (!paper.abstract) {
      if (!isAutomatic) {
        alert('この論文にはアブストラクトがありません');
      }
      return;
    }

    // 他の優先タスクがある場合は中断
    if (currentPriorityTask && currentPriorityTask.paperId !== paperId) {
      return;
    }

    setSummarizingPaperId(paperId);
    setIsSummarizing(true);
    
    try {
      const response = await fetch('http://localhost:8000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: paper.title,
          abstract: paper.abstract
        }),
      });

      if (!response.ok) {
        throw new Error('要約に失敗しました');
      }

      const summaryData = await response.json();
      
      // 結果をキャッシュ
      setSummaryResults(prev => ({
        ...prev,
        [paperId]: summaryData.summary
      }));
      
      if (!isAutomatic) {
        setShowSummaryPopup(prev => new Set([...prev, paperId]));
      } else {
        // 自動要約の場合は自動で表示
        setShowSummaryPopup(prev => new Set([...prev, paperId]));
      }
    } catch (error) {
      console.error('要約エラー:', error);
      if (!isAutomatic) {
        alert('要約中にエラーが発生しました');
      }
    } finally {
      setIsSummarizing(false);
      setSummarizingPaperId(null);
      setCurrentPriorityTask(null);
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
            0% {
              border-color: rgb(168 85 247);
            }
            50% {
              border-color: rgb(147 51 234);
            }
            100% {
              border-color: rgb(168 85 247);
            }
          }
          .selected-paper {
            animation: pulse-ring 3s ease-in-out infinite, border-glow 2s ease-in-out infinite;
          }
        `}</style>

        <div className="flex flex-grow">
          <main className={`flex-grow transition-all duration-300 ${drawerOpen ? "ml-72" : ""} ${showAnalysisPanel ? "mr-96" : ""}`}
            style={{ 
              width: drawerOpen && showAnalysisPanel ? "calc(100% - 42rem)" : 
                     drawerOpen ? "calc(100% - 18rem)" : 
                     showAnalysisPanel ? "calc(100% - 24rem)" : "100%" 
            }}
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
                  results.map((result, index) => {
                    const isSelected = selectedPaper && getPaperId(selectedPaper) === getPaperId(result);
                    const hasAnalysis = analysisResults[getPaperId(result)];
                    return (
                    <div
                      key={index}
                      className={`p-6 rounded-lg border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-400 ring-4 ring-purple-200 z-10 relative selected-paper' 
                          : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start flex-1 mr-4">
                          {isSelected && (
                            <Eye className="mr-2 mt-1 text-purple-600 flex-shrink-0" size={16} />
                          )}
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-lg font-normal text-blue-700 hover:underline"
                          >
                            {result.title}
                          </a>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSummarizePaper(result)}
                            disabled={(isSummarizing && summarizingPaperId === getPaperId(result)) || !result.abstract}
                            className={`flex items-center px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 ${
                              summaryResults[getPaperId(result)]
                                ? 'bg-gray-400 hover:bg-gray-500 text-white'
                                : 'bg-teal-500 hover:bg-teal-600 text-white'
                            }`}
                          >
                            {isSummarizing && summarizingPaperId === getPaperId(result) ? (
                              <Loader2 className="animate-spin mr-1" size={14} />
                            ) : (
                              <FileText className="mr-1" size={14} />
                            )}
                            要約
                          </button>
                          <button
                            onClick={() => handleAnalyzePaper(result)}
                            disabled={isAnalyzing && analyzingPaperId === getPaperId(result)}
                            className={`flex items-center px-3 py-1.5 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 ${
                              hasAnalysis
                                ? 'bg-gray-400 hover:bg-gray-500'
                                : isSelected 
                                  ? 'bg-purple-700 hover:bg-purple-800 ring-2 ring-purple-300' 
                                  : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            {isAnalyzing && analyzingPaperId === getPaperId(result) ? (
                              <Loader2 className="animate-spin mr-1" size={14} />
                            ) : hasAnalysis ? (
                              <Eye className="mr-1" size={14} />
                            ) : (
                              <Brain className="mr-1" size={14} />
                            )}
                            {hasAnalysis ? '表示' : '解析'}
                          </button>
                          <button
                            onClick={() => handleTranslatePaper(result)}
                            disabled={(isTranslating && translatingPaperId === getPaperId(result)) || !result.abstract}
                            className={`flex items-center px-3 py-1.5 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 ${
                              translationResults[getPaperId(result)]
                                ? 'bg-gray-400 hover:bg-gray-500'
                                : 'bg-orange-500 hover:bg-orange-600'
                            }`}
                          >
                            {isTranslating && translatingPaperId === getPaperId(result) ? (
                              <Loader2 className="animate-spin mr-1" size={14} />
                            ) : (
                              <Languages className="mr-1" size={14} />
                            )}
                            翻訳
                          </button>
                        </div>
                      </div>
                      <ExpandableText
                        text={result.authors && result.authors.length > 0 
                          ? result.authors.map((author: any) => author.name).join(", ")
                          : "著者不明"
                        }
                        maxLines={2}
                        className="text-sm text-green-700 mb-2"
                      />
                      <ExpandableText
                        text={result.abstract || "要約なし"}
                        maxLines={2}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                      
                      {/* 要約ポップアップ */}
                      {showSummaryPopup.has(getPaperId(result)) && summaryResults[getPaperId(result)] && (
                        <div className="mt-3 relative">
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 shadow-lg relative">
                            <button
                              onClick={() => setShowSummaryPopup(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(getPaperId(result));
                                return newSet;
                              })}
                              className="absolute top-2 right-2 p-1 hover:bg-teal-100 rounded-full transition-colors"
                            >
                              <X size={14} className="text-teal-600" />
                            </button>
                            <h5 className="text-sm font-semibold text-teal-800 mb-2 flex items-center">
                              <FileText className="mr-1" size={16} />
                              論文要約
                            </h5>
                            <p className="text-sm text-teal-900 leading-relaxed">
                              {summaryResults[getPaperId(result)]}
                            </p>
                          </div>
                          {/* 矢印 */}
                          <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-teal-200"></div>
                        </div>
                      )}
                    </div>
                  )
                  })
                )}
              </div>
            </div>
          </div>
          </main>

          {/* 解析結果右サイドパネル */}
          {showAnalysisPanel && selectedPaper && (
            <div className="fixed right-0 h-full w-96 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out"
              style={{ top: headerHeight, height: `calc(100% - ${headerHeight}px)` }}
            >
              <div className="h-full flex flex-col">
                <div className="sticky top-0 bg-white border-b border-gray-200">
                  <div className="flex justify-between items-center p-4 pb-0">
                    <h2 className="text-lg font-bold text-gray-800">
                      論文情報
                    </h2>
                    <button
                      onClick={() => setShowAnalysisPanel(false)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <h3 className="text-sm text-gray-600 px-4 line-clamp-2">{selectedPaper.title}</h3>
                  
                  {/* タブ */}
                  <div className="flex mt-3">
                    <button
                      onClick={() => setActiveTab('analysis')}
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
                      onClick={() => setActiveTab('translation')}
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
                    (() => {
                      const analysisResult = getAnalysisResult();
                      if (!analysisResult) {
                        return (
                          <div className="text-center text-gray-500 mt-8">
                            <Brain className="mx-auto mb-2" size={48} />
                            解析結果がありません
                            <p className="text-xs mt-2">解析ボタンを押して分析を開始してください</p>
                          </div>
                        );
                      }
                    
                    return (
                      <>
                        {/* 分野分類 */}
                        <div className="bg-blue-50 rounded-lg p-3">
                          <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 分野分類</h4>
                          <div className="space-y-1">
                            {analysisResult.fields.map((field, index) => (
                              <div key={index} className="flex justify-between items-center bg-white p-2 rounded text-xs">
                                <span className="font-medium">{field.name}</span>
                                <div className="flex items-center">
                                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mr-1">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${field.score * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-600">{(field.score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 研究対象 */}
                        <div className="bg-green-50 rounded-lg p-3">
                          <h4 className="text-sm font-semibold text-green-800 mb-2">🎯 研究対象</h4>
                          <div className="bg-white p-2 rounded text-xs">
                            <div className="mb-1">
                              <span className="font-medium text-gray-600">日本語:</span>
                              <span className="ml-1 text-gray-800">{analysisResult.target.ja}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">English:</span>
                              <span className="ml-1 text-gray-800">{analysisResult.target.en}</span>
                            </div>
                          </div>
                        </div>

                        {/* 技術的アプローチ */}
                        <div className="bg-purple-50 rounded-lg p-3">
                          <h4 className="text-sm font-semibold text-purple-800 mb-2">🔬 技術的アプローチ</h4>
                          
                          {/* Methods */}
                          <div className="bg-white p-2 rounded mb-2">
                            <h5 className="text-xs font-semibold text-purple-700 mb-1">手法</h5>
                            <div className="space-y-1">
                              {analysisResult.methods.map((method, index) => (
                                <div key={index} className="text-xs">
                                  <div className="font-medium">{method.ja}</div>
                                  <div className="text-gray-600">{method.en}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Factors */}
                          <div className="bg-white p-2 rounded mb-2">
                            <h5 className="text-xs font-semibold text-purple-700 mb-1">要因</h5>
                            <div className="space-y-1">
                              {analysisResult.factors.map((factor, index) => (
                                <div key={index} className="text-xs">
                                  <div className="font-medium">{factor.ja}</div>
                                  <div className="text-gray-600">{factor.en}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="bg-white p-2 rounded">
                            <h5 className="text-xs font-semibold text-purple-700 mb-1">指標</h5>
                            <div className="space-y-1">
                              {analysisResult.metrics.map((metric, index) => (
                                <div key={index} className="text-xs">
                                  <div className="font-medium">{metric.ja}</div>
                                  <div className="text-gray-600">{metric.en}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 検索キーワード */}
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <h4 className="text-sm font-semibold text-yellow-800 mb-2">🔍 検索キーワード</h4>
                          <div className="space-y-2">
                            <div className="bg-white p-2 rounded">
                              <h5 className="text-xs font-semibold text-yellow-700 mb-1">日本語</h5>
                              <div className="flex flex-wrap gap-1">
                                {analysisResult.search_keywords.map((keyword, index) => (
                                  <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                                    {keyword.ja}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <h5 className="text-xs font-semibold text-yellow-700 mb-1">English</h5>
                              <div className="flex flex-wrap gap-1">
                                {analysisResult.search_keywords.map((keyword, index) => (
                                  <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                                    {keyword.en}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()
                  ) : (
                    // 翻訳タブの内容
                    (() => {
                      const paperId = getPaperId(selectedPaper);
                      const translationResult = translationResults[paperId];
                      const currentTranslation = isStreamingTranslation ? streamingTranslation : translationResult;
                      
                      if (!currentTranslation && !isStreamingTranslation) {
                        return (
                          <div className="text-center text-gray-500 mt-8">
                            <Languages className="mx-auto mb-2" size={48} />
                            翻訳結果がありません
                            <p className="text-xs mt-2">翻訳ボタンを押して翻訳を開始してください</p>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                            🌐 翻訳結果
                            {isStreamingTranslation && (
                              <span className="ml-3 flex items-center text-sm text-blue-600">
                                <Loader2 className="animate-spin mr-1" size={14} />
                                翻訳中...
                              </span>
                            )}
                          </h4>
                          <div className="bg-white p-4 rounded-lg text-sm text-gray-800 leading-relaxed min-h-[150px]">
                            {currentTranslation && (
                              <span className={isStreamingTranslation ? 'animate-pulse' : ''}>
                                {currentTranslation}
                              </span>
                            )}
                            {isStreamingTranslation && currentTranslation && (
                              <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
                            )}
                            {!currentTranslation && isStreamingTranslation && (
                              <div className="flex items-center text-gray-500">
                                <Loader2 className="animate-spin mr-2" size={18} />
                                翻訳を開始しています...
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 旧モーダル（削除予定） */}
        {false && (
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
