def normalize_comments(raw_comments: list, platform: str):
    normalized = []

    for c in raw_comments:
        text = c.get("text") or ""
        author = c.get("author") or ""
        likes = c.get("likes") or c.get("score") or 0

        if not text.strip():
            continue

        normalized.append({
            "text": text,
            "author": author,
            "likes": int(str(likes).replace("k", "000").replace(".", "")) 
                     if isinstance(likes, str) else likes
        })

    return normalized
def normalize_comments(raw_comments: list, platform: str):
    normalized = []

    for c in raw_comments:
        text = c.get("text") or ""
        author = c.get("author") or ""
        likes = c.get("likes") or c.get("score") or 0

        if not text.strip():
            continue

        # Convert likes like "1.2k" to 1200
        if isinstance(likes, str):
            if "k" in likes.lower():
                likes = int(float(likes.lower().replace("k", "")) * 1000)
            elif likes.isdigit():
                likes = int(likes)
            else:
                likes = 0

        normalized.append({
            "text": text,
            "author": author,
            "likes": likes
        })

    return normalized
