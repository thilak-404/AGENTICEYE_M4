# analysis.py
from typing import Dict, Any
from ml_nlp import analyze_text_nlp
from pipelines.engagement import compute_engagement_metrics

def aggregate_signals(source_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Source_data is expected to contain keys: youtube (optional), reddit (optional), serp (optional)
    Return final analysis including trend probability, explanations, and combined stats.
    """
    results = {
        "engine": "ViralEdge-NLP-v2.0",
        "analyzed_at": None,
        "stats": {},
        "nlp": {},
        "engagement": {},
        "platform": {},
        "summary": {}
    }

    # combine comments text for NLP
    combined_texts = []
    total_comments = 0
    total_likes = 0
    if "youtube" in source_data and source_data["youtube"]:
        y = source_data["youtube"]
        total_comments += y.get("comments_count", 0)
        total_likes += sum([safe_like_count(c.get("likes", 0)) for c in y.get("comments", [])])
        combined_texts.extend([c.get("text", "") for c in y.get("comments", [])])

    if "reddit" in source_data and source_data["reddit"]:
        r = source_data["reddit"]
        total_comments += r.get("comments_count", 0)
        combined_texts.extend([c.get("text", "") for c in r.get("comments", [])])

    # NLP
    nlp = analyze_text_nlp("\n".join(combined_texts))
    results["nlp"] = nlp

    # engagement (simple)
    engagement = compute_engagement_metrics(source_data)
    results["engagement"] = engagement

    # platform info & simplistic trend scoring
    results["platform"] = source_data.get("meta", {})
    # naive trend score: weight youtube likes, reddit mentions, serp hits
    youtube_like_score = engagement.get("total_likes", 0)
    reddit_mentions = results["nlp"].get("topic_counts", {}).get("total_mentions", 0) or 0
    serp_hits = source_data.get("serp", {}).get("total_results", 0) or 0

    # Score normalisation (very simple)
    score = min(100, int((youtube_like_score / 1000) * 10 + (reddit_mentions * 0.5) + (serp_hits / 100000)))
    trend_type = "unknown"
    if score > 75:
        trend_type = "multi-platform (high)"
    elif score > 45:
        trend_type = "multi-platform (medium)"
    elif score > 20:
        trend_type = "single-platform (youtube)"
    else:
        trend_type = "not_trending"

    results["summary"] = {
        "trend_probability": score,
        "trend_type": trend_type,
        "trend_reason": f"likes={youtube_like_score}, reddit_mentions={reddit_mentions}, serp_hits={serp_hits}"
    }

    results["stats"] = {
        "comments_aggregated": total_comments
    }

    return results

def safe_like_count(v):
    try:
        return int(v)
    except Exception:
        # v might be "1.2k" form, convert:
        s = str(v).lower()
        if "k" in s:
            return int(float(s.replace("k", "")) * 1000)
        return 0

# Expose safe_like_count for analysis and engagement modules
