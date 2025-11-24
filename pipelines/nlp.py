import spacy
from keybert import KeyBERT
from transformers import pipeline
import re
from typing import List, Dict

# Load NLP models once
nlp = spacy.load("en_core_web_sm")
kw_model = KeyBERT()
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
    return_all_scores=True
)


def clean(text: str) -> str:
    return re.sub(r"http\S+|@\w+|#\w+", "", text).strip()


# ---------------- Questions ----------------
def extract_questions(comments: List[Dict]) -> List[Dict]:
    patterns = ["how", "what", "why", "can you", "where", "when", "which", "who", "is it"]
    questions = []

    for c in comments:
        txt = clean(c["text"]).lower()
        if "?" in c["text"] or any(p in txt for p in patterns):
            if len(txt) > 10:
                questions.append(c)

    # Remove duplicates
    seen = set()
    unique = []
    for q in questions:
        key = q["text"].lower()[:60]
        if key not in seen:
            seen.add(key)
            unique.append(q)

    return sorted(unique, key=lambda x: x.get("likes", 0), reverse=True)[:20]


# ---------------- Topics ----------------
def safe_extract_keywords(texts):
    try:
        return kw_model.extract_keywords(
            texts,
            keyphrase_ngram_range=(1, 3),
            stop_words='english',
            top_n=15
        )
    except:
        return []


def extract_topics(comments: List[Dict]) -> List[Dict]:
    texts = [clean(c["text"]) for c in comments if len(clean(c["text"])) > 10]

    if not texts:
        return []

    keywords = safe_extract_keywords(texts)
    topics = []

    for item in keywords:
        if len(item) == 2:
            kw, score = item
        elif len(item) == 1:
            kw = item[0]
            score = 0
        else:
            continue

        count = sum(1 for t in texts if kw.lower() in t.lower())
        topics.append({
            "topic": kw.title(),
            "mentions": count,
            "percentage": round(count / len(texts) * 100, 1)
        })

    return sorted(topics, key=lambda x: x["mentions"], reverse=True)[:10]


# ---------------- Sentiment ----------------
def analyze_sentiment(comments: List[Dict]) -> Dict:
    texts = [clean(c["text"])[:500] for c in comments[:300]]
    if not texts:
        return {"positive": 0, "neutral": 0, "negative": 0}

    results = sentiment_pipeline(texts)

    pos = neu = neg = 0

    for r in results:
        scores = {x["label"]: x["score"] for x in r}
        if scores.get("LABEL_2", 0) > 0.6:
            pos += 1
        elif scores.get("LABEL_0", 0) > 0.6:
            neg += 1
        else:
            neu += 1

    total = len(results)

    return {
        "positive": round(pos / total * 100, 1),
        "neutral": round(neu / total * 100, 1),
        "negative": round(neg / total * 100, 1)
    }


# ---------------- Main NLP Wrapper ----------------
def analyze_comments(comments: List[Dict], video_url: str = "") -> Dict:
    if not comments:
        return {"error": "No comments found"}

    questions = extract_questions(comments)
    topics = extract_topics(comments)
    sentiment = analyze_sentiment(comments)

    return {
        "video_url": video_url,
        "total_comments": len(comments),
        "milestone": "M1 + M2 COMPLETE",
        "questions": {
            "total": len(questions),
            "top": [q["text"] for q in questions[:10]]
        },
        "topics": topics,
        "sentiment_percent": sentiment,
        "ready_for_m3": True
    }
