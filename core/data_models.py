from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class PaperField:
    name: str
    score: float

@dataclass
class Label:
    ja: str
    en: str

@dataclass
class PaperAnalysisResult:
    fields: List[PaperField]
    target: Label
    title: Optional[str] = None
    methods: Optional[List[Label]] = None
    factors: Optional[List[Label]] = None
    metrics: Optional[List[Label]] = None
    search_keywords: Optional[List[Label]] = None
    main_keywords: Optional[List[Label]] = None

@dataclass
class PaperInfo:
    title: str
    abstract: Optional[str]
    url: str
    paper_id: str
    relatedness: Optional[int] = None

@dataclass
class PaperResult:
    papers: List[PaperInfo] = field(default_factory=list)
