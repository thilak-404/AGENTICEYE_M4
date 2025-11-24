import re
from typing import List

def extract_video_id(youtube_url: str) -> str:
    """
    Extracts the YouTube video id from possible url forms.
    """
    # common formats
    patterns = [
        r"(?:v=|\/)([0-9A-Za-z_-]{11}).*",
        r"youtu\.be\/([0-9A-Za-z_-]{11})"
    ]
    for p in patterns:
        m = re.search(p, youtube_url)
        if m:
            return m.group(1)
    # fallback: keep original string
    return youtube_url

def clean_text(text: str) -> str:
    text = text or ""
    text = re.sub(r"\s+", " ", text).strip()
    return text

def get_query_terms_from_topics(topics: List[str]) -> List[str]:
    # simple safe cleaning
    return [re.sub(r"[^\w\s-]", "", t).strip() for t in topics if t and len(t) > 1]
