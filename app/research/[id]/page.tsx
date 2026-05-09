"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentStep, AgentStatus } from "@/components/ui/AgentStep";
import { PaperCard } from "@/components/ui/PaperCard";
import { KnowledgeGraph } from "@/components/ui/KnowledgeGraph";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Mock data ─────────────────────────────────────────────────────
const MOCK_PAPERS = [
  {
    id: "p1",
    title: "Highly Accurate Protein Structure Prediction with AlphaFold",
    authors: ["Jumper, J.", "Evans, R.", "Pritzel, A."],
    year: 2021,
    journal: "Nature",
    abstract:
      "Proteins are essential to life, and understanding their structure can facilitate a mechanistic understanding of their function. Through the development of AlphaFold, we have achieved a significant advance in protein structure prediction.",
    isOpenAccess: true,
    isPreprint: false,
  },
  {
    id: "p2",
    title: "Language Models are Few-Shot Learners",
    authors: ["Brown, T.", "Mann, B.", "Ryder, N.", "Subbiah, M."],
    year: 2020,
    journal: "NeurIPS",
    abstract:
      "We demonstrate that scaling language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches.",
    isOpenAccess: true,
    isPreprint: false,
  },
  {
    id: "p3",
    title: "Attention Is All You Need",
    authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
    year: 2017,
    journal: "NeurIPS",
    abstract:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.",
    isOpenAccess: true,
    isPreprint: false,
  },
  {
    id: "p4",
    title: "CRISPR-Cas9 for Medical Genetic Screens in Human Cells",
    authors: ["Shalem, O.", "Sanjana, N.", "Hartenian, E."],
    year: 2014,
    journal: "Science",
    abstract:
      "The ability to perturb genes systematically in human cells would facilitate the identification of genes underlying disease phenotypes and the development of novel therapeutics.",
    isOpenAccess: false,
    isPreprint: false,
  },
  {
    id: "p5",
    title: "mRNA-1273 SARS-CoV-2 Vaccine Efficacy",
    authors: ["Baden, L.", "El Sahly, H.", "Essink, B."],
    year: 2020,
    journal: "NEJM",
    abstract:
      "Messenger RNA–1273 is a lipid nanoparticle–encapsulated mRNA-based vaccine that encodes the prefusion stabilized full-length spike protein of SARS-CoV-2.",
    isOpenAccess: true,
    isPreprint: false,
  },
  {
    id: "p6",
    title: "Deep Residual Learning for Image Recognition",
    authors: ["He, K.", "Zhang, X.", "Ren, S.", "Sun, J."],
    year: 2016,
    journal: "CVPR",
    abstract:
      "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.",
    isOpenAccess: true,
    isPreprint: false,
  },
];

const AGENT_STEPS = [
  { label: "Data Acquisition", description: "Fetching papers from Semantic Scholar API..." },
  { label: "Context Setting", description: "Analyzing temporal evolution and research themes..." },
  { label: "Dataset Extraction", description: "Extracting key datasets and benchmarks..." },
  { label: "Methodology Analysis", description: "Comparing methodological approaches across papers..." },
  { label: "Gap & Challenges", description: "Identifying research gaps and open problems..." },
  { label: "Conclusion & References", description: "Synthesizing conclusions and formatting citations..." },
  { label: "Final Assembly", description: "Assembling full survey document..." },
];

const MOCK_SURVEY = `# Deep Learning in Protein Structure Prediction: A Comprehensive Survey

## Abstract

Recent advances in deep learning have revolutionized protein structure prediction, culminating in AlphaFold's near-experimental accuracy. This survey synthesizes 12 peer-reviewed papers spanning 2017–2024, examining methodological evolution, benchmark performance, and open research challenges.

## 1. Introduction

Protein structure determines function, and accurate prediction has been a grand challenge in computational biology for decades. The release of AlphaFold2 [1] in 2021 marked a paradigm shift, achieving median backbone accuracy below 1Å on CASP14 targets — comparable to experimental methods.

## 2. Background and Context

The field traces from early homology modeling to modern end-to-end deep learning approaches. Key milestones include:

- **RoseTTAFold** [2]: parallel architecture combining 1D, 2D, and 3D representations
- **ESMFold** [3]: sequence-only prediction via language model embeddings  
- **OmegaFold** [4]: single-sequence prediction without multiple sequence alignments

## 3. Methodology Analysis

### 3.1 Multiple Sequence Alignment Approaches

AlphaFold2 relies on evolutionary information encoded in MSAs. The Evoformer module processes:

1. MSA representation (N_seq × L × c_m)
2. Pair representation (L × L × c_z)
3. Iterative refinement via recycling

### 3.2 Sequence-Only Methods

ESMFold demonstrates that protein language models trained on 250M+ sequences implicitly encode structural information, enabling **2× faster** inference than MSA-based methods at 60–80% of AlphaFold2 accuracy [3].

## 4. Identified Research Gaps

Despite remarkable progress, critical challenges remain:

- **Conformational dynamics**: Current methods predict single static structures
- **Multi-state proteins**: Allosteric regulation and intrinsically disordered regions
- **Protein-protein interactions**: Complex structure prediction accuracy varies significantly
- **Small proteins & peptides**: Limited training data reduces accuracy for <50aa sequences

## 5. Conclusions

The field has achieved a solved problem for single-domain proteins under moderate evolutionary pressure. Future directions include dynamic structure prediction [1], structure-based drug design integration [2], and expanding to nucleic acid complexes.

## References

[1] Jumper et al. (2021). Highly accurate protein structure prediction with AlphaFold. *Nature*, 596, 583–589.  
[2] Baek et al. (2021). Accurate prediction of protein structures and interactions using a three-track neural network. *Science*, 373, 871–876.  
[3] Lin et al. (2023). Evolutionary-scale prediction of atomic-level protein structure with a language model. *Science*, 379, 1123–1130.
`;

