# 実験用のmessage　ユーザー論文あり
import os
from .field_colors import FIELD_LIST, FIELD_NAMES

# デフォルトで使用するOllamaモデル名を環境変数から指定可能にする
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma-textonly_v3:latest")

_experiment_message_template = '''
以下は論文の情報です。
"論文のタイトル、論文のアブストラクト"
の順で与えられます。

まずは論文をよく読んで、その論文が意味する核の部分をとらえてください。  
この論文について、以下の4つの情報を出力してください。出力は必ず指定されたJSON構造に従ってください。  
また、出力された情報は、その論文に関連した論文を効率的に検索するために使用されます。  
そのために有効だと思われるワードなどを意識して、出力結果を返してください。

---

1. **分野分類（fields）**  
　最も関連性が高いと思われる分野を「score: 1.0」としてください。  
　他の分野のスコアは、それに対して**どの程度関連しているか**を0.0〜1.0の範囲で設定してください。  
　2つ以上の分野を出力してください。  

選択可能な分野（fields）：
{FIELD_NAMES}

---

2. **研究対象（target）**  
　この論文が何を対象にしているかを、日本語と英語のペアで1つ出してください。  
　検索性を重視し、**抽象的すぎず具体的すぎない表現**を選んでください。  
　例：「人間行動認識」「創薬」「タンパク質」「グラフ構造」など。

---

3. **主な技術的アプローチ（approaches）**  
　この論文で研究対象にアプローチするために使われた**手法・要因・指標**を、以下の3カテゴリに分類してそれぞれ最低1つ以上、日本語・英語のペアで出力してください：  

- `"methods"`：分析技術やアルゴリズム、モデルなど（例：回帰分析、時系列解析、LDA、Transformerなど）  
- `"factors"`：分析における要因や変数（例：縦断勾配、大型車混入率、湿度、年齢など、なにを対象としているのか具体的に）  
- `"metrics"`：指標・評価軸（例：精度、F1スコア、飽和交通流率、語彙数など、この研究の最終的な目的を表すもの）  

出力順は、**関連性の強い順に並べてください**。  
また、**論文で独自に命名された新語（モデル名など）は含めないでください。**  
また、「機械学習」など抽象的な用語は避け、検索に役立つ具体的な語を優先してください。

---

4. **検索キーワード（search_keywords）**  
　上記の情報（fields、target、approaches）をもとに、論文検索（例：CiNii、Google Scholarなど）で有効な検索キーワードを考えてください。  
　日本語と英語それぞれで、**3つ以上のキーワードまたはフレーズ**を出力してください。  
　検索性向上のため、具体性と網羅性を意識してください。

---

### 出力形式（例）：
```json
{
  "fields": [
    { "name": "土木工学", "score": 1.0 },
    { "name": "交通工学", "score": 0.9 }
  ],
  "labels": {
    "target": { "ja": "飽和交通流率解析", "en": "Saturation Flow Rate Analysis" },
    "approaches": {
      "methods": [
        { "ja": "回帰分析", "en": "Regression Analysis" },
        { "ja": "実測データ収集", "en": "Field Data Collection" }
      ],
      "factors": [
        { "ja": "大型車混入率", "en": "Heavy Vehicle Penetration Rate" },
        { "ja": "縦断勾配", "en": "Vertical Gradient" }
      ],
      "metrics": [
        { "ja": "飽和交通流率", "en": "Saturation Flow Rate" },
        { "ja": "車頭時間", "en": "Headway Time" }
      ]
    },
    "search_keywords": {
      "ja": [
        "飽和交通流率解析",
        "土木工学 交通工学",
        "大型車混入率 縦断勾配"
      ],
      "en": [
        "Saturation Flow Rate Analysis",
        "Civil and Transportation Engineering",
        "Heavy Vehicle Penetration Vertical Gradient"
      ]
    }
  }
}
```

"""
多次元センサデータ処理のためのTransformerを用いた自己教師あり学習手法,センサ信号を入力として,人間行動認識を行う深層学習アルゴリズムを開発した. ここでは自然言語で用いられるTransformerに基づいた事前学習言語モデルを構築して, その事前学習言語モデルを用いて,下流タスクである人間行動認識タスクを解く形を追求する. VanillaのTransformerでもこれは可能であるが, ここでは, 線形層によるn次元数値データの埋め込み、ビン化処理、出力層の線形処理層という３つの要素を特色とするｎ次元数値処理トランスフォーマーを提案する。5種類のデータセットに対して、このモデルの効果を確かめた. VanillaのTransformerと比較して, 精度で10%～15%程度, 向上させることができた
"""'''

experiment_message = _experiment_message_template.replace("{FIELD_NAMES}", FIELD_NAMES)

