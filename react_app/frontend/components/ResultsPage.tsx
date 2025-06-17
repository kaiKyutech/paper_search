"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// 型定義
import { Paper, PriorityTask } from "../types";

// カスタムフック
import { useSearch } from "../features/search";
import { useAnalysis } from "../features/analysis";
import { useTranslation } from "../features/translation";
import { useSummary } from "../features/summary";
import { useModelSettings } from "../settings";

// コンポーネント
import { Header, Sidebar } from "../layout";
import { ResultsHeader } from "../features/search";
import { ModelSettings } from "../settings";
import { SkeletonLoader } from "../ui";
import { PaperCard } from "./PaperCard";
import { AnalysisPanel } from "./AnalysisPanel";

// 設定
import { DEFAULT_SIDEBAR_WIDTH } from "../config/constants";


const ResultsPage: React.FC = () => {
  const router = useRouter();
  
  // UI状態
  const [sortOption, setSortOption] = useState<"relevance" | "date" | "citations">("relevance");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'translation'>('analysis');
  const [showSettingsPage, setShowSettingsPage] = useState(false);
  const [currentPriorityTask, setCurrentPriorityTask] = useState<PriorityTask | null>(null);
  
  // Refs
  const headerRef = useRef<HTMLElement | null>(null);
  
  // カスタムフック
  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    searchTime,
    resultLimit,
    handleSearch,
    handleLimitChange,
  } = useSearch();
  
  const {
    analysisResults,
    isAnalyzing,
    analyzingPaperId,
    handleAnalyzePaper,
  } = useAnalysis();
  
  const {
    translationResults,
    isTranslating,
    translatingPaperId,
    streamingTranslation,
    isStreamingTranslation,
    handleTranslatePaper,
  } = useTranslation();
  
  const {
    summaryResults,
    quickSummaryResults,
    streamingQuickSummary,
    isSummarizing,
    summarizingPaperId,
    isQuickSummarizing,
    quickSummarizingPaperId,
    showSummaryPopup,
    setShowSummaryPopup,
    expandedSummaries,
    setExpandedSummaries,
    handleQuickSummary,
    handleDetailedSummary,
    setAutoSummarizeQueueFromPapers,
    processAutoSummarizeQueue,
    isProcessingQueue,
    autoSummarizeQueue,
  } = useSummary();
  
  const {
    modelConfig,
    availableModels,
    isLoadingModels,
    loadModelConfig,
    loadAvailableModels,
    updateModelConfig,
  } = useModelSettings();

  // ヘッダー高さの管理
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
  
  // 検索結果から自動要約キューを設定
  useEffect(() => {
    if (results.length > 0) {
      setAutoSummarizeQueueFromPapers(results);
    }
  }, [results, setAutoSummarizeQueueFromPapers]);
  
  // 自動簡潔要約キューの処理（優先タスクが終了したら再開）
  useEffect(() => {
    // 優先タスクがない時、またはキューに残りがある時に処理
    const timer = setTimeout(() => {
      if (!currentPriorityTask && autoSummarizeQueue.length > 0 && !isProcessingQueue) {
        processAutoSummarizeQueue(results, currentPriorityTask);
      }
    }, 500); // 少し遅延を入れて他のタスクを優先

    return () => clearTimeout(timer);
  }, [results, currentPriorityTask, processAutoSummarizeQueue, autoSummarizeQueue, isProcessingQueue]);

  // キューの監視（継続的な処理）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentPriorityTask && autoSummarizeQueue.length > 0 && !isProcessingQueue && !isSummarizing) {
        processAutoSummarizeQueue(results, currentPriorityTask);
      }
    }, 2000); // 2秒ごとにチェック

    return () => clearInterval(interval);
  }, [results, currentPriorityTask, processAutoSummarizeQueue, autoSummarizeQueue, isProcessingQueue, isSummarizing]);
  
  // 共通のgetPaperId関数（全フック間で統一）
  const getPaperId = (paper: Paper): string => {
    return paper.paperId || paper.url || `${paper.title}_${paper.authors?.[0]?.name || 'unknown'}`;
  };
  
  // イベントハンドラー
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleDrawerItemClick = (itemId: string) => {
    if (itemId === 'settings') {
      setShowSettingsPage(true);
      setDrawerOpen(false);
      loadModelConfig();
      loadAvailableModels();
    }
  };

  // 論文操作ハンドラー
  const handleAnalyze = (paper: Paper) => {
    handleAnalyzePaper(paper, setCurrentPriorityTask, (selectedPaper) => {
      setSelectedPaper(selectedPaper);
      setActiveTab('analysis');
      setShowAnalysisPanel(true);
    });
  };
  
  const handleTranslate = (paper: Paper) => {
    handleTranslatePaper(paper, setCurrentPriorityTask, (selectedPaper) => {
      setSelectedPaper(selectedPaper);
      setActiveTab('translation');
      setShowAnalysisPanel(true);
    });
  };
  
  const handleSummarize = (paper: Paper) => {
    handleDetailedSummary(paper, false);
  };
  

  return (
    <div className="flex">
      <Sidebar
        isOpen={drawerOpen}
        headerHeight={headerHeight}
        onItemClick={handleDrawerItemClick}
      />

      <div className="flex flex-col flex-grow min-h-screen bg-gray-50">
        <Header
          ref={headerRef}
          onMenuClick={toggleDrawer}
          onLogoClick={handleLogoClick}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          resultLimit={resultLimit}
          onLimitChange={handleLimitChange}
        />


        <div className="flex flex-grow">
          <main className={`flex-grow transition-all duration-300 ${drawerOpen ? "ml-72" : ""}`}
            style={{ 
              marginRight: showAnalysisPanel ? `${DEFAULT_SIDEBAR_WIDTH}px` : '0px',
              width: drawerOpen && showAnalysisPanel ? `calc(100% - 18rem - ${DEFAULT_SIDEBAR_WIDTH}px)` : 
                     drawerOpen ? "calc(100% - 18rem)" : 
                     showAnalysisPanel ? `calc(100% - ${DEFAULT_SIDEBAR_WIDTH}px)` : "100%" 
            }}
          >
            <div className="max-w-4xl mx-auto px-4 mt-6">
              <ResultsHeader
                isLoading={isLoading}
                resultsCount={results.length}
                searchTime={searchTime}
                sortOption={sortOption}
                onSortChange={setSortOption}
              />
              
              <div className="space-y-4">
                {isLoading ? (
                  <SkeletonLoader count={3} />
                ) : (
                  results.map((result, index) => {
                    const paperId = getPaperId(result);
                    const isSelected = selectedPaper && getPaperId(selectedPaper) === paperId;
                    const hasAnalysis = analysisResults[paperId];
                    const hasTranslation = translationResults[paperId];
                    
                    return (
                      <PaperCard
                        key={index}
                        paper={result}
                        isSelected={!!isSelected}
                        hasAnalysis={!!hasAnalysis}
                        hasTranslation={!!hasTranslation}
                        onAnalyze={() => handleAnalyze(result)}
                        onTranslate={() => handleTranslate(result)}
                        onSummarize={() => handleSummarize(result)}
                        onQuickSummary={() => handleQuickSummary(result)}
                        isAnalyzing={isAnalyzing}
                        isTranslating={isTranslating}
                        isSummarizing={isSummarizing}
                        isQuickSummarizing={isQuickSummarizing}
                        analyzingPaperId={analyzingPaperId}
                        translatingPaperId={translatingPaperId}
                        summarizingPaperId={summarizingPaperId}
                        quickSummarizingPaperId={quickSummarizingPaperId}
                        getPaperId={getPaperId}
                        quickSummary={quickSummaryResults[paperId]}
                        streamingSummary={streamingQuickSummary[paperId]}
                        summaryData={summaryResults[paperId]}
                        showSummaryPopup={showSummaryPopup.has(paperId)}
                        onCloseSummary={() => setShowSummaryPopup(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(paperId);
                          return newSet;
                        })}
                        expandedSummaries={expandedSummaries}
                        onToggleExpanded={(paperId) => setExpandedSummaries(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(paperId)) {
                            newSet.delete(paperId);
                          } else {
                            newSet.add(paperId);
                          }
                          return newSet;
                        })}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </main>

          <AnalysisPanel
            isOpen={showAnalysisPanel}
            onClose={() => setShowAnalysisPanel(false)}
            selectedPaper={selectedPaper}
            headerHeight={headerHeight}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            analysisResult={selectedPaper ? analysisResults[getPaperId(selectedPaper)] : null}
            translationResult={selectedPaper ? translationResults[getPaperId(selectedPaper)] : null}
            streamingTranslation={streamingTranslation}
            isStreamingTranslation={isStreamingTranslation}
          />
        </div>


        <ModelSettings
          isOpen={showSettingsPage}
          onClose={() => setShowSettingsPage(false)}
          modelConfig={modelConfig}
          availableModels={availableModels}
          isLoadingModels={isLoadingModels}
          onUpdateModel={updateModelConfig}
        />
      </div>
    </div>
  );
};

export default ResultsPage;
