import { useState, useEffect } from 'react';
import { Paper, QuickSummary, StreamingQuickSummary, SummaryData, PriorityTask } from '../../../types';
import { apiEndpoints } from '../../../config/api';

export const useSummary = () => {
  const [summaryResults, setSummaryResults] = useState<Record<string, SummaryData>>({});
  const [quickSummaryResults, setQuickSummaryResults] = useState<Record<string, QuickSummary>>({});
  const [streamingQuickSummary, setStreamingQuickSummary] = useState<Record<string, StreamingQuickSummary>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizingPaperId, setSummarizingPaperId] = useState<string | null>(null);
  const [showSummaryPopup, setShowSummaryPopup] = useState<Set<string>>(new Set());
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  const [autoSummarizeQueue, setAutoSummarizeQueue] = useState<string[]>([]);

  const getPaperId = (paper: Paper): string => {
    return paper.paperId || paper.url || `${paper.title}_${paper.authors?.[0]?.name || 'unknown'}`;
  };

  const handleQuickSummary = async (paper: Paper) => {
    const paperId = getPaperId(paper);
    
    // 既にキャッシュされた結果があるかチェック
    if (quickSummaryResults[paperId]) {
      return;
    }

    setSummarizingPaperId(paperId);
    setIsSummarizing(true);
    
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
        throw new Error('簡潔要約に失敗しました');
      }

      const quickSummary = await response.json();
      
      // 結果をキャッシュ
      setQuickSummaryResults(prev => ({
        ...prev,
        [paperId]: quickSummary
      }));
      
    } catch (error) {
      console.error('簡潔要約エラー:', error);
    } finally {
      setIsSummarizing(false);
      setSummarizingPaperId(null);
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

  // 自動簡潔要約キューの処理
  useEffect(() => {
    if (autoSummarizeQueue.length > 0 && !isSummarizing) {
      const paperId = autoSummarizeQueue[0];
      // papers配列は外部から提供される必要がある（useSearchから）
      setAutoSummarizeQueue(prev => prev.slice(1));
    }
  }, [autoSummarizeQueue, isSummarizing]);

  return {
    summaryResults,
    quickSummaryResults,
    streamingQuickSummary,
    isSummarizing,
    summarizingPaperId,
    showSummaryPopup,
    setShowSummaryPopup,
    expandedSummaries,
    setExpandedSummaries,
    autoSummarizeQueue,
    setAutoSummarizeQueueFromPapers,
    handleQuickSummary,
    handleDetailedSummary,
    getPaperId,
  };
};