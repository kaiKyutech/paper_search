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