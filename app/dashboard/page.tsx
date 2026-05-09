"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

const RECENT_SURVEYS = [
  { id: "1", title: "Protein Folding Prediction via Deep Learning", date: "May 8, 2025", papers: 12, status: "completed" },
  { id: "2", title: "Transformer Architectures in NLP: 2024 Survey", date: "May 7, 2025", papers: 18, status: "completed" },
  { id: "3", title: "CRISPR Delivery Mechanisms: Recent Advances", date: "May 6, 2025", papers: 8, status: "processing" },
  { id: "4", title: "mRNA Vaccine Efficacy: Meta-Analysis", date: "May 4, 2025", papers: 15, status: "completed" },
];

const PLACEHOLDER_QUERIES = [
  "What are the latest advances in quantum computing?",
  "Survey diffusion models in image synthesis...",
  "Review federated learning for healthcare...",
  "Explore graph neural networks in drug discovery...",
];

const STATS = [
  { label: "Surveys Created", value: "4", icon: "📄", color: "var(--accent-primary)" },
  { label: "Papers Analyzed", value: "53", icon: "🔬", color: "var(--accent-teal)" },
  { label: "Hours Saved", value: "~40h", icon: "⏱️", color: "var(--accent-amber)" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Cycle placeholder on focus
  const cyclePlaceholder = () => {
    setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_QUERIES.length);
  };

  const handleStart = () => {
    if (query.trim()) {
      // In production, create session then redirect
      router.push(`/research/demo`);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
          Good morning, Researcher 👋
        </h1>
        <p className="font-body" style={{ color: "var(--text-secondary)" }}>
          What are you curious about today?
        </p>
      </motion.div>

      {/* Quick Start Card */}
      <motion.div
        className="rounded-2xl p-8 mb-8"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-glow)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p className="font-sans font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: "var(--accent-primary)" }}>
          New Research
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="input-field flex-1 text-base"
            placeholder={PLACEHOLDER_QUERIES[placeholderIdx]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={cyclePlaceholder}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            style={{ fontFamily: "var(--font-instrument-serif)", fontSize: "17px" }}
          />
          <motion.button
            className="btn btn-primary px-6 py-3 whitespace-nowrap"
            onClick={handleStart}
            whileTap={{ scale: 0.96 }}
          >
            Begin Research →
          </motion.button>
        </div>

        {/* Options row */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs" style={{ color: "var(--text-secondary)" }}>Papers:</span>
            {[5, 10, 20].map((n) => (
              <button
                key={n}
                className="px-3 py-1 rounded-full font-sans text-xs font-semibold border transition-all"
                style={{
                  background: n === 10 ? "rgba(59,130,246,0.1)" : "transparent",
                  borderColor: n === 10 ? "var(--accent-primary)" : "var(--border)",
                  color: n === 10 ? "var(--accent-glow)" : "var(--text-muted)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
            <span className="font-sans text-xs" style={{ color: "var(--text-secondary)" }}>Peer-reviewed only</span>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="rounded-xl p-5 text-center"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="font-sans font-bold text-2xl mb-1" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="font-sans text-xs" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Surveys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-bold text-base" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Recent Research
          </h2>
          <Link href="/dashboard/history" className="font-sans text-xs font-semibold no-underline"
            style={{ color: "var(--accent-primary)" }}>
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {RECENT_SURVEYS.map((survey, i) => (
            <motion.div
              key={survey.id}
              className="flex items-center justify-between p-4 rounded-xl group cursor-pointer"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.05 }}
              whileHover={{ x: 4, borderColor: "rgba(59,130,246,0.3)" }}
              onClick={() => router.push(`/research/${survey.id}`)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--bg-elevated)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--accent-primary)" strokeWidth="2" />
                    <polyline points="14 2 14 8 20 8" stroke="var(--accent-primary)" strokeWidth="2" />
                    <line x1="16" y1="13" x2="8" y2="13" stroke="var(--accent-primary)" strokeWidth="2" />
                    <line x1="16" y1="17" x2="8" y2="17" stroke="var(--accent-primary)" strokeWidth="2" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-sans font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {survey.title}
                  </p>
                  <p className="font-sans text-xs" style={{ color: "var(--text-muted)" }}>
                    {survey.date} · {survey.papers} papers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`badge ${
                  survey.status === "completed" ? "badge-teal" :
                  survey.status === "processing" ? "badge-blue" : "badge-rose"
                }`}>
                  {survey.status === "processing" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1" />
                  )}
                  {survey.status}
                </span>
                <svg
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  style={{ color: "var(--text-muted)" }}
                >
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
