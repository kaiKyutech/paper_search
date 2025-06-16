"""要約処理を担当するサービスモジュール"""

import json
from jsonschema import validate, ValidationError
import httpx

from ..config import OLLAMA_MODEL, OLLAMA_CHAT_URL
from pydantic import BaseModel
from typing import Optional


class SummaryRequest(BaseModel):
    """要約リクエストデータモデル"""
    title: str
    abstract: str


class StructuredSummary(BaseModel):
    keywords: list[str]
    what_they_did: str
    background: str
    method: str
    results: str
    conclusion: str
    importance_level: str


STRUCTURED_SUMMARY_SCHEMA = {
    "type": "object",
    "properties": {
        "keywords": {"type": "array", "items": {"type": "string"}},
        "what_they_did": {"type": "string"},
        "background": {"type": "string"},
        "method": {"type": "string"},
        "results": {"type": "string"},
        "conclusion": {"type": "string"},
        "importance_level": {"type": "string"},
    },
    "required": [
        "keywords",
        "what_they_did",
        "background",
        "method",
        "results",
        "conclusion",
        "importance_level",
    ],
}


async def fetch_chat_response(payload: dict) -> dict:
    """Ollama API からチャットレスポンスを取得"""
    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(OLLAMA_CHAT_URL, json=payload)
        response.raise_for_status()
        return response.json()


async def summarize_paper(request: SummaryRequest) -> tuple[str, Optional[StructuredSummary]]:
    """論文要約を実行し、簡潔要約と構造化要約を返す"""
    simple_prompt = f"""{request.title}
{request.abstract}

上記論文を2-3文で簡潔に要約してください。"""
    structured_prompt = f"""論文: {request.title}
{request.abstract}

以下のJSON形式で出力:
{{
  "keywords": [論文から抽出した具体的な技術・手法・領域名4-6個],
  "what_they_did": "何を使って何をしたか一文で",
  "background": "研究背景・動機",
  "method": "使用手法・アプローチ",
  "results": "結果・成果",
  "conclusion": "結論・展望",
  "importance_level": "medium"
}}
"""

    async def get_simple() -> str:
        payload = {
            "model": OLLAMA_MODEL,
            "messages": [{"role": "user", "content": simple_prompt}],
            "stream": False,
            "temperature": 0.5,
        }
        result = await fetch_chat_response(payload)
        return result["message"]["content"].strip()

    async def get_structured() -> Optional[StructuredSummary]:
        payload = {
            "model": OLLAMA_MODEL,
            "messages": [{"role": "user", "content": structured_prompt}],
            "stream": False,
            "temperature": 0.7,
            "format": "json",
        }
        result = await fetch_chat_response(payload)
        content = result["message"]["content"]
        clean_lines = [line for line in content.splitlines() if not line.strip().startswith("```")]
        clean_result = "\n".join(clean_lines)
        try:
            structured_data = json.loads(clean_result)
            validate(instance=structured_data, schema=STRUCTURED_SUMMARY_SCHEMA)
            return StructuredSummary(**structured_data)
        except (json.JSONDecodeError, ValidationError):
            return None

    simple_summary = await get_simple()
    try:
        structured_summary = await get_structured()
    except Exception:
        structured_summary = None

    return simple_summary, structured_summary
