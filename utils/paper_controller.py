# utils/paper_controller.py
from api.paper_api import search_papers_semantic
from dataclasses import dataclass, field
from typing import List, Optional
from core.data_models import PaperInfo, PaperResult

def semantic_controller(query: str, year_range: tuple, limit: int = 10):
    year_from, year_to = year_range
    data = search_papers_semantic(query, year_from=year_from, year_to=year_to, limit=limit)
    papers = PaperResult()
    for d in data:
        paper = PaperInfo(
            title=d["title"],
            abstract=d.get("abstract"),
            url=d["url"],
            paper_id=d["paper_id"]
        )
        papers.paper.append(paper)
    return papers

if __name__ == "__main__":
    query = "Time-Series Gene Expression Data Imputation"
    data = semantic_controller(query, (2020, 2025))
    print("title:", data.paper[0].title)
    print("abstract:", data.paper[0].abstract)