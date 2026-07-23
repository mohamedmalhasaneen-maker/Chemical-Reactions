/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { Chemical, ReactionDetail } from "../types";

interface MolecularSimulationCanvasProps {
  reactants: Chemical[];
  activeReaction: ReactionDetail | null;
  isReactionPlaying: boolean;
  reactionProgress: number;
  stirSpeed: number;
  isStirring: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: "reactant" | "product";
  label: string;
  color: string;
  isDead?: boolean;
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number; // decreases from 1 to 0
}

const getFormulaColor = (formula: string): string => {
  const lower = formula.toLowerCase();
  if (lower.includes("hcl")) return "#60a5fa"; // custom vivid blue
  if (lower.includes("naoh")) return "#ec4899"; // vivid pink
  if (lower.includes("h₂so₄") || lower.includes("h2so4")) return "#22d3ee"; // cyan
  if (lower.includes("ch₃cooh") || lower.includes("ch3cooh")) return "#fbbf24"; // amber
  if (lower.includes("nh₃") || lower.includes("nh3")) return "#c084fc"; // purple
  if (lower.includes("naclo")) return "#fb923c"; // orange-yellow
  if (lower.includes("pb")) return "#94a3b8"; // lead slate
  if (lower.includes("ki")) return "#f97316"; // orange
  if (lower.includes("cuso₄") || lower.includes("cuso4")) return "#38bdf8"; // sky blue
  if (lower.includes("agno₃") || lower.includes("agno3")) return "#cbd5e1"; // zinc silver
  if (lower.includes("nacl")) return "#f8fafc"; // white salt
  if (lower.includes("na")) return "#f1f5f9"; // silver sodium
  if (lower.includes("mg")) return "#cbd5e1"; // mg ribbon
  if (lower.includes("h₂o₂") || lower.includes("h2o2")) return "#93c5fd"; // pale blue
  if (lower.includes("h₂o") || lower.includes("h2o")) return "#0ea5e9"; // water teal
  if (lower.includes("o₂") || lower.includes("o2")) return "#4ade80"; // gas green
  if (lower.includes("h₂") || lower.includes("h2")) return "#fef08a"; // hydrogen yellow
  if (lower.includes("i₂") || lower.includes("i2")) return "#a855f7"; // purple iod
  if (lower.includes("cl")) return "#a3e635"; // chlorine green
  return "#e2e8f0"; // default bright slate
};

// Helper to extract clean chemical formulas from products list
const getCleanProductFormulas = (reaction: ReactionDetail | null): string[] => {
  if (!reaction) return [];
  return reaction.products.map(p => {
    // Match prefix formula like NaCl, H₂O, PbI₂ etc. trước dấu (
    const match = p.match(/^([A-Za-z0-9_₂₃₄⁺⁻\(\)↑↓\s]+)/);
    if (match) {
      return match[1].replace(/[↑↓\s]/g, "").trim();
    }
    return p.split(" ")[0] || p;
  });
};

