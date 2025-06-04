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
    model = "gemma3:12b"
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