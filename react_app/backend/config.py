"""バックエンド共通設定"""
import os
from dotenv import load_dotenv

load_dotenv()


def running_in_docker() -> bool:
    """Docker 内で実行されているか判定"""
    return os.path.exists("/.dockerenv")


# Ollama 関連設定
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma-textonly_v3:latest")

default_ollama_url = (
    "http://host.docker.internal:11435" if running_in_docker() else "http://127.0.0.1:11435"
)
OLLAMA_API_BASE_URL = os.environ.get("OLLAMA_API_BASE_URL", default_ollama_url)


def get_ollama_url(path: str) -> str:
    """Ollama API 用の完全な URL を生成"""
    return f"{OLLAMA_API_BASE_URL}{path}"


OLLAMA_CHAT_URL = get_ollama_url("/api/chat")
"""チャット API のURL"""