# json出力(検索クエリまで出力)するためのユーザー論文指定なしのもの
_message_without_paper_template = """
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
{
  "title": "飽和交通流率における大型車の影響分析",
  "fields": [
    { "name": "土木工学", "score": 1.0 },
    { "name": "交通工学", "score": 0.9 }
  ],
  "labels": {
    "target": {
      "ja": "飽和交通流率解析",
      "en": "Saturation Flow Rate Analysis"
    },
    "approaches": {
      "methods": [
        { "ja": "回帰分析", "en": "Regression Analysis" },
        { "ja": "実測データ収集", "en": "Field Data Collection" }
      ],
      "factors": [
        { "ja": "大型車混入率", "en": "Heavy Vehicle Penetration Rate" },
        { "ja": "縦断勾配", "en": "Vertical Gradient" }
      ],
      "metrics": [
        { "ja": "飽和交通流率", "en": "Saturation Flow Rate" },
        { "ja": "車頭時間", "en": "Headway Time" }
      ]
    },
    "search_keywords": [
      { "ja": "飽和交通流率解析", "en": "Saturation Flow Rate Analysis" },
      { "ja": "土木工学 交通工学", "en": "Civil and Transportation Engineering" },
      { "ja": "大型車混入率 縦断勾配", "en": "Heavy Vehicle Penetration Vertical Gradient" }
    ]
  }
}
```"""

experiment_message_without_paper = _message_without_paper_template.replace("{FIELD_NAMES}", FIELD_NAMES)

# ユーザー論文と検索クエリなしのもの。
_field_main_factor_template = """
以下は論文の情報です。
"論文のタイトル、論文のアブストラクト"
の順で与えられます。

まずは論文をよく読んで、その論文が意味する核の部分をとらえてください。  
この論文について、以下の3つの情報を出力してください。出力は必ず指定されたJSON構造に従ってください。  
また、出力された情報は、その論文の内容を迅速に把握するために役立ちます。  
そのため、論文の技術的手法、解決しようとしている課題、または論文の種類など、論文の「本質」を理解するのに有効な具体的なキーワードを抽出するようにしてください。

---

1. **分野分類（fields）**  
　最も関連性が高いと思われる分野を「score: 1.0」としてください。  
　他の分野のスコアは、どの程度関連しているかを0.0〜1.0の範囲で設定してください。  
　2つ以上の分野を出力してください。  

選択可能な分野（fields）：
{FIELD_NAMES}

---

2. **研究対象（target）**  
　この論文が何を対象にしているかを、日本語と英語のペアで1つ出してください。  
　検索性を重視し、抽象的すぎず具体的すぎない表現を選んでください。  
　例：「人間行動認識」「創薬」「タンパク質」「グラフ構造」など。

---

3. **主要キーワード（main_keywords）**  
　この論文の内容理解に直結する、核となる要素を示すキーワードを日本語と英語のペアで3つ以上出してください。  
　ここでは、  
　　- **使用されている技術・手法**（例：深層学習による画像解析、統計的モデリングなど）  
　　- **解決しようとしている課題や問題意識**（例：都市の渋滞解消、臨床診断の精度向上など）  
　　- **論文の種類や性質**（例：サーベイ、ケーススタディ、実証実験など）  
　を意識して、論文の「本質」を示す具体的な語を選んでください。

### 出力形式（例）：
```json
{
  "fields": [
    { "name": "土木工学", "score": 1.0 },
    { "name": "交通工学", "score": 0.9 }
  ],
  "labels": {
    "target": {
      "ja": "飽和交通流率解析",
      "en": "Saturation Flow Rate Analysis"
    },
    "main_keywords": [
      { "ja": "回帰分析", "en": "Regression Analysis" },
      { "ja": "渋滞緩和", "en": "Congestion Mitigation" },
      { "ja": "実証実験", "en": "Empirical Study" }
    ]
  }
}

```"""

llm_init_prompt_field_main_factor = _field_main_factor_template.replace("{FIELD_NAMES}", FIELD_NAMES)

system_prompt = "あなたは誠実で優秀な日本人のアシスタントです。特に指示が無い場合は、常に日本語で回答してください。"
css_text_user = (
            '<div class="chat-box" style="background-color: rgba(255,255,255,0.9);'
            'padding:15px; border-radius:8px; box-shadow: 2px 2px 5px rgba(255,255,255,0);'
            'margin-bottom:10px; color: black; font-weight: bold;">'
        )
