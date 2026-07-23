/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { Chemical, ReactionDetail } from "../types";

interface LaserGlowCanvasProps {
  activeReaction: ReactionDetail | null;
  isReactionPlaying: boolean;
  reactionProgress: number;
  selectedReactants: Chemical[];
}

interface ElectronParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  speed: number;
  alpha: number;
  scale: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

interface LaserBeam {
  x: number;
  targetWidth: number;
  currentWidth: number;
  intensity: number;
  color: string;
  glowColor: string;
  speed: number;
}

// Function to check if the reaction is active redox / electron-transfer
const checkIsActiveRedox = (
  activeReaction: ReactionDetail | null,
  isReactionPlaying: boolean,
  reactionProgress: number,
  reactants: Chemical[]
) => {
  if (!activeReaction || !isReactionPlaying || reactionProgress <= 0 || reactionProgress >= 100) {
    return { isRedox: false, level: "none" as const };
  }

  const reactantIds = reactants.map((r) => r.id);
  const reactantCategories = reactants.map((r) => r.category);

  // Redox Indicators:
  // 1. Involves active alkali metals (Sodium + H2O) -> highly violent electron transfer!
  const isSodiumWater = reactantIds.includes("na_metal") && reactantIds.includes("h2o");

  // 2. Acid reacting with active metal (HCl + Magnesium Ribbon) -> metal is oxidized, protons reduced!
  const isMetalAcid = reactantCategories.includes("metal") && reactantCategories.includes("acid");

  // 3. Hydrogen peroxide catalytic decomposition (H2O2 + KI) -> dynamic oxygen/iodide redox cycles!
  const isPeroxideRedox = reactantIds.includes("h2o2") && reactantIds.includes("ki");

  const isDisplacement = activeReaction.reactionType === "displacement";

  const isRedox = isSodiumWater || isMetalAcid || isPeroxideRedox || isDisplacement;

  if (isRedox) {
    if (activeReaction.dangerLevel === "extreme" || activeReaction.bubblingRate === "explosive" || isSodiumWater) {
      return { isRedox: true, level: "extreme" as const, type: isSodiumWater ? "sodium" : "general" };
    }
    if (activeReaction.dangerLevel === "hazard" || activeReaction.bubblingRate === "rapid" || isMetalAcid || isPeroxideRedox) {
      return { isRedox: true, level: "high" as const, type: isMetalAcid ? "magnesium" : isPeroxideRedox ? "peroxide" : "general" };
    }
    return { isRedox: true, level: "moderate" as const, type: "general" };
  }

  return { isRedox: false, level: "none" as const };
};

