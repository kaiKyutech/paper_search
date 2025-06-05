import math
from collections import defaultdict
from . import field_colors

def build_cy_elements_simple(papers: list) -> list:
    """
    Cytoscape用のノード・エッジ情報を生成するシンプルな実装。
    各論文は中心ノードから放射状に配置され、中心と各論文ノード間にエッジを生成します。
    
    papersには、各論文の情報が含まれる辞書のリストが与えられると仮定しています。
    例: {
            "title": "論文タイトル",
            "abstract": "論文概要",
            "url": "論文のURL",
            "paper_id": "一意のID"
         }
    """
    elements = []

    # 中心ノード（例として "your paper" と表示）
    center_node = {
        "data": {"id": "center", "label": "your paper"},
        "position": {"x": 0, "y": 0}
    }
    elements.append(center_node)
    
    num_papers = len(papers.papers)
    # 論文ノードを中心の周りに円形に配置
    radius = 100  # 中心からの距離（必要に応じて調整）
    angle_step = 2 * math.pi / num_papers if num_papers > 0 else 0

    for i, paper in enumerate(papers.papers,start=1):
        # 論文データから必要な情報を取得（paper_idがなければインデックスを利用）
        paper_id = paper.paper_id
        node_id = f"paper_{paper_id}"
        angle = i * angle_step
        x = (radius+i*10) * math.cos(angle)
        y = (radius+i*10) * math.sin(angle)
        
        node = {
            "data": {
                "id": node_id,
                "paper_id": paper_id,
                "label": paper.title,
                "title": paper.title,
                "abstract": paper.abstract,
                "url": paper.url,
                "relatedness": i,
            },
            "position": {"x": x, "y": y}
        }
        elements.append(node)
        
        # 中心ノードとこの論文ノードとの間にエッジを作成
        edge = {
            "data": {
                "id": f"edge_center_{node_id}",
                "source": "center",
                "target": node_id
            }
        }
        elements.append(edge)
    
    return elements


def build_cy_elements_by_field(papers, analysis_map):
    """Create Cytoscape elements grouped by field.

    Parameters
    ----------
    papers : PaperResult
        Search result papers.
    analysis_map : dict
        Mapping from paper_id to PaperAnalysisResult.
    """
    elements = []

    center_node = {"data": {"id": "center", "label": "your paper", "type": "center"}, "position": {"x": 0, "y": 0}}
    elements.append(center_node)

    # Group papers by first and second field
    field_groups = defaultdict(lambda: defaultdict(list))
    for paper in papers.papers:
        analysis = analysis_map.get(paper.paper_id)
        if not analysis or not analysis.fields:
            field_groups["Unknown"]["Unknown"].append(paper)
            continue
        first = analysis.fields[0].name
        second = analysis.fields[1].name if len(analysis.fields) > 1 else "Other"
        field_groups[first][second].append(paper)

    num_fields = len(field_groups)
    radius = 150
    angle_step = 2 * math.pi / num_fields if num_fields else 0
    for idx, (field, subdict) in enumerate(field_groups.items()):
        angle = idx * angle_step
        fx = radius * math.cos(angle)
        fy = radius * math.sin(angle)
        field_id = f"field_{idx}"
        field_node = {
            "data": {
                "id": field_id,
                "label": field,
                "type": "field",
                "color": field_colors.get_field_color(field),
            },
            "position": {"x": fx, "y": fy},
        }
        elements.append(field_node)
        elements.append({"data": {"id": f"edge_center_{field_id}", "source": "center", "target": field_id}})

        sub_radius = 80
        num_sub = len(subdict)
        sub_angle = 2 * math.pi / num_sub if num_sub else 0
        for sidx, (subfield, plist) in enumerate(subdict.items()):
            s_angle = sidx * sub_angle
            sfx = fx + sub_radius * math.cos(s_angle)
            sfy = fy + sub_radius * math.sin(s_angle)
            sub_id = f"{field_id}_{sidx}"
            sub_node = {
                "data": {
                    "id": sub_id,
                    "label": subfield,
                    "type": "subfield",
                    "color": field_colors.get_field_color(subfield),
                },
                "position": {"x": sfx, "y": sfy},
            }
            elements.append(sub_node)
            elements.append({"data": {"id": f"edge_{field_id}_{sub_id}", "source": field_id, "target": sub_id}})

            paper_radius = 50
            paper_angle = 2 * math.pi / len(plist) if plist else 0
            for j, paper in enumerate(plist):
                px = sfx + (paper_radius + j * 10) * math.cos(j * paper_angle)
                py = sfy + (paper_radius + j * 10) * math.sin(j * paper_angle)
                node_id = f"paper_{paper.paper_id}"
                node = {
                    "data": {
                        "id": node_id,
                        "paper_id": paper.paper_id,
                        "label": paper.title,
                        "title": paper.title,
                        "abstract": paper.abstract,
                        "url": paper.url,
                        "color": field_colors.get_field_color(subfield),
                        "type": "paper",
                        "relatedness": j + 1,
                    },
                    "position": {"x": px, "y": py},
                }
                elements.append(node)
                elements.append({"data": {"id": f"edge_{sub_id}_{node_id}", "source": sub_id, "target": node_id}})

    return elements
