"use client";

import { useRef, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

/* ── Petal state ──────────────────────────────────────────────────────────── */

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  hue: number;
  phase: number;
  shape: number;       // 0–3 petal shape variant
  driftFreq: number;   // unique horizontal drift frequency
  driftAmp: number;    // unique horizontal drift amplitude
}

const PETAL_COUNT = 22;
const REPEL_RADIUS = 100;
const REPEL_FORCE = 0.4;

/* Spawn petals along the top and right edges so they enter from top-right */
function createPetal(w: number, h: number, initial = false): Petal {
  let x: number;
  let y: number;

  if (initial) {
    /* Scatter across the screen on first load */
    x = Math.random() * w;
    y = Math.random() * h;
  } else if (Math.random() > 0.5) {
    /* Spawn along right edge */
    x = w + Math.random() * 40;
    y = Math.random() * h * 0.6;
  } else {
    /* Spawn along top edge */
    x = w * 0.4 + Math.random() * w * 0.6;
    y = -Math.random() * 40;
  }

  return {
    x,
    y,
    /* Base velocity: leftward + downward (top-right → bottom-left) */
    vx: -(0.3 + Math.random() * 0.5),
    vy: 0.2 + Math.random() * 0.4,
    size: 8 + Math.random() * 16,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    opacity: 0.7 + Math.random() * 0.3,
    hue: 330 + Math.random() * 20,
    phase: Math.random() * Math.PI * 2,
    shape: Math.floor(Math.random() * 4),
    driftFreq: 0.008 + Math.random() * 0.012,
    driftAmp: 0.3 + Math.random() * 0.7,
  };
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function FloatingPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let petals: Petal[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let rafId: number;
    let running = true;
    let time = 0;

    /* Constant diagonal wind: top-right → bottom-left, with gentle variation */
    let windX = -0.15;
    let windY = 0.06;
    let windTargetX = -0.15;
    let windTargetY = 0.06;
    let windTimer = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      if (petals.length === 0) {
        petals = Array.from({ length: PETAL_COUNT }, () => createPetal(w, h, true));
      }
    };

    const onMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    const draw = () => {
      if (!running) return;
      time += 1;

      /* Vary wind slightly around the diagonal direction */
      windTimer++;
      if (windTimer > 300) {
        windTimer = 0;
        windTargetX = -(0.1 + Math.random() * 0.15);
        windTargetY = 0.03 + Math.random() * 0.06;
      }
      windX += (windTargetX - windX) * 0.008;
      windY += (windTargetY - windY) * 0.008;

      ctx.clearRect(0, 0, w, h);

      for (const p of petals) {
        /* Per-petal sine-wave drift — each petal has unique frequency + amplitude */
        const wobbleX = Math.sin(time * p.driftFreq + p.phase) * p.driftAmp;
        const wobbleY = Math.cos(time * p.driftFreq * 0.7 + p.phase) * p.driftAmp * 0.3;

        /* Mouse repulsion */
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        /* Apply diagonal wind + wobble as acceleration */
        p.vx += wobbleX * 0.006 + windX * 0.025;
        p.vy += wobbleY * 0.004 + windY * 0.02;
        /* Gentle gravity pulling diagonally (down-left) */
        p.vx -= 0.002;
        p.vy += 0.003;

        /* Damping */
        p.vx *= 0.978;
        p.vy *= 0.978;

        p.x += p.vx;
        p.y += p.vy;

        /* Rotation accelerates with movement speed */
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        p.rotation += p.rotationSpeed + speed * 0.01;

        /* Respawn from top-right when exiting bottom or left */
        if (p.y > h + p.size * 3 || p.x < -p.size * 3) {
          const fresh = createPetal(w, h, false);
          p.x = fresh.x;
          p.y = fresh.y;
          p.vx = fresh.vx;
          p.vy = fresh.vy;
        }

        /* Draw petal — one of 4 cherry blossom shapes */
        const s = p.size;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();

        if (p.shape === 0) {
          /* Half-round: flat bottom, rounded top (like top-right ref petal) */
          ctx.moveTo(-s * 0.7, s * 0.1);
          ctx.bezierCurveTo(-s * 0.7, -s * 0.9, s * 0.7, -s * 0.9, s * 0.7, s * 0.1);
          ctx.bezierCurveTo(s * 0.3, s * 0.2, -s * 0.3, s * 0.2, -s * 0.7, s * 0.1);
        } else if (p.shape === 1) {
          /* Teardrop: pointed base, round top (like middle-left ref) */
          ctx.moveTo(0, s * 0.9);
          ctx.bezierCurveTo(-s * 0.15, s * 0.5, -s * 0.8, -s * 0.1, -s * 0.55, -s * 0.7);
          ctx.bezierCurveTo(-s * 0.3, -s * 0.95, s * 0.3, -s * 0.95, s * 0.55, -s * 0.7);
          ctx.bezierCurveTo(s * 0.8, -s * 0.1, s * 0.15, s * 0.5, 0, s * 0.9);
        } else if (p.shape === 2) {
          /* Heart-notch: rounded with a small V at bottom (like bottom-left ref) */
          ctx.moveTo(0, s * 0.5);
          ctx.bezierCurveTo(-s * 0.2, s * 0.3, -s * 0.8, s * 0.3, -s * 0.7, -s * 0.3);
          ctx.bezierCurveTo(-s * 0.6, -s * 0.8, s * 0.6, -s * 0.8, s * 0.7, -s * 0.3);
          ctx.bezierCurveTo(s * 0.8, s * 0.3, s * 0.2, s * 0.3, 0, s * 0.5);
        } else {
          /* Leaf: pointed at both ends (like bottom-right ref) */
          ctx.moveTo(0, -s * 0.9);
          ctx.bezierCurveTo(s * 0.6, -s * 0.5, s * 0.7, s * 0.3, 0, s * 0.9);
          ctx.bezierCurveTo(-s * 0.7, s * 0.3, -s * 0.6, -s * 0.5, 0, -s * 0.9);
        }

        ctx.fillStyle = `hsla(${p.hue}, 45%, 78%, ${p.opacity})`;

        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
      aria-hidden="true"
    />
  );
}
