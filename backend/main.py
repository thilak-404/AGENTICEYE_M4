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
        # 1. Fetch Comments
        # The original code used asyncio.to_thread for fetch_youtube_comments,
        # but the new snippet calls it directly. Assuming fetch_youtube_comments
        # is now synchronous or handles its own async.
        # If fetch_youtube_comments is still synchronous and blocking,
        # it should be wrapped in asyncio.to_thread.
        comments_data = await asyncio.to_thread(fetch_youtube_comments, url, max_comments=limit)
        if "error" in comments_data:
            return JSONResponse(content={"error": f"YouTube Error: {comments_data['error']}"}, status_code=400)
        
        comments = comments_data["comments"]
        if not comments:
             return JSONResponse(content={"error": "No comments found or video is private."}, status_code=400)

        # 2. Analyze Sentiment & Topics (NLP)
        # We pass the raw comments list to the NLP analyzer
        nlp_results = analyze_comments(comments)
        
        # 3. Generate Viral Ideas & Script (DeepSeek AI)
        # We construct a rich prompt context
        ai_context = {
            "video_url": url,
            "platform": platform,
            "tier": tier,
            "sentiment_summary": nlp_results.get("sentiment", {}),
            "top_topics": nlp_results.get("topics", [])[:5],
            "comments_sample": [c["text"] for c in comments[:20]] # Feed top 20 comments to AI
        }
        
        m3_results = await generate_m3(ai_context)
        
        # 4. Construct Final JSON Response
        response_data = {
            "viral_score": m3_results.get("viral_prediction_engine", {}).get("score", 85), # Fallback to 85 if AI fails
            "sentiment": nlp_results.get("sentiment", {"positive": 0, "negative": 0, "neutral": 0}),
            "topics": nlp_results.get("topics", []),
            "ideas": m3_results.get("content_ideas_agent", {}).get("ideas", []),
            "full_script": m3_results.get("script_generation_agent", {}).get("script", "Script generation unavailable."),
            "engagement_metrics": nlp_results.get("engagement_metrics", {
                "comments_count": len(comments),
                "total_likes": sum(c.get('votes', 0) for c in comments),
                "avg_likes": 0
            }),
            "m2_analysis": nlp_results, # Keep legacy structure for backward compatibility if needed
            "m3_generation": m3_results
        }

        return response_data

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e), "trace": traceback.format_exc()}, status_code=500)

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