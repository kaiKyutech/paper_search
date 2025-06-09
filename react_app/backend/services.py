"""論文検索用のサービス関数群"""

from typing import List, Tuple, Optional
import time
import requests

from .models import PaperInfo, PaperResult


def search_papers_semantic(
    query: str,
    year_from: int = 2023,
    year_to: Optional[int] = None,
    limit: int = 20,
    max_retries: int = 10,
) -> List[dict]:
    """Semantic Scholar API から論文情報を取得する"""
    url = "http://api.semanticscholar.org/graph/v1/paper/search/"
    params = {
        "query": query,
        "fields": "title,abstract,url,publicationTypes",
        "limit": limit,
        "sort": "relevance",
    }
    if year_to is not None:
        params["year"] = f"{year_from}-{year_to}"
    else:
        params["year"] = f"{year_from}-"

    retries = 0
    while retries < max_retries:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        if "data" in data:
            return data["data"]
        if data.get("code") == "429":
            time.sleep(1)
            retries += 1
            continue
        raise RuntimeError("API error: %s" % data)
    raise RuntimeError("API rate limit exceeded")


def fetch_papers_by_query(
    query: str,
    year_range: Tuple[int, Optional[int]],
    limit: int = 10,
) -> PaperResult:
    """クエリから論文情報を取得し PaperResult に整形する"""
    year_from, year_to = year_range
    raw_papers = search_papers_semantic(query, year_from, year_to, limit)
    papers = [
        PaperInfo(
            title=p["title"],
            abstract=p.get("abstract"),
            url=p["url"],
            paper_id=p["paperId"],
        )
        for p in raw_papers
    ]
    return PaperResult(papers=papers)
