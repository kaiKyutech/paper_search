import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parents[1] / 'react_app' / 'backend'
sys.path.append(str(backend_path))

import config


def test_running_in_docker():
    assert isinstance(config.running_in_docker(), bool)


def test_get_ollama_url():
    url = config.get_ollama_url('/test')
    assert url.endswith('/test')
