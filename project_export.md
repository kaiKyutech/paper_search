## プロジェクト構成

```
paper_search/
├── AGENTS.md
├── docker-compose.yml
├── react_app
│   ├── backend
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   └── requirements.txt
│   └── frontend
│       ├── Dockerfile
│       └── src
│           └── main.tsx
└── streamlit_app
    ├── Dockerfile
    ├── __init__.py
    ├── api
    │   ├── __init__.py
    │   ├── lm_studio_api.py
    │   ├── ollama_api.py
    │   └── paper_api.py
    ├── app.py
    ├── core
    │   ├── __init__.py
    │   ├── data_models.py
    │   ├── llm_service.py
    │   └── paper_service.py
    ├── requirements.txt
    ├── state
    │   ├── __init__.py
    │   ├── state_manager.py
    │   └── state_manager_back.py
    ├── ui
    │   ├── __init__.py
    │   ├── chat_panel.py
    │   ├── paper_network.py
    │   ├── result_summary.py
    │   └── search_bar.py
    └── utils
        ├── __init__.py
        ├── config.py
        ├── cytoscape_utils.py
        ├── field_colors.py
        ├── llm_controller.py
        └── paper_controller.py
```

### File: AGENTS.md

```markdown
# AGENTS

## プロジェクト構成

```
paper_search/
├── AGENTS.md
├── README.md
├── docker-compose.yml
├── pulling_files.py
├── project_export.md
├── react_app
│   ├── backend
│   │   ├── Dockerfile
│   │   ├── README.md
│   │   ├── main.py
│   │   └── requirements.txt
│   └── frontend
│       ├── Dockerfile
│       ├── README.md
│       ├── package.json
│       └── src
│           └── main.tsx
└── streamlit_app
    ├── Dockerfile
    ├── api
    │   ├── lm_studio_api.py
    │   ├── ollama_api.py
    │   └── paper_api.py
    ├── app.py
    ├── core
    │   ├── data_models.py
    │   ├── llm_service.py
    │   └── paper_service.py
    ├── requirements.txt
    ├── state
    │   ├── state_manager.py
    │   └── state_manager_back.py
    ├── ui
    │   ├── chat_panel.py
    │   ├── paper_network.py
    │   ├── result_summary.py
    │   └── search_bar.py
    └── utils
        ├── config.py
        ├── cytoscape_utils.py
        ├── field_colors.py
        ├── llm_controller.py
        └── paper_controller.py
```

新しいファイルやディレクトリを追加・削除した場合は、上記のツリーを必ず最新の状態に更新してください。`pulling_files.py` を実行すると `project_export.md` に現在の構成が出力されるので参考にするとよいでしょう。

## 開発規約
- 使用言語は **Python** とする
- コードスタイルは PEP8 を基準とする
  - インデントは4スペース
  - 行長の目安は100文字
  - クラス名は `PascalCase`
  - 変数名・関数名は `snake_case`
- コメントおよび docstring は日本語で記述する
- Pull Request の本文も日本語で作成する

## テスト
- テストコードが存在する場合は `pytest` を実行すること
- テストが無い場合は `pytest` 実行結果が `no tests ran` であっても問題ない

```

### File: docker-compose.yml

```
version: '3.8'
services:
  streamlit:
    build:
      context: ./streamlit_app
    ports:
      - "8501:8501"
    container_name: streamlit_app
  backend:
    build:
      context: ./react_app/backend
    ports:
      - "8000:8000"
    container_name: fastapi_backend
  frontend:
    build:
      context: ./react_app/frontend
    ports:
      - "5173:5173"
    container_name: react_frontend
    depends_on:
      - backend

```

### File: react_app/frontend/Dockerfile

```
FROM node:18
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . /app
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

```

### File: react_app/frontend/src/main.tsx

```
import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => <div>Paper Search Frontend</div>;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

```

### File: react_app/backend/Dockerfile

```
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

```

### File: react_app/backend/main.py

```python
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


```

### File: react_app/backend/requirements.txt

```
fastapi
uvicorn

```

### File: streamlit_app/Dockerfile

```
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.address=0.0.0.0", "--server.port=8501"]

```

### File: streamlit_app/__init__.py

```python

```

### File: streamlit_app/app.py

