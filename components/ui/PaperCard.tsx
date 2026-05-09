"use client";

import { motion } from "framer-motion";

interface PaperCardProps {
  paper: {
    id: string;
    title: string;
    authors: string[];
    year: number;
    journal?: string;
    abstract: string;
    isOpenAccess: boolean;
    isPreprint?: boolean;
  };
  selected: boolean;
  onToggle: () => void;
  onRemove?: () => void;
}

export function PaperCard({ paper, selected, onToggle, onRemove }: PaperCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={`paper-card ${selected ? "selected" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, overflow: "hidden" }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={onToggle}
    >
      {/* Top badges row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {paper.isOpenAccess && (
            <span className="badge badge-teal">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Open Access
            </span>
          )}
          {paper.isPreprint && (
            <span className="badge badge-amber">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" fill="none" strokeWidth="2" />
              </svg>
              Preprint
            </span>
          )}
          <span className="badge" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            {paper.year}
          </span>
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[var(--accent-rose)] hover:text-white transition-all text-[var(--text-muted)]"
            aria-label="Remove paper"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="font-sans font-semibold text-sm leading-snug mb-2" style={{ color: "var(--text-primary)" }}>
        {paper.title}
      </h3>

      {/* Authors + journal */}
      <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
        {paper.authors.slice(0, 3).join(", ")}
        {paper.authors.length > 3 ? " et al." : ""}
        {paper.journal ? ` · ${paper.journal}` : ""}
      </p>

      {/* Abstract preview */}
      <div
        className="text-xs leading-relaxed overflow-hidden cursor-pointer"
        style={{ color: "var(--text-secondary)", maxHeight: expanded ? "none" : "3.6em" }}
      >
        <p>{paper.abstract}</p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="text-xs mt-2 font-sans font-semibold transition-colors"
        style={{ color: "var(--accent-primary)" }}
      >
        {expanded ? "Show less ↑" : "Read more ↓"}
      </button>

      {/* Selection indicator */}
      {selected && (
        <motion.div
          className="absolute top-3 right-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "var(--accent-primary)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M4 12l5 5 11-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Import useState
import { useState } from "react";
