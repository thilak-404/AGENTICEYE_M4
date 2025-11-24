from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import Dict

_analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text: str) -> Dict[str, float]:
    scores = _analyzer.polarity_scores(text or "")
    # map to simple labels
    compound = scores.get("compound", 0.0)
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"
    return {"label": label, "scores": scores, "compound": compound}