```python
# app.py
import streamlit as st
from ui import search_bar, result_summary, paper_network, chat_panel
from state import state_manager
from utils import config
from core import llm_service

st.set_page_config(layout="wide")


def main():
    # セッション状態の初期化（すべてのキーは state_manager.py で一元管理）
    state_manager.initialize_session_state()

    st.title("論文検索＆可視化＆AI解説")

    # --- 1段目：検索エリア ---
    search_bar.render_search_section()
    search_bar.render_search_info_selection_section()

    # --- 2段目：論文ネットワークと詳細情報 ---
    with st.container():
        network_col, detail_col = st.columns([1, 1])

        with network_col:
            st.write("### 論文ネットワーク")
            st.write("---")
            st.caption(
                '<span style="color:coral; font-weight:bold;">検索された論文の詳細な解析を行う場合は下のボタンを押してください。</span>',
                unsafe_allow_html=True,
            )
            st.caption(
                '<span style="color:coral; font-weight:bold;">＊処理に時間がかかります</span>',
                unsafe_allow_html=True,
            )
            if st.session_state["papers"].papers and st.button(
                "一括解析", key="batch_analysis"
            ):
                # 取得済みの PaperResult から、すべての論文を解析してキャッシュに保存
                for paper in st.session_state["papers"].papers:
                    pid = paper.paper_id
                    cache_key = f"paper_analysis_{pid}"
                    # まだ解析していなければ LLM 呼び出し
                    if cache_key not in st.session_state:
                        title = paper.title
                        abstract = paper.abstract or ""
                        analysis = llm_service.analyze_searched_paper(
                            f"title: {title}, abstract: {abstract}"
                        )
                        st.session_state[cache_key] = analysis
                # 全件解析後にリラン
                st.rerun()

            if st.session_state["papers"].papers:
                selected, element_dict, papers_dict = (
                    paper_network.render_network_sections(st.session_state["papers"])
                )
                # 新しい選択結果が存在する場合のみ更新する
                if selected and "nodes" in selected and selected["nodes"]:
                    if selected["nodes"] != st.session_state["prev_selected_nodes"]:
                        st.session_state["prev_selected_nodes"] = selected["nodes"]
                        state_manager.update_selected_paper(
                            paper_network.get_selected_papers(
                                selected, element_dict, papers_dict
                            )
                        )

                        st.rerun()

        with detail_col:
            st.write("### 詳細情報")
            selected_list = st.session_state.get("selected_paper", [])
            analysis_result = None
            if selected_list:
                paper_id = selected_list[0]["paper_id"]
                cache_key = f"paper_analysis_{paper_id}"
                if st.button("選択論文を解析", key="analyze_selected"):
                    title = selected_list[0]["title"]
                    abstract = selected_list[0]["abstract"]
                    analysis = llm_service.analyze_searched_paper(
                        f"title: {title}, abstract: {abstract}"
                    )
                    st.session_state[cache_key] = analysis
                    analysis_result = analysis
                elif cache_key in st.session_state:
                    analysis_result = st.session_state[cache_key]
            elif st.session_state.get("user_input_analysis"):
                analysis_result = st.session_state["user_input_analysis"]

            with st.expander("分野配分", expanded=True):
                if analysis_result:
                    result_summary.render__paper_info_analysis(analysis_result.fields)
                else:
                    st.info(
                        "ユーザー入力解析または論文ネットワークで論文を選択してください。"
                    )

            with st.expander("解析結果", expanded=True):
                st.caption(
                    "ユーザー論文または選択論文の解析結果を表示します。",
                    unsafe_allow_html=True,
                )
                if analysis_result:
                    result_summary.render_paper_analysis_result(analysis_result)
                else:
                    st.info("まずは検索→論文選択、またはAI検索を実行してください。")

            with st.expander("論文情報", expanded=True):
                result_summary.render_info_paper(selected_list)

    # --- 3段目：論文解説AI ---
    with st.container():
        st.write("### 論文解説AI")
        st.write("---")
        st.caption(
            '<span style="color:coral; font-weight:bold;">＊新たに選択した論文に関するセッションを始めたい場合は下のボタンを押してください。履歴削除と兼ねています。</span>',
            unsafe_allow_html=True,
        )
        st.caption(
            '<span style="color:coral; font-weight:bold;">＊他のUIの操作は文章生成が完了してから行ってください。（生成中に触ってしまうと途中で止まってしまいます。）</span>',
            unsafe_allow_html=True,
        )

        spacer_l, chat_col, spacer_r = st.columns([1, 2, 1])
        with chat_col:
            if st.button("選択された論文の解説 or チャット履歴削除", key="init"):
                st.session_state["chat_history"] = [
                    {"role": "system", "content": config.system_prompt}
                ]
                st.session_state["initial_prompt_processed"] = False

            # テキストチャットなどの処理をここに記述
            chat_container = st.container(height=600)
            history_placeholder = chat_container.empty()
            stream_placeholder = chat_container.empty()

            history_placeholder.markdown(
                f"{chat_panel.render_history(st.session_state['chat_history'], config.css_text_user, config.css_text_assistant)}</div>",
                unsafe_allow_html=True,
            )

            # 初期入力
            if (
                not st.session_state["initial_prompt_processed"]
                and st.session_state.get("selected_paper")
            ):
                chat_panel.render_stream(
                    stream_placeholder, selected_paper=st.session_state["selected_paper"][0]
                )
                st.session_state["initial_prompt_processed"] = True
                history_placeholder.markdown(
                    f"{chat_panel.render_history(st.session_state['chat_history'], config.css_text_user, config.css_text_assistant)}</div>",
                    unsafe_allow_html=True,
                )
            st.caption(
                '<span style="color:coral">＊自動スクロール機能はありません。メッセージ送信後は下にスクロールしてください。</span>',
                unsafe_allow_html=True,
            )

            with st.form(key="chat_form"):
                user_message = st.text_area("あなたのメッセージ", key="chat_input")
                submitted = st.form_submit_button("送信")

            if submitted and user_message.strip():
                st.session_state["chat_history"].append(
                    {"role": "user", "content": user_message}
                )
                history_placeholder.markdown(
                    f"{chat_panel.render_history(st.session_state['chat_history'], config.css_text_user, config.css_text_assistant)}</div>",
                    unsafe_allow_html=True,
                )
                api_messages = [
                    {
                        "role": "user" if msg["role"] == "hidden_user" else msg["role"],
                        "content": msg["content"],
                    }
                    for msg in st.session_state["chat_history"]
                ]
                chat_panel.update_chat_history_with_response(
                    api_messages, stream_placeholder
                )
                history_placeholder.markdown(
                    f"{chat_panel.render_history(st.session_state['chat_history'], config.css_text_user, config.css_text_assistant)}</div>",
                    unsafe_allow_html=True,
                )
            st.markdown("</div>", unsafe_allow_html=True)


if __name__ == "__main__":
    main()

```

### File: streamlit_app/requirements.txt

```
altair==5.5.0
annotated-types==0.7.0
anyio==4.9.0
asttokens @ file:///home/conda/feedstock_root/build_artifacts/asttokens_1733250440834/work
attrs==25.1.0
beautifulsoup4==4.13.3
blinker==1.9.0
cachetools==5.5.2
certifi @ file:///croot/certifi_1738623731865/work/certifi
charset-normalizer==3.4.1
click==8.1.8
comm @ file:///home/conda/feedstock_root/build_artifacts/comm_1733502965406/work
contourpy==1.3.1
cycler==0.12.1
debugpy @ file:///home/conda/feedstock_root/build_artifacts/debugpy_1741148395697/work
decorator @ file:///home/conda/feedstock_root/build_artifacts/decorator_1740384970518/work
distro==1.9.0
dotenv==0.9.9
exceptiongroup @ file:///home/conda/feedstock_root/build_artifacts/exceptiongroup_1733208806608/work
executing @ file:///home/conda/feedstock_root/build_artifacts/executing_1733569351617/work
filelock==3.13.1
fonttools==4.56.0
fsspec==2024.6.1
fugashi==1.4.0
gitdb==4.0.12
GitPython==3.1.44
h11==0.14.0
httpcore==1.0.7
httpx==0.28.1
huggingface-hub==0.29.3
idna==3.10
importlib_metadata @ file:///home/conda/feedstock_root/build_artifacts/importlib-metadata_1737420181517/work
ipykernel @ file:///home/conda/feedstock_root/build_artifacts/ipykernel_1719845459717/work
ipython @ file:///home/conda/feedstock_root/build_artifacts/bld/rattler-build_ipython_1741457802/work
jedi @ file:///home/conda/feedstock_root/build_artifacts/jedi_1733300866624/work
Jinja2==3.1.6
jiter==0.9.0
jsonschema==4.23.0
jsonschema-specifications==2024.10.1
jupyter_client @ file:///home/conda/feedstock_root/build_artifacts/jupyter_client_1733440914442/work
jupyter_core @ file:///home/conda/feedstock_root/build_artifacts/jupyter_core_1727163409502/work
kiwisolver==1.4.8
MarkupSafe==3.0.2
matplotlib==3.10.0
matplotlib-inline @ file:///home/conda/feedstock_root/build_artifacts/matplotlib-inline_1733416936468/work
mpmath==1.3.0
narwhals==1.31.0
nest_asyncio @ file:///home/conda/feedstock_root/build_artifacts/nest-asyncio_1733325553580/work
networkx==3.3
numpy==2.2.3
openai==1.66.5
outcome==1.3.0.post0
packaging @ file:///home/conda/feedstock_root/build_artifacts/packaging_1733203243479/work
pandas==2.2.3
parso @ file:///home/conda/feedstock_root/build_artifacts/parso_1733271261340/work
pexpect @ file:///home/conda/feedstock_root/build_artifacts/pexpect_1733301927746/work
pickleshare @ file:///home/conda/feedstock_root/build_artifacts/pickleshare_1733327343728/work
pillow==11.1.0
pinecone==6.0.1
pinecone-plugin-interface==0.0.7
platformdirs @ file:///home/conda/feedstock_root/build_artifacts/platformdirs_1733232627818/work
plotly==6.0.1
ply==3.11
prompt_toolkit @ file:///home/conda/feedstock_root/build_artifacts/prompt-toolkit_1737453357274/work
protobuf==5.29.3
psutil @ file:///home/conda/feedstock_root/build_artifacts/psutil_1740663128538/work
ptyprocess @ file:///home/conda/feedstock_root/build_artifacts/ptyprocess_1733302279685/work/dist/ptyprocess-0.7.0-py2.py3-none-any.whl#sha256=92c32ff62b5fd8cf325bec5ab90d7be3d2a8ca8c8a3813ff487a8d2002630d1f
pure_eval @ file:///home/conda/feedstock_root/build_artifacts/pure_eval_1733569405015/work
pyarrow==19.0.1
pydantic==2.10.6
pydantic_core==2.27.2
pydeck==0.9.1
Pygments @ file:///home/conda/feedstock_root/build_artifacts/pygments_1736243443484/work
pyparsing==3.2.1
PyQt5==5.15.10
PyQt5_sip @ file:///croot/pyqt-split_1736540531116/work/pyqt_sip
PySocks==1.7.1
python-dateutil @ file:///home/conda/feedstock_root/build_artifacts/python-dateutil_1733215673016/work
python-dotenv==1.0.1
pytz==2025.1
PyYAML==6.0.2
pyzmq @ file:///home/conda/feedstock_root/build_artifacts/pyzmq_1738270958168/work
referencing==0.36.2
regex==2024.11.6
requests==2.32.3
rpds-py==0.23.1
safetensors==0.5.3
selenium==4.30.0
sentencepiece==0.2.0
sip @ file:///croot/sip_1736541134699/work
six @ file:///home/conda/feedstock_root/build_artifacts/six_1733380938961/work
smmap==5.0.2
sniffio==1.3.1
sortedcontainers==2.4.0
soupsieve==2.6
st-cytoscape==0.0.5
stack_data @ file:///home/conda/feedstock_root/build_artifacts/stack_data_1733569443808/work
streamlit==1.43.1
sympy==1.13.1
tenacity==9.0.0
tokenizers==0.21.0
toml==0.10.2
tomli @ file:///opt/conda/conda-bld/tomli_1657175507142/work
torch==2.6.0+cpu
torchaudio==2.6.0+cpu
torchvision==0.21.0+cpu
tornado==5.0
tqdm==4.67.1
traitlets @ file:///home/conda/feedstock_root/build_artifacts/traitlets_1733367359838/work
transformers==4.49.0
trio==0.29.0
trio-websocket==0.12.2
typing_extensions @ file:///home/conda/feedstock_root/build_artifacts/typing_extensions_1733188668063/work
tzdata==2025.1
unidic-lite==1.0.8
urllib3==2.3.0
watchdog==6.0.0
wcwidth @ file:///home/conda/feedstock_root/build_artifacts/wcwidth_1733231326287/work
webdriver-manager==4.0.2
websocket-client==1.8.0
wsproto==1.2.0
zipp @ file:///home/conda/feedstock_root/build_artifacts/zipp_1732827521216/work

```

