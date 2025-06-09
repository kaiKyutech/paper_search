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
):
    exclude_filenames = exclude_filenames or []
    exclude_extensions = exclude_extensions or []
    exclude_dirs = exclude_dirs or []
    base_dir = base_dir or root

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
        is_last = (i == len(filtered_items) - 1)
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

def get_language_from_extension(filename):
    ext = os.path.splitext(filename)[1].lower()
    language_map = {
        ".py": "python",
        ".js": "javascript",
        ".html": "html",
        ".css": "css",
        ".java": "java",
        ".c": "c",
        ".cpp": "cpp",
        ".h": "c",
        ".hpp": "cpp",
        ".json": "json",
        ".md": "markdown",
        ".sh": "bash",
        ".rb": "ruby",
        # 他の拡張子は必要に応じて追加してください
    }
    return language_map.get(ext, "")

def generate_markdown(
    root_dir: str,
    exclude_filenames=None,
    exclude_extensions=None,
    exclude_dirs=None,
    ignore_spec: "pathspec.PathSpec | None" = None,
):
    exclude_filenames = exclude_filenames or []
    exclude_extensions = exclude_extensions or []
    exclude_dirs = exclude_dirs or []

    markdown = "## プロジェクト構成\n\n"
    markdown += "```\n"
    tree = os.path.basename(os.path.abspath(root_dir)) + "/\n"
    tree += generate_tree(
        root_dir,
        exclude_filenames=exclude_filenames,
        exclude_extensions=exclude_extensions,
        exclude_dirs=exclude_dirs,
        ignore_spec=ignore_spec,
        base_dir=root_dir,
    )
    markdown += tree + "```\n\n"

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # 除外ディレクトリをその場で削除して潜らないようにする
        dirnames[:] = [
            d
            for d in dirnames
            if d not in exclude_dirs
            and not (ignore_spec and ignore_spec.match_file(os.path.relpath(os.path.join(dirpath, d), root_dir)))
        ]

        for filename in sorted(filenames):
            file_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(file_path, root_dir)
            ext = os.path.splitext(filename)[1].lower()
            if (
                filename in exclude_filenames
                or ext in exclude_extensions
                or (ignore_spec and ignore_spec.match_file(rel_path))
            ):
                continue
            language = get_language_from_extension(filename)
            markdown += f"### File: {rel_path}\n\n"
            markdown += f"```{language}\n" if language else "```\n"
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                markdown += content
            except Exception as e:
                markdown += f"Error reading file: {e}"
            markdown += "\n```\n\n"
    return markdown

if __name__ == "__main__":
    # スクリプトが配置されているディレクトリから1つ上をプロジェクトルートとする
    root_directory = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )

    exclude_files = [
        ".env",
        ".gitignore",
        ".dockerignore",
        "README.md",
        "project_export.md",
        "llm_api.py",
        "pulling_files.py",
        "project_tree.py",
    ]
    exclude_exts = [".pyc", ".ipynb", ".json"]
    exclude_dirs = [".git", "__pycache__"]

    ignore_spec = load_ignore_spec(root_directory)

    output_markdown = generate_markdown(
        root_directory,
        exclude_filenames=exclude_files,
        exclude_extensions=exclude_exts,
        exclude_dirs=exclude_dirs,
        ignore_spec=ignore_spec,
    )
    
    with open("project_export.md", "w", encoding="utf-8") as out_file:
        out_file.write(output_markdown)

    print("Markdown export complete: project_export.md")
    
