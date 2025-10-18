import json
from collections import defaultdict
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

# Load data and count entries per state
def get_state_counts_data():
    try:
        with open('data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        state_counts = defaultdict(int)
        for item in data:
            state = item.get('geolocation', '').strip() or 'Unknown'
            state_counts[state] += 1
        return dict(state_counts)
    except Exception as e:
        return {"error": str(e)}


