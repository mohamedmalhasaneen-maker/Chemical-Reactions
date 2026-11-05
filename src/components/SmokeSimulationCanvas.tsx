import React, { useEffect, useRef } from "react";
import { Chemical, ReactionDetail, SimulationStatus } from "../types";

interface SmokeSimulationCanvasProps {
  activeReaction: ReactionDetail | null;
  isReactionPlaying: boolean;
  simulationStatus?: SimulationStatus;
  reactionProgress: number;
  currentTemp: number;
  selectedReactants: Chemical[];
}

interface PlumePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  tint: string;
}

export const SmokeSimulationCanvas: React.FC<SmokeSimulationCanvasProps> = ({
  activeReaction,
  isReactionPlaying,
  simulationStatus,
  currentTemp,
  selectedReactants,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const puffsRef = useRef<PlumePuff[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth || 260;
      canvas.height = canvas.offsetHeight || 160;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const isPaused = simulationStatus === "paused";

      const hasGasOrHeat =
        selectedReactants.length > 0 &&
        (currentTemp >= 52 ||
          Boolean(activeReaction?.hasGas) ||
          (isReactionPlaying && (activeReaction?.temperatureDelta || 0) > 15));

      if (!isPaused && hasGasOrHeat && puffsRef.current.length < 34 && Math.random() < 0.35) {
        // Tint gas plume scientifically (e.g. greenish-yellow for Cl₂, reddish-brown for NO₂, crisp steam otherwise)
        let tint = "226, 232, 240";
        const gasLabel = activeReaction?.gasType || "";
        if (gasLabel.includes("Cl₂") || gasLabel.includes("الكلور")) {
          tint = "163, 230, 53";
        } else if (gasLabel.includes("NO₂")) {
          tint = "251, 146, 60";
        } else if (activeReaction?.flameColor === "purple") {
          tint = "192, 132, 252";
        }

        puffsRef.current.push({
          x: w * 0.3 + Math.random() * (w * 0.4),
          y: h - 12,
          vx: (Math.random() - 0.5) * 0.55,
          vy: -(0.65 + Math.random() * 0.9),
          radius: 10 + Math.random() * 12,
          alpha: 0.28,
          life: 0,
          maxLife: 90 + Math.random() * 45,
          tint,
        });
      }

      const next: PlumePuff[] = [];
      for (const p of puffsRef.current) {
        if (!isPaused) {
          p.life += 1;
        }
        if (p.life >= p.maxLife) continue;

        if (!isPaused) {
          p.x += p.vx + Math.sin(p.life * 0.07) * 0.3;
          p.y += p.vy;
          p.radius += 0.22;
        }

        const progress = p.life / p.maxLife;
        const fade = Math.sin(progress * Math.PI) * p.alpha;

        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          p.radius * 0.1,
          p.x,
          p.y,
          p.radius
        );
        grad.addColorStop(0, `rgba(${p.tint}, ${fade.toFixed(3)})`);
        grad.addColorStop(1, `rgba(${p.tint}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        next.push(p);
      }

      puffsRef.current = next;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeReaction, isReactionPlaying, simulationStatus, currentTemp, selectedReactants]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute -top-28 inset-x-0 h-32 w-full z-20"
    />
  );
};
