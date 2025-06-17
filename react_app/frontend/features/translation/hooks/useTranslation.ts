import { useState } from 'react';
import { Paper, PriorityTask } from '../../../types';
import { apiEndpoints } from '../../../config/api';

export const useTranslation = () => {
  const [translationResults, setTranslationResults] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatingPaperId, setTranslatingPaperId] = useState<string | null>(null);
  const [streamingTranslation, setStreamingTranslation] = useState<string>('');
  const [isStreamingTranslation, setIsStreamingTranslation] = useState(false);

  const getPaperId = (paper: Paper): string => {
    return paper.paperId || paper.url || `${paper.title}_${paper.authors?.[0]?.name || 'unknown'}`;
  };

  const handleTranslatePaper = async (
    paper: Paper,
    setCurrentPriorityTask: (task: PriorityTask | null) => void,
    onSuccess?: (paper: Paper) => void
  ) => {
    const paperId = getPaperId(paper);
    
    setCurrentPriorityTask({type: 'translate', paperId});
    
    // キャッシュされた翻訳結果があるかチェック
    if (translationResults[paperId]) {
      onSuccess?.(paper);
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
    onSuccess?.(paper);
    setStreamingTranslation('');
    setIsStreamingTranslation(true);
    
    try {
      // ストリーミング翻訳APIを使用
      const response = await fetch(apiEndpoints.translate, {
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

  return {
    translationResults,
    isTranslating,
    translatingPaperId,
    streamingTranslation,
    isStreamingTranslation,
    handleTranslatePaper,
    getPaperId,
  };
};