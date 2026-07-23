/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { Chemical, ReactionDetail } from "../types";

interface SmokeSimulationCanvasProps {
  activeReaction: ReactionDetail | null;
  isReactionPlaying: boolean;
  reactionProgress: number;
  currentTemp: number;
  selectedReactants: Chemical[];
}

interface SmokeParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  color: string; // The "rgba(r, g, b, " prefix
  baseAlpha: number;
  life: number; // 1 to 0
  decay: number;
  growRate: number;
}

const getSmokeColor = (gasType: string | undefined, reactionType: string | undefined) => {
  if (!gasType) {
    if (reactionType === "neutralization") {
      // Soft, clean white-blue steam mist
      return { r: 242, g: 246, b: 252, baseAlpha: 0.26 };
    }
    return { r: 235, g: 238, b: 242, baseAlpha: 0.28 };
  }

  const g = gasType.toLowerCase();
  
  // Chlorine-based gases / Volatile halogens
  if (g.includes("كلور") || g.includes("chlorine") || g.includes("كلورامين")) {
    // Pale chartreuse / yellow-greenish toxic smoke
    return { r: 215, g: 238, b: 175, baseAlpha: 0.42 };
  }
  
  // Ammonia / Alkaline vapors
  if (g.includes("أموني") || g.includes("نشادر") || g.includes("nh3")) {
    // Soft lilac / lavender-gray vapor
    return { r: 230, g: 224, b: 240, baseAlpha: 0.35 };
  }
  
  // Active hydrogen gas (highly volatile, warm light)
  if (g.includes("هيدروجين") || g.includes("hydrogen")) {
    return { r: 245, g: 246, b: 250, baseAlpha: 0.34 };
  }
  
  // Pure oxygen gas
  if (g.includes("أكسجين") || g.includes("oxygen")) {
    return { r: 248, g: 250, b: 255, baseAlpha: 0.26 };
  }
  
  // Carbon dioxide / Heavy gas release
  if (g.includes("ثاني أكسيد الكربون") || g.includes("co2")) {
    // Dense greyish-white smoke
    return { r: 228, g: 230, b: 234, baseAlpha: 0.32 };
  }

  // Fallback default vapor
  return { r: 238, g: 240, b: 243, baseAlpha: 0.3 };
};

