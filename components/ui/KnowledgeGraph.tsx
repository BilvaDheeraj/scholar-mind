"use client";

import { useEffect, useRef } from "react";

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  glow: boolean;
  glowIntensity: number;
  label?: string;
  pulsePhase: number;
}

interface Edge {
  source: string;
  target: string;
  opacity: number;
}

interface KnowledgeGraphProps {
  className?: string;
}

export function KnowledgeGraph({ className = "" }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize nodes
    const nodeCount = 18;
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 4 + 3,
      glow: i < 3,
      glowIntensity: 0,
      label: i < 8 ? ["BERT", "GPT-4", "AlphaFold", "CRISPR", "mRNA", "Transformer", "Attention", "LoRA"][i] : undefined,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Initialize edges
    const edges: Edge[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < 0.2) {
          edges.push({ source: nodes[i].id, target: nodes[j].id, opacity: Math.random() * 0.4 + 0.1 });
        }
      }
    }

    nodesRef.current = nodes;
    edgesRef.current = edges;

    const getColor = (alpha: number) => `rgba(59, 130, 246, ${alpha})`;
    const getTealColor = (alpha: number) => `rgba(20, 184, 166, ${alpha})`;

    const animate = () => {
      if (!canvas || !ctx) return;
      timeRef.current += 0.016;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update physics
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls with padding
        const pad = 40;
        if (node.x < pad || node.x > canvas.width - pad) node.vx *= -1;
        if (node.y < pad || node.y > canvas.height - pad) node.vy *= -1;

        // Clamp
        node.x = Math.max(pad, Math.min(canvas.width - pad, node.x));
        node.y = Math.max(pad, Math.min(canvas.height - pad, node.y));

        // Update glow intensity
        node.glowIntensity += (node.glow ? 1 : 0 - node.glowIntensity) * 0.05;
      });

      // Draw edges
      edges.forEach((edge) => {
        const src = nodes.find((n) => n.id === edge.source);
        const tgt = nodes.find((n) => n.id === edge.target);
        if (!src || !tgt) return;

        const dist = Math.hypot(tgt.x - src.x, tgt.y - src.y);
        if (dist > 200) return;

        const alpha = edge.opacity * (1 - dist / 200);
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = getColor(alpha);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const pulse = Math.sin(timeRef.current * 2 + node.pulsePhase) * 0.5 + 0.5;
        const isActive = node.glow;

        if (isActive) {
          // Outer glow ring
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4);
          gradient.addColorStop(0, getTealColor(0.3 * pulse));
          gradient.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? getTealColor(0.8 + pulse * 0.2) : getColor(0.4 + pulse * 0.1);
        ctx.fill();

        // Label
        if (node.label && node.radius > 5) {
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillStyle = isActive ? "rgba(20,184,166,0.8)" : "rgba(136,153,170,0.6)";
          ctx.textAlign = "center";
          ctx.fillText(node.label, node.x, node.y + node.radius + 12);
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Rotate which nodes are "active" every 2.5s
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      nodes.forEach((n) => (n.glow = false));
      for (let i = 0; i < count; i++) {
        nodes[Math.floor(Math.random() * nodes.length)].glow = true;
      }
    }, 2500);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ opacity: 0.7 }}
    />
  );
}
