import os
from dotenv import load_dotenv

load_dotenv()

SERPAPI_KEY = os.getenv("SERPAPI_KEY")
PYTRENDS_TIMEFRAME = os.getenv("PYTRENDS_TIMEFRAME", "now 7-d")
