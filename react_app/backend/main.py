from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "ok"}


from fastapi import Query

from .services import fetch_papers_by_query


@app.get("/papers")
async def search_papers(
    q: str = Query(..., description="検索クエリ"),
    year_from: int = Query(2023, description="開始年"),
    year_to: int | None = Query(None, description="終了年"),
    limit: int = Query(10, description="取得件数"),
):
    """論文検索エンドポイント"""
    result = fetch_papers_by_query(q, (year_from, year_to), limit)
    return result