### File: streamlit_app/api/__init__.py

```python

```

### File: streamlit_app/api/lm_studio_api.py

```python
import json
from openai import OpenAI
from utils import config

def get_structured_response(client: OpenAI, model: str, messages: list) -> dict:
    """
    lm studio jsonスキーマ固定出力
    指定したモデルとメッセージでチャット補完を実行し、
    返ってきたJSON形式のレスポンスを辞書型に変換して返す関数。
    
    Parameters:
        client (OpenAI): OpenAIクライアントインスタンス
        model (str): 使用するモデル名
        messages (list): チャットで送信するメッセージのリスト
    
    Returns:
        dict: 整形されたレスポンス（例: fields, labels など）
    
    Raises:
        ValueError: JSONのパースに失敗した場合
    """
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        # 必要に応じて追加パラメータを設定
    )
    

    # message.content全体を取得
    result = response.choices[0].message.content
    clean_lines = [line for line in result.splitlines() if not line.strip().startswith("```")]
    result = "\n".join(clean_lines)
    #print(result)


    try:
        structured_data = json.loads(result)
    except json.JSONDecodeError as e:
        print(result)
        raise ValueError("レスポンスのJSON形式に誤りがあります") from e

    return structured_data

def stream_chat_response(messages, temperature=0.2):
    """
    APIを呼び出してストリーミング応答を生成するジェネレーター関数
    """
    # システムプロンプトやAPI設定
    system_prompt = "あなたは誠実で優秀な日本人のアシスタントです。特に指示が無い場合は、常に日本語で回答してください。"
    url1 = "http://192.168.11.26:1234/v1"
    client = OpenAI(base_url=url1, api_key="lm-studio")
    MODEL = "my-model"
    stream = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        stream=True,
        #temperature=temperature
    )
    response_text = ""
    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            response_text += delta.content
            yield response_text


# 使用例
if __name__ == "__main__":
    client = OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm-studio")
    #client = OpenAI(base_url="http://localhost:11435/v1", api_key="gemma3:12b")
    
    #MODEL = "gemma3:12b"
    MODEL = "my-model"
    #MODEL = "gemma-3-12b-it@q3_k_l"
    user_paper = '''"""感度解析を介した時系列遺伝子発現データ補完法の開発と創薬応用,承認薬を含む生物活性化合物は治療標的となるタンパク質に作用することで疾患治療のための作用を示す。しか し、それ以外のタンパク質に作用することで副作用のような期待していない作用を示す場合がある。したがって、 化合物の作用メカニズムを明らかにすることは、創薬における重要課題になっている。近年、オミクス情報に基づく、化合物の作用メカニズム予測が注目されている。例えば、化合物をヒト由来細胞に 添加して、一定時間後に遺伝子発現を観測した、化合物応答遺伝子発現データは、化合物の作用メカニズムの予測 に用いられている。しかしながら、このような遺伝子発現データは、コストや時間の制約により、特定の時間点で のみ観測され時系列で観測されていない。これによって、特定の時間点での解析を行うことはできるが、経時的に 解析を行うことができない。したがって、現状のデータから、化合物の経時的な影響を予測することは限界がある。そこで本研究では、細胞内システムに対して構築された数理モデルの感度解析を行い、得られた結果に基づき、 観測されている化合物応答遺伝子発現データから、時系列の遺伝子発現データを補完する新たな手法を開発することを目指した。"""'''
    user_paper = '''"""多次元センサデータ処理のためのTransformerを用いた自己教師あり学習手法,センサ信号を入力として,人間行動認識を行う深層学習アルゴリズムを開発した. ここでは自然言語で用いられるTransformerに基づいた事前学習言語モデルを構築して, その事前学習言語モデルを用いて,下流タスクである人間行動認識タスクを解く形を追求する. VanillaのTransformerでもこれは可能であるが, ここでは, 線形層によるn次元数値データの埋め込み、ビン化処理、出力層の線形処理層という３つの要素を特色とするｎ次元数値処理トランスフォーマーを提案する。5種類のデータセットに対して、このモデルの効果を確かめた. VanillaのTransformerと比較して, 精度で10%～15%程度, 向上させることができた"""'''
    #user_paper = '''"""P2LHAP: Wearable-Sensor-Based Human Activity Recognition, Segmentation, and Forecast Through Patch-to-Label Seq2Seq Transformer Traditional deep learning methods struggle to simultaneously segment, recognize, and forecast human activities from sensor data. This limits their usefulness in many fields, such as healthcare and assisted living, where real-time understanding of ongoing and upcoming activities is crucial. This article introduces P2LHAP, a novel Patch-to-Label Seq2Seq framework that tackles all three tasks in an efficient single-task model. P2LHAP divides sensor data streams into a sequence of “patches,” served as input tokens, and outputs a sequence of patch-level activity labels, including the predicted future activities. A unique smoothing technique based on surrounding patch labels, is proposed to identify activity boundaries accurately. Additionally, P2LHAP learns patch-level representation by sensor signal channel-independent Transformer encoders and decoders. All channels share embedding and Transformer weights across all sequences. Evaluated on the three public datasets, P2LHAP significantly outperforms the state-of-the-art in all three tasks, demonstrating its effectiveness and potential for real-world applications."""'''
    messages = [
        {
            "role": "user",
            "content": config.experiment_message_without_paper + user_paper
        }
    ]
    
    data = get_structured_response(client, MODEL, messages)
    print(data)
    print(data.keys())
    #for item in data['fields']:
    #    print(f"{item['name']}:{item['score']}")

