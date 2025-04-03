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
            num_search_papers = st.slider(
                "検索する論文数", 1, 50, st.session_state["num_search_papers"]
            )
        with year_col:
            year_range = st.slider(
                "発行年の範囲", 1970, 2025, st.session_state["year_range"]
            )
        with search_engine_col:
            search_engine = st.radio(
                "検索エンジン選択:",
                ("semantic scholar", "Google Scholar"),
                horizontal=True,
                key="search_engine"
            )

        if st.button("オプション設定更新"):
            state_manager.update_search_settings(num_search_papers, year_range, search_engine)
