# app.py
import streamlit as st
from ui import search_bar, result_summary, paper_network, chat_panel
from state.state_manager import initialize_session_state
from utils import config

st.set_page_config(layout="wide")

def main():
    # セッション状態の初期化（すべてのキーは state_manager.py で一元管理）
    initialize_session_state()

    st.title("論文検索＆可視化＆AI解説")

    # --- 1段目：検索エリア ---
    search_bar.render_search_section()
    search_bar.render_search_info_selection_section()

    # --- 2段目：結果のサマリー表示 ---
    with st.expander("詳細情報"):
        with st.container(height=500):
            col1, col2, col3 = st.columns([1, 2, 2])
            with col1:
                st.write("### 指定論文の分野配分")
                if st.session_state["user_input_analysis"]:
                    result_summary.render__paper_info_analysis(st.session_state["user_input_analysis"].fields)
            
            with col2:
                st.write("### 解析結果")
                st.caption('ユーザー論文 or 指定した論文の解析結果を出力します。', unsafe_allow_html=True)
                if st.session_state["user_input_analysis"]:
                    result_summary.render_paper_analysis_result(st.session_state["user_input_analysis"])
            
            with col3:
                st.write("### 論文情報")
                #if "selected_paper" in st.session_state:
                result_summary.render_info_paper(st.session_state["selected_paper"])
    
    # --- 3段目：論文ネットワーク＆テキストチャット ---
    with st.container():
        network_col, chat_col = st.columns(2)
        
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
                
                pass

            if st.session_state["papers"].papers:
                selected, element_dict, papers_dict = paper_network.render_network_sections(st.session_state["papers"])
                # 新しい選択結果が存在する場合のみ更新する
                if selected and "nodes" in selected and selected["nodes"]:
                    if selected["nodes"] != st.session_state["prev_selected_nodes"]:
                        st.session_state["prev_selected_nodes"] = selected["nodes"]
                        st.session_state["selected_paper"] = paper_network.get_selected_papers(selected, element_dict, papers_dict)
                        #print(st.session_state["selected_paper"])
                        st.rerun()
        
        with chat_col:
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

            # AI検索の場合のテキストチャット
            #if st.session_state["search_mode"] == "AI検索":
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