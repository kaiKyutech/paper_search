# ui/result_summary.py
import streamlit as st
import plotly.express as px
import pandas as pd

def render__paper_info_analysis(fields):
    if not fields:
        st.warning("データがありません。")
        return

    total_score = sum(field.score for field in fields)
    data = [
        {"name": field.name, "score": field.score, "percentage": 100 * field.score / total_score}
        for field in fields
    ]
    df = pd.DataFrame(data).copy().sort_values("percentage", ascending=False)
    sorted_names = df["name"].tolist()

    fig = px.pie(
        df,
        names="name",
        values="percentage",
        title="各分野の割合（多い順・時計回り）",
        category_orders={"name": sorted_names}
    )
    fig.update_traces(direction="clockwise")
    st.plotly_chart(fig, use_container_width=True)

def render_paper_analysis_result(result):
    data = {}
    if result.title:
        data["タイトル"] = result.title
    if result.fields:
        data["分野"] = ", ".join([f"{field.name} ({field.score})" for field in result.fields])
    if result.target:
        data["対象"] = result.target.ja
    if result.methods:
        data["手法"] = ", ".join([label.ja for label in result.methods])
    if result.factors:
        data["要因"] = ", ".join([label.ja for label in result.factors])
    if result.metrics:
        data["指標"] = ", ".join([label.ja for label in result.metrics])
    if result.search_keywords:
        data["検索キーワード"] = ", ".join([label.ja for label in result.search_keywords])
    if result.main_keywords:
        data["主要キーワード"] = ", ".join([label.ja for label in result.main_keywords])
    
    df = pd.DataFrame.from_dict(data, orient="index", columns=["内容"])
    st.table(df)

def render_info_paper(papers):
    for paper in papers:
        st.write(f"タイトル: {paper['title']}")
        st.write(f"関連順位: {paper.get('relatedness', 0)} 位")
        st.write(f"URL: {paper['url']}")
        st.write(f"アブストラクト：\n {paper['abstract']}")
        st.write("---")