export default function SmokeSimulationCanvas({
  activeReaction,
  isReactionPlaying,
  reactionProgress,
  currentTemp,
  selectedReactants,
}: SmokeSimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<SmokeParticle[]>([]);
  const idCounter = useRef<number>(0);

  // Read reactor states in mutable refs to keep canvas loop running perfectly at 60 FPS
  const stateRef = useRef({
    activeReaction,
    isReactionPlaying,
    reactionProgress,
    currentTemp,
    selectedReactantsCount: selectedReactants.length,
  });

  useEffect(() => {
    stateRef.current = {
      activeReaction,
      isReactionPlaying,
      reactionProgress,
      currentTemp,
      selectedReactantsCount: selectedReactants.length,
    };
  }, [activeReaction, isReactionPlaying, reactionProgress, currentTemp, selectedReactants]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;

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

    // Safely reads the bounding box of the glassware vessel relative to the Canvas container
    const getGlassVesselRect = () => {
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

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      const rect = getGlassVesselRect();
      if (!rect) {
        animationFrameId = requestAnimationFrame(step);
        return;
      }

      // Check state from cached refs to evaluate smoke emissions on this frame
      const { 
        activeReaction: currentReaction, 
        isReactionPlaying: currentPlaying, 
        reactionProgress: currentProgress, 
        currentTemp: temp, 
        selectedReactantsCount: reactantsLength 
      } = stateRef.current;

      let isSmoking = false;
      let density = 0; // average particles spawned per frame
      let smokeColor = { r: 240, g: 242, b: 245, baseAlpha: 0.3 };

      if (currentPlaying && currentReaction && currentProgress > 0 && currentProgress < 100) {
        const isExothermic = currentReaction.temperatureDelta > 10;
        const hasGas = currentReaction.hasGas || currentReaction.reactionType === "gas-release";

        if (isExothermic || hasGas || currentReaction.isDangerous) {
          isSmoking = true;
          smokeColor = getSmokeColor(currentReaction.gasType, currentReaction.reactionType);

          // Configure spawn rates based on structural danger/bubbling rate
          if (currentReaction.dangerLevel === "extreme" || currentReaction.bubblingRate === "explosive") {
            density = 1.3; // Intense thick billowing clouds
          } else if (currentReaction.dangerLevel === "hazard" || currentReaction.bubblingRate === "rapid") {
            density = 0.75; // Moderate dense vapor
          } else if (currentReaction.dangerLevel === "caution" || currentReaction.bubblingRate === "slow") {
            density = 0.35; // Gentle constant mist
          } else {
            density = 0.18; // Slow wispy fumes
          }
        }
      }

      // Heat-induced boiling steam
      if (temp > 45) {
        isSmoking = true;
        const heatDensity = Math.min(1.0, (temp - 45) / 60) * 0.45;
        if (heatDensity > density) {
          density = heatDensity;
          smokeColor = { r: 244, g: 248, b: 254, baseAlpha: 0.22 };
        }
      }

      // Spawn a new particle based on randomized floating density checks
      if (isSmoking && density > 0) {
        const spawnCount = Math.floor(density) + (Math.random() < (density % 1) ? 1 : 0);
        for (let i = 0; i < spawnCount; i++) {
          const { left, top, width: glassW, height: glassH } = rect;
          const level = Math.min(25 + reactantsLength * 15, 80) / 100;
          const liquidTopY = top + glassH * (1 - level);

          // Spawn just near the surface of the boiling fluids
          const startX = left + 12 + Math.random() * (glassW - 24);
          const startY = liquidTopY + (Math.random() * 8 - 4);

          // Standard upward thermal trajectory with gentle lateral deviations
          const angle = -Math.PI / 2 + (Math.random() * 0.3 - 0.15);
          const speed = 0.4 + Math.random() * 1.3;

          const isExplosive = currentReaction?.bubblingRate === "explosive";
          const dec = isExplosive 
            ? (0.005 + Math.random() * 0.004) // longer life for epic smoke
            : (0.008 + Math.random() * 0.006);

          const maxSz = isExplosive 
            ? (28 + Math.random() * 22) // massive dense smoke clouds
            : (15 + Math.random() * 12);

          particles.current.push({
            id: ++idCounter.current,
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 3 + Math.random() * 2.5,
            maxRadius: maxSz,
            color: `rgba(${smokeColor.r}, ${smokeColor.g}, ${smokeColor.b}, `,
            baseAlpha: smokeColor.baseAlpha * (0.85 + Math.random() * 0.3),
            life: 1.0,
            decay: dec,
            growRate: 0.12 + Math.random() * 0.18,
          });
        }
      }

      // Physics, boundaries and drafting loops for particles
      particles.current = particles.current.filter(p => {
        p.life -= p.decay;
        if (p.life <= 0) return false;

        p.x += p.vx;
        p.y += p.vy;

        // Upward buoyancy acceleration
        p.vy += -0.016;
        if (p.vy < -3.2) p.vy = -3.2;

        // Apply slight fluid drag decelerations
        p.vx *= 0.982;
        p.vy *= 0.982;

        // Volume expansion as cloud disperses
        if (p.radius < p.maxRadius) {
          p.radius += p.growRate;
        }

        const { left, top, width: glassW } = rect;
        const beakerMouthY = top;

        // Keep smoke inside beaker boundaries while inside glass vessel
        if (p.y > beakerMouthY) {
          const margin = p.radius * 0.55;
          if (p.x < left + margin) {
            p.x = left + margin;
            p.vx = Math.abs(p.vx) * 0.45; // smooth bounce inward
          } else if (p.x > left + glassW - margin) {
            p.x = left + glassW - margin;
            p.vx = -Math.abs(p.vx) * 0.45; // smooth bounce inward
          }
        } else {
          // Once it escapes the beaker mouth, apply beautiful atmospheric lateral draft waves
          const atmosphereDrift = Math.sin((Date.now() / 700) + p.y / 28 + p.id) * 0.095;
          p.vx += atmosphereDrift;
        }

        // Draw soft, 3D volumetric cloud circles using radial blending gradients
        const radialGrad = ctx.createRadialGradient(
          p.x - p.radius * 0.1, 
          p.y - p.radius * 0.1, 
          p.radius * 0.02, 
          p.x, 
          p.y, 
          p.radius
        );

        const currentAlpha = p.baseAlpha * p.life;

        // Multilayer stop fades
        radialGrad.addColorStop(0, `${p.color}${currentAlpha})`);
        radialGrad.addColorStop(0.35, `${p.color}${currentAlpha * 0.7})`);
        radialGrad.addColorStop(0.7, `${p.color}${currentAlpha * 0.22})`);
        radialGrad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Keep only if on-canvas
        return p.y > -p.radius * 2;
      });

      animationFrameId = requestAnimationFrame(step);
    };

    step();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30 w-full h-full"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
