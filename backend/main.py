"""
ScholarMind FastAPI Backend
============================
Run with: uvicorn main:app --reload --port 8000

Modes:
  - Demo mode: runs fully without API keys using mock data
  - Real mode: uses CrewAI agents (Semantic Scholar + Google Gemini / Claude)
                when ANTHROPIC_API_KEY or GOOGLE_API_KEY is set
"""

import asyncio
import json
import os
import sys
import uuid
from datetime import datetime
from typing import AsyncGenerator, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

# ── Ensure 'backend/' is on sys.path so `agents.*` imports resolve ────
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

# ── App setup ─────────────────────────────────────────────────────────
app = FastAPI(
    title="ScholarMind API",
    description="AI Research Synthesis Platform Backend — powered by CrewAI multi-agents",
    version="2.0.0",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://scholarmind.netlify.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Check if real AI mode is available ────────────────────────────────
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GOOGLE_KEY = os.getenv("GOOGLE_API_KEY", "")
SEMANTIC_SCHOLAR_KEY = os.getenv("SEMANTIC_SCHOLAR_API_KEY", "")

# CrewAI uses Google Gemini by default if GOOGLE_API_KEY is set,
# otherwise falls back to OPENAI_API_KEY. We support Anthropic too.
REAL_AI_MODE = bool(ANTHROPIC_KEY and not ANTHROPIC_KEY.startswith("sk-ant-api03-xx")) or bool(GOOGLE_KEY)

# ── In-memory session store (replace with Supabase in production) ─────
sessions_store: dict = {}

# ── Models ────────────────────────────────────────────────────────────
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


# ── Mock data (demo mode) ─────────────────────────────────────────────
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

MOCK_SURVEY = """# Advances in Deep Learning: A Comprehensive Survey

## Abstract

This survey synthesizes recent advances in deep learning, examining architectural innovations from residual networks through transformer-based models. We analyze 5 seminal papers and identify key research trajectories.

## 1. Introduction & Scope

The past decade has witnessed unprecedented advances in deep learning, driven by three co-evolving forces: architectural innovation, scale, and data availability.

## 2. Datasets

| Dataset | Modality | Use-case |
|---------|----------|----------|
| ImageNet | Images | Visual recognition benchmarks |
| BooksCorpus | Text | Language model pre-training |
| Protein Data Bank | 3D structures | Protein structure prediction |

## 3. Methodology & Results

### 3.1 Attention Mechanisms
The self-attention operation allows models to capture long-range dependencies without the sequential bottleneck of RNNs.

### 3.2 Pre-training at Scale
BERT and GPT-3 demonstrate that large-scale pre-training followed by fine-tuning or in-context learning is a dominant paradigm.

## 4. Challenges, Gaps & Future Directions

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

AGENT_STEPS = [
    {"key": "data_acquisition", "label": "Data Acquisition"},
    {"key": "intro_scope", "label": "Introduction & Scope"},
    {"key": "dataset_extraction", "label": "Dataset Extraction"},
    {"key": "methodology_analysis", "label": "Methodology Analysis"},
    {"key": "gaps_challenges", "label": "Gaps & Challenges"},
    {"key": "conclusion_references", "label": "Conclusion & References"},
    {"key": "final_assembly", "label": "Final Assembly"},
]


# ── Routes ────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "ScholarMind API",
        "version": "2.0.0",
        "mode": "real_ai" if REAL_AI_MODE else "demo",
    }


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
    """
    Fetch papers from Semantic Scholar via the CrewAI custom tool logic,
    or return mock data in demo mode.
    """
    session = sessions_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if SEMANTIC_SCHOLAR_KEY or REAL_AI_MODE:
        # Use the real Semantic Scholar python client (same logic as agents/tools/custom_tool.py)
        try:
            from semanticscholar import SemanticScholar
            from itertools import islice

            sch = SemanticScholar()
            query = session["query"]
            num = session["paper_count"]
            blacklist = ["arxiv", "biorxiv", "medrxiv", "ssrn"]

            def is_peer_reviewed(venue: str) -> bool:
                return not any(b in (venue or "").lower() for b in blacklist)

            results = sch.search_paper(query, open_access_pdf=True, limit=num * 4)
            papers = []
            seen = set()

            for p in islice(results, num * 4):
                if len(papers) >= num:
                    break
                key = (p.title or "").strip().lower()
                if key in seen:
                    continue
                seen.add(key)
                if not is_peer_reviewed(p.venue):
                    continue
                abstract = p.abstract
                if not abstract or len(abstract.strip()) < 50:
                    abstract = "Abstract not available."
                oa_pdf = p.openAccessPdf
                oa_url = oa_pdf.get("url") if isinstance(oa_pdf, dict) else None
                papers.append({
                    "id": p.paperId or str(uuid.uuid4()),
                    "title": p.title or "Untitled",
                    "authors": [a.name for a in (p.authors or [])],
                    "year": p.year or 0,
                    "journal": p.venue or "",
                    "abstract": abstract,
                    "is_open_access": bool(oa_url),
                    "is_preprint": False,
                    "semantic_scholar_id": p.paperId,
                    "openaccess_url": oa_url,
                })

            # Fallback: include preprints if not enough results
            if len(papers) < num:
                results2 = sch.search_paper(query, open_access_pdf=True, limit=num * 4)
                for p in islice(results2, num * 4):
                    if len(papers) >= num:
                        break
                    key = (p.title or "").strip().lower()
                    if key in seen:
                        continue
                    seen.add(key)
                    abstract = p.abstract or "Abstract not available."
                    oa_pdf = p.openAccessPdf
                    oa_url = oa_pdf.get("url") if isinstance(oa_pdf, dict) else None
                    papers.append({
                        "id": p.paperId or str(uuid.uuid4()),
                        "title": p.title or "Untitled",
                        "authors": [a.name for a in (p.authors or [])],
                        "year": p.year or 0,
                        "journal": p.venue or "",
                        "abstract": abstract,
                        "is_open_access": bool(oa_url),
                        "is_preprint": True,
                        "semantic_scholar_id": p.paperId,
                        "openaccess_url": oa_url,
                    })

        except Exception as e:
            # Graceful fallback to mock data on any Semantic Scholar error
            print(f"[WARN] Semantic Scholar fetch failed: {e}. Using mock data.")
            papers = [p.model_dump() for p in MOCK_PAPERS]
    else:
        # Demo mode
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
            event = {
                "step": step["key"],
                "step_label": step["label"],
                "status": "active",
                "progress": int((i / len(AGENT_STEPS)) * 100),
                "thought": f"Agent working on: {step['label']}...",
            }
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(2.5)

            event["status"] = "completed"
            event["progress"] = int(((i + 1) / len(AGENT_STEPS)) * 100)
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(0.5)

        yield f'data: {{"status": "done", "progress": 100}}\n\n'

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/sessions/{session_id}/synthesize")
async def start_synthesis(session_id: str):
    """
    Run the CrewAI multi-agent synthesis pipeline.
    Uses pre-selected papers from the session so users can curate before generating.
    """
    session = sessions_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    sessions_store[session_id]["status"] = "synthesizing"

    if REAL_AI_MODE:
        try:
            from agents.crew import run_synthesis_crew

            # Build the papers list from the selected IDs
            all_papers = session.get("papers", [])
            selected_ids = set(session.get("selected_paper_ids", [p["id"] for p in all_papers]))
            selected_papers = [p for p in all_papers if p.get("id") in selected_ids]

            if not selected_papers:
                selected_papers = all_papers

            # Run the crew in a thread pool so it doesn't block the event loop
            survey_content = await asyncio.to_thread(
                run_synthesis_crew,
                interest=session["query"],
                papers=selected_papers,
                session_id=session_id,
                num_papers=len(selected_papers),
            )

        except Exception as e:
            print(f"[ERROR] CrewAI synthesis failed: {e}. Falling back to Claude direct synthesis.")

            # Fallback: direct Claude synthesis without agents
            try:
                import anthropic as ant
                client = ant.Anthropic(api_key=ANTHROPIC_KEY)
                all_papers = session.get("papers", MOCK_PAPERS)
                paper_context = "\n\n".join([
                    f"Title: {p.get('title', '')}\nAuthors: {', '.join(p.get('authors', []))}\n"
                    f"Year: {p.get('year', '')}\nAbstract: {p.get('abstract', '')}"
                    for p in all_papers[:10]
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
            except Exception as claude_err:
                print(f"[ERROR] Claude fallback also failed: {claude_err}. Using mock survey.")
                survey_content = MOCK_SURVEY
    else:
        # Demo mode
        await asyncio.sleep(2)
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
