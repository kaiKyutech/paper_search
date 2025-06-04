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