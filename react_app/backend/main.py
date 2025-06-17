from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import requests
import time
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from jsonschema import validate, ValidationError
import asyncio
import PyPDF2
import io
from urllib.parse import urlparse

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

class TranslationRequest(BaseModel):
    text: str

class TranslationResult(BaseModel):
    translation: str

class SummaryRequest(BaseModel):
    title: str
    abstract: str

class StructuredSummary(BaseModel):
    title: Optional[str] = None
    keywords: List[str]
    background: str
    method: str
    results: str
    conclusion: str
    importance_level: str  # 'high', 'medium', 'low'

class SummaryResult(BaseModel):
    summary: str
    structured: Optional[StructuredSummary] = None

class QuickSummary(BaseModel):
    summary: str
    keywords: List[str]

class PaperAnalysisResult(BaseModel):
    title: Optional[str] = None
    fields: List[PaperField]
    target: Label
    methods: List[Label]
    factors: List[Label]
    metrics: List[Label]
    search_keywords: List[Label]

class ModelConfig(BaseModel):
    analysis_model: str
    translation_model: str
    quick_summary_model: str
    detailed_summary_model: str

class ModelConfigRequest(BaseModel):
    function_name: str  # 'analysis', 'translation', 'quick_summary', 'detailed_summary'
    model_name: str

class PdfProcessRequest(BaseModel):
    pdf_url: str

class PdfMetadata(BaseModel):
    title: str
    authors: List[str]
    abstract: str
    sections: List[str]

class PdfProcessResult(BaseModel):
    text: str
    metadata: PdfMetadata

# 設定
import os

def running_in_docker() -> bool:
    """Docker コンテナ内で実行されているか判定"""
    return os.path.exists("/.dockerenv")

# StreamlitアプリのOllama設定と同じ形式
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma-textonly_v3:latest")

# 機能別モデル設定（デフォルトは従来のOLLAMA_MODELを使用）
MODEL_CONFIGS = {
    "analysis": OLLAMA_MODEL,
    "translation": "gemma-textonly_v3:latest",
    "quick_summary": "gemma-textonly_v3:latest",
    "detailed_summary": "gemma-textonly_v3:latest"
}
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
        "model": MODEL_CONFIGS["analysis"],
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

