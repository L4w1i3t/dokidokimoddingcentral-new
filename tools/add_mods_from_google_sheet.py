#!/usr/bin/env python3
"""
Generate **mods.json** from responses exported as CSV from the Google Form.
Key fixes compared to the first draft:
  • keep yes/no flags (we no longer strip them in `clean_text`)
  • recognise android / demo entries directly from the title
  • convert YouTube links to **embed** format and mark them as `version = "video"`
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from typing import Dict, List, Any
from urllib.parse import urlparse, parse_qs

####################################################################################
# ─────────────────────────────── helpers ───────────────────────────────────────── #
####################################################################################

def clean_text(text: str | None) -> str:
    """Return the trimmed cell (do *not* erase literal *Yes.* / *No.* strings)."""
    return (text or "").strip()


def col(row: Dict[str, str], fragment: str) -> str:
    """Return the value whose header *contains* ``fragment`` (case‑insensitive)."""
    for k, v in row.items():
        if fragment.lower() in k.lower():
            return v
    return ""


def create_route_from_title(title: str) -> str:
    route = re.sub(r"[^\w\s-]", "", title.lower())
    return re.sub(r"[\s_-]+", "", route)


def determine_category(title: str, is_video: str, is_pre_feb_2024: str) -> str:
    is_video = clean_text(is_video).lower()
    is_pre_feb_2024 = clean_text(is_pre_feb_2024).lower()
    tl = title.lower()

    if is_video.startswith("yes"):
        return "videos"
    if "android" in tl or tl.endswith(".apk"):
        return "android"
    if "demo" in tl:
        return "demos"
    if is_pre_feb_2024.startswith("yes"):
        return "archive"
    return "standard"


def get_image_url_from_title(title: str) -> str:
    filename = re.sub(r"[^\w\s-]", "", title.lower())
    filename = re.sub(r"[\s_-]+", "", filename)
    return f"/assets/mod_prevs/{filename}.webp"  # default extension is fine


def extract_main_author(authors_str: str) -> str:
    return authors_str.split(",")[0].strip() if authors_str else ""


def youtube_to_embed(url: str) -> str:
    """Convert any YouTube *watch* / *youtu.be* link to the */embed/* form."""
    if not url:
        return url

    if "youtube.com/embed/" in url:
        return url  # already embed

    if "youtu.be" in url:
        video_id = urlparse(url).path.lstrip("/")
        return f"https://www.youtube.com/embed/{video_id}" if video_id else url

    if "youtube.com" in url and "watch" in url:
        q = parse_qs(urlparse(url).query)
        video_id = q.get("v", [""])[0]
        return f"https://www.youtube.com/embed/{video_id}" if video_id else url

    return url

####################################################################################
# ───────────────────────── main transformation ────────────────────────────────── #
####################################################################################

def process_csv_to_mods_json(csv_path: str | Path, out_path: str | Path) -> None:
    mods: Dict[str, List[Dict[str, Any]]] = {c: [] for c in ("standard", "archive", "android", "demos", "videos")}
    next_id = {"standard": 0, "archive": 1000, "android": 10000, "demos": 20000, "videos": 30000}

    with open(csv_path, encoding="utf-8") as f:
        for _ in range(4):  # skip form meta rows
            next(f)
        reader = csv.DictReader(f)
        for row in reader:
            title = clean_text(row.get("What is the title of your mod?"))
            if not title:
                continue  # blank response line

            category = determine_category(
                title,
                row.get("Is the modification video only?", ""),
                row.get("Was this modification originally created or published before the 19th of February, 2024?", ""),
            )

            submitter = clean_text(row.get("What username do you want to be listed as? (Submitter Name)"))
            description = clean_text(row.get("Please provide a description of your mod. It can be brief, or it can be as detailed as you want."))
            authors_raw = clean_text(col(row, "notable authors"))
            download_link = clean_text(row.get("Please provide a download link for your mod here. (Or submit a video link if the mod is in a video format.)"))
            archive_link = clean_text(row.get("ARCHIVE DOWNLOAD LINK"))

            final_link = download_link if category == "videos" else (archive_link or download_link)
            if category == "videos":
                final_link = youtube_to_embed(final_link)

            entry: Dict[str, Any] = {
                "id": next_id[category],
                "title": title,
                "author": extract_main_author(authors_raw),
                "imageUrl": get_image_url_from_title(title),
                "route": create_route_from_title(title),
                "submittedBy": submitter,
                "description": description,
                "links": [],
            }
            if final_link:
                entry["links"].append({
                    "version": "video" if category == "videos" else "standard",
                    "url": final_link,
                })

            mods[category].append(entry)
            next_id[category] += 1

    with open(out_path, "w", encoding="utf-8") as jf:
        json.dump(mods, jf, indent=2, ensure_ascii=False)

    print(f"✓ mods.json written to {out_path}")
    for cat, lst in mods.items():
        print(f"  {cat:8}: {len(lst)} mods")

####################################################################################
# ──────────────────────────────── cli ─────────────────────────────────────────── #
####################################################################################

def main():
    csv_path = Path(r"c:\Users\clmel\Desktop\Programming\LARGE SCALE PROJECTS\WEBSITES\Doki-Doki-Modding-Central\DDMC\tools\responses.csv")
    out_path = Path(r"c:\Users\clmel\Desktop\Programming\LARGE SCALE PROJECTS\WEBSITES\Doki-Doki-Modding-Central\DDMC\data\mods_exp.json")
    print("Processing CSV → mods.json …")
    process_csv_to_mods_json(csv_path, out_path)


if __name__ == "__main__":
    main()
