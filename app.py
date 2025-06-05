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
        network_col, detail_col = st.columns([3, 2])

        with network_col:
            st.write("### 論文ネットワーク")
            st.write("---")
            st.caption(
                '<span style="color:coral; font-weight:bold;">検索された論文の詳細な解析を行う場合は下のボタンを押してください。</span>',
                unsafe_allow_html=True
            )
            st.caption(
                '<span style="color:coral; font-weight:bold;">＊処理に時間がかかります</span>',
                unsafe_allow_html=True
            )
            if st.session_state["papers"].papers and st.button("解析開始",key="init_2"):
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
                selected, element_dict, papers_dict = paper_network.render_network_sections(st.session_state["papers"])
                # 新しい選択結果が存在する場合のみ更新する
                if selected and "nodes" in selected and selected["nodes"]:
                    if selected["nodes"] != st.session_state["prev_selected_nodes"]:
                        st.session_state["prev_selected_nodes"] = selected["nodes"]
                        st.session_state["selected_paper"] = paper_network.get_selected_papers(selected, element_dict, papers_dict)

                        # 選択された論文の解析。session_state["paper_analysis"]に保存
                        title  = st.session_state["selected_paper"][0]["title"]
                        abstract = st.session_state["selected_paper"][0]["abstract"]
                        paper_id = st.session_state["selected_paper"][0]["paper_id"]
                        key = f"paper_analysis_{paper_id}"

                        if key not in st.session_state:
                            # analyze_searched_paper は (タイトル, アブストラクト) をカンマ区切りで渡す想定
                            analysis = llm_service.analyze_searched_paper(f"title: {title}, abstract: {abstract}")
                            st.session_state[key] = analysis

                        st.rerun()

        with detail_col:
            st.write("### 詳細情報")
            with st.container(height=700):
                # 分野配分
                st.write("#### 分野配分")
                selected_list = st.session_state.get("selected_paper", [])
                if selected_list:
                    paper_id = selected_list[0]["paper_id"]
                    cache_key = f"paper_analysis_{paper_id}"
                    if cache_key in st.session_state:
                        result_summary.render__paper_info_analysis(
                            st.session_state[cache_key].fields
                        )
                    else:
                        st.info("解析中です…（完了までお待ちください）")
                elif st.session_state.get("user_input_analysis"):
                    result_summary.render__paper_info_analysis(
                        st.session_state["user_input_analysis"].fields
                    )
                else:
                    st.info("ユーザー入力解析または論文ネットワークで論文を選択してください。")

                st.write("#### 解析結果")
                st.caption(
                    'ユーザー論文または選択論文の解析結果を表示します。', unsafe_allow_html=True
                )
                if selected_list:
                    paper_id = selected_list[0]["paper_id"]
                    cache_key = f"paper_analysis_{paper_id}"
                    if cache_key in st.session_state:
                        result_summary.render_paper_analysis_result(
                            st.session_state[cache_key]
                        )
                    else:
                        st.info("解析中です…（完了までお待ちください）")
                elif st.session_state.get("user_input_analysis"):
                    result_summary.render_paper_analysis_result(
                        st.session_state["user_input_analysis"]
                    )
                else:
                    st.info("まずは検索→論文選択、またはAI検索を実行してください。")

                st.write("#### 論文情報")
                result_summary.render_info_paper(st.session_state.get("selected_paper", []))

    # --- 3段目：論文解説AI ---
    with st.container():
        st.write("### 論文解説AI")
        st.write("---")
        st.caption(
            '<span style="color:coral; font-weight:bold;">＊新たに選択した論文に関するセッションを始めたい場合は下のボタンを押してください。履歴削除と兼ねています。</span>',
            unsafe_allow_html=True
        )
        st.caption(
            '<span style="color:coral; font-weight:bold;">＊他のUIの操作は文章生成が完了してから行ってください。（生成中に触ってしまうと途中で止まってしまいます。）</span>',
            unsafe_allow_html=True
        )
        if st.button("選択された論文の解説 or チャット履歴削除", key="init"):
            st.session_state["chat_history"] = [{"role": "system", "content": config.system_prompt}]
            st.session_state["initial_prompt_processed"] = False

        # テキストチャットなどの処理をここに記述
        chat_container = st.container(height=600)
        history_placeholder = chat_container.empty()
        stream_placeholder = chat_container.empty()

        history_placeholder.markdown(
            f"{chat_panel.render_history(st.session_state['chat_history'], config.css_text_user, config.css_text_assistant)}</div>",
            unsafe_allow_html=True
        )

        # 初期入力
        if not st.session_state["initial_prompt_processed"] and "selected_paper" in st.session_state:
            chat_panel.render_stream(stream_placeholder, selected_paper=st.session_state["selected_paper"][0])
            st.session_state["initial_prompt_processed"] = True
            history_placeholder.markdown(
                f"{chat_panel.render_history(st.session_state['chat_history'], config.css_text_user, config.css_text_assistant)}</div>",
                unsafe_allow_html=True
            )
        st.caption(
            '<span style="color:coral">＊自動スクロール機能はありません。メッセージ送信後は下にスクロールしてください。</span>',
            unsafe_allow_html=True,
        )

        with st.form(key="chat_form"):
            user_message = st.text_area("あなたのメッセージ", key="chat_input")
            submitted = st.form_submit_button("送信")

        if submitted and user_message.strip():
            st.session_state["chat_history"].append({
                "role": "user",
                "content": user_message
            })
            history_placeholder.markdown(
                f"{chat_panel.render_history(st.session_state['chat_history'], config.css_text_user, config.css_text_assistant)}</div>",
                unsafe_allow_html=True
            )
            api_messages = [
                {"role": "user" if msg["role"] == "hidden_user" else msg["role"], "content": msg["content"]}
                for msg in st.session_state["chat_history"]
            ]
            chat_panel.update_chat_history_with_response(api_messages, stream_placeholder)
            history_placeholder.markdown(
                f"{chat_panel.render_history(st.session_state['chat_history'], config.css_text_user, config.css_text_assistant)}</div>",
                unsafe_allow_html=True
            )
        st.markdown('</div>', unsafe_allow_html=True)
        
            
        

if __name__ == "__main__":
    main() 