import os

def generate_tree(root, prefix="", exclude_filenames=None, exclude_extensions=None, exclude_dirs=None):
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
        is_last = (i == len(filtered_items) - 1)
        connector = "└── " if is_last else "├── "
        tree += prefix + connector + item + "\n"
        if os.path.isdir(item_path):
            extension_prefix = "    " if is_last else "│   "
            tree += generate_tree(item_path, prefix + extension_prefix,
                                  exclude_filenames, exclude_extensions, exclude_dirs)
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

def generate_markdown(root_dir, exclude_filenames=None, exclude_extensions=None, exclude_dirs=None):
    exclude_filenames = exclude_filenames or []
    exclude_extensions = exclude_extensions or []
    exclude_dirs = exclude_dirs or []

    markdown = "## プロジェクト構成\n\n"
    markdown += "```\n"
    tree = os.path.basename(os.path.abspath(root_dir)) + "/\n"
    tree += generate_tree(root_dir, exclude_filenames=exclude_filenames,
                          exclude_extensions=exclude_extensions,
                          exclude_dirs=exclude_dirs)
    markdown += tree + "```\n\n"

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # 除外ディレクトリをその場で削除して潜らないようにする
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]

        for filename in sorted(filenames):
            ext = os.path.splitext(filename)[1].lower()
            if filename in exclude_filenames or ext in exclude_extensions:
                continue
            file_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(file_path, root_dir)
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
    root_directory = "."

    exclude_files = [".env", ".gitignore", "README.md", "project_export.md", "llm_api.py", "pulling_files.py"]
    exclude_exts = [".pyc", ".ipynb", ".json"]
    exclude_dirs = [".git", "__pycache__"]

    output_markdown = generate_markdown(
        root_directory,
        exclude_filenames=exclude_files,
        exclude_extensions=exclude_exts,
        exclude_dirs=exclude_dirs
    )
    
    with open("project_export.md", "w", encoding="utf-8") as out_file:
        out_file.write(output_markdown)

    print("Markdown export complete: project_export.md")
    