def search_papers_semantic(query: str, year_from: int = 2023, year_to: int | None = None,
                           limit: int = 10, max_retries: int = 5) -> list[dict]:
    """Semantic Scholar API から論文情報を取得する"""
    url = "http://api.semanticscholar.org/graph/v1/paper/search/"
    params = {
        "query": query,
        "fields": "title,abstract,url,authors,openAccessPdf,citationCount,publicationDate,paperId",
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

# エンドポイント定義

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

@app.get("/models")
async def get_available_models():
    """利用可能なOllamaモデル一覧を取得"""
    try:
        ollama_tags_url = get_ollama_url("/api/tags")
        response = requests.get(ollama_tags_url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        models = []
        
        if "models" in data:
            for model in data["models"]:
                models.append({
                    "name": model.get("name", ""),
                    "size": model.get("size", 0),
                    "modified_at": model.get("modified_at", ""),
                    "digest": model.get("digest", "")
                })
        
        return {
            "models": models,
            "current_model": OLLAMA_MODEL
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"モデル一覧の取得に失敗しました: {str(e)}")

@app.get("/models/config", response_model=ModelConfig)
async def get_model_config():
    """現在の機能別モデル設定を取得"""
    return ModelConfig(
        analysis_model=MODEL_CONFIGS["analysis"],
        translation_model=MODEL_CONFIGS["translation"],
        quick_summary_model=MODEL_CONFIGS["quick_summary"],
        detailed_summary_model=MODEL_CONFIGS["detailed_summary"]
    )

@app.post("/models/config")
async def update_model_config(request: ModelConfigRequest):
    """機能別モデル設定を更新"""
    valid_functions = ["analysis", "translation", "quick_summary", "detailed_summary"]
    
    if request.function_name not in valid_functions:
        raise HTTPException(status_code=400, detail=f"無効な機能名です。有効な値: {valid_functions}")
    
    # モデルが利用可能か確認
    try:
        ollama_tags_url = get_ollama_url("/api/tags")
        response = requests.get(ollama_tags_url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        available_models = [model.get("name", "") for model in data.get("models", [])]
        
        if request.model_name not in available_models:
            raise HTTPException(status_code=400, detail=f"モデル '{request.model_name}' は利用できません。利用可能なモデル: {available_models}")
        
        # 設定を更新
        MODEL_CONFIGS[request.function_name] = request.model_name
        
        return {
            "message": f"{request.function_name}の使用モデルを{request.model_name}に変更しました",
            "updated_config": MODEL_CONFIGS
        }
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Ollama API通信エラー: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"モデル設定の更新に失敗しました: {str(e)}")

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

@app.post("/translate", response_model=TranslationResult)
async def translate_text(request: TranslationRequest):
    """英語テキストを日本語に翻訳するエンドポイント"""
    print(f"翻訳リクエスト受信: {request.text[:100]}...")
    
    try:
        # 翻訳用プロンプト（より明確に指示）
        translation_prompt = f"""/no_think 以下の英語テキストのみを日本語に翻訳してください。余計な文章や説明は一切追加せず、翻訳結果のみを出力してください。

{request.text}

"""
        
        # Ollama APIで翻訳実行
        payload = {
            "model": MODEL_CONFIGS["translation"],
            "messages": [{"role": "user", "content": translation_prompt}],
            "stream": False,
            "temperature": 0.3  # 翻訳は一貫性を重視
        }
        
        print("Ollama API翻訳呼び出し開始...")
        response = requests.post(OLLAMA_CHAT_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        translation = result["message"]["content"].strip()
        
        print("翻訳完了")
        return TranslationResult(translation=translation)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"翻訳中にエラーが発生しました: {str(e)}")

@app.post("/translate-stream")
async def translate_text_stream(request: TranslationRequest):
    """英語テキストを日本語にストリーミング翻訳するエンドポイント"""
    print(f"ストリーミング翻訳リクエスト受信: {request.text[:100]}...")
    
    def generate_translation():
        try:
            # 翻訳用プロンプト（明確に指示）
            translation_prompt = f"""/no_think 以下の英語テキストのみを日本語に翻訳してください。余計な文章や説明は一切追加せず、翻訳結果のみを出力してください。

{request.text}

"""
            
            # Ollama APIでストリーミング翻訳実行（Streamlitと同じ形式）
            payload = {
                "model": MODEL_CONFIGS["translation"],
                "messages": [{"role": "user", "content": translation_prompt}],
                "stream": True,
                "temperature": 0.3
            }
            
            print(f"Ollama URL: {OLLAMA_CHAT_URL}")
            print("Ollama APIストリーミング翻訳呼び出し開始...")
            
            # 開始イベントを送信
            yield f"data: {json.dumps({'type': 'start', 'content': ''})}\n\n"
            
            # Ollamaからのストリーミングレスポンスを処理
            response = requests.post(OLLAMA_CHAT_URL, json=payload, stream=True, timeout=120)
            
            if response.status_code != 200:
                error_msg = f"Ollama API error: {response.status_code}"
                print(error_msg)
                yield f"data: {json.dumps({'type': 'error', 'content': error_msg})}\n\n"
                return
            
            accumulated_text = ""
            
            # Streamlitアプリと同じ処理方法
            for line in response.iter_lines():
                if line:
                    try:
                        chunk_data = json.loads(line.decode('utf-8'))
                        print(f"受信チャンク: {chunk_data}")
                        
                        # Streamlitアプリと同じ構造でcontentを抽出
                        content = ""
                        if "message" in chunk_data and "content" in chunk_data["message"]:
                            content = chunk_data["message"]["content"]
                        else:
                            # 例外対応: "text" キーの場合
                            content = chunk_data.get("text", "")
                            
                        if content:
                            accumulated_text += content
                            # チャンクデータを送信
                            yield f"data: {json.dumps({'type': 'chunk', 'content': content, 'accumulated': accumulated_text})}\n\n"
                            
                        # 完了フラグをチェック
                        if chunk_data.get('done', False):
                            print("ストリーミング完了フラグ受信")
                            # 完了イベントを送信
                            yield f"data: {json.dumps({'type': 'complete', 'content': accumulated_text})}\n\n"
                            break
                            
                    except json.JSONDecodeError as e:
                        print(f"JSON decode error: {e}")
                        # JSONパースに失敗した場合、デコード済みの文字列をそのまま処理
                        decoded_line = line.decode("utf-8")
                        print(f"デコード済み行: {decoded_line}")
                        continue
                        
            print("ストリーミング翻訳完了")
            
        except Exception as e:
            print(f"ストリーミング翻訳エラー: {str(e)}")
            import traceback
            traceback.print_exc()
            # エラーイベントを送信
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_translation(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
    )

@app.post("/quick-summary", response_model=QuickSummary)
async def quick_summary_paper(request: SummaryRequest):
    """論文の簡潔要約（一言要約+キーワード）を生成"""
    print(f"簡潔要約リクエスト受信: {request.title}")
    
    try:
        # 簡潔要約用プロンプト（内容を増強）
        quick_summary_prompt = f"""論文: {request.title}
{request.abstract}

以下のJSON形式で出力してください：

{{
  "keywords": [論文から抽出した具体的な技術・手法・領域名を3-6個],
  "summary": "論文の詳細要約（200文字以内の日本語要約）"
}}

例:
- keywords: ["BERT", "感情分析", "自然言語処理", "Twitter"]
- summary: "BERTを使ってTwitterデータの感情分析モデルを開発した研究。従来のLSTMベースの手法と比較して、BERTのTransformerアーキテクチャを活用することで文脈理解能力が向上し、特にネガティブ感情の検出精度が15%改善した。データセットには10万件のTwitter投稿を使用し、評価指標としてF1スコアを使用。"

要件：
- keywordsは具体的な技術・手法・領域名を含む
- summaryは200文字以内で、背景・手法・結果を含む詳細要約
- 使用した技術、データ、評価方法、得られた成果を具体的に記述
- 数値や性能指標がある場合は含める

/no_think"""

        payload = {
            "model": MODEL_CONFIGS["quick_summary"],
            "messages": [{"role": "user", "content": quick_summary_prompt}],
            "stream": False,
            "temperature": 0.6,
            "format": {
                "$schema": "http://json-schema.org/draft-07/schema#",
                "type": "object",
                "properties": {
                    "keywords": {
                        "type": "array",
                        "items": {"type": "string"},
                        "minItems": 3,
                        "maxItems": 6
                    },
                    "summary": {"type": "string"}
                },
                "required": ["keywords", "summary"],
                "additionalProperties": False
            }
        }
        
        print("Ollama API簡潔要約呼び出し開始...")
        response = requests.post(OLLAMA_CHAT_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        content = result["message"]["content"]
        
        # マークダウンのコードブロックを除去
        clean_lines = [line for line in content.splitlines() if not line.strip().startswith("```")]
        clean_result = "\n".join(clean_lines)
        
        try:
            quick_data = json.loads(clean_result)
            return QuickSummary(**quick_data)
        except (json.JSONDecodeError, ValidationError) as e:
            print(f"簡潔要約のパースに失敗: {e}")
            # フォールバック: デフォルト値を返す
            return QuickSummary(
                keywords=["論文", "研究", "分析"],
                summary="論文の要約に失敗しました"
            )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"簡潔要約中にエラーが発生しました: {str(e)}")

# 構造化要約用のJSONスキーマ
STRUCTURED_SUMMARY_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "StructuredSummary",
    "type": "object",
    "properties": {
        "title": { "type": "string" },
        "keywords": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 3,
            "maxItems": 8
        },
        "background": { "type": "string" },
        "method": { "type": "string" },
        "results": { "type": "string" },
        "conclusion": { "type": "string" },
        "importance_level": {
            "type": "string",
            "enum": ["high", "medium", "low"]
        }
    },
    "required": ["keywords", "background", "method", "results", "conclusion", "importance_level"],
    "additionalProperties": False
}

