import httpx
from typing import Dict, Any, List
from utils.text_utils import clean_text
import urllib.parse

HEADERS = {"User-Agent": "ViralEdgeBot/1.0 (by you)"}

def fetch_reddit_post(url: str) -> Dict[str, Any]:
    """
    Fetch a reddit post via its JSON endpoint (public).
    Example: https://www.reddit.com/r/sub/comments/id.json
    """
    # normalize: append .json if needed
    if not url.endswith(".json"):
        # remove query to avoid issues
        parsed = urllib.parse.urlsplit(url)
        path = parsed.path
        json_url = f"https://www.reddit.com{path}.json"
    else:
        json_url = url
    with httpx.Client(timeout=20.0, headers=HEADERS) as client:
        r = client.get(json_url)
        r.raise_for_status()
        data = r.json()
    # Reddit returns list: [post, comments]
    post = data[0]["data"]["children"][0]["data"]
    comments_raw = data[1]["data"]["children"]
    comments = []
    def extract(comments_list):
        out = []
        for c in comments_list:
            kind = c.get("kind")
            if kind != "t1":
                continue
            d = c.get("data", {})
            out.append({
                "author": d.get("author"),
                "text": clean_text(d.get("body", "")),
                "score": d.get("score", 0)
            })
            # replies
            if d.get("replies"):
                try:
                    replies = d["replies"]["data"]["children"]
                    out.extend(extract(replies))
                except Exception:
                    pass
        return out
    comments = extract(comments_raw)
    return {
        "url": url,
        "title": post.get("title"),
        "author": post.get("author"),
        "content": clean_text(post.get("selftext", "")),
        "comments_count": len(comments),
        "comments": comments
    }

def reddit_search(query: str, limit: int = 25) -> List[Dict[str, Any]]:
    """
    Very simple Reddit search via the public search endpoint.
    """
    url = "https://www.reddit.com/search.json"
    params = {"q": query, "limit": limit, "sort": "relevance", "t": "week"}
    with httpx.Client(timeout=15.0, headers=HEADERS) as client:
        r = client.get(url, params=params)
        r.raise_for_status()
        data = r.json()
    results = []
    for c in data.get("data", {}).get("children", []):
        d = c.get("data", {})
        results.append({
            "title": d.get("title"),
            "subreddit": d.get("subreddit"),
            "ups": d.get("ups"),
            "url": "https://www.reddit.com" + d.get("permalink", "")
        })
    return results
