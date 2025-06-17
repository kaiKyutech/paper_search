import { useState } from 'react';
import { Paper, PaperAnalysisResult, PriorityTask } from '../../../types';
import { apiEndpoints } from '../../../config/api';

export const useAnalysis = () => {
  const [analysisResults, setAnalysisResults] = useState<Record<string, PaperAnalysisResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingPaperId, setAnalyzingPaperId] = useState<string | null>(null);

  const getPaperId = (paper: Paper): string => {
    return paper.paperId || paper.url || `${paper.title}_${paper.authors?.[0]?.name || 'unknown'}`;
  };

  const handleAnalyzePaper = async (
    paper: Paper, 
    setCurrentPriorityTask: (task: PriorityTask | null) => void,
    onSuccess?: (paper: Paper) => void
  ) => {
    const paperId = getPaperId(paper);
    
    setCurrentPriorityTask({type: 'analyze', paperId});
    
    // キャッシュされた結果があるかチェック
    if (analysisResults[paperId]) {
      onSuccess?.(paper);
      setCurrentPriorityTask(null);
      return;
    }

    setAnalyzingPaperId(paperId);
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(apiEndpoints.analyze, {
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
      
      onSuccess?.(paper);
    } catch (error) {
      console.error('解析エラー:', error);
      alert('論文解析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingPaperId(null);
      setCurrentPriorityTask(null);
    }
  };

  const getAnalysisResult = (paper: Paper): PaperAnalysisResult | null => {
    if (!paper) return null;
    const paperId = getPaperId(paper);
    return analysisResults[paperId] || null;
  };

  return {
    analysisResults,
    isAnalyzing,
    analyzingPaperId,
    handleAnalyzePaper,
    getAnalysisResult,
    getPaperId,
  };
};