from typing import List, Dict, Any
from pydantic import BaseModel

class Comment(BaseModel):
    author: str
    text: str
    likes: int = 0
    time: str = ""

class YoutubeCommentsResponse(BaseModel):
    video_url: str
    comments_count: int
    comments: List[Comment]

class RedditPostResponse(BaseModel):
    url: str
    title: str
    author: str
    content: str
    comments_count: int
    comments: List[Dict[str, Any]]

class AnalyzeResponse(BaseModel):
    engine: str
    analyzed_at: str
    stats: Dict[str, Any]
    nlp: Dict[str, Any]
    engagement: Dict[str, Any]
    platform: Dict[str, Any]
    summary: Dict[str, Any]
