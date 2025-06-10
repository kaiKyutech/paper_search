from fastapi import FastAPI, HTTPException
import requests
import time
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


def search_papers_semantic(query: str, year_from: int = 2023, year_to: int | None = None,
                           limit: int = 10, max_retries: int = 5) -> list[dict]:
    """Semantic Scholar API から論文情報を取得する"""
    url = "http://api.semanticscholar.org/graph/v1/paper/search/"
    params = {
        "query": query,
        "fields": "title,abstract,url,authors",
        "limit": limit,
        "sort": "relevance",
    }
    if year_to is not None:
        params["year"] = f"{year_from}-{year_to}"
    else:
        params["year"] = f"{year_from}-"

    retries = 0
    while retries < max_retries:
        resp = requests.get(url, params=params, timeout=30)
        data = resp.json()
        if "data" in data:
            return data["data"]
        if data.get("code") == "429":
            time.sleep(1)
            retries += 1
            continue
        retries += 1
    raise HTTPException(status_code=500, detail="Semantic Scholar API error")


@app.get("/search")
async def search_endpoint(q: str, year_from: int = 2023, year_to: int | None = None, limit: int = 10):
    """論文検索エンドポイント"""
    papers = search_papers_semantic(q, year_from, year_to, limit)
    return {"papers": papers}