@app.post("/summarize", response_model=SummaryResult)
async def summarize_paper(request: SummaryRequest):
    """論文を要約するエンドポイント（構造化要約対応）"""
    print(f"要約リクエスト受信: {request.title}")
    
    try:
        # 簡潔要約
        simple_summary_prompt = f"""{request.title}
{request.abstract}

上記論文を2-3文で簡潔に要約してください。

/no_think"""
        
        # 構造化要約（簡潔要約を前提とした背景・手法・結果・結論のみ）
        structured_summary_prompt = f"""論文: {request.title}
{request.abstract}

以下の論文について、簡潔要約は既に別途生成されています。
構造化要約では、簡潔要約を前提として、以下の4項目のみを詳細に記述してください。

**必ず日本語で生成してください。**

以下のJSON形式で出力:

1. **title**: 論文のタイトル（元のタイトルまたは内容を表す短いタイトル）
2. **keywords**: 論文の主要キーワード（3-8個）。具体的な技術名、手法名、領域名を含む。
3. **background**: 研究背景・動機（なぜこの研究が必要だったのか、既存手法の問題点）
4. **method**: 使用した手法・アプローチ。具体的な技術名、モデル名、アルゴリズム名、実験設定を含む。
5. **results**: 得られた結果・成果。数値や性能指標、比較結果を具体的に記述。
6. **conclusion**: 結論・将来の展望、応用可能性
7. **importance_level**: 常に\"medium\"を設定（重要度判定は主観的なため）

### 出力形式例：
```json
{{
  "title": "Transformerを用いたセンサデータ解析の新規モデル開発",
  "keywords": ["Transformer", "センサデータ", "時系列解析", "Attention機構", "IoT"],
  "background": "従来のLSTMベースのセンサデータ解析では長期依存関係の捕捉が困難で、特に複数センサからの情報統合において性能低下が課題となっていた。",
  "method": "Transformerアーキテクチャにマルチヘッドアテンションを適用し、時系列センサデータの特徴抽出を改善。位置エンコーディングを時系列データ用に最適化し、3つのベンチマークデータセットで評価。",
  "results": "提案手法はベースラインLSTMと比較して精度が15%向上（F1スコア0.87→0.92）。特に異常検知タスクでは再現率が20%向上し、誤検出率を半減。",
  "conclusion": "提案手法はIoTシステムのリアルタイム監視に応用可能。今後は他のセンサタイプへの適用と計算効率の改善を検討予定。",
  "importance_level": "medium"
}}
```

上記の4項目（background, method, results, conclusion）を中心に、論文の技術的詳細を日本語で記述してください。

/no_think"""
        
        # 並行して両方の要約を実行
        
        async def get_simple_summary():
            payload = {
                "model": MODEL_CONFIGS["quick_summary"],
                "messages": [{"role": "user", "content": simple_summary_prompt}],
                "stream": False,
                "temperature": 0.5
            }
            response = requests.post(OLLAMA_CHAT_URL, json=payload, timeout=60)
            response.raise_for_status()
            result = response.json()
            return result["message"]["content"].strip()
        
        async def get_structured_summary():
            payload = {
                "model": MODEL_CONFIGS["detailed_summary"],
                "messages": [{"role": "user", "content": structured_summary_prompt}],
                "stream": False,
                "temperature": 0.7,
                "format": STRUCTURED_SUMMARY_SCHEMA
            }
            response = requests.post(OLLAMA_CHAT_URL, json=payload, timeout=90)
            response.raise_for_status()
            result = response.json()
            content = result["message"]["content"]
            
            # マークダウンのコードブロックを除去
            clean_lines = [line for line in content.splitlines() if not line.strip().startswith("```")]
            clean_result = "\n".join(clean_lines)
            
            try:
                structured_data = json.loads(clean_result)
                # スキーマバリデーション
                validate(instance=structured_data, schema=STRUCTURED_SUMMARY_SCHEMA)
                return StructuredSummary(**structured_data)
            except (json.JSONDecodeError, ValidationError) as e:
                print(f"構造化要約のパースに失敗: {e}")
                return None
        
        print("Ollama API要約呼び出し開始...")
        
        # 簡潔な要約を先に取得
        simple_summary = await get_simple_summary()
        
        # 構造化要約を並行して取得（失敗してもエラーにしない）
        try:
            structured_summary = await get_structured_summary()
        except Exception as e:
            print(f"構造化要約の取得に失敗: {e}")
            structured_summary = None
        
        print("要約完了")
        return SummaryResult(
            summary=simple_summary,
            structured=structured_summary
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"要約中にエラーが発生しました: {str(e)}")