css_text_assistant = (
    '<div class="chat-box" style="background-color: rgba(255,255,255,0.07);'
    'padding:15px; border-radius:8px; box-shadow: 2px 2px 5px rgba(255,255,255,0);'
    'margin-bottom:10px;">'
)
INST_PROMPT_AI = (
    "以下は論文のタイトルとアブストラクトです。ここでは２つの論文、ユーザー論文と選択された論文を挙げます。"
    "このユーザー論文はユーザーの論文であり、指定論文との関連性を知りたいと考えています。 つまりあなたはユーザーがまだ知らない指定論文についての"
    "簡潔に説明しつつユーザー論文との関連性を明確に簡潔に説明する必要があります。まずユーザー論文を見て、その内容について理解し、その後指定論文を見て、"
    "その内容について説明します。そのときプレゼン資料のような少ない文字数で分かりやすく表現することを心掛けてください。具体的には丁寧な文章ではなく箇条書きのようにクリティカルに内容を表すような短文で表現してください。無理のない体言止めがふさわしいです。"
    "その後、指定論文について、ユーザー論文との関連性を説明する文書を生成してください。そして最後にユーザーに対してなんらかの助言や追加の説明が必要かを行ってください。"
    "またあなたに渡される論文の構成は、'(論文タイトル),(論文アブストラクト)'のようにカンマで分かりやすく分けてあります。説明するときユーザーが見やすいように"
    "文字の大きさや必要があれば簡単な図解や比較表などその時々にあったものを作るなどして分かりやすく行うことを心掛けてください。"
)
INST_PROMPT_KEYWORDS = (
    "以下は検索エンジンでの検索ワードとその検索結果の論文のタイトルとアブストラクトです。"
    "ユーザーはこの検索結果の論文についての内容を知りたいと考えています。説明するときはプレゼン資料のような少ない文字数で分かりやすく表現することを心掛けてください。具体的には箇条書きのように丁寧な文章ではなくクリティカルな内容を表すような短文で表現してください。無理のない体言止めがふさわしいです。"
    "またあなたに渡される構成は、'検索キーワード：(検索キーワード)\n論文：(論文タイトル),(論文アブストラクト)のように分かりやすくわけてあります。"
    "文字の大きさや必要があれば簡単な図解や表などその時々にあったものを作るなどして分かりやすく説明することを心掛けてください。"
    "検索キーワードはユーザーの知りたいことについての情報が詰まっています。これは必ず参考にしてユーザーが得たいと考えている情報について意図をくみ取り説明をするよう心掛けてください。"
    "より深い説明を求めているかやユーザーに説明したほうがいい概念などがあればその説明が必要かどうかなどについて質問を最後にすることで、自然な会話を続けるように心がけてください。"
    "また与えられた論文のタイトルとアブストラクトは繰り返して生成しないでください。"
)
# 使う予定なし
unified_schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "StructuredResearchMetadata",
    "type": "object",
    "properties": {
        "fields": {
            "type": "array",
            "minItems": 2,
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "enum": FIELD_LIST
                    },
                    "score": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 1
                    }
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
                        "ja": {"type": "string"},
                        "en": {"type": "string"}
                    },
                    "required": ["ja", "en"]
                },
                "approaches": {
                    "type": "object",
                    "properties": {
                        "methods": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                                "type": "object",
                                "properties": {
                                    "ja": {"type": "string"},
                                    "en": {"type": "string"}
                                },
                                "required": ["ja", "en"]
                            }
                        },
                        "factors": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                                "type": "object",
                                "properties": {
                                    "ja": {"type": "string"},
                                    "en": {"type": "string"}
                                },
                                "required": ["ja", "en"]
                            }
                        },
                        "metrics": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                                "type": "object",
                                "properties": {
                                    "ja": {"type": "string"},
                                    "en": {"type": "string"}
                                },
                                "required": ["ja", "en"]
                            }
                        }
                    },
                    "required": ["methods", "factors", "metrics"]
                },
                "search_keywords": {
                    "type": "object",
                    "properties": {
                        "ja": {
                            "type": "array",
                            "minItems": 1,
                            "items": {"type": "string"}
                        },
                        "en": {
                            "type": "array",
                            "minItems": 1,
                            "items": {"type": "string"}
                        }
                    },
                    "required": ["ja", "en"]
                }
            },
            "required": ["target", "approaches", "search_keywords"]
        }
    },
    "required": ["fields", "labels"],
    "additionalProperties": False
}

# 使う予定なし
# 統一スキーマを tools に含める
experiment_tools = [
    {
        "type": "function",
        "function": {
            "name": "extract_paper_metadata",
            "description": "論文から分野分類、研究対象、技術的アプローチ、検索キーワードを抽出する",
            "parameters": unified_schema  # 統一スキーマをそのまま使用
        }
    }
]

structured_json_schema = {
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