```

### File: streamlit_app/api/ollama_api.py

```python
import requests
import json
from utils import config
from jsonschema import validate, ValidationError

def get_structured_response(model_name: str, prompt: str, temperature: float = 0.8, max_tokens: int = 500) -> dict:
    """
    Ollama の /api/generate エンドポイントを使い、指定したプロンプトで生成を実行します。
    非ストリーミングのため、レスポンス全体を一度に取得して辞書型に変換します。
    """
    url_generate = "http://127.0.0.1:11435/api/generate"
    data = {
        "model": model_name,
        "prompt": prompt,
        "stream": False,
        "temperature": temperature,
        #"max_tokens": max_tokens
    }
    response = requests.post(url_generate, json=data)
    if response.status_code != 200:
        raise Exception(f"Error: {response.status_code}")
    
    result = response.text
    # 不要なマークダウン（例: ```）が含まれている場合は除去
    clean_lines = [line for line in result.splitlines() if not line.strip().startswith("```")]
    clean_result = "\n".join(clean_lines)
    
    try:
        structured_data = json.loads(clean_result)
    except json.JSONDecodeError as e:
        raise ValueError("レスポンスのJSON形式に誤りがあります.1") from e
    
    # 不要なマークダウン（例: ```）が含まれている場合は除去
    clean_lines = [line for line in structured_data["response"].splitlines() if not line.strip().startswith("```")]
    clean_result = "\n".join(clean_lines)

    try:
        structured_data = json.loads(clean_result)
    except json.JSONDecodeError as e:
        print(clean_result)
        raise ValueError("レスポンスのJSON形式に誤りがあります.2") from e

    return structured_data

def get_structured_response_v2(model_name: str, prompt: str, temperature: float = 0.8, max_tokens: int = 500, json_schema: dict = config.structured_json_schema) -> dict:
    """
    Structured output機能を利用して、JSONスキーマに沿ったレスポンスを取得する改良版関数です。
    
    Parameters:
        model_name (str): 使用するモデル名
        prompt (str): ユーザーのプロンプト
        temperature (float): 出力の多様性を制御するパラメータ
        max_tokens (int): 最大トークン数（必要に応じて利用）
        json_schema (dict): JSONスキーマを指定する場合に渡す。例:
            {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "capital": { "type": "string" },
                "languages": {
                  "type": "array",
                  "items": { "type": "string" }
                }
              },
              "required": ["name", "capital", "languages"]
            }
    
    Returns:
        dict: 解析済みの構造化されたレスポンス
    """
    url_chat = "http://127.0.0.1:11435/api/chat"  # エンドポイントをchatに変更
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "temperature": temperature,
    }
    if json_schema:
        payload["format"] = json_schema

    response = requests.post(url_chat, json=payload)
    if response.status_code != 200:
        raise Exception(f"Error: {response.status_code}")
    
    result = response.text
    
    
    try:
        structured_data = json.loads(result)
        print("\n\n",structured_data)
    except json.JSONDecodeError as e:
        raise ValueError("レスポンスのJSON形式に誤りがあります") from e
    
    try:
        content = structured_data["message"]["content"]
    except (KeyError, TypeError):
        raise ValueError("レスポンス形式が想定と異なります")
    
    clean_lines = [line for line in content.splitlines() if not line.strip().startswith("```")]
    clean_result = "\n".join(clean_lines)
    
    try:
        structured_data = json.loads(clean_result)
        print("\n\n", structured_data)
    except json.JSONDecodeError as e:
        print("abc")
        print(clean_result)
        print("def")
        raise ValueError("レスポンスのJSON形式に誤りがあります.2") from e

    # ここで、json_schema が指定されている場合はバリデーションを実施
    if json_schema:
        try:
            validate(instance=structured_data, schema=json_schema)
        except ValidationError as ve:
            raise ValueError("レスポンスが指定されたJSONスキーマに準拠していません。") from ve

    print("last data:\n\n\n\n", structured_data)
    return structured_data

def stream_chat_response(model_name: str, messages: list, temperature: float = 0.8):
    """
    Ollama の /api/chat エンドポイントを使い、ストリーミングでチャット応答を生成するジェネレーター関数です。
    
    Parameters:
        model (str): 使用するモデル名（例: "llama2"）
        messages (list): 各メッセージに "role" と "content" を含む辞書のリスト
        temperature (float): 応答の多様性を制御するパラメータ
    
    Yields:
        response_text (str): 累積された応答テキスト（逐次更新）
    """
    url_chat = "http://127.0.0.1:11435/api/chat"
    data = {
        "model": model_name,
        "messages": messages,
        "stream": True,
        "temperature": temperature
    }
    response = requests.post(url_chat, json=data, stream=True)
    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        return
    
    response_text = ""
    """for chunk in response.iter_lines():
        if chunk:
            # 受信したチャンクは JSON ではなくプレーンなテキストとして返ってくる前提
            text = chunk.decode("utf-8")
            print(text, end="", flush=True)  # 改行せずにリアルタイム出力
            response_text += text
            yield response_text"""

    for line in response.iter_lines():
        if line:
            try:
                # 各チャンクは JSON 形式で送られてくると想定
                chunk = json.loads(line.decode("utf-8"))
                # 実際のレスポンス構造に合わせてキーを変更してください
                # ここでは例として、"message" キーの中の "content" を取り出しています
                content = ""
                if "message" in chunk and "content" in chunk["message"]:
                    content = chunk["message"]["content"]
                else:
                    # 例外対応: "text" キーの場合
                    content = chunk.get("text", "")
                if content:
                    print(content, end="", flush=True)
                    response_text += content
                    yield response_text
            except json.JSONDecodeError:
                # JSONパースに失敗した場合、デコード済みの文字列をそのまま出力
                decoded_line = line.decode("utf-8")
                print(decoded_line, end="", flush=True)
                response_text += decoded_line
                yield response_text

if __name__ == "__main__":
    # 非ストリーミング生成の例
    model = config.OLLAMA_MODEL
    prompt = "自己紹介をお願いします"
    try:
        structured_response = get_structured_response(model, prompt)
        print("Structured response:")
        print(structured_response)
    except Exception as e:
        print("Error:", e)
    
    """# ストリーミングチャットの例
    messages = [
        { "role": "system", "content": "あなたは親切なアシスタントです" },
        { "role": "user", "content": "こんにちは" },
        { "role": "assistant", "content": "はい、何かお手伝いできることはありますか？" },
        { "role": "user", "content": "天気について教えてください" }
    ]
    print("\nStreaming chat response:")
    for full_response in stream_chat_response(model, messages):
        # リアルタイムにコンソールへ出力されるので、ここでの処理は不要
        pass
"""
```

### File: streamlit_app/api/paper_api.py

```python
import requests
import streamlit as st
import time

