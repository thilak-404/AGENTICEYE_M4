# pipelines/youtube.py
from youtube_comment_downloader import YoutubeCommentDownloader
from ..utils.text_utils import extract_video_id, clean_text
import time

def parse_count(value):
    if isinstance(value, int):
        return value
    if not value:
        return 0
    value = str(value).lower().strip()
    if 'k' in value:
        return int(float(value.replace('k', '')) * 1000)
    if 'm' in value:
        return int(float(value.replace('m', '')) * 1000000)
    try:
        return int(value)
    except:
        return 0

def fetch_youtube_comments(url: str, limit: int = 500):
    video_id = extract_video_id(url)
    if not video_id:
        return {"error": "Invalid YouTube URL", "video_url": url}

    downloader = YoutubeCommentDownloader()
    comments = []
    try:
        for comment in downloader.get_comments_from_url(url, sleep=0.3):
            if len(comments) >= limit:
                break
            text = clean_text(comment.get("text", ""))
            if not text:
                continue
            comments.append({
                "author": comment.get("author", "Unknown"),
                "text": text,
                "likes": parse_count(comment.get("votes", 0)),
                "time": comment.get("time", "")
            })
    except Exception as e:
        return {"error": str(e)}

    return {
        "video_url": url,
        "comments_count": len(comments),
        "comments": comments
    }