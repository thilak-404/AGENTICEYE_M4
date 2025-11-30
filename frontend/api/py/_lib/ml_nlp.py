# ml_nlp.py
from collections import Counter
from typing import Dict, Any
import re

def analyze_text_nlp(text: str) -> Dict[str, Any]:
    """
    Simple, robust NLP pipeline: tokenization, naive sentiment, extract questions & topics.
    For production you would replace with spaCy / transformers.
    """
    if not text:
        return {
            "questions": [],
            "topics": [],
            "topic_counts": {"total_mentions": 0},
            "sentiment": {"positive": 0, "negative": 0, "neutral": 0, "avg_score": 0.0}
        }

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    questions = [ln for ln in lines if ln.endswith("?")]
    # topics: naive word frequency (filtered)
    words = []
    for ln in lines:
        tokens = re.findall(r"[a-zA-Z0-9\#@]{2,}", ln.lower())
        words.extend(tokens)
    cnt = Counter(words)
    # keep top 20 excluding common small words
    stop = set(["the","and","to","of","in","is","it","that","this","a","i","you","we","for","on","with","mrbeast","mr","beast"])
    topics = [{"topic": w, "count": c} for w, c in cnt.most_common(50) if w not in stop][:20]

    # naive sentiment: count emoticons / positive/negative words
    pos_words = set(["good","love","great","best","awesome","amazing","fun","win","respect","legend","wow","w","nice"])
    neg_words = set(["bad","suck","hate","worst","terrible","nope","disgust","dislike"])
    pos = neg = 0
    for w in words:
        if w in pos_words:
            pos += 1
        if w in neg_words:
            neg += 1
    neutral = max(0, len(lines) - pos - neg)
    avg_score = (pos - neg) / max(1, len(lines))

    return {
        "questions": [{"author": None, "text": q} for q in questions],
        "topics": topics,
        "topic_counts": {"total_mentions": sum([t["count"] for t in topics])},
        "sentiment": {"positive": pos, "negative": neg, "neutral": neutral, "avg_score": avg_score}
    }
