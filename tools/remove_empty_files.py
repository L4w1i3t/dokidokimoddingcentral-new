import os
from pathlib import Path


def remove_empty_files(start_path: str | Path) -> None:
    """Recursively remove empty files starting from the root path."""
    start_path = Path(start_path).resolve()

    for root, dirs, files in os.walk(start_path):
        for file in files:
            file_path = Path(root) / file
            if file_path.is_file() and file_path.stat().st_size == 0:
                print(f"Removing empty file: {file_path}")
                file_path.unlink()


if __name__ == "__main__":
    # Specify the root directory
    project_root = Path(__file__).resolve().parent.parent
    remove_empty_files(project_root)
    print("Empty files removal completed.")
