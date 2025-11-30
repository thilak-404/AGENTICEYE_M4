from pytrends.request import TrendReq
from typing import List, Dict, Any
from config import CONFIG

pytrends = TrendReq(hl='en-US', tz=360)

def trends_for_terms(terms: List[str]) -> Dict[str, Any]:
    if not terms:
        return {"interest_over_time": {}, "top_terms": []}

    try:
        kw_list = terms[:5]  # max 5 keywords
        pytrends.build_payload(
            kw_list,
            cat=0,
            timeframe=CONFIG.PYTRENDS_TIMEFRAME,
            geo='',
            gprop=''
        )

        df = pytrends.interest_over_time()

        if df.empty:
            iot = {}
        else:
            iot = {kw: int(df[kw].max()) for kw in kw_list}

        region = pytrends.interest_by_region(resolution='COUNTRY').head(10).to_dict()

        return {"interest_over_time": iot, "interest_by_region_sample": region}

    except Exception as e:
        return {"error": str(e)}
