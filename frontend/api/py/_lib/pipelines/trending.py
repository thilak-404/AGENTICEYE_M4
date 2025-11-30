from typing import Dict, Any, List
from utils.nlp import top_topics, extract_questions, overall_sentiment_summary
from utils.sentiment_utils import analyze_sentiment
from pipelines.reddit import reddit_search
from pipelines.google_trends import trends_for_terms
import datetime
import asyncio
from config import CONFIG


def compute_engagement_stats(comments: List[Dict[str,Any]]) -> Dict[str,Any]:
    total_likes = sum(c.get("likes", 0) for c in comments)
    avg_likes = (total_likes / len(comments)) if comments else 0
    top_comments = sorted(comments, key=lambda c: c.get("likes", 0), reverse=True)[:5]
    return {"total_likes": total_likes, "avg_likes": avg_likes, "top_comments": top_comments}

async def analyze_all(video_url: str, comments_payload: Dict[str,Any]) -> Dict[str,Any]:
    # comments_payload is the result from fetch_youtube_comments
    comments = comments_payload.get("comments", [])
    # run sentiment analysis in thread to avoid blocking
    sentiments = []
    for c in comments:
        s = analyze_sentiment(c.get("text", ""))
        sentiments.append(s)
    nlp_summary = {
        "questions": extract_questions(comments),
        "topics": top_topics(comments, top_k=12),
        "sentiment": overall_sentiment_summary(sentiments)
    }
    engagement = compute_engagement_stats(comments)
    # build reddit queries from top topic strings
    topic_terms = [t["topic"] for t in nlp_summary["topics"][:6]] or []
    reddit_results = []
    for q in topic_terms:
        reddit_results.append({"query": q, "results": reddit_search(q)})
    # google trends
    google = trends_for_terms(topic_terms)
    # simple trend probability heuristic
    # weights: yt likes (40), reddit mentions (30), google interest (30)
    yt_score = min(100, engagement["avg_likes"] / 5)  # normalize heuristic
    reddit_mentions = sum(len(r["results"]) for r in reddit_results)
    reddit_score = min(100, reddit_mentions * 2)
    google_sum = 0
    if isinstance(google.get("interest_over_time"), dict):
        google_sum = sum(google["interest_over_time"].values()) if google["interest_over_time"] else 0
    google_score = min(100, google_sum)
    # weighted
    trend_probability = int((yt_score * 0.4) + (reddit_score * 0.3) + (google_score * 0.3))
    summary = {
        "trend_probability": trend_probability,
        "trend_type": "multi-platform (youtube+reddit+google) - level2",
        "trend_reason": f"YT avg likes => {engagement['avg_likes']:.2f}, Reddit mentions => {reddit_mentions}, google_interest_sum => {google_sum}"
    }
    return {
        "engine": "ViralEdge-NLP-v2.0",
        "analyzed_at": datetime.datetime.utcnow().isoformat() + "Z",
        "stats": {
            "comments_fetched": comments_payload.get("comments_count", 0),
            "questions_found": len(nlp_summary["questions"]),
            "top_topics_counted": len(nlp_summary["topics"])
        },
        "nlp": nlp_summary,
        "engagement": engagement,
        "platform": {
            "source": "youtube",
            "video_url": video_url,
            "reddit_search": {
                "queries": topic_terms,
                "results": reddit_results,
                "total_mentions": reddit_mentions
            },
            "google_serp": google
        },
        "summary": summary
    }
