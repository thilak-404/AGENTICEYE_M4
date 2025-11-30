from youtube_comment_downloader import YoutubeCommentDownloader
import re

def fetch_youtube_comments(video_url, max_comments=100):
    downloader = YoutubeCommentDownloader()
    comments = []
    
    try:
        # Extract Video ID
        video_id = None
        if "v=" in video_url:
            video_id = video_url.split("v=")[1].split("&")[0]
        elif "youtu.be" in video_url:
            video_id = video_url.split("/")[-1]
            
        if not video_id:
            return []

        # Fetch comments
        generator = downloader.get_comments(video_id)
        for comment in generator:
            if len(comments) >= max_comments:
                break
            comments.append({
                "text": comment['text'],
                "author": comment['author'],
                "likes": comment.get('votes', 0),
                "time": comment.get('time_parsed', 0) # Relative time
            })
            
        return comments
    except Exception as e:
        print(f"Error fetching comments: {e}")
        return []