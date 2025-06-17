import { useState, useCallback } from 'react';
import { apiEndpoints } from '../../../config/api';

export interface PdfProcessingResult {
  text: string;
  metadata: {
    title: string;
    authors: string[];
    abstract: string;
    sections: string[];
  };
}

export const usePdfProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const processPdf = useCallback(async (pdfUrl: string): Promise<PdfProcessingResult | null> => {
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const response = await fetch(apiEndpoints.processPdf, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdf_url: pdfUrl }),
      });

      if (!response.ok) {
        throw new Error(`PDF処理エラー: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'PDF処理中にエラーが発生しました';
      setProcessingError(errorMessage);
      console.error('PDF処理エラー:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    processPdf,
    isProcessing,
    processingError,
  };
};