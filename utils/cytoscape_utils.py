import math

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

# テスト用のサンプルデータ（与えられた例）
papers = [
    {
        "title": "A Data Efficient Vision Transformer for Robust Human Activity Recognition from the Spectrograms of Wearable Sensor Data",
        "abstract": ("This study introduces the Data Efficient Separable Transformer (DeSepTr) architecture, "
                     "a novel framework for Human Activity Recognition (HAR) that utilizes a light-weight computer vision model "
                     "to train a Vision Transformer (ViT) on spectrograms generated from wearable sensor data. "
                     "The proposed model achieves strong results on several HAR tasks, including surface condition recognition "
                     "and activity recognition. Compared to the ResNet-18 model, DeSepTr outperforms by 5.9% on out-of-distribution "
                     "test data accuracy for surface condition recognition. The framework enables ViTs to learn from limited labeled "
                     "training data and generalize to data from participants outside of the training cohort, potentially leading to "
                     "the development of activity recognition models that are robust to the wider population. The results suggest that "
                     "the DeSepTr architecture can overcome limitations related to the heterogeneity of individuals’ behavior patterns "
                     "and the weak inductive bias of transformer algorithms."),
        "url": "https://www.semanticscholar.org/paper/4394e581e2fa1685072ebe9e27a026f8f6191c24",
        "paper_id": "4394e581e2fa1685072ebe9e27a026f8f6191c24"
    }
]

if __name__ == "__main__":
    elements = build_cy_elements_simple(papers)
    # 作成された要素を確認（デバッグ用）
    from pprint import pprint
    pprint(elements)