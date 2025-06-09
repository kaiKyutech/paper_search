import os
from pathlib import Path

import pathspec


def load_ignore_spec(root_dir: str) -> "pathspec.PathSpec":
    """Collect patterns from .gitignore and .dockerignore files."""
    patterns = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for name in (".gitignore", ".dockerignore"):
            ignore_path = os.path.join(dirpath, name)
            if os.path.isfile(ignore_path):
                prefix = os.path.relpath(dirpath, root_dir)
                with open(ignore_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#"):
                            continue
                        # .gitignore 内のパスはそのファイルが存在するディレクトリを基点とする
                        if prefix != ".":
                            line = os.path.join(prefix, line.lstrip("/"))
                        patterns.append(line)

    return pathspec.PathSpec.from_lines("gitwildmatch", patterns)


def generate_tree(
    root: str,
    prefix: str = "",
    exclude_filenames=None,
    exclude_extensions=None,
    exclude_dirs=None,
    ignore_spec: "pathspec.PathSpec | None" = None,
    base_dir: str | None = None,
) -> str:
    """指定ディレクトリ以下のツリー構造を文字列で返す"""
    base_dir = base_dir or root
    exclude_filenames = exclude_filenames or []
    exclude_extensions = exclude_extensions or []
    exclude_dirs = exclude_dirs or []

    tree = ""
    items = sorted(os.listdir(root))
    filtered_items = []
    for item in items:
        item_path = os.path.join(root, item)
        rel_item_path = os.path.relpath(item_path, base_dir)
        if ignore_spec and ignore_spec.match_file(rel_item_path):
            continue
        if item in exclude_dirs and os.path.isdir(item_path):
            continue
        if os.path.isfile(item_path):
            ext = os.path.splitext(item)[1].lower()
            if item in exclude_filenames or ext in exclude_extensions:
                continue
        filtered_items.append(item)

    for i, item in enumerate(filtered_items):
        item_path = os.path.join(root, item)
        is_last = i == len(filtered_items) - 1
        connector = "└── " if is_last else "├── "
        tree += prefix + connector + item + "\n"
        if os.path.isdir(item_path):
            extension_prefix = "    " if is_last else "│   "
            tree += generate_tree(
                item_path,
                prefix + extension_prefix,
                exclude_filenames,
                exclude_extensions,
                exclude_dirs,
                ignore_spec,
                base_dir,
            )
    return tree


if __name__ == "__main__":
    # スクリプトがあるディレクトリの1つ上をプロジェクトルートとみなす
    root_directory = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    ignore_spec = load_ignore_spec(root_directory)

    exclude_files = [
        ".env",
        ".gitignore",
        ".dockerignore",
        "project_export.md",
    ]
    exclude_exts = [".pyc", ".ipynb", ".json"]
    exclude_dirs = [".git", "__pycache__"]

    tree = os.path.basename(root_directory) + "/\n" + generate_tree(
        root_directory,
        exclude_filenames=exclude_files,
        exclude_extensions=exclude_exts,
        exclude_dirs=exclude_dirs,
        ignore_spec=ignore_spec,
        base_dir=root_directory,
    )
    print(tree)
