import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

def get_geolocation_clusters():
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    clusters = {}
    for entry in data:
        geo = entry.get('geolocation', 'Unknown')
        clusters.setdefault(geo, []).append({
            'text': entry['text'],
            'time_date': entry['time_date']
        })
    return clusters



llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

def summarize_text(text: str) -> str:
    print("Summarizing text:", text)
    messages = [
        ("system", "You are a Indian language expert and a text summarization expert. Summarize the given text in English if it is not in English. Keep the summary concise give the summary in following pointer (well formatted bold the heading ) Requirements/Need:- , Contact Details:- ,Help Location :-(if mentioned) , Tagged Authority:-(@tagged things in text) "),        ("human", text),
    ]
    ai_msg = llm.invoke(messages)
    print(ai_msg.content)
    return str(ai_msg.content)