export default function LaserGlowCanvas({
  activeReaction,
  isReactionPlaying,
  reactionProgress,
  selectedReactants,
}: LaserGlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const electronsRef = useRef<ElectronParticle[]>([]);
  const beamsRef = useRef<LaserBeam[]>([]);
  const particleIdCounter = useRef<number>(0);
  const animationFrameId = useRef<number>(0);

  // Store state refs to read at 60 FPS without breaking HMR or React loops
  const stateRef = useRef({
    activeReaction,
    isReactionPlaying,
    reactionProgress,
    selectedReactants,
  });

  useEffect(() => {
    stateRef.current = {
      activeReaction,
      isReactionPlaying,
      reactionProgress,
      selectedReactants,
    };
  }, [activeReaction, isReactionPlaying, reactionProgress, selectedReactants]);

  // Initialize laser beam slots if not already initialized
  const initBeams = (width: number) => {
    if (beamsRef.current.length > 0) return;
    const beamCount = 6;
    const items: LaserBeam[] = [];
    for (let i = 0; i < beamCount; i++) {
      // Space beams horizontally across Beaker core
      const xRatio = 0.18 + (i / (beamCount - 1)) * 0.64; // central 64% of beaker
      items.push({
        x: xRatio,
        targetWidth: 1.5 + Math.random() * 2,
        currentWidth: 0,
        intensity: 0,
        color: "rgba(255, 255, 255, 0.95)",
        glowColor: "rgba(6, 182, 212, 1)", // Default cyan electron glow
        speed: 0.1 + Math.random() * 0.15,
      });
    }
    beamsRef.current = items;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    initBeams(width);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Capture geometry of the beaker glass vessel relative to canvas parent
    const getBeakerDimensions = () => {
      const glassElem = document.getElementById("glass-vessel");
      const parentElem = canvas.parentElement;
      if (!glassElem || !parentElem) return null;

      const glassRect = glassElem.getBoundingClientRect();
      const parentRect = parentElem.getBoundingClientRect();

      return {
        left: glassRect.left - parentRect.left,
        top: glassRect.top - parentRect.top,
        width: glassRect.width,
        height: glassRect.height,
      };
    };

    let pulseCycle = 0;

    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);
      pulseCycle += 0.08;

      const geom = getBeakerDimensions();
      if (!geom) {
        animationFrameId.current = requestAnimationFrame(renderLoop);
        return;
      }

      const { 
        activeReaction: curReaction, 
        isReactionPlaying: curPlaying, 
        reactionProgress: curProgress, 
        selectedReactants: curReactants 
      } = stateRef.current;

      const redoxState = checkIsActiveRedox(curReaction, curPlaying, curProgress, curReactants);

      if (redoxState.isRedox) {
        const { left, top, width: beakerW, height: beakerH } = geom;

        // Fluid volume coordinate bounds
        const fillLevel = Math.min(25 + curReactants.length * 15, 80) / 100;
        const fluidBottomY = top + beakerH - 12; // slightly above glass edge
        const fluidTopY = top + beakerH * (1 - fillLevel);
        const fluidHeight = fluidBottomY - fluidTopY;

        // Custom scheme for each reaction archetype
        let coreGlowColor = "rgba(6, 182, 212, 1)"; // cyan laser
        let secondaryGlowColor = "rgba(14, 116, 144, 0.4)";
        let textLabel = "انتقال الإلكترونات • e⁻ Transfer";

        if (redoxState.type === "sodium") {
          coreGlowColor = "rgba(168, 85, 247, 1)"; // Electric purple/magenta
          secondaryGlowColor = "rgba(244, 63, 94, 0.5)"; // violent red-violet corona
          textLabel = "أكسدة واختزال عنيفة ⚡ Violent Redox";
        } else if (redoxState.type === "magnesium") {
          coreGlowColor = "rgba(20, 184, 166, 1)"; // teal neon
          secondaryGlowColor = "rgba(45, 212, 191, 0.4)";
          textLabel = "إزاحة فلزية (انتقال إلكترونات e⁻)";
        } else if (redoxState.type === "peroxide") {
          coreGlowColor = "rgba(249, 115, 22, 1)"; // Bright hot orange laser
          secondaryGlowColor = "rgba(239, 68, 68, 0.4)";
          textLabel = "تحلل محفّز (أكسدة واختزال للأكسجين)";
        }

        // Draw a majestic neon laser bar/beam glowing base at the very bottom curved rim
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = coreGlowColor;
        
        const gradientBase = ctx.createLinearGradient(left, fluidBottomY, left, fluidBottomY - 18);
        gradientBase.addColorStop(0, coreGlowColor.replace(", 1)", ", 0.75)"));
        gradientBase.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradientBase;
        // Draw matched curve matching beaker bottom
        ctx.beginPath();
        ctx.moveTo(left + 6, fluidBottomY - 14);
        ctx.quadraticCurveTo(left + beakerW / 2, fluidBottomY + 4, left + beakerW - 6, fluidBottomY - 14);
        ctx.lineTo(left + beakerW - 6, fluidBottomY);
        ctx.quadraticCurveTo(left + beakerW / 2, fluidBottomY + 14, left + 6, fluidBottomY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Animate and render Laser Beams
        beamsRef.current.forEach((beam) => {
          // Slowly oscillate target width to make it dynamic
          beam.targetWidth = (redoxState.level === "extreme" ? 3.2 : 2.0) + Math.sin(pulseCycle + beam.x * 20) * 1.25;
          beam.currentWidth += (beam.targetWidth - beam.currentWidth) * 0.15;

          // Increase intensity
          beam.intensity += (1.0 - beam.intensity) * 0.08;

          const beamX = left + 14 + beam.x * (beakerW - 28);

          // Draw neon outer glow band with full blurring
          ctx.save();
          ctx.strokeStyle = coreGlowColor.replace(", 1)", `, ${0.45 * beam.intensity}`) ;
          ctx.lineWidth = beam.currentWidth * 3.8;
          ctx.shadowBlur = 10;
          ctx.shadowColor = coreGlowColor;
          ctx.beginPath();
          ctx.moveTo(beamX, fluidBottomY);
          ctx.lineTo(beamX, fluidTopY);
          ctx.stroke();
          ctx.restore();

          // Draw intense white-hot laser core line
          ctx.strokeStyle = "rgba(255, 255, 255, 0.96)";
          ctx.lineWidth = beam.currentWidth * 0.9;
          ctx.beginPath();
          ctx.moveTo(beamX, fluidBottomY);
          ctx.lineTo(beamX, fluidTopY);
          ctx.stroke();
        });

        // Spawn glowing electron particles e⁻ at the base to travel up
        const spawnProbability = redoxState.level === "extreme" ? 0.44 : 0.22;
        if (Math.random() < spawnProbability) {
          const spawnXOffsetRatio = 0.15 + Math.random() * 0.7; // distributed in central base
          const spawnX = left + 12 + spawnXOffsetRatio * (beakerW - 24);
          const speed = 1.6 + Math.random() * 2.3;

          electronsRef.current.push({
            id: ++particleIdCounter.current,
            x: spawnX,
            y: fluidBottomY - 4,
            vx: 0,
            vy: -speed,
            baseX: spawnX,
            speed: speed,
            alpha: 1.0,
            scale: 0.75 + Math.random() * 0.5,
            amplitude: 4 + Math.random() * 8,
            frequency: 0.04 + Math.random() * 0.06,
            phase: Math.random() * Math.PI * 2,
          });
        }

        // Draw and update travelling electrons
        electronsRef.current = electronsRef.current.filter((electron) => {
          electron.y += electron.vy;
          
          // Sinusoidal wave oscillation horizontally around its beam track to feel fluid
          electron.phase += electron.frequency;
          electron.x = electron.baseX + Math.sin(electron.phase) * electron.amplitude;

          // Fade out as it nears the surface of the fluid
          const relativeY = (electron.y - fluidTopY) / fluidHeight;
          if (relativeY < 0.22) {
            electron.alpha = Math.max(0, relativeY / 0.22);
          }

          if (electron.y <= fluidTopY || electron.alpha <= 0) {
            return false;
          }

          // Draw electron particle as a glowing neon ball with "e⁻" written inside!
          const r = 8 * electron.scale;
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = coreGlowColor;

          // Ball background fill
          const radialGrad = ctx.createRadialGradient(
            electron.x, electron.y, r * 0.1,
            electron.x, electron.y, r
          );
          radialGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          radialGrad.addColorStop(0.4, coreGlowColor.replace(", 1)", `, ${0.8 * electron.alpha}`));
          radialGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = radialGrad;

          ctx.beginPath();
          ctx.arc(electron.x, electron.y, r, 0, Math.PI * 2);
          ctx.fill();

          // Render miniature "e⁻" text inside
          if (r > 6) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.font = `bold ${Math.round(r * 1.15)}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("e⁻", electron.x + 0.5, electron.y);
          }
          ctx.restore();

          return true;
        });

        // Floating info badge showing the chemical electron transfer is taking place
        // Render it above the active reaction fluid levels
        const badgeY = fluidTopY - 18;
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = coreGlowColor;

        // Outer neon glow capsule
        ctx.strokeStyle = coreGlowColor.replace(", 1)", ", 0.45)");
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)"; // Glassmorphism backdrop
        ctx.lineWidth = 1.5;

        const badgeW = 120;
        const badgeH = 18;
        const badgeX = left + beakerW / 2 - badgeW / 2;

        // Draw capsule
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY - badgeH / 2, badgeW, badgeH, 6);
        ctx.fill();
        ctx.stroke();

        // Live text indicator
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 8px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(textLabel, left + beakerW / 2, badgeY);
        ctx.restore();

      } else {
        // Decay existing elements smoothly to prevent harsh visual cuts when reaction finishes
        if (beamsRef.current.length > 0) {
          beamsRef.current.forEach((beam) => {
            beam.intensity *= 0.85;
            beam.currentWidth *= 0.85;
          });
          // Remove beam cache once fully faded out
          if (beamsRef.current[0].intensity < 0.01) {
            beamsRef.current = [];
          }
        }
        electronsRef.current = [];
      }

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
