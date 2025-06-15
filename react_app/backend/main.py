from fastapi import FastAPI, HTTPException
import requests
import time
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from jsonschema import validate, ValidationError

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データモデル
class PaperField(BaseModel):
    name: str
    score: float

class Label(BaseModel):
    ja: str
    en: str

class PaperAnalysisRequest(BaseModel):
    title: str
    abstract: str

class PaperAnalysisResult(BaseModel):
    title: Optional[str] = None
    fields: List[PaperField]
    target: Label
    methods: List[Label]
    factors: List[Label]
    metrics: List[Label]
    search_keywords: List[Label]

# 設定
import os

def running_in_docker() -> bool:
    """Docker コンテナ内で実行されているか判定"""
    return os.path.exists("/.dockerenv")

# StreamlitアプリのOllama設定と同じ形式
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma-textonly_v3:latest")
default_ollama_url = (
    "http://host.docker.internal:11435" if running_in_docker() else "http://127.0.0.1:11435"
)
OLLAMA_API_BASE_URL = os.environ.get("OLLAMA_API_BASE_URL", default_ollama_url)

def get_ollama_url(path: str) -> str:
    """Ollama API 用の完全な URL を返す"""
    return f"{OLLAMA_API_BASE_URL}{path}"

OLLAMA_CHAT_URL = get_ollama_url("/api/chat")

# 分野リスト
FIELD_LIST = [
    "transformer","人工知能", "ロボティクス", "電子工学", "機械工学", "材料工学",
    "化学", "物理学", "生物学", "医学", "薬学", "環境科学", "農学", "数学",
    "地球科学", "哲学", "心理学", "社会学", "教育学", "法学", "政治学",
    "経済学", "経営学", "言語学", "文学", "歴史学", "文化人類学", "メディア学",
    "芸術学", "土木工学", "交通工学", "建築工学",
]

FIELD_NAMES = ", ".join(FIELD_LIST)

# プロンプトテンプレート
ANALYSIS_PROMPT_TEMPLATE = """
以下は論文の情報です。
"論文のタイトル、論文のアブストラクト"
の順で与えられます。

まずは論文をよく読んで、その論文が意味する核の部分をとらえてください。

この論文にタイトルが含まれる場合、そのタイトルをその言語のままそのまま抽出して、出力されるJSONの最初のキーとして`title`という項目に格納してください。タイトルが明示されていない場合は、入力テキストを適切に表すようなタイトルを短く生成してください。

この論文について、以下の4つの情報を出力してください。出力は必ず指定されたJSON構造に従ってください。
また、出力された情報は、その論文に関連した論文を効率的に検索するために使用されます。
そのために有効だと思われるワードなどを意識して、出力結果を返してください。

---

1. **分野分類（fields）**
　最も関連性が高いと思われる分野を「score: 1.0」としてください。
　他の分野のスコアは、それに対してどの程度関連しているかを0.0〜1.0の範囲で設定してください。
　2つ以上の分野を出力してください。

選択可能な分野（fields）：
{FIELD_NAMES}

---

2. **研究対象（target）**
　この論文が何を対象にしているかを、日本語と英語のペアで1つ出してください。
　検索性を重視し、抽象的すぎず具体的すぎない表現を選んでください。
　例：「人間行動認識」「創薬」「タンパク質」「グラフ構造」など。

---

3. **主な技術的アプローチ（approaches）**
　この論文で研究対象にアプローチするために使われた手法・要因・指標を、以下の3カテゴリに分類してそれぞれ最低1つ以上、日本語・英語のペアで出力してください：

- `"methods"`：分析技術やアルゴリズム、モデルなど（例：回帰分析、時系列解析、LDA、Transformerなど）
- `"factors"`：分析における要因や変数（例：縦断勾配、大型車混入率、湿度、年齢など、なにを対象としているのか具体的に）
- `"metrics"`：指標・評価軸（例：精度、F1スコア、飽和交通流率、語彙数など、この研究の最終的な目的を表すもの）

出力順は、関連性の強い順に並べてください。
また、論文で独自に命名された新語（モデル名など）は含めないでください。
また、「機械学習」など抽象的な用語は避け、検索に役立つ具体的な語を優先してください。

---

4. **検索キーワード（search_keywords）**
　上記の情報（fields、target、approaches）をもとに、論文検索（例：CiNii、Google Scholarなど）で有効な検索キーワードを考えてください。
　日本語と英語それぞれで、3つ以上のキーワードまたはフレーズを出力してください。
　検索性向上のため、具体性と網羅性を意識してください。

---

### 出力形式（例）：
```json
{{
  "title": "飽和交通流率における大型車の影響分析",
  "fields": [
    {{ "name": "土木工学", "score": 1.0 }},
    {{ "name": "交通工学", "score": 0.9 }}
  ],
  "labels": {{
    "target": {{
      "ja": "飽和交通流率解析",
      "en": "Saturation Flow Rate Analysis"
    }},
    "approaches": {{
      "methods": [
        {{ "ja": "回帰分析", "en": "Regression Analysis" }},
        {{ "ja": "実測データ収集", "en": "Field Data Collection" }}
      ],
      "factors": [
        {{ "ja": "大型車混入率", "en": "Heavy Vehicle Penetration Rate" }},
        {{ "ja": "縦断勾配", "en": "Vertical Gradient" }}
      ],
      "metrics": [
        {{ "ja": "飽和交通流率", "en": "Saturation Flow Rate" }},
        {{ "ja": "車頭時間", "en": "Headway Time" }}
      ]
    }},
    "search_keywords": [
      {{ "ja": "飽和交通流率解析", "en": "Saturation Flow Rate Analysis" }},
      {{ "ja": "土木工学 交通工学", "en": "Civil and Transportation Engineering" }},
      {{ "ja": "大型車混入率 縦断勾配", "en": "Heavy Vehicle Penetration Vertical Gradient" }}
    ]
  }}
}}
```

{input_text}
""".replace("{FIELD_NAMES}", FIELD_NAMES)

