from typing import List, Dict, Any
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter
from .text_utils import clean_text

nlp = spacy.load("en_core_web_sm", disable=["parser", "ner"])

def extract_questions(comments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    qs = []
    for c in comments:
        t = c.get("text", "")
        if "?" in t:
            qs.append({"author": c.get("author"), "text": t})
    return qs

def top_topics(comments: List[Dict[str, Any]], top_k: int = 10) -> List[Dict[str, Any]]:
    texts = [clean_text(c.get("text", "")) for c in comments if c.get("text")]
    if not texts:
        return []
    # use simple TF-IDF to get keywords
    vectorizer = TfidfVectorizer(max_features=200, stop_words="english", ngram_range=(1,2))
    X = vectorizer.fit_transform(texts)
    features = vectorizer.get_feature_names_out()
    # sum tfidf scores across docs
    scores = X.sum(axis=0).A1
    pairs = list(zip(features, scores))
    pairs.sort(key=lambda x: x[1], reverse=True)
    return [{"topic": p[0], "score": float(p[1])} for p in pairs[:top_k]]

def overall_sentiment_summary(sentiment_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    counts = Counter([r["label"] for r in sentiment_results])
    total = sum(counts.values()) or 1
    avg_compound = sum([r["compound"] for r in sentiment_results]) / total
    return {
        "positive": counts.get("positive", 0),
        "negative": counts.get("negative", 0),
        "neutral": counts.get("neutral", 0),
        "positive_ratio": counts.get("positive", 0) / total,
        "negative_ratio": counts.get("negative", 0) / total,
        "neutral_ratio": counts.get("neutral", 0) / total,
        "avg_score": avg_compound
    }
