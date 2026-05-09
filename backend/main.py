"""
ScholarMind FastAPI Backend
============================
Run with: uvicorn main:app --reload --port 8000
Demo mode: runs fully without API keys using mock data
"""

import asyncio
import json
import os
import uuid
from datetime import datetime
from typing import AsyncGenerator, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

# ─── App setup ─────────────────────────────────────────────────────
app = FastAPI(
    title="ScholarMind API",
    description="AI Research Synthesis Platform Backend",
    version="1.0.0",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://scholarmind.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory store (replace with Supabase in production) ─────────
sessions_store: dict = {}

# ─── Models ────────────────────────────────────────────────────────
class CreateSessionRequest(BaseModel):
    query: str
    paper_count: int = 10
    peer_reviewed_only: bool = True


class Paper(BaseModel):
    id: str
    title: str
    authors: List[str]
    year: int
    journal: Optional[str] = None
    abstract: str
    is_open_access: bool
    is_preprint: bool = False
    doi: Optional[str] = None
    semantic_scholar_id: Optional[str] = None


class UpdatePapersRequest(BaseModel):
    paper_ids: List[str]


# ─── Mock data ─────────────────────────────────────────────────────
MOCK_PAPERS = [
    Paper(
        id="p1", title="Highly Accurate Protein Structure Prediction with AlphaFold",
        authors=["Jumper, J.", "Evans, R.", "Pritzel, A."],
        year=2021, journal="Nature",
        abstract="Proteins are essential to life. AlphaFold achieves experimental accuracy in protein structure prediction.",
        is_open_access=True,
    ),
    Paper(
        id="p2", title="Language Models are Few-Shot Learners",
        authors=["Brown, T.", "Mann, B.", "Ryder, N."],
        year=2020, journal="NeurIPS",
        abstract="GPT-3 demonstrates that scaling language models greatly improves task-agnostic few-shot performance.",
        is_open_access=True,
    ),
    Paper(
        id="p3", title="Attention Is All You Need",
        authors=["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
        year=2017, journal="NeurIPS",
        abstract="The Transformer architecture based solely on attention mechanisms, dispensing with recurrence and convolutions.",
        is_open_access=True,
    ),
    Paper(
        id="p4", title="BERT: Pre-training of Deep Bidirectional Transformers",
        authors=["Devlin, J.", "Chang, M.", "Lee, K.", "Toutanova, K."],
        year=2019, journal="NAACL",
        abstract="BERT obtains new state-of-the-art results on eleven NLP tasks via bidirectional pre-training.",
        is_open_access=True,
    ),
    Paper(
        id="p5", title="Deep Residual Learning for Image Recognition",
        authors=["He, K.", "Zhang, X.", "Ren, S.", "Sun, J."],
        year=2016, journal="CVPR",
        abstract="We present residual learning to ease training of extremely deep neural networks.",
        is_open_access=True,
    ),
]

AGENT_STEPS = [
    "Data Acquisition",
    "Context Setting",
    "Dataset Extraction",
    "Methodology Analysis",
    "Gap & Challenges",
    "Conclusion & References",
    "Final Assembly",
]

MOCK_SURVEY = """# Advances in Deep Learning: A Comprehensive Survey

## Abstract

This survey synthesizes recent advances in deep learning, examining architectural innovations from residual networks through transformer-based models. We analyze 5 seminal papers and identify key research trajectories.

## 1. Introduction

The past decade has witnessed unprecedented advances in deep learning, driven by three co-evolving forces: architectural innovation, scale, and data availability.

## 2. Background

From ResNets enabling extremely deep networks to the Transformer's attention-only paradigm, the field has undergone multiple paradigm shifts.

## 3. Methodology Analysis

### 3.1 Attention Mechanisms
The self-attention operation allows models to capture long-range dependencies without the sequential bottleneck of RNNs.

### 3.2 Pre-training at Scale
BERT and GPT-3 demonstrate that large-scale pre-training followed by fine-tuning or in-context learning is a dominant paradigm.

## 4. Research Gaps

- Mechanistic interpretability of large models
- Sample efficiency in low-data regimes
- Energy efficiency and environmental impact

## 5. Conclusions

Deep learning has reached remarkable capability across modalities. Future work must address interpretability, efficiency, and robustness.

## References

[1] Jumper et al. (2021). AlphaFold. *Nature*.
[2] Brown et al. (2020). GPT-3. *NeurIPS*.
[3] Vaswani et al. (2017). Transformer. *NeurIPS*.
[4] Devlin et al. (2019). BERT. *NAACL*.
[5] He et al. (2016). ResNet. *CVPR*.
"""


# ─── Routes ────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "ScholarMind API", "version": "1.0.0"}


@app.post("/api/sessions")
async def create_session(req: CreateSessionRequest):
    session_id = str(uuid.uuid4())
    sessions_store[session_id] = {
        "id": session_id,
        "query": req.query,
        "paper_count": req.paper_count,
        "peer_reviewed_only": req.peer_reviewed_only,
        "status": "pending",
        "papers": [],
        "selected_paper_ids": [],
        "survey": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    return {"session_id": session_id, "status": "pending"}


@app.get("/api/sessions")
async def list_sessions():
    return {"sessions": list(sessions_store.values())}


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    session = sessions_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.post("/api/sessions/{session_id}/papers/fetch")
async def fetch_papers(session_id: str):
    """Fetch papers from Semantic Scholar (or return mock data in demo mode)."""
    session = sessions_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    semantic_scholar_key = os.getenv("SEMANTIC_SCHOLAR_API_KEY")

    if semantic_scholar_key:
        # Real API call
        import httpx
        query = session["query"]
        url = "https://api.semanticscholar.org/graph/v1/paper/search"
        params = {
            "query": query,
            "fields": "title,authors,year,venue,abstract,isOpenAccess,externalIds",
            "limit": session["paper_count"],
        }
        headers = {"x-api-key": semantic_scholar_key}
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, headers=headers)
            data = resp.json()
            papers = [
                {
                    "id": p["paperId"],
                    "title": p.get("title", ""),
                    "authors": [a["name"] for a in p.get("authors", [])],
                    "year": p.get("year", 0),
                    "journal": p.get("venue", ""),
                    "abstract": p.get("abstract", ""),
                    "is_open_access": p.get("isOpenAccess", False),
                    "semantic_scholar_id": p["paperId"],
                }
                for p in data.get("data", [])
            ]
    else:
        # Demo mode — return mock papers
        papers = [p.model_dump() for p in MOCK_PAPERS]

    sessions_store[session_id]["papers"] = papers
    sessions_store[session_id]["selected_paper_ids"] = [p["id"] for p in papers]
    sessions_store[session_id]["status"] = "papers_ready"

    return {"papers": papers, "count": len(papers)}


@app.patch("/api/sessions/{session_id}/papers")
async def update_papers(session_id: str, req: UpdatePapersRequest):
    session = sessions_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    sessions_store[session_id]["selected_paper_ids"] = req.paper_ids
    return {"selected_paper_ids": req.paper_ids}


@app.get("/api/sessions/{session_id}/progress")
async def stream_progress(session_id: str):
    """Server-Sent Events stream for agent progress."""

    async def event_generator() -> AsyncGenerator[str, None]:
        for i, step in enumerate(AGENT_STEPS):
            # Emit start event
            event = {
                "step": step.lower().replace(" ", "_"),
                "step_label": step,
                "status": "active",
                "progress": int((i / len(AGENT_STEPS)) * 100),
                "thought": f"Processing {step}...",
            }
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(2.5)

            # Emit completion
            event["status"] = "completed"
            event["progress"] = int(((i + 1) / len(AGENT_STEPS)) * 100)
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(0.5)

        # Final done event
        sessions_store.get(session_id, {}).update({"status": "completed", "survey": MOCK_SURVEY})
        yield f'data: {{"status": "done", "progress": 100}}\n\n'

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/sessions/{session_id}/synthesize")
async def start_synthesis(session_id: str):
    session = sessions_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    anthropic_key = os.getenv("ANTHROPIC_API_KEY")

    if anthropic_key:
        # Real synthesis with Claude
        import anthropic as ant

        client = ant.Anthropic(api_key=anthropic_key)
        papers = session.get("papers", MOCK_PAPERS)
        paper_context = "\n\n".join([
            f"Title: {p.get('title', '')}\nAuthors: {', '.join(p.get('authors', []))}\nYear: {p.get('year', '')}\nAbstract: {p.get('abstract', '')}"
            for p in papers[:10]
        ])

        message = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=4000,
            messages=[{
                "role": "user",
                "content": f"""Write a comprehensive academic survey paper on: "{session['query']}"

Based on these papers:
{paper_context}

Structure: Abstract, Introduction, Background, Methodology Analysis, Research Gaps, Conclusions, References.
Use academic style with inline citations [1], [2] etc. Minimum 1500 words."""
            }]
        )
        survey_content = message.content[0].text
    else:
        # Demo mode
        await asyncio.sleep(1)
        survey_content = MOCK_SURVEY

    sessions_store[session_id]["survey"] = survey_content
    sessions_store[session_id]["status"] = "completed"

    return {"status": "completed", "survey_preview": survey_content[:500] + "..."}


@app.get("/api/sessions/{session_id}/survey")
async def get_survey(session_id: str):
    session = sessions_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    survey = session.get("survey")
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not yet generated")

    return {"content_md": survey, "session_id": session_id}


@app.post("/api/sessions/{session_id}/survey/export")
async def export_survey(session_id: str, format: str = "markdown"):
    session = sessions_store.get(session_id)
    if not session or not session.get("survey"):
        raise HTTPException(status_code=404, detail="Survey not found")

    content = session["survey"]

    if format == "markdown":
        return {"download_url": f"/api/sessions/{session_id}/survey/download?format=md", "format": "markdown"}
    elif format == "pdf":
        return {"download_url": f"/api/sessions/{session_id}/survey/download?format=pdf", "format": "pdf"}

    return {"content": content, "format": format}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
