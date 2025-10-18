from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from fastapi.responses import JSONResponse
from cluster import get_state_counts_data
from agent import get_geolocation_clusters,summarize_text  # <-- Add this import
from pydantic import BaseModel
from rag2 import chat

app = FastAPI()

# Allow CORS for frontend (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load data at startup
@app.on_event("startup")
def load_data():
    global summarized_data
    try:
        with open("data.json", "r", encoding="utf-8") as f:  # Changed filename here
            summarized_data = json.load(f)
    except Exception:
        summarized_data = []

@app.get("/state_counts")
def get_state_counts():
    result = get_state_counts_data()
    if "error" in result:
        return JSONResponse(content=result, status_code=500)
    return JSONResponse(content=result)



@app.get("/geolocation_clusters")
def geolocation_clusters():
    try:
        clusters = get_geolocation_clusters()
        return JSONResponse(content=clusters)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

class SummarizeRequest(BaseModel):    
    text: str

@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    try:
        summary = summarize_text(req.text)
        return {"summary": summary}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        response = chat(req.message, session_id=req.session_id)
        return {"response": response}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)