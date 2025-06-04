# utils/llm_controller.py
from api import lm_studio_api, ollama_api
from openai import OpenAI
from utils import config
from dataclasses import dataclass, field
from typing import List, Optional
import streamlit as st

@dataclass
class Field:
    name: str
    score: float

@dataclass
class Label:
    ja: str
    en: str

@dataclass
class PaperAnalysisResult:
    fields: List[Field]
    target: Label
    title: Optional[str] = None
    methods: Optional[List[Label]] = None
    factors: Optional[List[Label]] = None
    metrics: Optional[List[Label]] = None
    search_keywords: Optional[List[Label]] = None
    main_keywords: Optional[List[Label]] = None

def user_paper_lmstudio_controllar(input: str):
    client = OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
    MODEL = "my-model"
    messages = [{
        "role": "user",
        "content": config.experiment_message_without_paper + input
    }]
    data = lm_studio_api.get_structured_response(client, MODEL, messages)
    fields = [Field(f["name"], f["score"]) for f in data["fields"]]
    target = Label(data["labels"]["target"]["ja"], data["labels"]["target"]["en"])
    title = data["title"]
    methods = [Label(m["ja"], m["en"]) for m in data["labels"]["approaches"]["methods"]]
    factors = [Label(f["ja"], f["en"]) for f in data["labels"]["approaches"]["factors"]]
    metrics = [Label(m["ja"], m["en"]) for m in data["labels"]["approaches"]["metrics"]]
    search_keywords = [Label(m["ja"], m["en"]) for m in data["labels"]["search_keywords"]]
    return PaperAnalysisResult(fields, target, title=title, methods=methods, factors=factors, metrics=metrics, search_keywords=search_keywords)

def search_paper_lmstudio_controllar(input: str):
    client = OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
    MODEL = "my-model"
    messages = [{
        "role": "user",
        "content": config.llm_init_prompt_field_main_factor + input
    }]
    data = lm_studio_api.get_structured_response(client, MODEL, messages)
    fields = [Field(f["name"], f["score"]) for f in data["fields"]]
    target = Label(data["labels"]["target"]["ja"], data["labels"]["target"]["en"])
    main_keywords = [Label(m["ja"], m["en"]) for m in data["labels"]["main_keywords"]]
    return PaperAnalysisResult(fields, target, main_keywords=main_keywords)

def user_paper_ollama_controllar(input: str):
    #client = OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
    #MODEL = "gemma3:12b"
    MODEL = "gemma-textonly_v3:latest"
    #messages = [{
    #    "role": "user",
    #    "content": config.experiment_message_without_paper + input
    #}]
    messages = config.experiment_message_without_paper + input
    data = ollama_api.get_structured_response_v2(MODEL, messages)
    print(data)
    fields = [Field(f["name"], f["score"]) for f in data["fields"]]
    target = Label(data["labels"]["target"]["ja"], data["labels"]["target"]["en"])
    title = data["title"]
    methods = [Label(m["ja"], m["en"]) for m in data["labels"]["approaches"]["methods"]]
    factors = [Label(f["ja"], f["en"]) for f in data["labels"]["approaches"]["factors"]]
    metrics = [Label(m["ja"], m["en"]) for m in data["labels"]["approaches"]["metrics"]]
    search_keywords = [Label(m["ja"], m["en"]) for m in data["labels"]["search_keywords"]]
    return PaperAnalysisResult(fields, target, title=title, methods=methods, factors=factors, metrics=metrics, search_keywords=search_keywords)

def search_paper_ollama_controllar(input: str):
    #client = OpenAI(base_url="http://192.168.11.26:1234/v1", api_key="lm_studio")
    MODEL = "gemma3:12b"
    messages = [{
        "role": "user",
        "content": config.llm_init_prompt_field_main_factor + input
    }]
    data = ollama_api.get_structured_response(MODEL, messages)
    fields = [Field(f["name"], f["score"]) for f in data["fields"]]
    target = Label(data["labels"]["target"]["ja"], data["labels"]["target"]["en"])
    main_keywords = [Label(m["ja"], m["en"]) for m in data["labels"]["main_keywords"]]
    return PaperAnalysisResult(fields, target, main_keywords=main_keywords)



if __name__ == "__main__":
    text = """サンプルテキスト"""
    result = search_paper_lmstudio_controllar(text)
    print(result.fields)
    print(result.target)
    print(result.main_keywords)