export default function MolecularSimulationCanvas({
  reactants,
  activeReaction,
  isReactionPlaying,
  reactionProgress,
  stirSpeed,
  isStirring
}: MolecularSimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Simulation lists stored in refs to bypass React re-renders for smooth 60fps canvas performance
  const particlesRef = useRef<Particle[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  
  // Track states to detect transitions
  const lastStateRef = useRef<{
    reactantsCount: number;
    reactantsHash: string;
    isReactionPlaying: boolean;
    activeReaction: boolean;
  }>({
    reactantsCount: 0,
    reactantsHash: "",
    isReactionPlaying: false,
    activeReaction: false
  });

  // Main canvas sizing and loop initializer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    
    // Set internal resolution matching display
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

    // Helper to spawn initial particles
    const spawnParticles = (type: "reactant" | "product", list: string[]) => {
      const countPerType = type === "reactant" ? 6 : 8;
      const newParticles: Particle[] = [];
      
      list.forEach(formula => {
        const color = getFormulaColor(formula);
        for (let i = 0; i < countPerType; i++) {
          const speedFactor = isStirring ? 1.0 + (stirSpeed / 400) : 1.0;
          const angle = Math.random() * Math.PI * 2;
          const speed = (0.5 + Math.random() * 0.8) * speedFactor;
          
          newParticles.push({
            id: Math.random() + i + Date.now(),
            x: 25 + Math.random() * (width - 50),
            y: 25 + Math.random() * (height - 50),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 15,
            type,
            label: formula,
            color
          });
        }
      });
      return newParticles;
    };

    // Sync state and check for triggers
    const reactantsHash = reactants.map(r => r.id).sort().join("+");
    const wasPlaying = lastStateRef.current.isReactionPlaying;
    const isPlaying = isReactionPlaying;

    // Detect if reactants changed, or we just transitioned to reaction playing
    const reactantsChanged = reactantsHash !== lastStateRef.current.reactantsHash;
    const reactionStarted = isPlaying && !wasPlaying;
    const reactionCleared = !isPlaying && wasPlaying;

    if (reactantsChanged || reactionStarted || reactionCleared || particlesRef.current.length === 0) {
      if (isPlaying && activeReaction) {
        // Just started reaction -> Spawn reactant molecules at high velocity representing heat and collision energy!
        const formulas = reactants.map(r => r.formula);
        const pArray = spawnParticles("reactant", formulas);
        // Give them a thermal excitement kick!
        pArray.forEach(p => {
          p.vx *= 1.8;
          p.vy *= 1.8;
          p.radius = 16; // slightly bigger for reaction focus
        });
        particlesRef.current = pArray;
        sparklesRef.current = [];
      } else if (!isPlaying && activeReaction) {
        // Non-playing completed reaction -> Spawn product molecules only
        const productFormulas = getCleanProductFormulas(activeReaction);
        particlesRef.current = spawnParticles("product", productFormulas);
        sparklesRef.current = [];
      } else {
        // Static state before reaction mixing -> Spawn initial reactant molecules floating gently
        const formulas = reactants.map(r => r.formula);
        particlesRef.current = spawnParticles("reactant", formulas);
        sparklesRef.current = [];
      }

      // Update refs
      lastStateRef.current = {
        reactantsCount: reactants.length,
        reactantsHash,
        isReactionPlaying,
        activeReaction: !!activeReaction
      };
    }

    // Spawn sparkle explosion effect
    const createExplosion = (x: number, y: number, colorA: string, colorB: string) => {
      const count = 12 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 2.5;
        sparklesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.5 ? colorA : colorB,
          size: 1.5 + Math.random() * 2.5,
          alpha: 1.0,
          life: 1.0
        });
      }
    };

    // Render & Physics Loop
    const tick = () => {
      // Clear canvas with subtle transparency to leave fading pathways
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const sparkles = sparklesRef.current;
      const cleanProducts = activeReaction ? getCleanProductFormulas(activeReaction) : [];

      // Stirring vortex force coordinates
      const cx = width / 2;
      const cy = height / 2;
      const stirForce = isStirring && stirSpeed > 0 ? (stirSpeed / 1000) * 0.04 : 0;

      // Update molecules physics
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply slight stir orbital pull if active
        if (stirForce > 0) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const distToVortex = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Tangential swirl vector
          const tx = -dy / distToVortex;
          const ty = dx / distToVortex;
          
          p.vx += tx * stirForce;
          p.vy += ty * stirForce;

          // Drag to prevent runaway speed
          p.vx *= 0.985;
          p.vy *= 0.985;
        }

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounces off visual beaker boundaries
        if (p.x < p.radius) {
          p.x = p.radius;
          p.vx = Math.abs(p.vx);
        } else if (p.x > width - p.radius) {
          p.x = width - p.radius;
          p.vx = -Math.abs(p.vx);
        }

        if (p.y < p.radius) {
          p.y = p.radius;
          p.vy = Math.abs(p.vy);
        } else if (p.y > height - p.radius) {
          p.y = height - p.radius;
          p.vy = -Math.abs(p.vy);
        }
      }

      // Handle custom collisions and molecular reactions
      const newProductsSpawned: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          if (p1.isDead || p2.isDead) continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const rSum = p1.radius + p2.radius;

          if (dist < rSum) {
            // Overlapping - trigger bounce physics
            const offset = rSum - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Push them apart elastically
            p1.x -= nx * offset * 0.5;
            p1.y -= ny * offset * 0.5;
            p2.x += nx * offset * 0.5;
            p2.y += ny * offset * 0.5;

            // Swap velocity components along normal
            const kx = p1.vx - p2.vx;
            const ky = p1.vy - p2.vy;
            const impulse = (nx * kx + ny * ky);

            p1.vx -= impulse * nx;
            p1.vy -= impulse * ny;
            p2.vx += impulse * nx;
            p2.vy += impulse * ny;

            // Trigger Chem reaction on contact if playing and both are reactants!
            if (isReactionPlaying && p1.type === "reactant" && p2.type === "reactant") {
              const differentTypes = p1.label !== p2.label;
              const hasMultipleReactants = reactants.length > 1;

              // If only 1 reactant is placed, we can allow homeo-collisions to react (decomposition)
              // Otherwise, prefer hetero-collisions
              if (!hasMultipleReactants || differentTypes) {
                p1.isDead = true;
                p2.isDead = true;

                createExplosion((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, p1.color, p2.color);

                // Spawn product particles in place of the collided reactants
                if (cleanProducts.length > 0) {
                  const productA = cleanProducts[0];
                  const productB = cleanProducts[1] || cleanProducts[0] || "H₂O";

                  const spawnAtOffset = (label: string) => {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1.0 + Math.random() * 1.5;
                    return {
                      id: Math.random() + Date.now(),
                      x: (p1.x + p2.x) / 2 + Math.cos(angle) * 8,
                      y: (p1.y + p2.y) / 2 + Math.sin(angle) * 8,
                      vx: Math.cos(angle) * speed,
                      vy: Math.sin(angle) * speed,
                      radius: 15,
                      type: "product" as const,
                      label,
                      color: getFormulaColor(label)
                    };
                  };

                  newProductsSpawned.push(spawnAtOffset(productA));
                  newProductsSpawned.push(spawnAtOffset(productB));
                }
              }
            }
          }
        }
      }

      // Filter out dead reactives and append new product child molecules
      let filteredParticles = particles.filter(p => !p.isDead);
      filteredParticles.push(...newProductsSpawned);

      // Force-decay leftover reactants slowly over reaction progress, to guarantee products fill the flask
      if (isReactionPlaying && reactionProgress > 55 && cleanProducts.length > 0) {
        filteredParticles = filteredParticles.map(p => {
          if (p.type === "reactant" && Math.random() < 0.003) {
            // Decay reactant into a product
            const randProduct = cleanProducts[Math.floor(Math.random() * cleanProducts.length)];
            createExplosion(p.x, p.y, p.color, getFormulaColor(randProduct));
            return {
              ...p,
              type: "product" as const,
              label: randProduct,
              color: getFormulaColor(randProduct)
            };
          }
          return p;
        });
      }

      // Ensure that when progress finishes (100%), all leftover reactants convert immediately to products
      if (isReactionPlaying && reactionProgress >= 100) {
        let hasReactantsLeft = filteredParticles.some(p => p.type === "reactant");
        if (hasReactantsLeft && cleanProducts.length > 0) {
          filteredParticles = filteredParticles.map(p => {
            if (p.type === "reactant") {
              const randProduct = cleanProducts[Math.floor(Math.random() * cleanProducts.length)];
              return {
                ...p,
                type: "product" as const,
                label: randProduct,
                color: getFormulaColor(randProduct)
              };
            }
            return p;
          });
        }
      }

      // Update the main ref list with newly updated arrays
      particlesRef.current = filteredParticles;

      // Draw active particles
      filteredParticles.forEach(p => {
        // outer shadow/glow
        ctx.save();
        ctx.shadowBlur = p.type === "product" ? 10 : 6;
        ctx.shadowColor = p.color;

        // Draw bubble circle body
        const grad = ctx.createRadialGradient(p.x - 3, p.y - 3, 2, p.x, p.y, p.radius);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, "rgba(15,23,42,0.85)");

        ctx.fillStyle = grad;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Draw standard legible molecular text label (e.g. H2O)
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px 'JetBrains Mono', Courier, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        
        // Slightly offset subscripts visually if they contain subscripts, or draw simply
        ctx.fillText(p.label, p.x, p.y);
      });

      // Update and draw sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05; // gravity pulls sparkle downwards
        s.life -= 0.03; // decay factor
        s.alpha = Math.max(0, s.life);

        if (s.life <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        // Draw sparkle
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        
        // draw glowing star diamond or simple circle
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [reactants, activeReaction, isReactionPlaying, reactionProgress, stirSpeed, isStirring]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-b-[38px] z-20"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
