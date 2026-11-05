import React, { useEffect, useRef } from "react";
import { Chemical, ReactionDetail, SimulationStatus } from "../types";

interface MolecularSimulationCanvasProps {
  reactants: Chemical[];
  activeReaction: ReactionDetail | null;
  isReactionPlaying: boolean;
  simulationStatus?: SimulationStatus;
  reactionProgress: number;
  stirSpeed: number;
  isStirring: boolean;
  temperature: number;
  viscosity?: number;
}

interface SimParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  label: string;
  isPrecipitate: boolean;
  isGasBubble: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  acid: "#fb7185",
  base: "#38bdf8",
  salt: "#34d399",
  metal: "#cbd5e1",
  indicator: "#f472b6",
  organic: "#a78bfa",
  oxidizer: "#fbbf24",
  other: "#60a5fa",
};

export const MolecularSimulationCanvas: React.FC<
  MolecularSimulationCanvasProps
> = ({
  reactants,
  activeReaction,
  isReactionPlaying,
  simulationStatus,
  reactionProgress,
  stirSpeed,
  isStirring,
  temperature,
  viscosity = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SimParticle[]>([]);

  // Rebuild particle ensemble whenever reactants or reaction result changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const width = canvas?.width || 280;
    const height = canvas?.height || 220;

    if (reactants.length === 0) {
      particlesRef.current = [];
      return;
    }

    const nextParticles: SimParticle[] = [];
    const perReagentCount = Math.max(8, Math.floor(28 / reactants.length));

    reactants.forEach((chem) => {
      const baseColor = CATEGORY_COLORS[chem.category] || "#60a5fa";
      const shortSymbol = chem.formula
        .replace(/\(.*?\)/g, "")
        .slice(0, 5);

      for (let i = 0; i < perReagentCount; i++) {
        nextParticles.push({
          x: 22 + Math.random() * Math.max(40, width - 44),
          y: 26 + Math.random() * Math.max(40, height - 52),
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4,
          radius: chem.state === "solid" ? 5.2 : 4.0,
          color: baseColor,
          label: shortSymbol,
          isPrecipitate: false,
          isGasBubble: false,
        });
      }
    });

    if (activeReaction?.hasPrecipitate) {
      const precipColor = activeReaction.precipitateColor || "#facc15";
      for (let i = 0; i < 16; i++) {
        nextParticles.push({
          x: 24 + Math.random() * Math.max(40, width - 48),
          y: height * 0.45 + Math.random() * (height * 0.45),
          vx: (Math.random() - 0.5) * 0.6,
          vy: 0.35 + Math.random() * 0.55,
          radius: 4.8,
          color: precipColor,
          label: "s↓",
          isPrecipitate: true,
          isGasBubble: false,
        });
      }
    }

    if (activeReaction?.hasGas) {
      const bubbleCount =
        activeReaction.bubblingRate === "explosive"
          ? 24
          : activeReaction.bubblingRate === "rapid"
          ? 16
          : 10;
      for (let i = 0; i < bubbleCount; i++) {
        nextParticles.push({
          x: 24 + Math.random() * Math.max(40, width - 48),
          y: 20 + Math.random() * Math.max(40, height - 30),
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(0.8 + Math.random() * 1.4),
          radius: 3.2 + Math.random() * 2.5,
          color: "rgba(224, 242, 254, 0.85)",
          label: "",
          isPrecipitate: false,
          isGasBubble: true,
        });
      }
    }

    particlesRef.current = nextParticles;
  }, [reactants, activeReaction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth || 260;
      canvas.height = canvas.offsetHeight || 200;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const isPaused = simulationStatus === "paused";

      // Kinetic speed factor governed by temperature (Kelvin-inspired scaling), stirrer, and viscosity
      const thermalFactor = Math.max(0.55, Math.min(2.8, (temperature + 15) / 38));
      const stirBoost = isStirring && !isPaused ? 1 + stirSpeed / 650 : 1;
      const damping = 1 / Math.max(1, Math.log10(viscosity + 9));
      const speedScale = isPaused
        ? 0
        : thermalFactor * stirBoost * damping * (isReactionPlaying ? 1.35 : 0.85);

      const particles = particlesRef.current;

      // Draw faint transient collision lines during active reaction
      if ((isReactionPlaying || activeReaction) && !isPaused) {
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          if (a.isGasBubble) continue;
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            if (b.isGasBubble) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 32) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${(
                (1 - dist / 32) *
                0.24
              ).toFixed(2)})`;
              ctx.lineWidth = 0.9;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      for (const p of particles) {
        if (p.isGasBubble) {
          p.y += p.vy * speedScale;
          p.x += Math.sin(p.y * 0.08) * 0.45;
          if (p.y < 6) {
            p.y = h - 10;
            p.x = 18 + Math.random() * Math.max(24, w - 36);
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
          ctx.lineWidth = 1.1;
          ctx.fillStyle = "rgba(224, 242, 254, 0.25)";
          ctx.fill();
          ctx.stroke();
          continue;
        }

        if (p.isPrecipitate) {
          const settleTarget = h - 14 - (p.radius + (p.x % 7));
          if (isStirring && stirSpeed > 350) {
            p.x += (Math.random() - 0.5) * 2.2;
            p.y += (Math.random() - 0.48) * 1.8;
          } else if (p.y < settleTarget && reactionProgress > 25) {
            p.y += p.vy * 0.9;
            p.x += Math.sin(p.y * 0.12) * 0.25;
          }
          p.x = Math.max(14, Math.min(w - 14, p.x));
          p.y = Math.max(16, Math.min(h - 10, p.y));

          // Crystalline diamond/circle particle
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.radius * 0.85, -p.radius * 0.85, p.radius * 1.7, p.radius * 1.7);
          ctx.restore();
          continue;
        }

        // Standard dissolved ion / molecule motion
        if (isStirring && stirSpeed > 0) {
          const centerX = w / 2;
          const dxFromCenter = p.x - centerX;
          p.vx += (-dxFromCenter * 0.0018 * stirSpeed) / 300;
        }

        p.x += p.vx * speedScale;
        p.y += p.vy * speedScale;

        if (p.x < 12 || p.x > w - 12) {
          p.vx *= -1;
          p.x = Math.max(12, Math.min(w - 12, p.x));
        }
        if (p.y < 14 || p.y > h - 14) {
          p.vy *= -1;
          p.y = Math.max(14, Math.min(h - 14, p.y));
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isReactionPlaying ? 6 : 2;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    activeReaction,
    isReactionPlaying,
    simulationStatus,
    reactionProgress,
    stirSpeed,
    isStirring,
    temperature,
    viscosity,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full z-10"
    />
  );
};
