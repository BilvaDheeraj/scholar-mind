"use client";

import { motion, AnimatePresence } from "framer-motion";

export type AgentStatus = "pending" | "active" | "completed" | "failed";

interface AgentStepProps {
  label: string;
  status: AgentStatus;
  description?: string;
  isLast?: boolean;
}

export function AgentStep({ label, status, description, isLast }: AgentStepProps) {
  return (
    <div className="agent-step">
      {/* Indicator */}
      <div className="flex flex-col items-center">
        <div className={`agent-step-indicator ${status}`}>
          <AnimatePresence mode="wait">
            {status === "completed" && (
              <motion.svg
                key="check"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <path
                  className="check-svg"
                  d="M4 12l5 5 11-11"
                  stroke="var(--accent-teal)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
            {status === "active" && (
              <motion.div
                key="active"
                className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            {status === "pending" && (
              <div key="pending" className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]" />
            )}
            {status === "failed" && (
              <motion.svg
                key="fail"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <path d="M18 6L6 18M6 6l12 12" stroke="var(--accent-rose)" strokeWidth="2.5" strokeLinecap="round" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>

        {/* Connector line */}
        {!isLast && (
          <div className="w-px flex-1 min-h-[24px] mt-1 overflow-hidden" style={{ background: "var(--border)" }}>
            <motion.div
              className="w-full origin-top"
              style={{ background: "var(--accent-teal)" }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: status === "completed" ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pb-6 flex-1">
        <p
          className="font-sans font-semibold text-sm"
          style={{
            color:
              status === "active"
                ? "var(--accent-glow)"
                : status === "completed"
                ? "var(--accent-teal)"
                : status === "failed"
                ? "var(--accent-rose)"
                : "var(--text-muted)",
          }}
        >
          {label}
        </p>
        {description && status === "active" && (
          <motion.p
            className="text-xs mt-1 font-mono"
            style={{ color: "var(--text-secondary)" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  );
}
