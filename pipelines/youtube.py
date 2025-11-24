from typing import List, Dict, Any
from youtube_comment_downloader import YoutubeCommentDownloader
from utils.text_utils import extract_video_id, clean_text
import time

def fetch_youtube_comments(url: str, limit: int = 500) -> Dict[str, Any]:
    """
    Fetch comments using youtube-comment-downloader (no API key).
    Returns dict with video_url, comments_count, comments list.
    """
    video_id = extract_video_id(url)
    downloader = YoutubeCommentDownloader()
    comments = []
    # the downloader expects a video id or url
    # it's a blocking call, keep basic protections
    idx = 0
    for c in downloader.get_comments_from_url(url):
        if idx >= limit:
            break
        text = c.get("text", "")
        author = c.get("author", "")
        likes = int(c.get("likes", 0) or 0)
        time_str = c.get("time", "")
        comments.append({
            "author": author,
            "text": clean_text(text),
            "likes": likes,
            "time": time_str
        })
        idx += 1
    return {"video_url": url, "comments_count": len(comments), "comments": comments}
