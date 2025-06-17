import { useState, useEffect, useCallback } from 'react';
import { Paper, QuickSummary, StreamingQuickSummary, SummaryData, PriorityTask } from '../../../types';
import { apiEndpoints } from '../../../config/api';

export const useSummary = () => {
  const [summaryResults, setSummaryResults] = useState<Record<string, SummaryData>>({});
  const [quickSummaryResults, setQuickSummaryResults] = useState<Record<string, QuickSummary>>({});
  const [streamingQuickSummary, setStreamingQuickSummary] = useState<Record<string, StreamingQuickSummary>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizingPaperId, setSummarizingPaperId] = useState<string | null>(null);
  const [isQuickSummarizing, setIsQuickSummarizing] = useState(false);
  const [quickSummarizingPaperId, setQuickSummarizingPaperId] = useState<string | null>(null);
  const [showSummaryPopup, setShowSummaryPopup] = useState<Set<string>>(new Set());
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  const [autoSummarizeQueue, setAutoSummarizeQueue] = useState<string[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const getPaperId = (paper: Paper): string => {
    return paper.paperId || paper.url || `${paper.title}_${paper.authors?.[0]?.name || 'unknown'}`;
  };

  const handleQuickSummary = async (paper: Paper) => {
    const paperId = getPaperId(paper);
    
    // 既にキャッシュされた結果があるかチェック
    if (quickSummaryResults[paperId]) {
      return;
    }

    setQuickSummarizingPaperId(paperId);
    setIsQuickSummarizing(true);
    
    try {
      const response = await fetch(apiEndpoints.quickSummary, {
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
        throw new Error('簡易要約に失敗しました');
      }

      const quickSummary = await response.json();
      
      // 結果をキャッシュ
      setQuickSummaryResults(prev => ({
        ...prev,
        [paperId]: quickSummary
      }));
      
    } catch (error) {
      console.error('簡易要約エラー:', error);
      alert('簡易要約中にエラーが発生しました');
    } finally {
      setIsQuickSummarizing(false);
      setQuickSummarizingPaperId(null);
    }
  };

  const handleDetailedSummary = async (paper: Paper, isAutomatic = false) => {
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

    setSummarizingPaperId(paperId);
    setIsSummarizing(true);
    
    try {
      const response = await fetch(apiEndpoints.detailedSummary, {
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
        [paperId]: summaryData
      }));
      
      if (!isAutomatic) {
        setShowSummaryPopup(prev => new Set([...prev, paperId]));
      } else {
        // 自動要約の場合は自動で表示
        setShowSummaryPopup(prev => new Set([...prev, paperId]));
      }
      
    } catch (error) {
      console.error('詳細要約エラー:', error);
      if (!isAutomatic) {
        alert('詳細要約中にエラーが発生しました');
      }
    } finally {
      setIsSummarizing(false);
      setSummarizingPaperId(null);
    }
  };

  const setAutoSummarizeQueueFromPapers = (papers: Paper[]) => {
    const paperIds = papers
      .filter((paper) => paper.abstract)
      .map((paper) => getPaperId(paper));
    setAutoSummarizeQueue(paperIds);
  };

  // 自動簡潔要約キューの処理（改善版）
  const processAutoSummarizeQueue = useCallback(async (papers: Paper[], currentPriorityTask: any) => {
    // 既に処理中、または優先タスクがある場合は処理しない
    if (isProcessingQueue || isSummarizing || currentPriorityTask) {
      return;
    }

    // キューが空の場合は何もしない
    if (autoSummarizeQueue.length === 0) {
      return;
    }

    setIsProcessingQueue(true);

    try {
      // キューから次の論文を取得
      const paperId = autoSummarizeQueue[0];
      const paper = papers.find(p => getPaperId(p) === paperId);
      
      if (paper && !quickSummaryResults[paperId] && !streamingQuickSummary[paperId]) {
        // 簡潔要約を実行
        await handleQuickSummary(paper);
      }
      
      // 処理済みの論文をキューから削除
      setAutoSummarizeQueue(prev => prev.slice(1));
    } catch (error) {
      console.error('自動要約処理エラー:', error);
      // エラーが発生した場合もキューから削除して次に進む
      setAutoSummarizeQueue(prev => prev.slice(1));
    } finally {
      setIsProcessingQueue(false);
    }
  }, [autoSummarizeQueue, isProcessingQueue, isSummarizing, quickSummaryResults, streamingQuickSummary]);

  return {
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
    autoSummarizeQueue,
    isProcessingQueue,
    setAutoSummarizeQueueFromPapers,
    handleQuickSummary,
    handleDetailedSummary,
    processAutoSummarizeQueue,
    getPaperId,
  };
};