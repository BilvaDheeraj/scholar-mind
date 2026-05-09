"""
ScholarMind - Semantic Scholar Custom Tool (Session-Safe)
=========================================================
Adapted from Draft_1_goog for use inside a FastAPI multi-user context.
Uses session-specific output paths to avoid concurrency conflicts.
"""

from crewai.tools import BaseTool
from typing import Type, Optional
from pydantic import BaseModel, Field
from semanticscholar import SemanticScholar
from itertools import islice
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path


class SemanticScholarInput(BaseModel):
    """Input schema for SemanticScholarTool."""
    interest: str = Field(..., description="The research topic/interest to search for.")
    num_papers: int = Field(default=5, description="Number of peer-reviewed open-access papers to retrieve.")
    session_id: Optional[str] = Field(default=None, description="Session ID for isolated file output.")


class SemanticScholarTool(BaseTool):
    name: str = "Semantic Scholar Paper Fetcher"
    description: str = (
        "Fetches real peer-reviewed open-access papers from Semantic Scholar for a given research interest. "
        "Returns a structured JSON string containing paper metadata (title, authors, year, venue, abstract, PDF URL). "
        "Use this tool to retrieve real academic papers — never fabricate or hallucinate paper data."
    )
    args_schema: Type[BaseModel] = SemanticScholarInput

    def _run(self, interest: str, num_papers: int = 5, session_id: Optional[str] = None) -> str:
        sch = SemanticScholar()

        blacklist = ["arxiv", "biorxiv", "medrxiv", "ssrn"]

        def is_peer_reviewed(venue: str) -> bool:
            return not any(b in (venue or "").lower() for b in blacklist)

        results = sch.search_paper(
            interest,
            open_access_pdf=True,
            limit=num_papers * 4  # overfetch to allow filtering
        )

        papers = []
        log = []
        seen = set()

        for paper in islice(results, num_papers * 4):
            if len(papers) >= num_papers:
                break

            key = (paper.title or "").strip().lower()
            if key in seen:
                continue
            seen.add(key)

            peer_reviewed = is_peer_reviewed(paper.venue)
            if not peer_reviewed:
                log.append(f"Excluded preprint: {paper.title}")
                continue

            abstract = paper.abstract
            if not abstract or len(abstract.strip()) < 50 or abstract.strip().lower().startswith("manuscript info"):
                abstract = None

            oa_pdf = paper.openAccessPdf
            oa_url = oa_pdf.get("url") if isinstance(oa_pdf, dict) else None

            papers.append({
                "title": paper.title,
                "year": paper.year,
                "authors": [a.name for a in (paper.authors or [])],
                "venue": paper.venue,
                "abstract": abstract,
                "openaccess_url": oa_url,
                "openaccess_validated": bool(oa_url),
                "peer_reviewed": True,
                "why_selected": "recent, OA PDF, keyword match, peer-reviewed venue"
            })

        # Relax filter if not enough results
        if len(papers) < num_papers:
            log.append(f"Only {len(papers)} peer-reviewed papers found. Relaxing filter to include preprints.")
            results2 = sch.search_paper(interest, open_access_pdf=True, limit=num_papers * 4)
            for paper in islice(results2, num_papers * 4):
                if len(papers) >= num_papers:
                    break
                key = (paper.title or "").strip().lower()
                if key in seen:
                    continue
                seen.add(key)
                abstract = paper.abstract
                if not abstract or len(abstract.strip()) < 50:
                    abstract = None
                oa_pdf = paper.openAccessPdf
                oa_url = oa_pdf.get("url") if isinstance(oa_pdf, dict) else None
                papers.append({
                    "title": paper.title,
                    "year": paper.year,
                    "authors": [a.name for a in (paper.authors or [])],
                    "venue": paper.venue,
                    "abstract": abstract,
                    "openaccess_url": oa_url,
                    "openaccess_validated": bool(oa_url),
                    "peer_reviewed": is_peer_reviewed(paper.venue),
                    "why_selected": "fallback (not strictly peer-reviewed)"
                })

        output = {
            "metadata": {
                "run_id": str(uuid.uuid4()),
                "run_date": datetime.now(timezone.utc).isoformat(),
                "interest": interest,
                "query_terms": interest.split(),
                "num_requested": num_papers,
                "num_selected": len(papers),
                "deduplication_strategy": "title",
                "source": "SemanticScholar",
                "log": log
            },
            "papers": papers
        }

        # Save to session-specific file to avoid concurrency conflicts
        out_dir = Path(__file__).parent.parent.parent / "outputs"
        out_dir.mkdir(exist_ok=True)
        file_name = f"{session_id}_abstracts.json" if session_id else "abstracts.json"
        out_path = out_dir / file_name
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)

        return json.dumps(output, indent=2)
