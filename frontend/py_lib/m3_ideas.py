# m3_ideas.py — MODIFIED FOR AI/ML API (aimlapi.com) with DeepSeek
import json
import re
import requests
import time
from .config import CONFIG
from datetime import datetime

# Rate limiting (AI/ML API free tier: 50 RPM)
last_call = 0
DELAY = 1.2

def call_openrouter_deepseek(prompt: str) -> str:
    global last_call
    while time.time() - last_call < DELAY:
        time.sleep(0.1)
    
    if not CONFIG.OPENROUTER_API_KEY:
        raise ValueError("OpenRouter API key missing in .env")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {CONFIG.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://viraledge.ai", # Optional
        "X-Title": "ViralEdge" # Optional
    }
    payload = {
        "model": "deepseek/deepseek-chat", # OpenRouter model ID
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 4000
    }
    
    try:
        r = requests.post(url, json=payload, headers=headers, timeout=60)
        last_call = time.time()
        
        if r.status_code == 200:
            return r.json()["choices"][0]["message"]["content"]
        else:
            raise ValueError(f"OpenRouter API error {r.status_code}: {r.text}")
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Network error: {str(e)}")

def repair_json(json_str: str) -> str:
    """Attempts to repair truncated JSON by closing open braces/brackets."""
    json_str = json_str.strip()
    # Remove any trailing incomplete strings (e.g. "abc...)
    if '"' in json_str and json_str.count('"') % 2 != 0:
        # Remove the last quote and everything after it
        last_quote = json_str.rfind('"')
        json_str = json_str[:last_quote]
    
    json_str = json_str.strip()
    if json_str.endswith(','):
        json_str = json_str[:-1]
    
    # Balance braces
    stack = []
    for char in json_str:
        if char == '{':
            stack.append('}')
        elif char == '[':
            stack.append(']')
        elif char == '}' or char == ']':
            if stack:
                if stack[-1] == char:
                    stack.pop()
    
    # Append missing closing characters in reverse order
    while stack:
        json_str += stack.pop()
        
    return json_str

def generate_m3(analysis: dict, tier: str = "Free") -> dict:
    topics = [t["topic"] for t in analysis.get("topics", [])[:12]]
    questions = [q["text"][:140] for q in analysis.get("questions", [])[:10]]
    sentiment = analysis["sentiment"]["positive"]
    sentiment = analysis["sentiment"]["positive"]
    # viral_score removed - AI predicts it now

    # Tier Logic
    idea_count = 10
    agent_persona = "You are ViralEdge-M3 — advanced viral content engine."
    
    if tier == "Diamond":
        idea_count = 20
        agent_persona = "You are ViralEdge-M3 — expert viral strategist and senior content consultant."
    elif tier == "Solitaire":
        idea_count = 30
        agent_persona = "You are ViralEdge-M3 — elite viral mastermind and executive media producer."

    prompt = f'''{agent_persona}

Real data from video comments:
- Topics: {", ".join(topics)}
- Top questions: {" | ".join(questions)}
- Positive sentiment: {sentiment}%
- Engagement Intensity: {analysis.get("engagement", {}).get("comments_count", 0)} comments analyzed

TASK: Analyze the above data. Based on the intensity of questions (burning desires), topic relevance, and sentiment, PREDICT a "Viral Score" (0-100) for potential future content.

Return ONLY this exact JSON structure. Keep descriptions punchy and concise to ensure valid JSON.

{{
  "viral_prediction_engine": {{
    "score": <PREDICTED_SCORE_INTEGER>,
    "category": "<High/Medium/Low>",
    "reasons": ["Reason 1", "Reason 2", "Reason 3"]
  }},
  "content_category_classifier": {{
    "best_format": "YouTube Long-form",
    "alternative_formats": ["Instagram Reel", "X Thread", "TikTok Short"],
    "reason": "Brief strategy explanation"
  }},
  "viral_pattern_detection": {{
    "detected_patterns": ["Pattern 1", "Pattern 2", "Pattern 3"],
    "confidence": 0.92
  }},
  "ai_recommendations": {{
    "next_best_content": [
      {{
        "title": "Title Idea 1",
        "score": 88,
        "reason": "High relevance to top question",
        "blueprint": {{
            "hooks": ["Hook 1 (5s)", "Hook 2 (Question)", "Hook 3 (Statement)"],
            "script_mini": "Scene 1: [Action]... Scene 2: [Action]... (10-20s script)",
            "voiceover": {{ "gender": "Male/Female", "tone": "Motivational/Cinematic", "language": "English/Hindi" }},
            "captions": "Sample caption text with emojis 🚀",
            "multi_platform": {{
                "instagram_reel": "Visual concept for Reels",
                "twitter_thread": "Hook for a 5-tweet thread",
                "linkedin_post": "Professional angle for LinkedIn",
                "blog_post": "Title and outline for a blog",
                "podcast_segment": "Discussion point for a podcast"
            }},
            "scene_directions": ["Scene 1: Close up...", "Scene 2: B-roll of..."]
        }}
      }},
      ... (Generate exactly {idea_count} distinct ideas, each with a UNIQUE predicted viral score (0-100) and full blueprint)
    ]
  }},
  "seo_keyword_generator": {{
    "primary_keywords": ["Key1", "Key2", "Key3", "Key4"],
    "secondary_keywords": ["Key5", "Key6", "Key7", "Key8"],
    "search_volume": {{
      "Key1": "10K/mo",
      "Key2": "5K/mo"
    }}
  }},
  "competitor_intelligence": {{
    "gaps": ["Gap 1", "Gap 2"],
    "opportunities": ["Opp 1", "Opp 2"]
  }},
  "trend_signals": {{
    "google_trends": "Rising/Falling/Stable",
    "reddit_discussions": "Hot/Warm/Cold",
    "prediction": "Brief trend prediction"
  }}
}}

Generate real, creative, data-driven content based on the topics/questions provided.
IMPORTANT: Ensure the JSON is valid and complete. Do not truncate.
START JSON NOW:'''

    raw = call_openrouter_deepseek(prompt)
    
    # Extract JSON - improved regex to catch code blocks or raw json
    match = re.search(r"\{[\s\S]*\}", raw)
    if match:
        json_str = match.group(0)
    else:
        # If no closing brace found, try to take from the first brace to the end
        match_start = re.search(r"\{", raw)
        if match_start:
            json_str = raw[match_start.start():]
        else:
            raise ValueError(f"No JSON found in response: {raw[:200]}...")

    try:
        result = json.loads(json_str)
    except json.JSONDecodeError:
        # Try to repair
        try:
            repaired_str = repair_json(json_str)
            result = json.loads(repaired_str)
        except json.JSONDecodeError as e:
            raise ValueError(f"JSON parse error after repair: {str(e)}. Raw: {raw[:200]}...")

    result["generated_by"] = "DeepSeek via OpenRouter"
    return result