def search_papers_semantic(query: str, year_from: int = 2023,year_to: int = None, limit: int = 20, max_retries=10) -> list[dict]:
    """
    指定されたクエリでSemantic Scholar APIから論文情報を取得し、辞書のリストを返す関数。

    Args:
        query (str): 検索クエリ
        year_from (int): 取得する論文の開始年（例: 2023）
        limit (int): 取得件数の上限（最大1000件）

    Returns:
        list[dict]: 論文情報の辞書のリスト
    """
    url = "http://api.semanticscholar.org/graph/v1/paper/search/"
    query_params = {
        "query": query,
        "fields": "title,abstract,url,publicationTypes",
        #"year": f"{year_from}-",
        "limit": limit,
        "sort": "relevance",
    }
    if year_to is not None:
        query_params["year"] = f"{year_from}-{year_to}"
    else:
        query_params["year"] = f"{year_from}-"

    retries = 0
    while retries < max_retries:
        response = requests.get(url, params=query_params)
        data = response.json()

        if "data" in data:
            #st.write(data)
            return data["data"]
        elif data.get("code") == "429":
            st.warning("APIが混雑しています。自動で再試行します...")
            time.sleep(1)
            retries += 1
            continue
        else:
            st.error("APIエラーが発生しました。再度検索ボタンを押してください。")
            st.write(data)
            return []
    
    st.error("APIが混雑しています。時間をおいて再試行してください。")
        

# 使用例（この行は他ファイルで呼び出す場合の参考）
# results = search_papers('"human activity recognition sensor transformer"')
if __name__ == "__main__":
    query = "Time-Series Gene Expression Data Imputation"
    data = search_papers_semantic(query=query, year_from=2023, limit=20)
    print(data)
    print(len(data))
```

### File: streamlit_app/utils/__init__.py

```python

```

### File: streamlit_app/utils/config.py

```python
# 実験用のmessage　ユーザー論文あり
import os
from .field_colors import FIELD_LIST, FIELD_NAMES

# デフォルトで使用するOllamaモデル名を環境変数から指定可能にする
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma-textonly_v3:latest")
#OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "deepseek-r1:8b-0528-qwen3-q8_0")
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
```

### File: streamlit_app/utils/cytoscape_utils.py

```python
import math
from collections import defaultdict
from . import field_colors


def _short_label(title: str, length: int = 20) -> str:
    """Return a shortened title for display."""
    return title if len(title) <= length else title[: length - 1] + "…"

def build_cy_elements_simple(papers: list) -> list:
    """
    Cytoscape用のノード・エッジ情報を生成するシンプルな実装。
    各論文は中心ノードから放射状に配置され、中心と各論文ノード間にエッジを生成します。
    
    papersには、各論文の情報が含まれる辞書のリストが与えられると仮定しています。
    例: {
            "title": "論文タイトル",
            "abstract": "論文概要",
            "url": "論文のURL",
            "paper_id": "一意のID"
         }
    """
    elements = []

    # 中心ノード（例として "your paper" と表示）
    center_node = {
        "data": {"id": "center", "label": "your paper"},
        "position": {"x": 0, "y": 0}
    }
    elements.append(center_node)
    
    num_papers = len(papers.papers)
    # 論文ノードを中心の周りに円形に配置
    radius = 200  # 中心からの距離を広めに取る
    angle_step = 2 * math.pi / num_papers if num_papers > 0 else 0

    for i, paper in enumerate(papers.papers,start=1):
        # 論文データから必要な情報を取得（paper_idがなければインデックスを利用）
        paper_id = paper.paper_id
        node_id = f"paper_{paper_id}"
        angle = i * angle_step
        x = (radius + i * 15) * math.cos(angle)
        y = (radius + i * 15) * math.sin(angle)
        
        node = {
            "data": {
                "id": node_id,
                "paper_id": paper_id,
                "label": _short_label(paper.title),
                "title": paper.title,
                "abstract": paper.abstract,
                "url": paper.url,
                "relatedness": i,
            },
            "position": {"x": x, "y": y}
        }
        elements.append(node)
        
        # 中心ノードとこの論文ノードとの間にエッジを作成
        edge = {
            "data": {
                "id": f"edge_center_{node_id}",
                "source": "center",
                "target": node_id
            }
        }
        elements.append(edge)
    
    return elements


def build_cy_elements_by_field(papers, analysis_map):
    """Create Cytoscape elements grouped by field.

    Parameters
    ----------
    papers : PaperResult
        Search result papers.
    analysis_map : dict
        Mapping from paper_id to PaperAnalysisResult.
    """
    elements = []

    center_node = {"data": {"id": "center", "label": "your paper", "type": "center"}, "position": {"x": 0, "y": 0}}
    elements.append(center_node)

    # Group papers by first and second field
    field_groups = defaultdict(lambda: defaultdict(list))
    for paper in papers.papers:
        analysis = analysis_map.get(paper.paper_id)
        if not analysis or not analysis.fields:
            field_groups["Unknown"]["Unknown"].append(paper)
            continue
        first = analysis.fields[0].name
        second = analysis.fields[1].name if len(analysis.fields) > 1 else "Other"
        field_groups[first][second].append(paper)

    num_fields = len(field_groups)
    radius = 300
    angle_step = 2 * math.pi / num_fields if num_fields else 0
    for idx, (field, subdict) in enumerate(field_groups.items()):
        angle = idx * angle_step
        fx = radius * math.cos(angle)
        fy = radius * math.sin(angle)
        field_id = f"field_{idx}"
        field_node = {
            "data": {
                "id": field_id,
                "label": field,
                "type": "field",
                "color": field_colors.get_field_color(field),
            },
            "position": {"x": fx, "y": fy},
        }
        elements.append(field_node)
        elements.append({"data": {"id": f"edge_center_{field_id}", "source": "center", "target": field_id}})

        sub_radius = 150
        num_sub = len(subdict)
        sub_angle = 2 * math.pi / num_sub if num_sub else 0
        for sidx, (subfield, plist) in enumerate(subdict.items()):
            s_angle = sidx * sub_angle
            sfx = fx + sub_radius * math.cos(s_angle)
            sfy = fy + sub_radius * math.sin(s_angle)
            sub_id = f"{field_id}_{sidx}"
            sub_node = {
                "data": {
                    "id": sub_id,
                    "label": subfield,
                    "type": "subfield",
                    "color": field_colors.get_field_color(subfield),
                },
                "position": {"x": sfx, "y": sfy},
            }
            elements.append(sub_node)
            elements.append({"data": {"id": f"edge_{field_id}_{sub_id}", "source": field_id, "target": sub_id}})

            paper_radius = 80
            paper_angle = 2 * math.pi / len(plist) if plist else 0
            for j, paper in enumerate(plist):
                px = sfx + (paper_radius + j * 15) * math.cos(j * paper_angle)
                py = sfy + (paper_radius + j * 15) * math.sin(j * paper_angle)
                node_id = f"paper_{paper.paper_id}"
                node = {
                    "data": {
                        "id": node_id,
                        "paper_id": paper.paper_id,
                        "label": _short_label(paper.title),
                        "title": paper.title,
                        "abstract": paper.abstract,
                        "url": paper.url,
                        "color": field_colors.get_field_color(subfield),
                        "type": "paper",
                        "relatedness": j + 1,
                    },
                    "position": {"x": px, "y": py},
                }
                elements.append(node)
                elements.append({"data": {"id": f"edge_{sub_id}_{node_id}", "source": sub_id, "target": node_id}})

    return elements

```

### File: streamlit_app/utils/field_colors.py

```python
import plotly.express as px

