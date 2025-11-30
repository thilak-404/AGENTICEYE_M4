from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter
import re

def clean_text(text):
    text = re.sub(r'http\S+', '', text) # Remove URLs
    text = re.sub(r'[^\w\s]', '', text) # Remove punctuation
    return text.lower()

def analyze_comments(comments):
    if not comments:
        return {
            "sentiment": {"positive": 0, "negative": 0, "neutral": 0},
            "topics": [],
            "questions": []
        }

    texts = [c['text'] for c in comments]
    cleaned_texts = [clean_text(t) for t in texts]

    # 1. Sentiment Analysis
    pos, neg, neu = 0, 0, 0
    for text in texts:
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        if polarity > 0.1: pos += 1
        elif polarity < -0.1: neg += 1
        else: neu += 1
    
    total = len(texts)
    sentiment = {
        "positive": round((pos/total)*100),
        "negative": round((neg/total)*100),
        "neutral": round((neu/total)*100)
    }

    # 2. Topic Extraction (TF-IDF)
    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=10)
        tfidf_matrix = vectorizer.fit_transform(cleaned_texts)
        feature_names = vectorizer.get_feature_names_out()
        topics = [{"topic": word, "weight": 10} for word in feature_names]
    except:
        # Fallback if too few words
        all_words = " ".join(cleaned_texts).split()
        common = Counter(all_words).most_common(5)
        topics = [{"topic": word, "weight": count} for word, count in common]

    # 3. Question Extraction
    questions = []
    for text in texts:
        if "?" in text or text.lower().startswith(("how", "what", "why", "when", "can")):
            questions.append({"text": text, "likes": 0})
    
    # Sort questions by length (heuristic for quality) and take top 10
    questions.sort(key=lambda x: len(x['text']), reverse=True)
    
    return {
        "sentiment": sentiment,
        "topics": topics,
        "questions": questions[:10]
    }