# 論文APIへのアクセスロジック
# core/paper_service.py

from core.data_models import PaperResult, PaperInfo
from api.paper_api import search_papers_semantic
from typing import Tuple

def fetch_papers_by_query(query: str, year_range: Tuple[int, int], limit: int = 10) -> PaperResult:
    year_from, year_to = year_range
    raw_papers = search_papers_semantic(query, year_from=year_from, year_to=year_to, limit=limit)
    
    papers = [
        PaperInfo(
            title=paper["title"],
            abstract=paper.get("abstract"),
            url=paper["url"],
            paper_id=paper["paperId"]
        )
        for paper in raw_papers
    ]
    return PaperResult(papers=papers)
