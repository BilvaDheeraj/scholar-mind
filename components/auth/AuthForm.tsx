"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { KnowledgeGraph } from "@/components/ui/KnowledgeGraph";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate auth (demo mode)
    await new Promise((r) => setTimeout(r, 1200));

    if (email && password) {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } else {
      setError("Please fill in all fields.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Left panel — visual */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}>

        {/* Knowledge graph background */}
        <div className="absolute inset-0">
          <KnowledgeGraph />
        </div>

        {/* Overlay content */}
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--accent-primary)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl mb-3" style={{ color: "var(--text-primary)" }}>
              ScholarMind
            </h1>
            <p className="font-body text-base" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              From question to insight &mdash; in minutes.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              "Anti-hallucination verified citations",
              "7 specialized research agents",
              "Real-time synthesis transparency",
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-body"
                style={{ color: "var(--text-secondary)" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12l5 5 11-11" stroke="var(--accent-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {feat}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-primary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-sans font-bold text-lg" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              ScholarMind
            </span>
          </div>

          <h2 className="font-sans font-bold text-2xl mb-2" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="font-body text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            {mode === "login"
              ? "Sign in to continue your research."
              : "Start synthesizing research in minutes."}
          </p>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            {[
              { name: "Google", icon: <GoogleIcon /> },
              { name: "GitHub", icon: <GitHubIcon /> },
            ].map((provider) => (
              <motion.button
                key={provider.name}
                className="btn btn-ghost w-full justify-center gap-3 py-3"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {provider.icon}
                <span className="font-sans font-semibold text-sm">
                  Continue with {provider.name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="font-sans text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Form */}
          <AnimatePresence>
            {success ? (
              <motion.div
                key="success"
                className="flex flex-col items-center py-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(20,184,166,0.1)", border: "2px solid var(--accent-teal)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12l5 5 11-11" stroke="var(--accent-teal)" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ strokeDasharray: 30, strokeDashoffset: 0 }} />
                  </svg>
                </div>
                <p className="font-sans font-semibold" style={{ color: "var(--text-primary)" }}>
                  {mode === "login" ? "Welcome back!" : "Account created!"}
                </p>
                <p className="font-body text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Redirecting to dashboard...
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="floating-label-group">
                    <input
                      type="text"
                      id="name"
                      className={`input-field ${error ? "error" : ""}`}
                      placeholder=" "
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <label htmlFor="name">Full Name</label>
                  </div>
                )}

                <div className="floating-label-group">
                  <input
                    type="email"
                    id="email"
                    className={`input-field ${error ? "error" : ""}`}
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email">Email Address</label>
                </div>

                <div className="floating-label-group relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`input-field ${error ? "error" : ""}`}
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {error && (
                  <motion.p
                    className="font-sans text-sm"
                    style={{ color: "var(--accent-rose)" }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}

                {mode === "login" && (
                  <div className="flex justify-end">
                    <Link href="#" className="font-sans text-xs no-underline hover:underline"
                      style={{ color: "var(--accent-primary)" }}>
                      Forgot password?
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-full justify-center py-3.5 text-sm mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {mode === "login" ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    mode === "login" ? "Sign in →" : "Create account →"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Switch mode */}
          <p className="font-body text-sm text-center mt-6" style={{ color: "var(--text-secondary)" }}>
            {mode === "login" ? (
              <>Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-sans font-semibold no-underline" style={{ color: "var(--accent-primary)" }}>
                  Sign up free
                </Link>
              </>
            ) : (
              <>Already have an account?{" "}
                <Link href="/login" className="font-sans font-semibold no-underline" style={{ color: "var(--accent-primary)" }}>
                  Sign in
                </Link>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Icons
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
