"""
ScholarMind CrewAI Crew Definition
====================================
A multi-agent survey synthesis crew adapted from Draft_1_goog for
integration with the ScholarMind FastAPI backend.

Two usage modes:
  1. fetch_and_synthesize: Full pipeline — fetch papers from Semantic Scholar, then synthesize.
  2. synthesize_from_papers: Synthesis only — receives pre-fetched paper data (used when the
     user has already selected papers from the UI).
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from dotenv import load_dotenv

from agents.tools.custom_tool import SemanticScholarTool

load_dotenv()

# Config directory relative to this file
_CONFIG_DIR = Path(__file__).parent / "config"


@CrewBase
class ScholarMindCrew:
    """
    ScholarMind multi-agent survey synthesis crew.
    Agents are loaded from config/agents.yaml, tasks from config/tasks.yaml.
    """

    agents_config = str(_CONFIG_DIR / "agents.yaml")
    tasks_config = str(_CONFIG_DIR / "tasks.yaml")

    agents: List[BaseAgent]
    tasks: List[Task]

    # ── Agents ────────────────────────────────────────────────────────

    @agent
    def semantic_scholar_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["semantic_scholar_agent"],
            verbose=True,
            tools=[SemanticScholarTool()],
        )

    @agent
    def intro_scope_agent(self) -> Agent:
        return Agent(config=self.agents_config["intro_scope_agent"], verbose=True)

    @agent
    def dataset_agent(self) -> Agent:
        return Agent(config=self.agents_config["dataset_agent"], verbose=True)

    @agent
    def methods_results_agent(self) -> Agent:
        return Agent(config=self.agents_config["methods_results_agent"], verbose=True)

    @agent
    def challenges_gaps_future_agent(self) -> Agent:
        return Agent(config=self.agents_config["challenges_gaps_future_agent"], verbose=True)

    @agent
    def conclusion_references_agent(self) -> Agent:
        return Agent(config=self.agents_config["conclusion_references_agent"], verbose=True)

    @agent
    def merger_agent(self) -> Agent:
        return Agent(config=self.agents_config["merger_agent"], verbose=True)

    # ── Tasks ─────────────────────────────────────────────────────────

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config["research_task"])

    @task
    def intro_scope_task(self) -> Task:
        return Task(config=self.tasks_config["intro_scope_task"])

    @task
    def dataset_task(self) -> Task:
        return Task(config=self.tasks_config["dataset_task"])

    @task
    def methods_results_task(self) -> Task:
        return Task(config=self.tasks_config["methods_results_task"])

    @task
    def challenges_gaps_future_task(self) -> Task:
        return Task(config=self.tasks_config["challenges_gaps_future_task"])

    @task
    def conclusion_references_task(self) -> Task:
        return Task(config=self.tasks_config["conclusion_references_task"])

    @task
    def merge_task(self) -> Task:
        return Task(config=self.tasks_config["merge_task"])

    # ── Crew ──────────────────────────────────────────────────────────

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )


# ── Public API used by main.py ─────────────────────────────────────────

def run_synthesis_crew(
    interest: str,
    papers: List[Dict[str, Any]],
    session_id: str,
    num_papers: int = 10,
) -> str:
    """
    Run the writing crew using pre-fetched paper data (from the UI selection step).
    Skips the research_task (Semantic Scholar fetch) and goes straight to synthesis.

    Args:
        interest:   The user's research query string.
        papers:     List of paper dicts already selected and fetched by the UI flow.
        session_id: Unique session identifier for file isolation.
        num_papers: Number of papers (informational only for prompts).

    Returns:
        The final survey Markdown string.
    """
    papers_json = json.dumps(papers, indent=2, ensure_ascii=False)

    # Build a writing-only crew (no fetch step)
    c = ScholarMindCrew()
    writing_crew = Crew(
        agents=[
            c.intro_scope_agent(),
            c.dataset_agent(),
            c.methods_results_agent(),
            c.challenges_gaps_future_agent(),
            c.conclusion_references_agent(),
            c.merger_agent(),
        ],
        tasks=[
            c.intro_scope_task(),
            c.dataset_task(),
            c.methods_results_task(),
            c.challenges_gaps_future_task(),
            c.conclusion_references_task(),
            c.merge_task(),
        ],
        process=Process.sequential,
        verbose=True,
    )

    result = writing_crew.kickoff(
        inputs={
            "interest": interest,
            "session_id": session_id,
            "num_papers": num_papers,
            "papers_json": papers_json,
            # merge_task context will be filled by sequential outputs
            "intro_scope": "",
            "datasets": "",
            "methods_results": "",
            "challenges_gaps_future": "",
            "conclusion_references": "",
        }
    )

    survey_text = result.raw if hasattr(result, "raw") else str(result)

    # Persist to session-specific file
    out_dir = Path(__file__).parent.parent / "outputs"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / f"{session_id}_final_survey.md"
    out_path.write_text(survey_text, encoding="utf-8")

    return survey_text


def run_full_crew(
    interest: str,
    session_id: str,
    num_papers: int = 10,
) -> str:
    """
    Run the full crew pipeline including the Semantic Scholar fetch step.
    Used when the backend should auto-fetch papers without UI selection.

    Returns:
        The final survey Markdown string.
    """
    c = ScholarMindCrew()
    result = c.crew().kickoff(
        inputs={
            "interest": interest,
            "session_id": session_id,
            "num_papers": num_papers,
            "papers_json": "",  # populated by research_task output
            "intro_scope": "",
            "datasets": "",
            "methods_results": "",
            "challenges_gaps_future": "",
            "conclusion_references": "",
        }
    )

    survey_text = result.raw if hasattr(result, "raw") else str(result)

    out_dir = Path(__file__).parent.parent / "outputs"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / f"{session_id}_final_survey.md"
    out_path.write_text(survey_text, encoding="utf-8")

    return survey_text
