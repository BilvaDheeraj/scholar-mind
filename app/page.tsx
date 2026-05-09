"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ParticleField } from "@/components/ui/ParticleField";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ─── Typewriter Hook ───────────────────────────────────────────────
function useTypewriter(texts: string[], speed = 50, pause = 2000) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(c => c + 1), speed);
    } else if (!isDeleting && charIndex === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(c => c - 1), speed / 2);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex(i => (i + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

  return charIndex <= texts[textIndex].length ? texts[textIndex].slice(0, charIndex) : "";
}

// ─── Scroll Reveal Hook ─────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return { ref, isInView };
}

// ─── Navbar ─────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
      style={{
        background: scrolled ? "rgba(8,11,16,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all 400ms ease",
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-primary)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="font-sans font-bold text-lg" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          ScholarMind
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {["Features", "Pricing", "Research"].map((item) => (
          <Link
            key={item}
            href={`#${item.toLowerCase()}`}
            className="font-sans text-sm font-medium transition-colors no-underline"
            style={{ color: "var(--text-secondary)" }}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* CTA row */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/login" className="btn btn-ghost px-4 py-2 text-sm hidden md:flex">
          Sign in
        </Link>
        <Link href="/signup" className="btn btn-primary px-4 py-2 text-sm">
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────
function HeroSection() {
  const demoTexts = [
    "What are the latest advances in protein folding?",
    "Survey transformer architectures in NLP...",
    "Explore CRISPR delivery mechanisms...",
    "Review mRNA vaccine efficacy data...",
  ];
  const typed = useTypewriter(demoTexts);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Background */}
      <ParticleField />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)", zIndex: 1 }}
      />

      {/* Perspective grid */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%) perspective(600px) rotateX(60deg)",
            width: "150%",
            height: "60%",
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.12,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-teal)] animate-pulse" />
          <span className="font-sans font-semibold text-xs text-[var(--accent-glow)] tracking-wider uppercase">
            AI Research Synthesis Platform
          </span>
        </motion.div>

        {/* Headline */}
        <div className="mb-6">
          {["Research that used to take weeks.", "Now takes ten minutes."].map((line, li) => (
            <motion.h1
              key={li}
              className="font-serif leading-tight"
              style={{
                fontSize: "clamp(42px, 7vw, 88px)",
                color: li === 1 ? "var(--accent-glow)" : "var(--text-primary)",
                display: "block",
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 + li * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {line}
            </motion.h1>
          ))}
        </div>

        {/* Sub-headline */}
        <motion.p
          className="font-body text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          ScholarMind orchestrates a team of AI agents to synthesize peer-reviewed
          literature into structured survey papers — automatically.
        </motion.p>

        {/* CTA Row */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Link href="/signup" className="btn btn-primary px-8 py-4 text-base gap-2">
            Start Researching Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button className="btn btn-ghost px-8 py-4 text-base gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" opacity="0.6" />
            </svg>
            Watch 90-second demo
          </button>
        </motion.div>

        {/* Demo input preview */}
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <div
            className="rounded-2xl p-4 text-left"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-rose)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-amber)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-teal)" }} />
              <span className="ml-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                scholarmind.ai
              </span>
            </div>
            <p className="font-mono text-sm" style={{ color: "var(--text-secondary)", minHeight: "1.5em" }}>
              <span style={{ color: "var(--accent-teal)" }}>→ </span>
              {typed}
              <span className="animate-pulse ml-0.5" style={{ color: "var(--accent-primary)" }}>|</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ zIndex: 10 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}

