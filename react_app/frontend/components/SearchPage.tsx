"use client";
import React, { useState } from "react";
import { Search, FileText, Upload, File, X } from "lucide-react";
import { useRouter } from "next/navigation";

const SearchPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"keyword" | "ai">("keyword");
  const [searchEngine, setSearchEngine] = useState<"semantic" | "google">(
    "semantic"
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      params.set("type", searchType);
      params.set("engine", searchEngine);
      router.push(`/results?${params.toString()}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20">
      <div className="text-center mb-8">
        <FileText className="mx-auto mb-4 text-blue-600" size={80} />
        <h1 className="text-4xl font-normal text-gray-800 mb-2">Paper Search</h1>
        <p className="text-gray-600">学術論文を検索・発見しましょう</p>
      </div>
      <div className="w-full max-w-2xl mb-8">
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-8 mb-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="searchEngine"
                value="semantic"
                checked={searchEngine === "semantic"}
                onChange={(e) =>
                  setSearchEngine(e.target.value as "semantic" | "google")
                }
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Semantic Scholar
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="searchEngine"
                value="google"
                checked={searchEngine === "google"}
                onChange={(e) =>
                  setSearchEngine(e.target.value as "semantic" | "google")
                }
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Google Scholar
              </span>
            </label>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="searchType"
                value="keyword"
                checked={searchType === "keyword"}
                onChange={(e) =>
                  setSearchType(e.target.value as "keyword" | "ai")
                }
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">キーワード検索</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="searchType"
                value="ai"
                checked={searchType === "ai"}
                onChange={(e) =>
                  setSearchType(e.target.value as "keyword" | "ai")
                }
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">AI検索</span>
            </label>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500">
              {searchType === "keyword"
                ? "キーワードに完全一致する論文を検索します"
                : "AIが内容を理解して関連する論文を検索します"}
            </p>
          </div>
        </div>
        <div className="relative bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md focus-within:shadow-md focus-within:border-blue-500 transition-all">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={
              searchType === "keyword"
                ? "論文のタイトル、著者、キーワードを入力..."
                : "どのような論文をお探しですか？（自然言語で入力）"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-12 pr-4 py-4 text-base rounded-full focus:outline-none text-black"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {searchType === "keyword" ? "キーワード検索" : "AI検索"}
        </button>
      </div>
      <div className="w-full max-w-2xl mt-8">
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">
            または、論文ファイルをアップロードして検索
          </p>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-600 mb-1">クリックしてファイルを選択</p>
            <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT形式に対応</p>
          </label>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">アップロード済みファイル:</p>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
              >
                <div className="flex items-center">
                  <File className="mr-2 text-blue-600" size={16} />
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
