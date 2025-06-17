"use client";

import React, { useState } from 'react';
import { FileText, Download, Eye, Brain, X, Loader2 } from 'lucide-react';
import { usePdfProcessing } from './hooks/usePdfProcessing';
import { LoadingSpinner } from '../../ui';

interface PdfViewerProps {
  pdfUrl: string;
  paperTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onAnalyzePdf?: (extractedText: string) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  paperTitle,
  isOpen,
  onClose,
  onAnalyzePdf
}) => {
  const { processPdf, isProcessing, processingError } = usePdfProcessing();
  const [extractedText, setExtractedText] = useState<string | null>(null);
  
  // URL妥当性チェック
  const isValidPdfUrl = pdfUrl && pdfUrl.trim() && (
    pdfUrl.startsWith('http://') || 
    pdfUrl.startsWith('https://') ||
    pdfUrl.startsWith('/')
  );

  const handleProcessPdf = async () => {
    const result = await processPdf(pdfUrl);
    if (result) {
      setExtractedText(result.text);
    }
  };

  const handleAnalyzePdf = () => {
    if (extractedText && onAnalyzePdf) {
      onAnalyzePdf(extractedText);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="mr-2 text-red-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800 truncate max-w-md">
              {paperTitle}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {/* PDF処理ボタン */}
            <button
              onClick={handleProcessPdf}
              disabled={isProcessing || !isValidPdfUrl}
              className="flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin mr-1" size={14} />
              ) : (
                <Brain className="mr-1" size={14} />
              )}
              {isProcessing ? 'テキスト抽出中...' : 'テキスト抽出'}
            </button>
            
            {/* PDF解析ボタン */}
            {extractedText && (
              <button
                onClick={handleAnalyzePdf}
                className="flex items-center px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm"
              >
                <Brain className="mr-1" size={14} />
                PDF解析
              </button>
            )}
            
            {/* ダウンロードボタン */}
            {isValidPdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
              >
                <Download className="mr-1" size={14} />
                ダウンロード
              </a>
            ) : (
              <button
                disabled
                className="flex items-center px-3 py-2 bg-gray-400 text-white rounded-lg text-sm opacity-50 cursor-not-allowed"
              >
                <Download className="mr-1" size={14} />
                ダウンロード
              </button>
            )}
            
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 flex overflow-hidden">
          {/* PDF表示エリア */}
          <div className="flex-1 p-4">
            <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden">
              {isValidPdfUrl ? (
                <iframe
                  src={`${pdfUrl}#view=FitH`}
                  className="w-full h-full"
                  title={`PDF: ${paperTitle}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      PDF URLが無効です
                    </h3>
                    <p className="text-gray-500 text-sm">
                      有効なPDF URLが提供されていません
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      URL: {pdfUrl || 'null'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 抽出テキスト表示エリア */}
          {(extractedText || processingError) && (
            <div className="w-1/3 border-l border-gray-200 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                抽出テキスト
              </h3>
              
              {processingError ? (
                <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                  {processingError}
                </div>
              ) : extractedText ? (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {extractedText}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};