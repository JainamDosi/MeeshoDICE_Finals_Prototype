# 🚀 MeeshoDICE — Meesho Finals Prototype (AI for Humanity)

[![Status](https://img.shields.io/badge/status-prototype-orange)](./)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

A compact prototype built for the Meesho Finals hackathon — topic: **AI for Humanity**. This project ingests social media posts, applies AI agents, and uses a retrieval-augmented generation (RAG) pipeline to extract helpful, actionable information from posts (e.g., needs, resources, and recommended actions). Designed for fast experimentation and demos, not production.

Table of Contents
- [What this project does](#what-this-project-does)
- [Why it’s useful](#why-its-useful)
- [Technical overview](#technical-overview)
- [Quick start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Setup (fast)](#setup-fast)
  - [Run the backend](#run-the-backend)
  - [Usage snippets](#usage-snippets)
- [Project layout](#project-layout)
- [Where to get help](#where-to-get-help)
- [Maintainers & contributing](#maintainers--contributing)
- [Notes](#notes)

What this project does
----------------------
- ✅ Ingests social media posts (raw + cleaned datasets included).
- 🧠 Uses AI agents to analyze posts and identify needs, sentiment, and relevant resources.
- 🔎 Uses a RAG pipeline to retrieve supporting passages from the dataset and produce context-aware responses.
- 🧪 Built as a prototype for rapid experimentation during the Meesho Finals hackathon (AI for Humanity).

Why it’s useful
---------------
- ⚡ Rapid prototyping for social-good AI use-cases (disaster response, community help, outreach).
- 🧩 Modular: separate ingestion, clustering, retrieval, and agent orchestration simplify experimentation.
- 📂 Ships with domain datasets so you can run end-to-end tests quickly.

Technical overview
------------------
- Languages: Python (Backend); Frontend (prototype client under Frontend/)
- Core ideas:
  - Data ingestion & cleaning (Backend/data.json, Backend/Cleaned.json)
  - Clustering / vector utilities (Backend/cluster.py)
  - Retrieval + scoring + generation (Backend/rag2.py)
  - Agent orchestration and experiment entrypoint (Backend/agent.py, Backend/main.py)

Quick start
-----------

Prerequisites
- Python 3.8+
- Git
- Optional: API key for an LLM provider (set via env vars) if running generation that calls external models.

Setup (fast)
1. Clone
   - git clone git@github.com:JainamDosi/MeeshoDICE_Finals_Prototype.git
   - cd MeeshoDICE_Finals_Prototype

2. Create & activate a virtual environment
   - python -m venv .venv
   - source .venv/bin/activate   # macOS / Linux
   - .venv\Scripts\Activate.ps1  # Windows (PowerShell)

3. Install dependencies
   - If a requirements.txt exists:
     - pip install -r requirements.txt
   - Otherwise, inspect imports in Backend/*.py and install required packages (common: numpy, pandas, scikit-learn, sentence-transformers, faiss-cpu, openai, Flask/FastAPI).

Run the backend
- Start the main experiment/entrypoint:
  - python Backend/main.py

Usage snippets
- Load the dataset (quick):
```python
import json
from pathlib import Path

p = Path("Backend") / "data.json"
with p.open("r", encoding="utf-8") as f:
    data = json.load(f)
print("Entries:", len(data) if isinstance(data, list) else type(data))
```

- Inspect the RAG pipeline:
  - Open Backend/rag2.py — contains retrieval, scoring, and example generator calls.

- Use the agent:
  - Backend/agent.py shows how agents orchestrate retrieval + generation to produce actionable outputs from social posts.

Project layout
--------------
- Backend/
  - agent.py — agent orchestration
  - rag2.py — retrieval-augmented generation pipeline
  - cluster.py — clustering & vector utilities
  - main.py — experiment entrypoint
  - data.json — raw social media posts dataset
  - Cleaned.json — cleaned/processed posts
  - state_authorities.json — auxiliary dataset used for contextual matches
- Frontend/ — frontend prototype (client UI)
- .gitignore
- LICENSE (referenced)

Where to get help
-----------------
- Open an issue in this repository describing:
  - a short summary, files you looked at, expected vs actual behavior, and minimal repro (error logs or small dataset samples).
- For architecture or design discussions, open an issue titled: "Discussion: <topic>".
- Reference code locations directly (e.g., Backend/rag2.py → function name) to speed up responses.

Maintainers & contributing
--------------------------
- Maintainer: @JainamDosi

Contributing (short)
1. Fork the repo.
2. Branch: feature/<short-desc> or fix/<short-desc>.
3. Add tests/examples where helpful.
4. Open a PR with a clear description and motivation.

See also:
- ./CONTRIBUTING.md (if present)
- ./LICENSE

Notes & best practices
----------------------
- 🔐 Keep API keys out of the repo — use environment variables.
- 💾 Persist vector indices between runs with Faiss or disk caches if you need reproducible results.
- 🧩 Add a requirements.txt or pyproject.toml for reproducible environments.
- ⚠️ Prototype reminder: not hardened for production (no rate-limiting, sanitization, or privacy protections applied by default).

Next steps I can take for you
- generate a requirements.txt by scanning imports,
- create a minimal CONTRIBUTING.md,
- add a QuickStart notebook showing an end-to-end query through the RAG + agent flow.

Enjoy exploring the prototype — built for Meesho Finals: AI for Humanity 🌍💡