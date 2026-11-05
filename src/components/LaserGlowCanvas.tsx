import React, { useEffect, useRef } from "react";
import { Chemical, ReactionDetail, SimulationStatus } from "../types";

interface LaserGlowCanvasProps {
  activeReaction: ReactionDetail | null;
  isReactionPlaying: boolean;
  simulationStatus?: SimulationStatus;
  reactionProgress: number;
  selectedReactants: Chemical[];
}

export const LaserGlowCanvas: React.FC<LaserGlowCanvasProps> = ({
  activeReaction,
  isReactionPlaying,
  simulationStatus,
  reactionProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let phase = 0;

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

      const shouldGlow =
        isReactionPlaying ||
        isPaused ||
        (activeReaction &&
          (activeReaction.flameColor !== "none" ||
            activeReaction.reactionType === "exothermic" ||
            activeReaction.reactionType === "redox" ||
            activeReaction.reactionType === "dangerous"));

      if (shouldGlow && activeReaction) {
        if (!isPaused) {
          phase += 0.055;
        }
        let rgb = "56, 189, 248";
        if (activeReaction.flameColor === "yellow") rgb = "250, 204, 21";
        else if (activeReaction.flameColor === "purple") rgb = "192, 132, 252";
        else if (activeReaction.flameColor === "green") rgb = "52, 211, 153";
        else if (activeReaction.flameColor === "red") rgb = "251, 113, 133";
        else if (activeReaction.reactionType === "exothermic")
          rgb = "251, 146, 60";

        const pulse =
          (0.16 + Math.sin(phase) * 0.06) *
          (isReactionPlaying ? 1.25 : Math.max(0.4, 1 - reactionProgress / 160));

        const grad = ctx.createRadialGradient(
          w / 2,
          h * 0.62,
          8,
          w / 2,
          h * 0.62,
          Math.max(w, h) * 0.65
        );
        grad.addColorStop(0, `rgba(${rgb}, ${pulse.toFixed(3)})`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeReaction, isReactionPlaying, simulationStatus, reactionProgress]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full z-0"
    />
  );
};
