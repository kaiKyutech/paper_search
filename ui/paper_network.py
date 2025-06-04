# ui/paper_network_and_basic_info.py
import streamlit as st
from utils import cytoscape_utils
from st_cytoscape import cytoscape

def render_network_sections(papers, details=False):
    elements = cytoscape_utils.build_cy_elements_simple(papers)
    style_sheet = [
        {
            "selector": "node",
            "style": {
                "label": "data(label)",
                "font-size": "12px",
                "color": "#333",
                "width": "30px",
                "height": "30px",
            }
        },
        {
            "selector": "edge",
            "style": {
                "width": 2,
                "line-color": "#ccc",
                "target-arrow-shape": "triangle",
                "target-arrow-color": "#ccc",
                "curve-style": "bezier",
            }
        },
        {
            "selector": "node:selected",
            "style": {
                "background-color": "#FF0000",
                "border-color": "#F00",
                "border-width": "2px",
            }
        },
    ]
    layout = {"name": "preset"}
    
    with st.container():
        selected = cytoscape(
            elements,
            style_sheet,
            height="700px",
            layout=layout,
            key="graph",
            selection_type="single",
            min_zoom=0.5,
            max_zoom=1
        )
    # ノード情報の高速検索用辞書（センター以外）
    element_dict = {str(f"{e['data']['id']}"): e for e in elements if e["data"]["id"] != "center"}
    # 論文情報を paper_id でマッピング（ここでは PaperFields の paperId と対応付け）
    papers_dict = {str(f"paper_{p.paper_id}"): p for p in papers.papers}
    
    return selected, element_dict, papers_dict

def get_selected_papers(selected, element_dict, papers_dict):
    """
    選択されたノードから論文情報のリストを作成する関数
    """
    selected_papers = []
    if selected and "nodes" in selected:
        for node_id in selected["nodes"]:
            if node_id == "center":
                continue
            node_papers = papers_dict.get(node_id)
            node_elem = element_dict.get(node_id)
            if not node_papers:
                print("why")
                continue
            selected_papers.append({
                "title": node_papers.title,
                "abstract": node_papers.abstract,
                "url": node_papers.url,
                "paperId": node_papers.paper_id,
                "relatedness": node_elem["data"]["relatedness"],
            #    "relatedness": getattr(paper, "relatedness", 0),  # 存在しない場合は0とする例
            #    "university": getattr(paper, "university", "不明"),
            #    "url": paper.url,
            #    "abstract": paper.abstract,
            })
    return selected_papers