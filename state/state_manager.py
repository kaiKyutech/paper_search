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
    st.session_state["initial_prompt_processed"] = False

def update_paper_results(papers: PaperResult):
    st.session_state["papers"] = papers

def update_user_input_analysis(analysis: PaperAnalysisResult):
    st.session_state["user_input_analysis"] = analysis

def update_search_settings(num_search_papers: int, year_range: tuple, search_engine: str):
    st.session_state["num_search_papers"] = num_search_papers
    st.session_state["year_range"] = year_range
    st.session_state["search_engine"] = search_engine
