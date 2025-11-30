from fastapi import FastAPI, Query, HTTPException
import asyncio
from datetime import datetime
from app.pipelines.youtube import fetch_youtube_comments
from app.utils.nlp_utils import analyze_comments
from app.m3_ideas import generate_m3
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ViralEdge M3 Engine",
    description="Professional AI-powered viral content generator",
    version="3.0",
    root_path="/api/py"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Allows localhost:5000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Agentic Eye API"}

@app.get("/m3/analyze")
async def m3_analyze(
    url: str = Query(..., description="Video URL"), 
    tier: str = Query("Free", description="User Tier"),
    platform: str = Query("youtube", description="Platform (youtube/tiktok)"),
    limit: int = Query(100, description="Comment limit")
):
    try:
        if platform == "tiktok":
            # Mock TikTok Analysis for now as we don't have a TikTok scraper
            m2 = {
                "topics": [{"topic": "Trending Challenge"}, {"topic": "Viral Sound"}, {"topic": "Dance"}],
                "questions": [{"text": "What is this song?"}, {"text": "Tutorial please!"}],
                "sentiment": {"positive": 85},
                "engagement": {"comments_count": 1200}
            }
        else:
            # Optimized: Use limit from query (default 100 for speed, 500 for deep)
            print(f"Fetching comments for {url}...")
            comments_data = await asyncio.to_thread(fetch_youtube_comments, url, max_comments=limit)
            if "error" in comments_data:
                print(f"Comment fetch error: {comments_data['error']}")
                raise HTTPException(500, comments_data["error"])
            print("Comments fetched. Analyzing...")
            m2 = analyze_comments(comments_data["comments"])

        print("Generating M3...")
        m3 = generate_m3(m2, tier)  # ← 100% DeepSeek
        
        return {
            "engine": "ViralEdge-M3",
            "model_used": "DeepSeek-V3",
            "video_url": url,
            "generated_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "m2_analysis": {
                "topics": m2["topics"],
                "questions": m2["questions"][:10],
                "sentiment": m2["sentiment"],
                "engagement": m2["engagement"]
            },
            "m3_generation": m3
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "traceback": traceback.format_exc()}

@app.post("/m3/generate-script")
async def generate_script_endpoint(
    title: str = Query(..., description="Video Title"),
    duration: str = Query("60s", description="Duration"),
    tone: str = Query("Energetic", description="Tone"),
    notes: str = Query("", description="Additional Notes")
):
    # Dynamic Script Generation based on Duration
    is_long = "min" in duration or (duration.isdigit() and int(duration) > 60)
    
    if is_long:
        # Structure for > 60s
        structure = f"""
**Title:** {title}
**Duration:** {duration}
**Tone:** {tone}

**[0:00-0:10] The Hook**
(High energy visual, text overlay)
"I bet you didn't know this about {title}..."

**[0:10-0:30] The Context (The 'Why')**
"Here's the thing. Most people ignore this detail, but it's actually the most important part because..."

**[0:30-1:00] The Meat (Step-by-Step)**
1. First, you need to...
2. Then, make sure to...
3. Finally, the secret sauce is...
{notes if notes else "(Insert specific details here)"}

**[1:00-1:30] The Twist / Advanced Tip**
"But wait, there's a hack. If you combine this with..."

**[1:30-{duration}] Call to Action**
"Save this video so you don't lose it. And follow for part 2!"
"""
    else:
        # Structure for <= 60s (Shorts/Reels)
        structure = f"""
**Title:** {title}
**Duration:** {duration}
**Tone:** {tone}

**[0:00-0:05] Hook**
(Fast paced visual)
"Stop doing THIS if you want results!"

**[0:05-0:15] The Problem**
"You're wasting time on X, when you should be doing Y."

**[0:15-0:45] The Solution**
{notes if notes else "1. Do this. 2. Then this. 3. Profit."}

**[0:45-{duration}] CTA**
"Link in bio for the full guide!"
"""
    
    return {"script": structure, "status": "Generated"}

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "AgenticEye Backend",
        "version": "3.0",
        "time": datetime.utcnow().isoformat() + "Z"
    }