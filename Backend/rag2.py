# rag_chat.py
# rag_chat.py
import os
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_cohere import CohereEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.docstore.document import Document
from langchain_pinecone import PineconeVectorStore
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from pinecone import Pinecone, ServerlessSpec

# -------------------------
# Load environment
# -------------------------
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "helper")

# -------------------------
# LLM & Embeddings
# -------------------------
llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name="meta-llama/llama-4-scout-17b-16e-instruct",
    temperature=0.2,
)

embedding = CohereEmbeddings(
    model="embed-english-v3.0",
    cohere_api_key=COHERE_API_KEY,
)

# -------------------------
# Pinecone
# -------------------------
pc = Pinecone(api_key=PINECONE_API_KEY)
if PINECONE_INDEX_NAME not in pc.list_indexes().names():
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=4096,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
index = pc.Index(PINECONE_INDEX_NAME)

# -------------------------
# Load & chunk data
# -------------------------
# Load original posts data
with open("Cleaned.json", "r", encoding="utf-8") as f:
    posts = json.load(f)

# Load state authorities data
with open("state_authorities.json", "r", encoding="utf-8") as f:
    authorities_data = json.load(f)

splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=80)
docs = []

# Process original posts
for post in posts:
    text = post.get("text", "")
    if not text.strip():
        continue
    for chunk in splitter.split_text(text):
        docs.append(Document(page_content=chunk, metadata={**post, "source": "posts"}))

# Process authorities data - NGOs
for ngo in authorities_data["medical_emergencies_india"]["important_ngos"]:
    content = f"Organization: {ngo['name']}\nDescription: {ngo['description']}\nContact: {ngo['contact']}"
    if 'twitter' in ngo:
        content += f"\nTwitter: {ngo['twitter']}"
    docs.append(Document(page_content=content, metadata={
        "source": "authorities", 
        "type": "ngo", 
        "name": ngo['name'],
        "contact": ngo['contact']
    }))

# Process authorities data - Helplines
for helpline in authorities_data["medical_emergencies_india"]["important_helplines"]:
    content = f"Emergency Number: {helpline['number']}\nDescription: {helpline['description']}"
    docs.append(Document(page_content=content, metadata={
        "source": "authorities", 
        "type": "helpline", 
        "number": helpline['number']
    }))

# Process authorities data - Government Authorities
for authority in authorities_data["medical_emergencies_india"]["important_authorities"]:
    content = f"Authority: {authority['name']}\nDescription: {authority['description']}\nContact: {authority['contact']}"
    if 'twitter' in authority:
        content += f"\nTwitter: {authority['twitter']}"
    docs.append(Document(page_content=content, metadata={
        "source": "authorities", 
        "type": "authority", 
        "name": authority['name'],
        "contact": authority['contact']
    }))

# -------------------------
# Vector Store
# -------------------------
vectorstore = PineconeVectorStore(index, embedding, text_key="text")

# Clear existing data and add all documents
print("Adding documents to vector store...")
vectorstore.add_documents(docs)
print(f"Added {len(docs)} documents to vector store")

retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.00001, "k": 20},
)

# -------------------------
# Prompt & Chain
# -------------------------
system_prompt = (
    "You are CrisisCompass, a helpful emergency response assistant for India.\n"
    "You have access to information about:\n"
    "1. Medical emergency posts and experiences\n"
    "2. Important NGOs providing medical assistance\n"
    "3. Emergency helpline numbers (112, 108, 102, 104, 1098)\n"
    "4. Government authorities and agencies\n\n"
    "Use ONLY the provided context to answer the user's question.\n"
    "When providing contact information or emergency numbers, be precise and clear.\n"
    "If the context does not contain enough information, say so clearly.\n\n"
    "User Query: {input}\n\n"
    "Context:\n{context}"
)

qa_prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}")
])

qa_chain = create_stuff_documents_chain(llm, qa_prompt)

# Memory for conversation
memory_store = {}  # key=session_id -> chat_history list

def get_memory(session_id: str):
    if session_id not in memory_store:
        memory_store[session_id] = []
    return memory_store[session_id]

rag_chain = create_retrieval_chain(retriever, qa_chain)

# -------------------------
# Query Function
# -------------------------
def chat(user_query: str, session_id: str = "default_session"):
    chat_history = get_memory(session_id)
    
    # Build input with memory
    input_with_memory = {"input": user_query, "chat_history": chat_history}
    result = rag_chain.invoke(input_with_memory)
    
    # Add user and bot response to memory
    chat_history.extend([
        {"role": "human", "content": user_query},
        {"role": "assistant", "content": result["answer"]}
    ])
    
    return result["answer"]
