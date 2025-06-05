import plotly.express as px

FIELD_LIST = [
    "情報科学", "ロボティクス", "電子工学", "機械工学", "材料工学",
    "化学", "物理学", "生物学", "医学", "薬学", "環境科学", "農学", "数学",
    "地球科学", "哲学", "心理学", "社会学", "教育学", "法学", "政治学",
    "経済学", "経営学", "言語学", "文学", "歴史学", "文化人類学", "メディア学",
    "芸術学", "土木工学", "交通工学", "建築工学",
]

# Comma-separated string of field names for prompt templates
FIELD_NAMES = ", ".join(FIELD_LIST)

# large palette to support many fields
_DEFAULT_COLORS = px.colors.qualitative.Dark24 + px.colors.qualitative.Light24

FIELD_COLOR_MAP = {
    name: _DEFAULT_COLORS[i % len(_DEFAULT_COLORS)]
    for i, name in enumerate(FIELD_LIST)
}


def get_field_color(name: str) -> str:
    """Return a color for the given field name.

    If the field is not predefined, a color is selected deterministically
    based on the hash of the name so the same field gets the same color
    across sessions.
    """
    if name not in FIELD_COLOR_MAP:
        index = abs(hash(name)) % len(_DEFAULT_COLORS)
        FIELD_COLOR_MAP[name] = _DEFAULT_COLORS[index]
    return FIELD_COLOR_MAP[name]
