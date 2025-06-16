# summarize関数のみの簡潔版
@app.post("/summarize", response_model=SummaryResult)
async def summarize_paper(request: SummaryRequest):
    """論文を要約するエンドポイント（簡潔版）"""
    print(f"要約リクエスト受信: {request.title}")
    
    try:
        # 簡潔要約
        simple_summary_prompt = f"""{request.title}
{request.abstract}

上記論文を2-3文で簡潔に要約してください。"""
        
        # 構造化要約
        structured_summary_prompt = f"""論文: {request.title}
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

例: 
- keywords: ["BERT", "感情分析", "自然言語処理", "Twitter"]
- what_they_did: "BERTを使ってTwitterデータの感情分析モデルを開発した"

keywordsは「キーワード1」ではなく具体的な用語で。"""
        
        # 並行して両方の要約を実行
        async def get_simple_summary():
            payload = {
                "model": OLLAMA_MODEL,
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
                "model": OLLAMA_MODEL,
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