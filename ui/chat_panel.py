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
    MODEL = "gemma3:12b"
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

        