// ─── Phase types ───────────────────────────────────────────────────
type Phase = "query" | "papers" | "agents" | "survey";

const PLACEHOLDER_QUERIES = [
  "Explore CRISPR delivery mechanisms...",
  "Survey transformer architectures in NLP...",
  "Review mRNA vaccine efficacy data...",
  "Latest advances in protein folding prediction...",
];

// ─── Research Session ──────────────────────────────────────────────
export default function ResearchSessionPage() {
  const [phase, setPhase] = useState<Phase>("query");
  const [query, setQuery] = useState("");
  const [selectedPapers, setSelectedPapers] = useState<string[]>(MOCK_PAPERS.map((p) => p.id));
  const [papers, setPapers] = useState(MOCK_PAPERS);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>(AGENT_STEPS.map(() => "pending"));
  const [agentProgress, setAgentProgress] = useState(0);
  const [thoughtStream, setThoughtStream] = useState("");
  const [activeStep, setActiveStep] = useState(-1);
  const [tocActive, setTocActive] = useState(0);
  const thoughtRef = useRef<HTMLDivElement>(null);

  const [phIdx, setPhIdx] = useState(0);

  useEffect(() => {
    const len = PLACEHOLDER_QUERIES.length;
    const interval = setInterval(() => {
      setPhIdx((i) => (i + 1) % len);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Run agent simulation
  useEffect(() => {
    if (phase !== "agents") return;

    let stepIdx = 0;
    const THOUGHTS = [
      "Initializing Semantic Scholar API connection...\nFetching top papers by citation count and relevance score...\nFound 47 candidate papers, filtering to top 12 by quality metrics...",
      "Analyzing publication timeline from 2017 to 2024...\nIdentifying key paradigm shifts: pre-deep-learning → CNN → Transformer-based approaches...\nClustering research themes: protein folding, structure prediction, drug discovery...",
      "Extracting datasets: CASP13, CASP14, PDB validation sets...\nBenchmark metrics: TM-score, RMSD, GDT-TS...\nIdentifying 8 unique benchmark suites across papers...",
      "Comparing methodology classes: MSA-based vs sequence-only...\nAlphaFold2 Evoformer: 48 blocks × (MSA row, column, outer product, triangle update)...\nESMFold: 48 × ESM-2 150B blocks → folding trunk...",
      "Research gap analysis: conformational dynamics, intrinsically disordered regions...\nIdentifying 3 major unsolved challenges...\nCross-referencing with future work sections of all 12 papers...",
      "Compiling reference list in APA format...\nGenerating citation network: 23 inter-paper citations detected...\nFormatting bibliography for LaTeX compatibility...",
      "Final document assembly in progress...\nGenerating executive abstract...\nApplying academic typographic conventions...\nDocument ready: 4,200 words, 12 references, 5 sections.",
    ];

    const runStep = () => {
      if (stepIdx >= AGENT_STEPS.length) {
        setPhase("survey");
        return;
      }

      // Activate current step
      setAgentStatuses((prev) => {
        const next = [...prev];
        next[stepIdx] = "active";
        return next;
      });
      setActiveStep(stepIdx);
      setThoughtStream("");

      // Stream thoughts character by character
      const thought = THOUGHTS[stepIdx];
      let charIdx = 0;
      const charInterval = setInterval(() => {
        charIdx++;
        setThoughtStream(thought.slice(0, charIdx));
        if (thoughtRef.current) {
          thoughtRef.current.scrollTop = thoughtRef.current.scrollHeight;
        }
        if (charIdx >= thought.length) {
          clearInterval(charInterval);
        }
      }, 18);

      // Complete after 2.8s
      setTimeout(() => {
        clearInterval(charInterval);
        setThoughtStream(thought);
        setAgentStatuses((prev) => {
          const next = [...prev];
          next[stepIdx] = "completed";
          return next;
        });
        setAgentProgress(((stepIdx + 1) / AGENT_STEPS.length) * 100);
        stepIdx++;
        setTimeout(runStep, 600);
      }, 2800);
    };

    const timer = setTimeout(runStep, 800);
    return () => clearTimeout(timer);
  }, [phase]);

  // ToC sections
  const TOC_SECTIONS = [
    "Abstract", "Introduction", "Background", "Methodology", "Research Gaps", "Conclusions", "References"
  ];

  const togglePaper = (id: string) => {
    setSelectedPapers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const removePaper = (id: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== id));
    setSelectedPapers((prev) => prev.filter((p) => p !== id));
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <AnimatePresence mode="wait">
        {/* ─── Phase 1: Query Input ─────────────────────────────── */}
        {phase === "query" && (
          <motion.div
            key="query"
            className="min-h-screen flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-sans font-semibold text-xs uppercase tracking-widest mb-3 text-center"
                  style={{ color: "var(--accent-primary)" }}>
                  New Research Session
                </p>
                <h1 className="font-serif text-center mb-8" style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "var(--text-primary)" }}>
                  What do you want to explore?
                </h1>

                <textarea
                  className="input-field w-full resize-none mb-4"
                  rows={4}
                  placeholder={PLACEHOLDER_QUERIES[phIdx]}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ fontFamily: "var(--font-instrument-serif)", fontSize: "20px", lineHeight: 1.5 }}
                />

                {/* Options */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-sm" style={{ color: "var(--text-secondary)" }}>Papers:</span>
                    <div className="flex gap-2">
                      {[5, 10, 20].map((n, i) => (
                        <button key={n}
                          className="px-3 py-1.5 rounded-full font-sans text-xs font-semibold border transition-all"
                          style={{
                            background: i === 1 ? "rgba(59,130,246,0.1)" : "transparent",
                            borderColor: i === 1 ? "var(--accent-primary)" : "var(--border)",
                            color: i === 1 ? "var(--accent-glow)" : "var(--text-muted)",
                          }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider" />
                    </label>
                    <span className="font-sans text-sm" style={{ color: "var(--text-secondary)" }}>Peer-reviewed only</span>
                  </div>
                </div>

                <motion.button
                  className="btn btn-primary w-full justify-center py-4 text-base"
                  onClick={() => {
                    if (!query.trim()) setQuery("Protein folding prediction using deep learning");
                    setPhase("papers");
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Begin Research →
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ─── Phase 2: Paper Selection ─────────────────────────── */}
        {phase === "papers" && (
          <motion.div
            key="papers"
            className="min-h-screen p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <button
                  onClick={() => setPhase("query")}
                  className="font-sans text-sm mb-4 flex items-center gap-2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back to query
                </button>
                <h2 className="font-serif text-2xl mb-2" style={{ color: "var(--text-primary)" }}>
                  We found {papers.length} papers. Review and confirm.
                </h2>
                <p className="font-body text-sm" style={{ color: "var(--text-secondary)" }}>
                  Remove irrelevant papers or add specific DOIs before synthesis begins.
                </p>
              </div>

              {/* Selection counter */}
              <div className="flex items-center justify-between mb-6 p-4 rounded-xl"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3">
                  <span className="font-sans font-bold text-lg" style={{ color: "var(--accent-primary)" }}>
                    {selectedPapers.length}
                  </span>
                  <span className="font-sans text-sm" style={{ color: "var(--text-secondary)" }}>
                    of {papers.length} papers selected
                  </span>
                </div>
                <div className="flex-1 mx-6">
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${(selectedPapers.length / papers.length) * 100}%` }} />
                  </div>
                </div>
                <motion.button
                  className="btn btn-primary px-6 py-2.5 text-sm"
                  onClick={() => setPhase("agents")}
                  animate={{
                    scale: selectedPapers.length >= 3 ? [1, 1.03, 1] : 1,
                  }}
                  transition={{ duration: 0.4, repeat: selectedPapers.length >= 3 ? 0 : 0 }}
                  disabled={selectedPapers.length < 3}
                >
                  Proceed to Synthesis →
                </motion.button>
              </div>

              {/* Papers grid */}
              <div className="grid md:grid-cols-2 gap-4 group">
                <AnimatePresence>
                  {papers.map((paper) => (
                    <PaperCard
                      key={paper.id}
                      paper={paper}
                      selected={selectedPapers.includes(paper.id)}
                      onToggle={() => togglePaper(paper.id)}
                      onRemove={() => removePaper(paper.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Phase 3: Agent Progress ──────────────────────────── */}
        {phase === "agents" && (
          <motion.div
            key="agents"
            className="min-h-screen flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background knowledge graph */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              <KnowledgeGraph />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, transparent, var(--bg-base))" }} />
            </div>

            <div className="relative z-10 flex flex-1 p-8 gap-8 max-w-7xl mx-auto w-full">
              {/* Agent Timeline */}
              <div className="w-72 flex-shrink-0">
                <div className="sticky top-8">
                  <div className="mb-6">
                    <h2 className="font-serif text-xl mb-1" style={{ color: "var(--text-primary)" }}>
                      Synthesizing...
                    </h2>
                    <p className="font-sans text-xs" style={{ color: "var(--text-secondary)" }}>
                      {agentProgress < 100 ? `${Math.round(agentProgress)}% complete` : "Complete!"}
                    </p>
                    <div className="progress-bar mt-3">
                      <motion.div
                        className="progress-bar-fill"
                        style={{ width: `${agentProgress}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>

                  <div className="space-y-0">
                    {AGENT_STEPS.map((step, i) => (
                      <AgentStep
                        key={step.label}
                        label={step.label}
                        status={agentStatuses[i]}
                        description={i === activeStep ? step.description : undefined}
                        isLast={i === AGENT_STEPS.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Thought stream */}
              <div className="flex-1">
                <div
                  className="rounded-2xl p-6 h-full"
                  style={{
                    background: "rgba(14,19,24,0.9)",
                    border: "1px solid var(--border)",
                    backdropFilter: "blur(20px)",
                    minHeight: "60vh",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent-teal)" }} />
                    <span className="font-mono text-xs font-medium" style={{ color: "var(--accent-teal)" }}>
                      Agent Live Stream
                    </span>
                    <span className="ml-auto font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {activeStep >= 0 ? AGENT_STEPS[activeStep]?.label : "Initializing..."}
                    </span>
                  </div>

                  <div
                    ref={thoughtRef}
                    className="font-mono text-sm leading-relaxed overflow-y-auto"
                    style={{
                      color: "var(--text-secondary)",
                      maxHeight: "calc(60vh - 80px)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {thoughtStream}
                    <span className="animate-pulse" style={{ color: "var(--accent-primary)" }}>▊</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Phase 4: Survey Output ───────────────────────────── */}
        {phase === "survey" && (
          <motion.div
            key="survey"
            className="min-h-screen flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Left: Table of Contents */}
            <aside className="w-64 flex-shrink-0 sticky top-0 h-screen overflow-auto p-6 border-r"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
              <p className="font-sans font-semibold text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--text-muted)" }}>
                Contents
              </p>
              {TOC_SECTIONS.map((section, i) => (
                <button
                  key={section}
                  className="w-full text-left px-3 py-2 rounded-lg mb-1 font-sans text-sm transition-all"
                  style={{
                    background: tocActive === i ? "rgba(59,130,246,0.08)" : "transparent",
                    color: tocActive === i ? "var(--accent-glow)" : "var(--text-secondary)",
                    borderLeft: tocActive === i ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  }}
                  onClick={() => setTocActive(i)}
                >
                  {section}
                </button>
              ))}
            </aside>

            {/* Center: Survey content */}
            <main className="flex-1 px-12 py-10 max-w-4xl">
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-8 p-3 rounded-xl sticky top-4 z-20 glass">
                <span className="badge badge-teal">Survey Complete</span>
                <div className="flex-1" />
                <button className="btn btn-ghost py-2 px-4 text-xs gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Export PDF
                </button>
                <button className="btn btn-ghost py-2 px-4 text-xs gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Share
                </button>
              </div>

              {/* Survey markdown */}
              <motion.div
                className="survey-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {MOCK_SURVEY}
                </ReactMarkdown>
              </motion.div>
            </main>

            {/* Right: Citations panel */}
            <aside className="w-72 flex-shrink-0 sticky top-0 h-screen overflow-auto p-6 border-l"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
              <p className="font-sans font-semibold text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--text-muted)" }}>
                References ({selectedPapers.length})
              </p>
              <div className="space-y-3">
                {papers.filter((p) => selectedPapers.includes(p.id)).map((paper, i) => (
                  <motion.div
                    key={paper.id}
                    className="p-3 rounded-xl cursor-pointer transition-all"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ borderColor: "var(--accent-primary)" }}
                  >
                    <p className="font-sans font-semibold text-xs mb-1 leading-snug" style={{ color: "var(--text-primary)" }}>
                      [{i + 1}] {paper.title}
                    </p>
                    <p className="font-sans text-xs" style={{ color: "var(--text-muted)" }}>
                      {paper.authors[0]}{paper.authors.length > 1 ? " et al." : ""} · {paper.year} · {paper.journal}
                    </p>
                  </motion.div>
                ))}
              </div>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