# JSONスキーマ
STRUCTURED_JSON_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "StructuredPaperMetadata",
    "type": "object",
    "properties": {
        "title": { "type": "string" },
        "fields": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": { "type": "string" },
                    "score": { "type": "number", "minimum": 0, "maximum": 1 }
                },
                "required": ["name", "score"]
            }
        },
        "labels": {
            "type": "object",
            "properties": {
                "target": {
                    "type": "object",
                    "properties": {
                        "ja": { "type": "string" },
                        "en": { "type": "string" }
                    },
                    "required": ["ja", "en"]
                },
                "approaches": {
                    "type": "object",
                    "properties": {
                        "methods": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "ja": { "type": "string" },
                                    "en": { "type": "string" }
                                },
                                "required": ["ja", "en"]
                            }
                        },
                        "factors": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "ja": { "type": "string" },
                                    "en": { "type": "string" }
                                },
                                "required": ["ja", "en"]
                            }
                        },
                        "metrics": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "ja": { "type": "string" },
                                    "en": { "type": "string" }
                                },
                                "required": ["ja", "en"]
                            }
                        }
                    },
                    "required": ["methods", "factors", "metrics"]
                },
                "search_keywords": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "ja": { "type": "string" },
                            "en": { "type": "string" }
                        },
                        "required": ["ja", "en"]
                    }
                }
            },
            "required": ["target", "approaches", "search_keywords"]
        }
    },
    "required": ["title", "fields", "labels"],
    "additionalProperties": False
}

def get_structured_response_from_ollama(prompt: str, temperature: float = 0.8) -> Dict[str, Any]:
    """Ollama APIを使って構造化されたレスポンスを取得する"""
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "temperature": temperature,
        "format": STRUCTURED_JSON_SCHEMA
    }

    try:
        response = requests.post(OLLAMA_CHAT_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        content = result["message"]["content"]
        
        # マークダウンのコードブロックを除去
        clean_lines = [line for line in content.splitlines() if not line.strip().startswith("```")]
        clean_result = "\n".join(clean_lines)
        
        # JSONパース
        structured_data = json.loads(clean_result)
        
        # スキーマバリデーション
        validate(instance=structured_data, schema=STRUCTURED_JSON_SCHEMA)
        
        return structured_data
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Ollama API通信エラー: {str(e)}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSONパースエラー: {str(e)}")
    except ValidationError as e:
        raise HTTPException(status_code=500, detail=f"スキーマバリデーションエラー: {str(e)}")

@app.get("/health")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {
        "status": "ok",
        "ollama_model": OLLAMA_MODEL,
        "ollama_url": OLLAMA_API_BASE_URL,
        "ollama_chat_url": OLLAMA_CHAT_URL,
        "running_in_docker": running_in_docker()
    }


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

@app.post("/analyze", response_model=PaperAnalysisResult)
async def analyze_paper(request: PaperAnalysisRequest):
    """論文解析エンドポイント"""
    print(f"解析リクエスト受信: {request.title}")
    print(f"Ollama URL: {OLLAMA_CHAT_URL}")
    print(f"Docker環境: {running_in_docker()}")
    
    try:
        # プロンプト生成
        input_text = f"{request.title}, {request.abstract}"
        prompt = ANALYSIS_PROMPT_TEMPLATE.format(input_text=input_text)
        print(f"プロンプト生成完了, 長さ: {len(prompt)}")
        
        # Ollama APIで解析実行
        print("Ollama API呼び出し開始...")
        raw_data = get_structured_response_from_ollama(prompt)
        print("Ollama API呼び出し完了")
        
        # レスポンスデータの変換
        analysis_result = PaperAnalysisResult(
            title=raw_data.get("title"),
            fields=[PaperField(**field) for field in raw_data["fields"]],
            target=Label(**raw_data["labels"]["target"]),
            methods=[Label(**method) for method in raw_data["labels"]["approaches"]["methods"]],
            factors=[Label(**factor) for factor in raw_data["labels"]["approaches"]["factors"]],
            metrics=[Label(**metric) for metric in raw_data["labels"]["approaches"]["metrics"]],
            search_keywords=[Label(**keyword) for keyword in raw_data["labels"]["search_keywords"]]
        )
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"論文解析中にエラーが発生しました: {str(e)}")

