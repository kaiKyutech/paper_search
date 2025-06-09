import os


def generate_tree(root, prefix="", exclude_filenames=None, exclude_extensions=None, exclude_dirs=None):
    """指定ディレクトリ以下のツリー構造を文字列で返す"""
    exclude_filenames = exclude_filenames or []
    exclude_extensions = exclude_extensions or []
    exclude_dirs = exclude_dirs or []

    tree = ""
    items = sorted(os.listdir(root))
    filtered_items = []
    for item in items:
        item_path = os.path.join(root, item)
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
            )
    return tree


if __name__ == "__main__":
    # スクリプトがあるディレクトリの1つ上をプロジェクトルートとみなす
    root_directory = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    exclude_files = [
        ".env",
        ".gitignore",
        "project_export.md",
    ]
    exclude_exts = [".pyc", ".ipynb", ".json"]
    exclude_dirs = [".git", "__pycache__"]

    tree = os.path.basename(root_directory) + "/\n" + generate_tree(
        root_directory,
        exclude_filenames=exclude_files,
        exclude_extensions=exclude_exts,
        exclude_dirs=exclude_dirs,
    )
    print(tree)
