import React, { useEffect, useRef } from "react";

interface HeroMolecularCanvasProps {
  isDark: boolean;
}

interface AtomNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  symbol: string;
  colorDark: string;
  colorLight: string;
}

const ATOM_PRESETS = [
  { symbol: "O", radius: 7.5, colorDark: "#38bdf8", colorLight: "#0284c7" },
  { symbol: "C", radius: 8.5, colorDark: "#818cf8", colorLight: "#4f46e5" },
  { symbol: "N", radius: 7.0, colorDark: "#22d3ee", colorLight: "#0891b2" },
  { symbol: "H", radius: 5.0, colorDark: "#94a3b8", colorLight: "#475569" },
  { symbol: "Mg", radius: 9.0, colorDark: "#a78bfa", colorLight: "#6d28d9" },
];

export const HeroMolecularCanvas: React.FC<HeroMolecularCanvasProps> = ({
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animId = 0;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 480);

    const nodeCount = width < 640 ? 18 : 30;
    const nodes: AtomNode[] = Array.from({ length: nodeCount }, (_, idx) => {
      const preset = ATOM_PRESETS[idx % ATOM_PRESETS.length];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.36,
        vy: (Math.random() - 0.5) * 0.36,
        radius: preset.radius,
        symbol: preset.symbol,
        colorDark: preset.colorDark,
        colorLight: preset.colorLight,
      };
    });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 800;
      height = canvas.height = canvas.offsetHeight || 480;
    };

    window.addEventListener("resize", handleResize);

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      const maxDist = width < 640 ? 115 : 148;

      // Update positions gently
      if (!prefersReducedMotion) {
        for (const node of nodes) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 16 || node.x > width - 16) node.vx *= -1;
          if (node.y < 16 || node.y > height - 16) node.vy *= -1;
        }
      }

      // Draw covalent bond lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isDark ? 0.26 : 0.18);
            ctx.strokeStyle = isDark
              ? `rgba(56, 189, 248, ${alpha.toFixed(3)})`
              : `rgba(37, 99, 235, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw atom spheres
      for (const node of nodes) {
        const fill = isDark ? node.colorDark : node.colorLight;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.1, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? "rgba(34, 211, 238, 0.06)"
          : "rgba(37, 99, 235, 0.05)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.globalAlpha = isDark ? 0.65 : 0.45;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-85"
    />
  );
};
