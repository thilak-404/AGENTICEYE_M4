# utils/text_utils.py
import re

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"http\S+|@\w+|#\w+", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|\/)([0-9A-Za-z_-]{11})",
        r"youtu\.be\/([0-9A-Za-z_-]{11})",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return ""