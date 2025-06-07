# core/llm_service.py

from core.data_models import PaperAnalysisResult, PaperField, Label
from api import ollama_api, lm_studio_api
from utils import config

def analyze_user_paper(input_text: str, api_type: str = "ollama") -> PaperAnalysisResult:
    prompt = config.experiment_message_without_paper + input_text
    
    if api_type == "ollama":
        data = ollama_api.get_structured_response_v2(config.OLLAMA_MODEL, prompt)
    elif api_type == "lm_studio":
        client = lm_studio_api.OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
        messages = [{"role": "user", "content": prompt}]
        data = lm_studio_api.get_structured_response(client, "my-model", messages)
    else:
        raise ValueError("Unsupported API type provided.")

    return PaperAnalysisResult(
        fields=[PaperField(name=f["name"], score=f["score"]) for f in data["fields"]],
        target=Label(**data["labels"]["target"]),
        title=data.get("title"),
        methods=[Label(**m) for m in data["labels"]["approaches"]["methods"]],
        factors=[Label(**f) for f in data["labels"]["approaches"]["factors"]],
        metrics=[Label(**m) for m in data["labels"]["approaches"]["metrics"]],
        search_keywords=[Label(**kw) for kw in data["labels"]["search_keywords"]]
    )

def analyze_searched_paper(input_text: str, api_type: str = "ollama") -> PaperAnalysisResult:
    prompt = config.experiment_message_without_paper + input_text
    
    if api_type == "ollama":
        data = ollama_api.get_structured_response_v2(config.OLLAMA_MODEL, prompt)
    elif api_type == "lm_studio":
        client = lm_studio_api.OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
        messages = [{"role": "user", "content": prompt}]
        data = lm_studio_api.get_structured_response(client, "my-model", messages)
    else:
        raise ValueError("Unsupported API type provided.")

    return PaperAnalysisResult(
        fields=[PaperField(name=f["name"], score=f["score"]) for f in data["fields"]],
        target=Label(**data["labels"]["target"]),
        title=data.get("title"),
        methods=[Label(**m) for m in data["labels"]["approaches"]["methods"]],
        factors=[Label(**f) for f in data["labels"]["approaches"]["factors"]],
        metrics=[Label(**m) for m in data["labels"]["approaches"]["metrics"]],
        search_keywords=[Label(**kw) for kw in data["labels"]["search_keywords"]]
    )
