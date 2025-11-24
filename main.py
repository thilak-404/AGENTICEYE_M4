from fastapi import FastAPI, Query, HTTPException
from models.response import YoutubeCommentsResponse, RedditPostResponse, AnalyzeResponse
from pipelines.youtube import fetch_youtube_comments
from pipelines.reddit import fetch_reddit_post
from pipelines.trending import analyze_all
import asyncio

app = FastAPI(title="ViralEdge Engine (Milestone 2)", version="2.0")

@app.get("/", tags=["root"])
async def root():
    return {"status": "ok", "message": "ViralEdge Engine Live 🚀"}

@app.get("/health", tags=["root"])
async def health():
    return {"status": "healthy"}

@app.get("/youtube-comments", response_model=YoutubeCommentsResponse, tags=["youtube"])
async def youtube_comments(url: str = Query(..., description="YouTube video URL or id"), limit: int = 500):
    """
    Fetch YouTube comments (scraped).
    """
    try:
        # fetch in thread to avoid blocking event loop
        result = await asyncio.to_thread(fetch_youtube_comments, url, limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube fetch error: {str(e)}")

@app.get("/reddit-post", response_model=RedditPostResponse, tags=["reddit"])
async def reddit_post(url: str = Query(..., description="Reddit post URL")):
    try:
        result = await asyncio.to_thread(fetch_reddit_post, url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reddit fetch error: {str(e)}")

@app.get("/analyze", response_model=AnalyzeResponse, tags=["analysis"])
async def analyze(url: str = Query(..., description="YouTube video URL to analyze"), limit: int = 500):
    """
    Full analysis: fetch youtube comments, run NLP, reddit search, google trends.
    """
    try:
        comments_payload = await asyncio.to_thread(fetch_youtube_comments, url, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube fetch error: {str(e)}")
    try:
        analysis = await analyze_all(url, comments_payload)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
