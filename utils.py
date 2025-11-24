# utils.py
import re
from urllib.parse import urlparse, parse_qs

def extract_youtube_id(url: str) -> str | None:
    """
    Extract YouTube video id from a variety of URL forms.
    """
    if not url:
        return None
    # direct id?
    if re.fullmatch(r"^[\w-]{11}$", url):
        return url
    parsed = urlparse(url)
    if parsed.hostname in ("youtu.be", "www.youtu.be"):
        return parsed.path.lstrip("/")
    if parsed.hostname in ("youtube.com", "www.youtube.com", "m.youtube.com"):
        qs = parse_qs(parsed.query)
        if "v" in qs:
            return qs["v"][0]
        # /embed/ID
        m = re.search(r"/embed/([-\w]{11})", parsed.path)
        if m:
            return m.group(1)
    return None

def normalize_query(q: str) -> str:
    return " ".join(q.split()).strip().lower()

def safe_int(val, default=0):
    try:
        return int(val)
    except Exception:
        return default
