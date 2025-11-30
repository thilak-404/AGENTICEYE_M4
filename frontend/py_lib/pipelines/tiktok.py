# pipelines/tiktok.py
import requests
import random

def get_tiktok_comments(video_url: str):
    try:
        video_id = video_url.split("video/")[1].split("?")[0]
    except:
        return {"error": "Invalid TikTok URL"}

    # Working endpoint Nov 2025
    api_url = f"https://www.tiktok.com/api/comment/list/?aweme_id={video_id}&count=50"
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": "https://www.tiktok.com/",
    }

    try:
        r = requests.get(api_url, headers=headers, timeout=15)
        if r.status_code != 200:
            raise
        data = r.json()
        comments = []
        for c in data.get("comments", [])[:50]:
            comments.append({
                "text": c.get("text", ""),
                "author": c.get("user", {}).get("unique_id", "unknown"),
                "likes": c.get("digg_count", 0),
                "time": c.get("create_time", "")
            })
        return {"video_url": video_url, "comments": comments, "total": len(comments)}
    except:
        return {"error": "TikTok blocked request — use VPN or try later"}