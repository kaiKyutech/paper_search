"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  FileText,
  Settings,
  User,
  Clock,
  Bookmark,
  TrendingUp,
  ChevronDown,
  File,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaperInfo {
  title: string;
  abstract?: string;
  url: string;
  paper_id: string;
}

const ResultsPage: React.FC = () => {
  const params = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(params.get("q") || "");
  const [sortOption, setSortOption] = useState<"relevance" | "date" | "citations">(
    "relevance"
  );
  const [results, setResults] = useState<PaperInfo[]>([]);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    if (searchQuery) {
      fetch(`${apiBase}/papers?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.papers ?? []))
        .catch((err) => console.error(err));
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams(params.toString());
      newParams.set("q", searchQuery);
      router.push(`/results?${newParams.toString()}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  const drawerItems = [
    { text: "アカウント", icon: User, id: "account" },
    { text: "設定", icon: Settings, id: "settings" },
    { text: "検索履歴", icon: Clock, id: "history" },
    { text: "ブックマーク", icon: Bookmark, id: "bookmarks" },
    { text: "論文ネットワーク", icon: TrendingUp, id: "network" },
  ];

  const sortOptions = [
    { value: "relevance", label: "関連度順" },
    { value: "date", label: "新しい順" },
    { value: "citations", label: "引用数順" },
  ];

  return (
    <div className="flex">
      <div
        className={`fixed left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ top: headerHeight, height: `calc(100% - ${headerHeight}px)` }}
      >
        <nav className="p-4 space-y-2">
          {drawerItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-all duration-200 hover:translate-x-1 hover:shadow-sm"
                style={{
                  animationDelay: drawerOpen ? `${index * 50}ms` : "0ms",
                  animation: drawerOpen ? "slideInLeft 0.3s ease-out forwards" : "none",
                }}
              >
                <IconComponent className="mr-3 text-gray-600 transition-colors duration-200" size={20} />
                <span className="text-sm text-gray-700">{item.text}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col flex-grow min-h-screen bg-gray-50">
        <header ref={headerRef} className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center px-4 py-3">
            <button onClick={toggleDrawer} className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <Menu size={24} />
            </button>
            <div
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
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

        <main className={`flex-grow transition-all duration-300 ${drawerOpen ? "ml-72" : ""}`}
          style={{ width: drawerOpen ? "calc(100% - 18rem)" : "100%" }}
        >
          <div className="max-w-4xl mx-auto px-4 mt-6">
            {sortDropdownOpen && (
              <div className="fixed inset-0 z-30" onClick={() => setSortDropdownOpen(false)}></div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  約 1,240,000 件の結果 (0.42 秒)
                </p>
                <div className="relative">
                  <button
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    ソート: {sortOptions.find((opt) => opt.value === sortOption)?.label}
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                  {sortDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortOption(option.value as "relevance" | "date" | "citations");
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${sortOption === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="text-lg font-normal text-blue-700 mb-2 hover:underline">
                      {result.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {result.abstract}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResultsPage;
