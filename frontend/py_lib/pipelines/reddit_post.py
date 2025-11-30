# pipelines/reddit.py
import httpx
from utils.headers import get_headers


# ---------- Extract full comment tree ----------
def extract_comments(comment_list, out):
    for c in comment_list:
        if c.get("kind") == "t1":  # A real comment
            data = c.get("data", {})

            out.append({
                "author": data.get("author") or "unknown",
                "text": data.get("body") or "",
                "score": data.get("score") or 0,
            })

            # Recursive replies
            replies = data.get("replies")
            if replies and isinstance(replies, dict):
                nested = replies.get("data", {}).get("children", [])
                extract_comments(nested, out)

        elif c.get("kind") == "more":
            # "more" nodes contain extra comment IDs we cannot fetch without OAuth
            continue


# ---------- Fetch full Reddit post + comments ----------
def get_reddit_post(url: str):
    try:
        # Always convert into `.json` endpoint
        base = url.split("?")[0].rstrip("/")
        json_url = base + "/.json"

        response = httpx.get(json_url, headers=get_headers(), timeout=30)
        data = response.json()

        # Post details
        post_data = data[0]["data"]["children"][0]["data"]

        # Comment tree
        comment_tree = data[1]["data"]["children"]

        all_comments = []
        extract_comments(comment_tree, all_comments)

        return {
            "url": base,
            "title": post_data.get("title"),
            "author": post_data.get("author"),
            "content": post_data.get("selftext") or "",
            "comments_count": len(all_comments),
            "comments": all_comments
        }

    except Exception as e:
        return {"error": f"reddit_parse_failed: {str(e)}"}