FIELD_LIST = [
    "transformer","人工知能", "ロボティクス", "電子工学", "機械工学", "材料工学",
    "化学", "物理学", "生物学", "医学", "薬学", "環境科学", "農学", "数学",
    "地球科学", "哲学", "心理学", "社会学", "教育学", "法学", "政治学",
    "経済学", "経営学", "言語学", "文学", "歴史学", "文化人類学", "メディア学",
    "芸術学", "土木工学", "交通工学", "建築工学",
]

# Comma-separated string of field names for prompt templates
FIELD_NAMES = ", ".join(FIELD_LIST)

# large palette to support many fields
_DEFAULT_COLORS = px.colors.qualitative.Dark24 + px.colors.qualitative.Light24

FIELD_COLOR_MAP = {
    name: _DEFAULT_COLORS[i % len(_DEFAULT_COLORS)]
    for i, name in enumerate(FIELD_LIST)
}


def get_field_color(name: str) -> str:
    """Return a color for the given field name.

    If the field is not predefined, a color is selected deterministically
    based on the hash of the name so the same field gets the same color
    across sessions.
    """
    if name not in FIELD_COLOR_MAP:
        index = abs(hash(name)) % len(_DEFAULT_COLORS)
        FIELD_COLOR_MAP[name] = _DEFAULT_COLORS[index]
    return FIELD_COLOR_MAP[name]

```

### File: streamlit_app/utils/llm_controller.py

```python
# utils/llm_controller.py
from api import lm_studio_api, ollama_api
from openai import OpenAI
from utils import config
from dataclasses import dataclass, field
from typing import List, Optional
import streamlit as st

@dataclass
class Field:
    name: str
    score: float

@dataclass
class Label:
    ja: str
    en: str

@dataclass
class PaperAnalysisResult:
    fields: List[Field]
    target: Label
    title: Optional[str] = None
    methods: Optional[List[Label]] = None
    factors: Optional[List[Label]] = None
    metrics: Optional[List[Label]] = None
    search_keywords: Optional[List[Label]] = None
    main_keywords: Optional[List[Label]] = None

def user_paper_lmstudio_controllar(input: str):
    client = OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
    MODEL = "my-model"
    messages = [{
        "role": "user",
        "content": config.experiment_message_without_paper + input
    }]
    data = lm_studio_api.get_structured_response(client, MODEL, messages)
    fields = [Field(f["name"], f["score"]) for f in data["fields"]]
    target = Label(data["labels"]["target"]["ja"], data["labels"]["target"]["en"])
    title = data["title"]
    methods = [Label(m["ja"], m["en"]) for m in data["labels"]["approaches"]["methods"]]
    factors = [Label(f["ja"], f["en"]) for f in data["labels"]["approaches"]["factors"]]
    metrics = [Label(m["ja"], m["en"]) for m in data["labels"]["approaches"]["metrics"]]
    search_keywords = [Label(m["ja"], m["en"]) for m in data["labels"]["search_keywords"]]
    return PaperAnalysisResult(fields, target, title=title, methods=methods, factors=factors, metrics=metrics, search_keywords=search_keywords)

def search_paper_lmstudio_controllar(input: str):
    client = OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
    MODEL = "my-model"
    messages = [{
        "role": "user",
        "content": config.llm_init_prompt_field_main_factor + input
    }]
    data = lm_studio_api.get_structured_response(client, MODEL, messages)
    fields = [Field(f["name"], f["score"]) for f in data["fields"]]
    target = Label(data["labels"]["target"]["ja"], data["labels"]["target"]["en"])
    main_keywords = [Label(m["ja"], m["en"]) for m in data["labels"]["main_keywords"]]
    return PaperAnalysisResult(fields, target, main_keywords=main_keywords)

def user_paper_ollama_controllar(input: str):
    #client = OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
    #MODEL = "gemma3:12b"
    MODEL = config.OLLAMA_MODEL
    #messages = [{
    #    "role": "user",
    #    "content": config.experiment_message_without_paper + input
    #}]
    messages = config.experiment_message_without_paper + input
    data = ollama_api.get_structured_response_v2(MODEL, messages)
    print(data)
    fields = [Field(f["name"], f["score"]) for f in data["fields"]]
    target = Label(data["labels"]["target"]["ja"], data["labels"]["target"]["en"])
    title = data["title"]
    methods = [Label(m["ja"], m["en"]) for m in data["labels"]["approaches"]["methods"]]
    factors = [Label(f["ja"], f["en"]) for f in data["labels"]["approaches"]["factors"]]
    metrics = [Label(m["ja"], m["en"]) for m in data["labels"]["approaches"]["metrics"]]
    search_keywords = [Label(m["ja"], m["en"]) for m in data["labels"]["search_keywords"]]
    return PaperAnalysisResult(fields, target, title=title, methods=methods, factors=factors, metrics=metrics, search_keywords=search_keywords)

def search_paper_ollama_controllar(input: str):
    #client = OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
    MODEL = "gemma3:12b"
    messages = [{
        "role": "user",
        "content": config.llm_init_prompt_field_main_factor + input
    }]
    data = ollama_api.get_structured_response(MODEL, messages)
    fields = [Field(f["name"], f["score"]) for f in data["fields"]]
    target = Label(data["labels"]["target"]["ja"], data["labels"]["target"]["en"])
    main_keywords = [Label(m["ja"], m["en"]) for m in data["labels"]["main_keywords"]]
    return PaperAnalysisResult(fields, target, main_keywords=main_keywords)



if __name__ == "__main__":
    text = """サンプルテキスト"""
    result = search_paper_lmstudio_controllar(text)
    print(result.fields)
    print(result.target)
    print(result.main_keywords)
```

### File: streamlit_app/utils/paper_controller.py

```python
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
```

### File: streamlit_app/ui/__init__.py

```python

```

### File: streamlit_app/ui/chat_panel.py

```python
# テキストチャット
import streamlit as st
from utils import llm_controller, config
from api import lm_studio_api, ollama_api

def render_history(chat_history, css_text_user, css_text_assistant):
    """
    チャット履歴をHTML形式でレンダリングする。
    """
    out = ""
    script = """<script>
        var chatBoxes = document.getElementsByClassName("chat-box");
        if (chatBoxes.length > 0) {
            chatBoxes[chatBoxes.length - 1].scrollTop = chatBoxes[chatBoxes.length - 1].scrollHeight;
        }
    </script>"""
    for msg in chat_history:
        if msg["role"] == "assistant":
            out += f"""{css_text_assistant}<strong>Assistant:</strong> {msg['content']}</div>{script}\n\n"""
        elif msg["role"] == "user":
            out += f"""{css_text_user}<strong>User:</strong> {msg['content']}</div>{script}\n\n"""
    return out

def update_chat_history_with_response(api_messages, stream_placeholder):
    """
    LLM APIからのストリーミングレスポンスを処理し、チャット履歴を更新する。
    """
    #MODEL = config.OLLAMA_MODEL
    MODEL = "gemma3:12b"
    #MODEL = "deepseek-r1:8b-0528-qwen3-q8_0"
    assistant_response = ""
    #stream_placeholder = st.empty()  # ストリーミング更新用プレースホルダー
    for updated_text in ollama_api.stream_chat_response(model_name=MODEL,messages=api_messages):
        assistant_response = updated_text
        stream_placeholder.markdown(f"<strong>Assistant:</strong> {updated_text}</div>", unsafe_allow_html=True)
    stream_placeholder.empty()
    st.session_state["chat_history"].append({
        "role": "assistant",
        "content": assistant_response
    })
    return assistant_response

