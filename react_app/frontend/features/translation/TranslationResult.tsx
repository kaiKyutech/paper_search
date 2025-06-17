import React from "react";
import { Languages, Loader2 } from "lucide-react";

interface TranslationResultProps {
  translationResult: string | null;
  streamingTranslation: string;
  isStreamingTranslation: boolean;
}

export const TranslationResult: React.FC<TranslationResultProps> = ({
  translationResult,
  streamingTranslation,
  isStreamingTranslation
}) => {
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
};