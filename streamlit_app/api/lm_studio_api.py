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