def render_stream(stream_placeholder, selected_paper):
    selected_paper_content = f"{selected_paper['title']}, {selected_paper['abstract']}"
    if st.session_state["search_mode"] == "AI検索 2":
        initial_prompt = (
            f"{config.INST_PROMPT_AI}\nユーザー論文:{st.session_state['first_user_input']}"
            f"\"\"\"選択された論文\"\"\"{selected_paper_content}\"\"\""
        )
    elif st.session_state["search_mode"] == "キーワード検索":
        initial_prompt = (
            f"{config.INST_PROMPT_KEYWORDS}\n"
            f"検索キーワード：{st.session_state['first_user_input']}\n論文：{selected_paper_content}"
        )
    else:
        st.error("検索方法が指定されていないことになっています。")
        return

    st.session_state["chat_history"].append({
        "role": "hidden_user",
        "content": initial_prompt
    })

    # hidden_user を user に変換した API 用メッセージリストの作成
    api_messages = [
        {"role": "user" if msg["role"] == "hidden_user" else msg["role"], "content": msg["content"]}
        for msg in st.session_state["chat_history"]
    ]
    update_chat_history_with_response(api_messages, stream_placeholder)

        
```

### File: streamlit_app/ui/paper_network.py

```python
# ui/paper_network_and_basic_info.py
import streamlit as st
from utils import cytoscape_utils
from utils import field_colors
from st_cytoscape import cytoscape

def render_network_sections(papers, details=False):
    analysis_map = {}
    all_analyzed = True
    for paper in papers.papers:
        key = f"paper_analysis_{paper.paper_id}"
        analysis = st.session_state.get(key)
        if analysis:
            analysis_map[paper.paper_id] = analysis
        else:
            all_analyzed = False

    if all_analyzed and analysis_map:
        elements = cytoscape_utils.build_cy_elements_by_field(papers, analysis_map)
    else:
        elements = cytoscape_utils.build_cy_elements_simple(papers)
    style_sheet = [
        {
            "selector": "node",
            "style": {
                "label": "data(label)",
                "font-size": "10px",
                "color": "#333",
                "background-color": "data(color)",
                "width": "35px",
                "height": "35px",
            },
        },
        {
            "selector": "edge",
            "style": {
                "width": 2,
                "line-color": "#ccc",
                "target-arrow-shape": "triangle",
                "target-arrow-color": "#ccc",
                "curve-style": "bezier",
            }
        },
        {
            "selector": "node:selected",
            "style": {
                "background-color": "#FF0000",
                "border-color": "#F00",
                "border-width": "2px",
            }
        },
        {
            "selector": "[type='field']",
            "style": {"shape": "rectangle", "width": "50px", "height": "50px"},
        },
        {
            "selector": "[type='subfield']",
            "style": {"shape": "round-rectangle", "width": "45px", "height": "45px"},
        },
        {
            "selector": "[type='paper']",
            "style": {"shape": "ellipse", "width": "35px", "height": "35px"},
        },
    ]
    layout = {"name": "preset"}
    
    with st.container():
        selected = cytoscape(
            elements,
            style_sheet,
            height="800px",
            layout=layout,
            key="graph",
            selection_type="single",
            min_zoom=0.5,
            max_zoom=1
        )
    # ノード情報の高速検索用辞書（センター以外）
    element_dict = {str(f"{e['data']['id']}"): e for e in elements if e["data"]["id"] != "center"}
    # 論文情報を paper_id でマッピング（ここでは PaperFields の paper_id と対応付け）
    papers_dict = {str(f"paper_{p.paper_id}"): p for p in papers.papers}
    
    return selected, element_dict, papers_dict

def get_selected_papers(selected, element_dict, papers_dict):
    """
    選択されたノードから論文情報のリストを作成する関数
    """
    selected_papers = []
    if selected and "nodes" in selected:
        for node_id in selected["nodes"]:
            if node_id == "center":
                continue
            node_papers = papers_dict.get(node_id)
            node_elem = element_dict.get(node_id)
            if not node_papers:
                print("why")
                continue
            selected_papers.append({
                "title": node_papers.title,
                "abstract": node_papers.abstract,
                "url": node_papers.url,
                "paper_id": node_papers.paper_id,
                "relatedness": node_elem["data"]["relatedness"],
            #    "relatedness": getattr(paper, "relatedness", 0),  # 存在しない場合は0とする例
            #    "university": getattr(paper, "university", "不明"),
            #    "url": paper.url,
            #    "abstract": paper.abstract,
            })
    return selected_papers
```

### File: streamlit_app/ui/result_summary.py

```python
# ui/result_summary.py
import streamlit as st
import plotly.express as px
import pandas as pd
from utils.field_colors import get_field_color

def render__paper_info_analysis(fields):
    if not fields:
        st.warning("データがありません。")
        return

    total_score = sum(field.score for field in fields)
    data = [
        {"name": field.name, "score": field.score, "percentage": 100 * field.score / total_score}
        for field in fields
    ]
    df = pd.DataFrame(data).copy().sort_values("percentage", ascending=False)
    sorted_names = df["name"].tolist()

    color_map = {name: get_field_color(name) for name in df["name"]}

    fig = px.pie(
        df,
        names="name",
        values="percentage",
        title="各分野の割合（多い順・時計回り）",
        category_orders={"name": sorted_names},
        color="name",
        color_discrete_map=color_map,
    )
    fig.update_traces(direction="clockwise")
    st.plotly_chart(fig, use_container_width=True)

def render_paper_analysis_result(result):
    data = {}
    if result.title:
        data["タイトル"] = result.title
    if result.fields:
        data["分野"] = ", ".join([f"{field.name} ({field.score})" for field in result.fields])
    if result.target:
        data["対象"] = result.target.ja
    if result.methods:
        data["手法"] = ", ".join([label.ja for label in result.methods])
    if result.factors:
        data["要因"] = ", ".join([label.ja for label in result.factors])
    if result.metrics:
        data["指標"] = ", ".join([label.ja for label in result.metrics])
    if result.search_keywords:
        data["検索キーワード"] = ", ".join([label.ja for label in result.search_keywords])
    if result.main_keywords:
        data["主要キーワード"] = ", ".join([label.ja for label in result.main_keywords])
    
    df = pd.DataFrame.from_dict(data, orient="index", columns=["内容"])
    st.table(df)

def render_info_paper(papers):
    for paper in papers:
        st.write(f"タイトル: {paper['title']}")
        st.write(f"関連順位: {paper.get('relatedness', 0)} 位")
        st.write(f"URL: {paper['url']}")
        st.write(f"アブストラクト：\n {paper['abstract']}")
        st.write("---")

```

### File: streamlit_app/ui/search_bar.py

```python
# ui/search_bar.py

import streamlit as st
from core import paper_service, llm_service
from state import state_manager

