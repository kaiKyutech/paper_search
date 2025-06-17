import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Paper } from '../../../types';
import { apiEndpoints } from '../../../config/api';
import { DEFAULT_RESULT_LIMIT } from '../../../config/constants';

export const useSearch = () => {
  const params = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(params.get("q") || "");
  const [results, setResults] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [resultLimit, setResultLimit] = useState<number>(DEFAULT_RESULT_LIMIT);

  useEffect(() => {
    const q = params.get("q");
    if (!q) return;
    
    setIsLoading(true);
    const startTime = performance.now();
    
    const limit = params.get("limit") || DEFAULT_RESULT_LIMIT.toString();
    setResultLimit(Number(limit));
    
    const searchUrl = `${apiEndpoints.search}?q=${encodeURIComponent(q)}&limit=${limit}`;
    
    fetch(searchUrl)
      .then((res) => res.json())
      .then((data) => {
        const endTime = performance.now();
        setSearchTime((endTime - startTime) / 1000);
        const papers = data.papers || [];
        setResults(papers);
      })
      .catch((err) => {
        console.error(err);
        setResults([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [params]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams(params.toString());
      newParams.set("q", searchQuery);
      router.push(`/results?${newParams.toString()}`);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("limit", newLimit.toString());
    router.push(`/results?${newParams.toString()}`);
  };

  return {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    searchTime,
    resultLimit,
    handleSearch,
    handleLimitChange,
  };
};