// ─── Social Proof Marquee ──────────────────────────────────────────
function SocialProofBar() {
  const institutions = [
    "MIT", "Stanford", "Oxford", "Max Planck Institute",
    "NIH", "WHO", "Harvard", "Cambridge", "ETH Zürich",
    "Johns Hopkins", "Caltech", "Tokyo University", "CERN",
  ];

  return (
    <div className="py-8 overflow-hidden border-y" style={{ borderColor: "var(--border)" }}>
      <p className="text-center font-sans text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--text-muted)" }}>
        Trusted by researchers at
      </p>
      <div className="marquee-container">
        <div className="marquee-track">
          {[...institutions, ...institutions].map((inst, i) => (
            <span
              key={i}
              className="inline-block px-8 font-sans font-semibold text-sm transition-all duration-300 hover:scale-110 hover:opacity-100 cursor-default"
              style={{ color: "var(--text-muted)", opacity: 0.5 }}
            >
              {inst}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Features Grid ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🛡️",
    title: "Anti-Hallucination Engine",
    desc: "Every claim is cross-referenced against actual paper content. No fabricated citations, ever.",
    color: "var(--accent-teal)",
    large: true,
  },
  {
    icon: "👁️",
    title: "Human-in-the-Loop Review",
    desc: "Audit every paper before synthesis. Full transparency into what the AI uses.",
    color: "var(--accent-primary)",
  },
  {
    icon: "🕸️",
    title: "Deep Agent Decomposition",
    desc: "7 specialized AI agents working in sequence — from data acquisition to final assembly.",
    color: "var(--accent-amber)",
  },
  {
    icon: "🔬",
    title: "Preprint Filtering",
    desc: "Flag preprints automatically. Focus on peer-reviewed work or include both — your choice.",
    color: "var(--accent-rose)",
  },
  {
    icon: "📡",
    title: "Real-time Progress Stream",
    desc: "Watch AI agent thoughts stream live. Full visibility into the synthesis process.",
    color: "var(--accent-glow)",
  },
  {
    icon: "📤",
    title: "One-click Export",
    desc: "Export as PDF, LaTeX, Markdown, or Word. Ready to submit in any academic format.",
    color: "var(--accent-teal)",
  },
];

function FeaturesGrid() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto" ref={ref}>
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="font-sans font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: "var(--accent-primary)" }}>
          Platform Features
        </p>
        <h2 className="font-serif" style={{ fontSize: "clamp(32px, 4vw, 52px)", color: "var(--text-primary)" }}>
          Everything you need for serious research
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            className={`card card-glow p-8 ${feature.large ? "md:row-span-1" : ""}`}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="text-3xl mb-5 w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: `${feature.color}18`, fontSize: "24px" }}
            >
              {feature.icon}
            </div>
            <h3 className="font-sans font-bold text-base mb-2" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {feature.title}
            </h3>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────
function HowItWorks() {
  const { ref, isInView } = useScrollReveal();

  const steps = [
    { num: "01", title: "Ask your question", desc: "Type any research question. Our system immediately understands scope and context." },
    { num: "02", title: "Review your papers", desc: "We fetch the top papers from Semantic Scholar. You audit and curate before synthesis." },
    { num: "03", title: "Watch agents work", desc: "7 AI agents analyze, synthesize, and structure — in real time, fully transparent." },
    { num: "04", title: "Get your survey", desc: "A publication-quality survey paper, fully cited, ready to export in any format." },
  ];

  return (
    <section className="py-24 px-6 md:px-12" style={{ background: "var(--bg-surface)" }}>
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="font-sans font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: "var(--accent-teal)" }}>
            How It Works
          </p>
          <h2 className="font-serif" style={{ fontSize: "clamp(32px, 4vw, 52px)", color: "var(--text-primary)" }}>
            From question to insight in 4 steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="flex gap-6 p-6 rounded-2xl"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="font-serif text-3xl font-bold flex-shrink-0"
                style={{ color: "var(--accent-primary)", opacity: 0.4, lineHeight: 1 }}
              >
                {step.num}
              </div>
              <div>
                <h3 className="font-sans font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>
                  {step.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ───────────────────────────────────────────────
function PricingSection() {
  const { ref, isInView } = useScrollReveal();

  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "For curious researchers",
      features: ["3 surveys/month", "Up to 10 papers", "PDF export", "30-day history"],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$19",
      per: "/month",
      desc: "For serious researchers",
      features: [
        "Unlimited surveys",
        "Up to 50 papers",
        "PDF + LaTeX + Word export",
        "1-year history",
        "Priority processing",
        "API access",
      ],
      cta: "Start Pro Trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For research teams",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "SSO + SAML",
        "Custom data retention",
        "Dedicated support",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 md:px-12 max-w-6xl mx-auto" ref={ref}>
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="font-sans font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: "var(--accent-amber)" }}>
          Pricing
        </p>
        <h2 className="font-serif" style={{ fontSize: "clamp(32px, 4vw, 52px)", color: "var(--text-primary)" }}>
          Invest in your research
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 items-center">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            className={`rounded-2xl p-8 ${plan.highlight ? "animate-glow-pulse" : ""}`}
            style={{
              background: plan.highlight ? "var(--bg-elevated)" : "var(--bg-surface)",
              border: plan.highlight ? "1px solid var(--accent-primary)" : "1px solid var(--border)",
              transform: plan.highlight ? "scale(1.05)" : "scale(1)",
              boxShadow: plan.highlight ? "var(--shadow-glow)" : "none",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            {plan.highlight && (
              <div className="badge badge-blue mb-4">Most Popular</div>
            )}
            <p className="font-sans font-bold text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
              {plan.name}
            </p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-serif" style={{ fontSize: "2.5rem", color: "var(--text-primary)" }}>
                {plan.price}
              </span>
              {plan.per && (
                <span className="font-sans text-sm" style={{ color: "var(--text-muted)" }}>{plan.per}</span>
              )}
            </div>
            <p className="font-body text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              {plan.desc}
            </p>

            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12l5 5 11-11" stroke="var(--accent-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={`btn w-full justify-center ${plan.highlight ? "btn-primary" : "btn-ghost"}`}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────
function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Changelog", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy", "Terms", "Cookie Policy", "GDPR"],
  };

  return (
    <footer className="border-t py-16 px-6 md:px-12" style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-primary)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-sans font-bold text-base" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                ScholarMind
              </span>
            </div>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-secondary)", maxWidth: "240px" }}>
              From question to insight &mdash; in minutes. Built for the world&apos;s researchers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p className="font-sans font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
                {section}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="font-body text-sm transition-colors no-underline hover:underline"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4"
          style={{ borderTop: "1px solid var(--border)" }}>
          <p className="font-sans text-xs" style={{ color: "var(--text-muted)" }}>
            ScholarMind &copy; 2025 &middot; Built with &hearts; for the global research community
          </p>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ───────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <FeaturesGrid />
      <HowItWorks />
      <PricingSection />
      <Footer />
    </main>
  );
}
