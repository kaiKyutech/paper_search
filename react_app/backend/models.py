from pydantic import BaseModel
from typing import List, Optional

class PaperInfo(BaseModel):
    """単一論文の情報"""

    title: str
    abstract: Optional[str] = None
    url: str
    paper_id: str

class PaperResult(BaseModel):
    """論文検索結果"""

    papers: List[PaperInfo] = []