def extract_text_from_pdf_url(pdf_url: str) -> str:
    """PDFのURLからテキストを抽出する"""
    try:
        response = requests.get(pdf_url, timeout=30)
        response.raise_for_status()
        
        # PDFバイナリデータをPyPDF2で処理
        pdf_file = io.BytesIO(response.content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF処理エラー: {str(e)}")

def extract_metadata_from_text(text: str) -> PdfMetadata:
    """抽出したテキストからメタデータを推定する（簡易版）"""
    lines = text.split('\n')
    
    # 簡易的なメタデータ抽出
    title = ""
    authors = []
    abstract = ""
    sections = []
    
    # タイトル推定（最初の非空行）
    for line in lines[:10]:
        if line.strip() and len(line.strip()) > 10:
            title = line.strip()
            break
    
    # セクション見出し検出
    for line in lines:
        line = line.strip()
        if line and (line.isupper() or 
                    line.startswith(('Abstract', 'Introduction', 'Method', 'Results', 'Conclusion', 'References'))):
            if len(line) < 50:  # 見出しは通常短い
                sections.append(line)
    
    return PdfMetadata(
        title=title,
        authors=authors,
        abstract=abstract,
        sections=sections[:10]  # 最大10セクション
    )

@app.post("/process-pdf", response_model=PdfProcessResult)
async def process_pdf(request: PdfProcessRequest):
    """PDFからテキストとメタデータを抽出する"""
    try:
        # URL検証
        parsed_url = urlparse(request.pdf_url)
        if not parsed_url.scheme or not parsed_url.netloc:
            raise HTTPException(status_code=400, detail="無効なPDF URLです")
        
        # テキスト抽出
        extracted_text = extract_text_from_pdf_url(request.pdf_url)
        
        if not extracted_text:
            raise HTTPException(status_code=400, detail="PDFからテキストを抽出できませんでした")
        
        # メタデータ抽出
        metadata = extract_metadata_from_text(extracted_text)
        
        return PdfProcessResult(
            text=extracted_text,
            metadata=metadata
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF処理中にエラーが発生しました: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)