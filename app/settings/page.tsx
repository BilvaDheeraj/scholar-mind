"use client";

import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}>
        <h1 className="font-sans font-bold text-xl" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Settings
        </h1>
        <p className="font-body text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Manage your account, preferences, and API keys.
        </p>
      </div>

      <div className="max-w-3xl mx-auto p-8 space-y-6">
        {/* Profile */}
        <SettingsSection title="Profile" icon="👤">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-sans text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "var(--text-muted)" }}>Full Name</label>
              <input className="input-field" defaultValue="Researcher" />
            </div>
            <div>
              <label className="font-sans text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "var(--text-muted)" }}>Email</label>
              <input className="input-field" defaultValue="researcher@university.edu" type="email" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="btn btn-primary px-5 py-2 text-sm">Save Changes</button>
          </div>
        </SettingsSection>

        {/* Theme preference */}
        <SettingsSection title="Preferences" icon="🎨">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Theme</p>
              <p className="font-body text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Choose your preferred display mode.
              </p>
            </div>
            <div className="flex gap-2">
              {["Light", "System", "Dark"].map((t, i) => (
                <button key={t}
                  className="px-4 py-2 rounded-lg font-sans text-xs font-semibold border transition-all"
                  style={{
                    background: i === 2 ? "rgba(59,130,246,0.1)" : "transparent",
                    borderColor: i === 2 ? "var(--accent-primary)" : "var(--border)",
                    color: i === 2 ? "var(--accent-glow)" : "var(--text-secondary)",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="divider my-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-semibold text-sm" style={{ color: "var(--text-primary)" }}>LLM Query Logging</p>
              <p className="font-body text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Opt out of query logging for GDPR compliance.
              </p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="toggle-slider" />
            </label>
          </div>
        </SettingsSection>

        {/* API Keys */}
        <SettingsSection title="API Keys" icon="🔑">
          <ApiKeyRow label="ScholarMind API Key" keyValue="sm_live_••••••••••••••••4f2a" />
          <div className="divider my-4" />
          <ApiKeyRow label="Anthropic API Key (Claude)" keyValue="sk-ant-••••••••••••••••••••••••" />
          <div className="divider my-4" />
          <ApiKeyRow label="Semantic Scholar API Key" keyValue="Optional — free tier available" />
        </SettingsSection>

        {/* Billing */}
        <SettingsSection title="Billing" icon="💳">
          <div className="p-4 rounded-xl mb-4"
            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-sans font-bold text-sm" style={{ color: "var(--text-primary)" }}>Free Plan</p>
                <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>3 surveys/month · 10 papers max</p>
              </div>
              <button className="btn btn-primary px-4 py-2 text-xs">Upgrade to Pro</button>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Surveys Used", used: 4, total: 3, overage: true },
              { label: "Papers Analyzed This Month", used: 53, total: 30, overage: true },
            ].map((meter) => (
              <div key={meter.label}>
                <div className="flex justify-between mb-1">
                  <span className="font-sans text-xs" style={{ color: "var(--text-secondary)" }}>{meter.label}</span>
                  <span className="font-sans text-xs font-semibold"
                    style={{ color: meter.overage ? "var(--accent-amber)" : "var(--text-primary)" }}>
                    {meter.used} / {meter.total}
                  </span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, (meter.used / meter.total) * 100)}%`,
                      background: meter.overage
                        ? "linear-gradient(90deg, var(--accent-amber), var(--accent-rose))"
                        : "linear-gradient(90deg, var(--accent-primary), var(--accent-teal))",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (meter.used / meter.total) * 100)}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title="Danger Zone" icon="⚠️" danger>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Download My Data</p>
              <p className="font-body text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Export all your research sessions and surveys (GDPR).
              </p>
            </div>
            <button className="btn btn-ghost px-4 py-2 text-sm">Download</button>
          </div>
          <div className="divider my-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-semibold text-sm" style={{ color: "var(--accent-rose)" }}>Delete Account</p>
              <p className="font-body text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Permanently delete your account and all data.
              </p>
            </div>
            <button className="btn btn-danger px-4 py-2 text-sm">Delete Account</button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────
function SettingsSection({
  title, icon, children, danger = false
}: {
  title: string; icon: string; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <motion.div
      className="rounded-2xl p-6"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${danger ? "rgba(244,63,94,0.3)" : "var(--border)"}`,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-lg">{icon}</span>
        <h2 className="font-sans font-bold text-base" style={{
          color: danger ? "var(--accent-rose)" : "var(--text-primary)",
          letterSpacing: "-0.02em"
        }}>
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

function ApiKeyRow({ label, keyValue }: { label: string; keyValue: string }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(keyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <div className="flex items-center gap-2">
        <div className="input-field flex-1 font-mono text-sm flex items-center"
          style={{ color: "var(--text-secondary)" }}>
          {visible ? keyValue : keyValue.replace(/[^•·]/g, (c) => c === "•" ? "•" : "•")}
        </div>
        <button onClick={() => setVisible(!visible)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          {visible ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </button>
        <button onClick={handleCopy}
          className="btn btn-ghost py-2 px-3 text-xs"
          style={{ minWidth: "70px" }}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
