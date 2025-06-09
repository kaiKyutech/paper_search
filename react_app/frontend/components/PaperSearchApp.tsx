"use client"
import React, { useState } from 'react';
import {
  Search,
  Menu,
  FileText,
  Settings,
  User,
  Clock,
  Bookmark,
  TrendingUp,
  X,
  Upload,
  File,
  ChevronDown,
} from 'lucide-react';

const PaperSearchApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [searchType, setSearchType] = useState<'keyword' | 'ai'>('keyword');
  const [searchEngine, setSearchEngine] = useState<'semantic' | 'google'>('semantic');
  const [sortOption, setSortOption] = useState<'relevance' | 'date' | 'citations'>('relevance');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const mockResults = [
    {
      title: 'Attention Is All You Need',
      authors: 'Vaswani, A., Shazeer, N., Parmar, N., et al.',
      journal: 'Advances in Neural Information Processing Systems',
      year: '2017',
      abstract:
        'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism...',
    },
    {
      title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
      authors: 'Devlin, J., Chang, M. W., Lee, K., Toutanova, K.',
      journal: 'NAACL-HLT',
      year: '2019',
      abstract:
        'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional...',
    },
    {
      title: 'Language Models are Few-Shot Learners',
      authors: 'Brown, T., Mann, B., Ryder, N., et al.',
      journal: 'Advances in Neural Information Processing Systems',
      year: '2020',
      abstract:
        'Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture...',
    },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearched(true);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLogoClick = () => {
    setIsSearched(false);
    setSearchQuery('');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sortOptions = [
    { value: 'relevance', label: '関連度順' },
    { value: 'date', label: '新しい順' },
    { value: 'citations', label: '引用数順' },
  ];

  const drawerItems = [
    { text: 'アカウント', icon: User, id: 'account' },
    { text: '設定', icon: Settings, id: 'settings' },
    { text: '検索履歴', icon: Clock, id: 'history' },
    { text: 'ブックマーク', icon: Bookmark, id: 'bookmarks' },
    { text: '論文ネットワーク', icon: TrendingUp, id: 'network' },
  ];

  return (
    <div className="flex">
      <div
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">メニュー</h2>
          <button onClick={toggleDrawer} className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <X size={20} />
          </button>
        </div>
        <nav className="p-2">
          {drawerItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-all duration-200 hover:translate-x-1 hover:shadow-sm"
                style={{
                  animationDelay: drawerOpen ? `${index * 50}ms` : '0ms',
                  animation: drawerOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none',
                }}
              >
                <IconComponent className="mr-3 text-gray-600 transition-colors duration-200" size={20} />
                <span className="text-sm text-gray-700">{item.text}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`flex-grow min-h-screen bg-gray-50 transition-transform duration-300 ${drawerOpen ? 'translate-x-72' : ''}`}> 
        {isSearched && (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center px-4 py-3">
            <button onClick={toggleDrawer} className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <Menu size={24} />
            </button>
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogoClick}>
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
          </div>
        </header>
      )}


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
      `}</style>

      <main className={`max-w-4xl mx-auto px-4 ${isSearched ? 'mt-6' : 'pt-8'}`}>
        {sortDropdownOpen && <div className="fixed inset-0 z-30" onClick={() => setSortDropdownOpen(false)}></div>}
        {!isSearched ? (
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
                    <input type="radio" name="searchEngine" value="semantic" checked={searchEngine === 'semantic'} onChange={(e) => setSearchEngine(e.target.value as 'semantic' | 'google')} className="mr-2 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Semantic Scholar</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="searchEngine" value="google" checked={searchEngine === 'google'} onChange={(e) => setSearchEngine(e.target.value as 'semantic' | 'google')} className="mr-2 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Google Scholar</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="searchType" value="keyword" checked={searchType === 'keyword'} onChange={(e) => setSearchType(e.target.value as 'keyword' | 'ai')} className="mr-2 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">キーワード検索</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="searchType" value="ai" checked={searchType === 'ai'} onChange={(e) => setSearchType(e.target.value as 'keyword' | 'ai')} className="mr-2 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">AI検索</span>
                  </label>
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500">
                    {searchType === 'keyword' ? 'キーワードに完全一致する論文を検索します' : 'AIが内容を理解して関連する論文を検索します'}
                  </p>
                </div>
              </div>
              <div className="relative bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md focus-within:shadow-md focus-within:border-blue-500 transition-all">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={searchType === 'keyword' ? '論文のタイトル、著者、キーワードを入力...' : 'どのような論文をお探しですか？（自然言語で入力）'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-4 text-base rounded-full focus:outline-none text-black"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleSearch} disabled={!searchQuery.trim()} className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {searchType === 'keyword' ? 'キーワード検索' : 'AI検索'}
              </button>
            </div>
            <div className="w-full max-w-2xl mt-8">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">または、論文ファイルをアップロードして検索</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <input type="file" id="file-upload" multiple accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600 mb-1">クリックしてファイルを選択</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT形式に対応</p>
                </label>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">アップロード済みファイル:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-center">
                        <File className="mr-2 text-blue-600" size={16} />
                        <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                      </div>
                      <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                約 1,240,000 件の結果 (0.42 秒) - {searchEngine === 'semantic' ? 'Semantic Scholar' : 'Google Scholar'} / {searchType === 'keyword' ? 'キーワード検索' : 'AI検索'}
              </p>
              <div className="relative">
                <button onClick={() => setSortDropdownOpen(!sortDropdownOpen)} className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                  ソート: {sortOptions.find((opt) => opt.value === sortOption)?.label}
                  <ChevronDown size={16} className="ml-1" />
                </button>
                {sortDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortOption(option.value as 'relevance' | 'date' | 'citations');
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${sortOption === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {mockResults.map((result, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-normal text-blue-700 mb-2 hover:underline">{result.title}</h3>
                  <p className="text-sm text-green-700 mb-2">
                    {result.authors} - {result.journal}, {result.year}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.abstract}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  </div>
  );
};

export default PaperSearchApp;