def render_search_section():
    st.radio(
        "検索モード選択:",
        ("キーワード検索", "AI検索 1", "AI検索 2"),
        horizontal=True,
        key="search_mode"
    )

    st.caption(
        '※ キーワード検索 : 指定されたキーワードで検索を行います。（例：「genarative ai transformer」）',
        unsafe_allow_html=True
    )
    st.caption(
        '※ AI検索 1 : 入力された文章から関連度の高い論文を自動で解析し検索します。（例：「～～に関する論文が知りたい」）',
        unsafe_allow_html=True
    )
    st.caption(
        '※ AI検索 2 : 論文で論文を検索する場合は「(論文タイトル),(論文アブストラクト)」の形式にしてください。',
        unsafe_allow_html=True
    )

    input_col, search_button = st.columns([8, 2])

    with input_col:
        st.text_area("入力:", value="", placeholder="ここに入力...", key="first_user_input")

    with search_button:
        if st.button("検索実行"):
            query = st.session_state["first_user_input"]
            mode = st.session_state["search_mode"]
            engine = st.session_state["search_engine"]
            year_range = st.session_state["year_range"]
            num_papers = st.session_state["num_search_papers"]

            if mode == "キーワード検索":
                results = paper_service.fetch_papers_by_query(query, year_range, num_papers)
                state_manager.update_paper_results(results)

            elif mode == "AI検索 2":
                analysis = llm_service.analyze_user_paper(query)
                state_manager.update_user_input_analysis(analysis)
                ai_query = analysis.search_keywords[0].en
                results = paper_service.fetch_papers_by_query(ai_query, year_range, num_papers)
                state_manager.update_paper_results(results)

def render_search_info_selection_section():
    with st.expander("オプション設定"):
        search_num_col, year_col, search_engine_col = st.columns([1, 1, 1])

        with search_num_col:
            st.slider(
                "検索する論文数",
                1,
                50,
                st.session_state["num_search_papers"],
                key="num_search_papers",
            )
        with year_col:
            st.slider(
                "発行年の範囲",
                1970,
                2025,
                st.session_state["year_range"],
                key="year_range",
            )
        with search_engine_col:
            st.radio(
                "検索エンジン選択:",
                ("semantic scholar", "Google Scholar"),
                horizontal=True,
                key="search_engine",
            )


```

### File: streamlit_app/core/__init__.py

```python

```

### File: streamlit_app/core/data_models.py

```python
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

```

### File: streamlit_app/core/llm_service.py

```python
# core/llm_service.py

from core.data_models import PaperAnalysisResult, PaperField, Label
from api import ollama_api, lm_studio_api
from utils import config

def analyze_user_paper(input_text: str, api_type: str = "ollama") -> PaperAnalysisResult:
    prompt = config.experiment_message_without_paper + input_text
    
    if api_type == "ollama":
        data = ollama_api.get_structured_response_v2(config.OLLAMA_MODEL, prompt)
    elif api_type == "lm_studio":
        client = lm_studio_api.OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
        messages = [{"role": "user", "content": prompt}]
        data = lm_studio_api.get_structured_response(client, "my-model", messages)
    else:
        raise ValueError("Unsupported API type provided.")

    return PaperAnalysisResult(
        fields=[PaperField(name=f["name"], score=f["score"]) for f in data["fields"]],
        target=Label(**data["labels"]["target"]),
        title=data.get("title"),
        methods=[Label(**m) for m in data["labels"]["approaches"]["methods"]],
        factors=[Label(**f) for f in data["labels"]["approaches"]["factors"]],
        metrics=[Label(**m) for m in data["labels"]["approaches"]["metrics"]],
        search_keywords=[Label(**kw) for kw in data["labels"]["search_keywords"]]
    )

def analyze_searched_paper(input_text: str, api_type: str = "ollama") -> PaperAnalysisResult:
    prompt = config.experiment_message_without_paper + input_text
    
    if api_type == "ollama":
        data = ollama_api.get_structured_response_v2(config.OLLAMA_MODEL, prompt)
    elif api_type == "lm_studio":
        client = lm_studio_api.OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
        messages = [{"role": "user", "content": prompt}]
        data = lm_studio_api.get_structured_response(client, "my-model", messages)
    else:
        raise ValueError("Unsupported API type provided.")

    return PaperAnalysisResult(
        fields=[PaperField(name=f["name"], score=f["score"]) for f in data["fields"]],
        target=Label(**data["labels"]["target"]),
        title=data.get("title"),
        methods=[Label(**m) for m in data["labels"]["approaches"]["methods"]],
        factors=[Label(**f) for f in data["labels"]["approaches"]["factors"]],
        metrics=[Label(**m) for m in data["labels"]["approaches"]["metrics"]],
        search_keywords=[Label(**kw) for kw in data["labels"]["search_keywords"]]
    )

```

### File: streamlit_app/core/paper_service.py

```python
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

```

### File: streamlit_app/state/__init__.py

```python

```

### File: streamlit_app/state/state_manager.py

```python
# state/state_manager.py

import streamlit as st
from core.data_models import PaperResult, PaperAnalysisResult
from utils import config

def initialize_session_state():
    defaults = {
        "search_mode": "キーワード検索",
        "first_user_input": "",
        "papers": PaperResult(),
        "user_input_analysis": None,
        "paper_analysis": None,
        "num_search_papers": 10,
        "year_range": (2023, 2025),
        "search_engine": "semantic scholar",
        "selected_paper": [],
        "prev_selected_nodes": [],
        "chat_history": [{"role": "system", "content": config.system_prompt}],
        "initial_prompt_processed": True,
    }

    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

def reset_chat_history():
    st.session_state["chat_history"] = [{"role": "system", "content": config.system_prompt}]
    st.session_state["initial_prompt_processed"] = False

def update_selected_paper(selected_paper):
    st.session_state["selected_paper"] = selected_paper
    #st.session_state["initial_prompt_processed"] = False

def update_paper_results(papers: PaperResult):
    st.session_state["papers"] = papers

def update_user_input_analysis(analysis: PaperAnalysisResult):
    """
    analysis情報を
    user_input_analysis
    に保存
    """
    st.session_state["user_input_analysis"] = analysis

def update_user_results(analysis: PaperAnalysisResult):
    """
    analysis情報を
    paper_analysis
    に保存
    """
    st.session_state["paper_analysis"] = analysis

def update_search_settings(num_search_papers: int, year_range: tuple, search_engine: str):
    st.session_state["num_search_papers"] = num_search_papers
    st.session_state["year_range"] = year_range
    st.session_state["search_engine"] = search_engine

```

### File: streamlit_app/state/state_manager_back.py

```python
# state_manager.py
import streamlit as st
#from utils.paper_controller import PaperResult
from core.data_models import PaperResult
from utils.llm_controller import PaperAnalysisResult
from utils import config

def initialize_session_state():
    # 検索モードと入力値
    if "search_mode" not in st.session_state:
        st.session_state["search_mode"] = "キーワード検索"
    if "first_user_input" not in st.session_state:
        st.session_state["first_user_input"] = ""
    
    # 論文検索結果
    if "papers" not in st.session_state:
        st.session_state["papers"] = PaperResult()
    
    # ユーザー入力解析結果
    if "user_input_analysis" not in st.session_state:
        st.session_state["user_input_analysis"] = None

    # 検索に関するオプション
    if "num_search_papers" not in st.session_state:
        st.session_state["num_search_papers"] = 10
    if "year_range" not in st.session_state:
        st.session_state["year_range"] = (2023, 2025)
    if "search_engine" not in st.session_state:
        st.session_state["search_engine"] = "semantic scholar"

    # ネットワークで選択された論文
    if "selected_paper" not in st.session_state:
        st.session_state["selected_paper"] = []

    # 論文表示のための1つ前の論文保存用
    if "prev_selected_nodes" not in st.session_state:
        st.session_state["prev_selected_nodes"] = []

    if "chat_history" not in st.session_state:
        st.session_state["chat_history"] = [{"role": "system", "content": config.system_prompt}]
        st.session_state["initial_prompt_processed"] = True
```

