"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * VioletOrb — a soft cloud of violet particles that holds the shape of a
 * slowly breathing sphere. Decorative only: the hero owns the lavender canvas,
 * the headline and the layout; this component paints a transparent canvas so
 * the parent's gradient shows through.
 *
 * Model: ~1,000 particles live on (and inside) a unit sphere. Each frame the
 * sphere is rotated around its vertical axis, given a slight wobbling tilt,
 * projected with a gentle perspective, and drawn as pre-rendered soft
 * radial-gradient sprites with `globalCompositeOperation = "lighter"`.
 *
 * Three details do most of the depth work:
 *  - particles are tinted by depth (deep violet at the back, lilac in the
 *    middle, blush at the front) so the cloud reads as a lit volume;
 *  - back particles are dimmer and smaller, front particles brighter;
 *  - a small luminous core plus a wide, very soft halo make it feel lit from
 *    within rather than lit from outside.
 *
 * Sprites are baked once, so no gradients, shadows or filters are created per
 * particle per frame — that is what keeps the 60 fps budget on a mid laptop.
 */

/* ── Motion + sizing constants ───────────────────────────────────────────── */

const TAU = Math.PI * 2;
/** One full revolution — slow enough to feel suspended rather than spinning. */
const TURN_SECONDS = 118;
/** Breathing: radius ±2 % over roughly nine seconds. */
const BREATH_SECONDS = 9.2;
const BREATH_AMPLITUDE = 0.02;
/** Fixed tilt so the point cloud reads as a volume, not a flat disc. */
const SPHERE_TILT = -0.19;
/** Mild perspective: front particles grow, back particles recede. */
const PERSPECTIVE = 0.16;
/** Device pixel ratio is capped — 3× phone screens gain nothing visually. */
const MAX_DPR = 2;
/** Particle budget; the count is scaled by canvas size between these bounds. */
const MIN_PARTICLES = 900;
const MAX_PARTICLES = 1320;
/** Reference canvas side at which the full particle budget is used. */
const PARTICLE_REFERENCE_SIDE = 760;
/** Sphere radius relative to the smaller side of the canvas. */
const ORB_RADIUS_RATIO = 0.26;
/** Soft halo bleed factor for a dust particle (sprite size / core size). */
const DUST_SPREAD = 5.4;
const BOKEH_SPREAD = DUST_SPREAD + 1.2;
const SPARKLE_SPREAD = 5.2;
/** Alpha floor for particles on the far side of the sphere. */
const DEPTH_ALPHA_MIN = 0.3;
/** Very subtle "limb darkening" inverse: the silhouette gathers a little light. */
const RIM_BOOST = 0.16;
/** Frame used for the single still image under prefers-reduced-motion. */
const STATIC_TIME = 37.5;
const POINTER_PULL = 26;
const SCROLL_PULL = 9;
const POINTER_EASE = 3.4;
const SCROLL_EASE = 4.2;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/* ── Interaction — the cloud scatters, then springs back ─────────────────── */

/** Cursor repulsion reaches this many orb radii away. */
const REPEL_FIELD_RATIO = 1.35;
/** Push strength at the centre of the field (px/s²). */
const REPEL_STRENGTH = 10000;
/** Spring that pulls a scattered particle back to its resting position. */
const SPREAD_STIFFNESS = 14;
/** How quickly spread energy dissipates. */
const SPREAD_DAMPING = 3.6;
/** Hard cap on particle speed while scattering. */
const MAX_SPREAD_SPEED = 2400;
/** Maximum distance a particle can be thrown, by smaller canvas side. */
const SPREAD_MAX_RATIO = 0.26;
/** Click / tap burst impulse. */
const BURST_SPEED = 2400;
/** Scroll turbulence budget (accumulated then spent in one frame). */
const SCROLL_KICK = 1900;
/* A burst also pushes everything outward from the orb's centre, not just
   away from the click — that is what makes it read as a real explosion. */
const BURST_OUTWARD = 0.6;
/** Pointer push fades out when the cursor stops moving, so the cloud settles. */
const POINTER_ENERGY_DECAY = 3.6;
/** Hold the orb this long to arm a full-strength burst. */
const HOLD_SECONDS = 2;
/** Scattered particles glow a little brighter so the cloud reads as thrown dust. */
const SPREAD_ALPHA_BOOST = 0.55;

/* ── Palette ─────────────────────────────────────────────────────────────── */

type GradientStop = readonly [offset: number, alpha: number];

interface OrbPalette {
  /**
   * Dust colours ordered back → front. The band is chosen per particle from
   * its current depth, so the same physical dot gets warmer as it rotates
   * towards the viewer — the volume is lit, not painted.
   */
  dust: readonly string[];
  /** Depth cut-offs between consecutive `dust` bands (length = dust - 1). */
  depthThresholds: readonly number[];
  /** Broad internal glow. */
  inner: string;
  /** Tight glow just under the core. */
  deep: string;
  /** Outer bloom. */
  halo: string;
  /** Luminous centre — the "lit from inside" highlight. */
  core: string;
  alphaScale: number;
  innerAlpha: number;
  deepAlpha: number;
  haloAlpha: number;
  coreAlpha: number;
  /** CSS-only still orb, painted on the wrapper before/without the canvas. */
  fallback: string;
}

const LIGHT_PALETTE: OrbPalette = {
  dust: ["#7114FF", "#9047FF", "#B79BFF", "#E0AEC7"],
  depthThresholds: [0.34, 0.6, 0.82],
  inner: "#9047FF",
  deep: "#9047FF",
  halo: "#B79BFF",
  core: "#FFFFFF",
  alphaScale: 0.95,
  innerAlpha: 0.36,
  deepAlpha: 0.18,
  haloAlpha: 0.34,
  coreAlpha: 0.16,
  fallback:
    "radial-gradient(closest-side, rgba(113,20,255,0.17) 0%, rgba(144,71,255,0.15) 32%, rgba(183,155,255,0.09) 54%, rgba(224,174,199,0.06) 68%, rgba(255,255,255,0) 86%)",
};

const DARK_PALETTE: OrbPalette = {
  dust: ["#8B5CF6", "#C4B5FD", "#E9D5FF"],
  depthThresholds: [0.42, 0.78],
  inner: "#8B5CF6",
  deep: "#C4B5FD",
  halo: "#C4B5FD",
  core: "#E9D5FF",
  alphaScale: 1,
  innerAlpha: 0.36,
  deepAlpha: 0.18,
  haloAlpha: 0.34,
  coreAlpha: 0.18,
  fallback:
    "radial-gradient(closest-side, rgba(196,181,253,0.24) 0%, rgba(139,92,246,0.2) 34%, rgba(139,92,246,0.09) 56%, rgba(233,213,255,0.04) 70%, rgba(255,255,255,0) 88%)",
};

/** Sprite falloff profiles — tuned to stay soft at 2–14 px draw sizes. */
const DUST_STOPS: readonly GradientStop[] = [
  [0, 1],
  [0.2, 0.78],
  [0.45, 0.28],
  [0.75, 0.07],
  [1, 0],
];

const SPARKLE_STOPS: readonly GradientStop[] = [
  [0, 1],
  [0.12, 0.95],
  [0.28, 0.4],
  [0.6, 0.08],
  [1, 0],
];

const INNER_STOPS: readonly GradientStop[] = [
  [0, 0.95],
  [0.32, 0.62],
  [0.6, 0.26],
  [0.84, 0.06],
  [1, 0],
];

const DEEP_STOPS: readonly GradientStop[] = [
  [0, 1],
  [0.24, 0.66],
  [0.55, 0.24],
  [0.82, 0.05],
  [1, 0],
];

const HALO_STOPS: readonly GradientStop[] = [
  [0, 0.36],
  [0.4, 0.4],
  [0.66, 0.28],
  [0.84, 0.11],
  [0.94, 0.03],
  [1, 0],
];

const CORE_STOPS: readonly GradientStop[] = [
  [0, 1],
  [0.28, 0.72],
  [0.55, 0.3],
  [0.8, 0.06],
  [1, 0],
];

/* ── Types ───────────────────────────────────────────────────────────────── */

interface Particle {
  /** Unit-sphere position, pre-multiplied by its radial factor. */
  x: number;
  y: number;
  z: number;
  /** Core size in CSS px (0.4 – 2.2). */
  size: number;
  alpha: number;
  /** Unit vector along which the particle drifts. */
  jitterX: number;
  jitterY: number;
  jitterZ: number;
  jitterAmp: number;
  jitterFreq: number;
  phase: number;
  twinkleAmp: number;
  twinkleFreq: number;
  twinklePhase: number;
  /** White highlight that flickers gently. */
  sparkle: boolean;
  /** Bigger, very faint dust mote — depth-of-field texture. */
  bokeh: boolean;
  /** Screen-space scatter offset from the particle's resting position. */
  offX: number;
  offY: number;
  /** Velocity of that offset, in px/s. */
  velX: number;
  velY: number;
  /** How far this particle may be thrown, as a fraction of the field limit. */
  spreadLimit: number;
}

interface SpriteSet {
  /** One sprite per palette dust band, back → front. */
  dust: HTMLCanvasElement[];
  sparkle: HTMLCanvasElement;
  inner: HTMLCanvasElement;
  deep: HTMLCanvasElement;
  halo: HTMLCanvasElement;
  core: HTMLCanvasElement;
}

interface VioletOrbProps {
  /** Sizing/positioning classes from the parent — the orb fills this box. */
  className?: string;
  /** "dark" = dark plum theme: swaps the palette for luminous lavender. */
  dark?: boolean;
}

/* ── Small helpers ───────────────────────────────────────────────────────── */

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Frame-rate independent easing towards a target. */
function approach(current: number, target: number, rate: number, delta: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * delta));
}

function hexToRgb(hex: string): readonly [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

/** Bakes one soft radial gradient into a small offscreen canvas. */
function makeRadialSprite(
  size: number,
  color: string,
  stops: readonly GradientStop[],
): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const spriteContext = sprite.getContext("2d");
  if (!spriteContext) return sprite;

  const [r, g, b] = hexToRgb(color);
  const half = size / 2;
  const gradient = spriteContext.createRadialGradient(half, half, 0, half, half, half);
  for (const [offset, alpha] of stops) {
    gradient.addColorStop(offset, `rgba(${r}, ${g}, ${b}, ${alpha})`);
  }
  spriteContext.fillStyle = gradient;
  spriteContext.fillRect(0, 0, size, size);
  return sprite;
}

function buildSprites(palette: OrbPalette): SpriteSet {
  return {
    dust: palette.dust.map((color) => makeRadialSprite(96, color, DUST_STOPS)),
    sparkle: makeRadialSprite(96, "#FFFFFF", SPARKLE_STOPS),
    inner: makeRadialSprite(320, palette.inner, INNER_STOPS),
    deep: makeRadialSprite(256, palette.deep, DEEP_STOPS),
    halo: makeRadialSprite(320, palette.halo, HALO_STOPS),
    core: makeRadialSprite(192, palette.core, CORE_STOPS),
  };
}

/** Uniform random point on the unit sphere (no latitude pinching). */
function randomUnitVector(): [number, number, number] {
  const z = Math.random() * 2 - 1;
  const angle = Math.random() * TAU;
  const ring = Math.sqrt(Math.max(0, 1 - z * z));
  return [Math.cos(angle) * ring, z, Math.sin(angle) * ring];
}

function createParticle(): Particle {
  const [ux, uy, uz] = randomUnitVector();
  const [jx, jy, jz] = randomUnitVector();
  const roll = Math.random();
  const sparkle = Math.random() < 0.03;
  const bokeh = !sparkle && Math.random() < 0.02;

  let radialFactor: number;
  let size: number;
  let alpha: number;

  if (roll < 0.1) {
    /* Interior haze — gives the sphere its lit-from-within volume. */
    radialFactor = 0.15 + Math.random() * 0.72;
    size = 0.34 + Math.random() * 0.55;
    alpha = 0.06 + Math.random() * 0.07;
  } else if (roll < 0.3) {
    /* Corona fuzz — dissolves the silhouette past the shell. */
    radialFactor = 0.96 + Math.random() * 0.22;
    size = 0.34 + Math.random() * 0.75;
    alpha = 0.05 + Math.random() * 0.05;
  } else {
    /* Main shell — the cloud that "holds shape". */
    radialFactor = 0.86 + Math.random() * 0.18;
    size = 0.4 + Math.pow(Math.random(), 2) * 1.8;
    alpha = 0.32 + Math.random() * 0.32;
  }

  if (sparkle) {
    radialFactor = 0.84 + Math.random() * 0.24;
    size = 0.55 + Math.random() * 0.8;
    alpha = 0.5 + Math.random() * 0.3;
  } else if (bokeh) {
    radialFactor = 0.88 + Math.random() * 0.35;
    size = 1.4 + Math.random() * 0.8;
    alpha = 0.05 + Math.random() * 0.06;
  }

  const twinkleAmp = sparkle
    ? 0.3 + Math.random() * 0.18
    : Math.random() < 0.22
      ? 0.08 + Math.random() * 0.12
      : 0;

  return {
    x: ux * radialFactor,
    y: uy * radialFactor,
    z: uz * radialFactor,
    size,
    alpha,
    jitterX: jx,
    jitterY: jy,
    jitterZ: jz,
    jitterAmp: 0.004 + Math.random() * 0.011,
    jitterFreq: 0.12 + Math.random() * 0.4,
    phase: Math.random() * TAU,
    twinkleAmp,
    twinkleFreq: 0.3 + Math.random() * 1.4,
    twinklePhase: Math.random() * TAU,
    sparkle,
    bokeh,
    offX: 0,
    offY: 0,
    velX: 0,
    velY: 0,
    spreadLimit: 0.55 + Math.random() * 0.6,
  };
}

/** More pixels → a denser cloud, but mobile and small cards stay light. */
function particleCountFor(width: number, height: number): number {
  const side = Math.min(width, height);
  const ratio = clamp(side / PARTICLE_REFERENCE_SIDE, 0.68, 1);
  return clamp(Math.round(MAX_PARTICLES * ratio), MIN_PARTICLES, MAX_PARTICLES);
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function VioletOrb({ className, dark = false }: VioletOrbProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Tiny "HOLD / RELEASE" pill that follows the cursor over the orb. */
  const hintRef = useRef<HTMLDivElement | null>(null);

  /* The canvas is only mounted after the host reports a real box — a 0×0
     canvas can throw on some browsers and would flash awkwardly anyway. The
     wrapper's inline CSS gradient is the visible fallback until then (and
     forever if JavaScript never runs, or if 2D context is unavailable). */
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const rect = host.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setMeasured(true);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setMeasured(true);
        observer.disconnect();
      }
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!measured) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const palette = dark ? DARK_PALETTE : LIGHT_PALETTE;
    const sprites = buildSprites(palette);

    let width = 0;
    let height = 0;
    let radius = 0;
    let sizeScale = 1;
    let particles: Particle[] = [];

    let rafId = 0;
    let running = false;
    let visible = true;
    let reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    let elapsed = STATIC_TIME;
    let lastFrame = 0;

    /* Pointer / scroll parallax, eased towards its target each frame. */
    let pointerX = 0;
    let pointerY = 0;
    let pointerActive = false;
    let pullX = 0;
    let pullY = 0;
    let scrollNow = window.scrollY;
    let scrollAtMeasure = scrollNow;
    let scrollOffset = 0;

    /* Interaction state — pointer position in canvas space, one-shot bursts
       and the smoothed "how scattered is the cloud right now" value. */
    let pointerLocalX = 0;
    let pointerLocalY = 0;
    let burstLocalX = 0;
    let burstLocalY = 0;
    let pendingBurst = 0;
    let pendingTurbulence = 0;
    let spreadVisual = 0;
    let maxSpread = 0;
    let repelField = 0;
    let pointerEnergy = 0;
    let hoveringOrb = false;
    let holding = false;
    let burstFlash = 0;
    let holdStart = 0;
    let holdCharge = 0;
    let holdX = 0;
    let holdY = 0;

    /* Cached viewport geometry — no layout reads happen inside the rAF loop. */
    let rectLeft = 0;
    let rectTop = 0;
    let rectWidth = 0;
    let rectHeight = 0;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    const draw = (time: number, delta: number) => {
      if (width <= 0 || height <= 0) return;

      const breath = 1 + BREATH_AMPLITUDE * Math.sin((time * TAU) / BREATH_SECONDS);
      const breathY =
        1 + BREATH_AMPLITUDE * 0.86 * Math.sin((time * TAU) / BREATH_SECONDS + 1.15);
      const pulse = 0.93 + 0.07 * Math.sin((time * TAU) / (BREATH_SECONDS * 1.5) + 0.6);

      const centerX = width / 2 + pullX;
      const centerY = height / 2 + pullY + scrollOffset;

      /* While particles are flung out, the glows bloom outward with them. */
      const bloom = 1 + spreadVisual * 1.1 + burstFlash * 1.1;

      context.clearRect(0, 0, width, height);
      /* Additive layering — light *adds* instead of covering. */
      context.globalCompositeOperation = "lighter";

      const haloSize = radius * 2.5 * breath * bloom;
      context.globalAlpha = clamp(palette.haloAlpha * pulse * (1 + spreadVisual * 0.6 + burstFlash * 1.1), 0, 1);
      context.drawImage(
        sprites.halo,
        centerX - haloSize / 2,
        centerY - haloSize / 2,
        haloSize,
        haloSize,
      );

      const innerSize = radius * 1.5 * breath * (1 + spreadVisual * 0.45);
      context.globalAlpha = clamp(palette.innerAlpha * pulse, 0, 1);
      context.drawImage(
        sprites.inner,
        centerX - innerSize / 2,
        centerY - innerSize / 2,
        innerSize,
        innerSize,
      );

      const deepSize = radius * 0.66 * breath * (1 + spreadVisual * 0.2);
      context.globalAlpha = clamp(palette.deepAlpha * pulse, 0, 1);
      context.drawImage(
        sprites.deep,
        centerX - deepSize / 2,
        centerY - deepSize / 2,
        deepSize,
        deepSize,
      );

      const coreSize = radius * 0.34 * breath;
      context.globalAlpha = clamp(palette.coreAlpha * pulse, 0, 1);
      context.drawImage(
        sprites.core,
        centerX - coreSize / 2,
        centerY - radius * 0.02 - coreSize / 2,
        coreSize,
        coreSize,
      );



      /* Sphere orientation for this frame — computed once, shared by all dots. */
      const rotation = (time * TAU) / TURN_SECONDS + 0.1 * Math.sin(time * 0.07);
      const cosRotation = Math.cos(rotation);
      const sinRotation = Math.sin(rotation);
      const tilt = SPHERE_TILT + 0.035 * Math.sin(time * 0.09);
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      const alphaScale = palette.alphaScale * pulse;
      const radiusX = radius * breath;
      const radiusY = radius * breathY;
      const thresholds = palette.depthThresholds;

      /* One-shot forces: a click/tap burst and scroll turbulence. */
      const burst = pendingBurst;
      pendingBurst = 0;
      const turbulence = pendingTurbulence;
      pendingTurbulence = 0;
      let spreadTotal = 0;

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];

        /* Slow per-particle drift along its own tangent vector. */
        const drift =
          Math.sin(time * particle.jitterFreq + particle.phase) * particle.jitterAmp;
        const localX = particle.x + particle.jitterX * drift;
        const localY = particle.y + particle.jitterY * drift;
        const localZ = particle.z + particle.jitterZ * drift;

        /* Y rotation, then the slowly wobbling tilt about X. */
        const rotatedX = localX * cosRotation + localZ * sinRotation;
        const rotatedZ = localZ * cosRotation - localX * sinRotation;
        const rotatedY = localY * cosTilt - rotatedZ * sinTilt;
        const depthZ = localY * sinTilt + rotatedZ * cosTilt;

        const perspective = 1 / (1 - depthZ * PERSPECTIVE);
        const depth = clamp((depthZ + 1) * 0.5, 0, 1);

        let alpha =
          particle.alpha * (DEPTH_ALPHA_MIN + (1 - DEPTH_ALPHA_MIN) * depth) * alphaScale;
        if (particle.twinkleAmp > 0) {
          alpha *=
            1 -
            particle.twinkleAmp +
            particle.twinkleAmp *
              Math.sin(time * particle.twinkleFreq + particle.twinklePhase);
        }

        const preSpread =
          maxSpread > 0
            ? Math.min(1, Math.sqrt(particle.offX * particle.offX + particle.offY * particle.offY) / maxSpread)
            : 0;
        const drawSize = particle.size * sizeScale * perspective * (1 + preSpread * 0.5);
        if (alpha <= 0.008 || drawSize <= 0.2) continue;

        const x = centerX + rotatedX * radiusX * perspective;
        const y = centerY + rotatedY * radiusY * perspective;

        /* Interaction — burst outward, scatter with the cursor, spring back. */
        if (burst > 0) {
          const burstDx = x - burstLocalX;
          const burstDy = y - burstLocalY;
          const burstDistance = Math.sqrt(burstDx * burstDx + burstDy * burstDy) || 1;
          const kick = BURST_SPEED * burst * (0.35 + Math.random() * 0.95);
          particle.velX += (burstDx / burstDistance) * kick;
          particle.velY += (burstDy / burstDistance) * kick;

          const outwardDx = x - centerX;
          const outwardDy = y - centerY;
          const outwardDistance = Math.sqrt(outwardDx * outwardDx + outwardDy * outwardDy) || 1;
          particle.velX += (outwardDx / outwardDistance) * kick * BURST_OUTWARD;
          particle.velY += (outwardDy / outwardDistance) * kick * BURST_OUTWARD;

          /* Swirl: a tangential component so the burst curls instead of
             firing in perfectly straight rays. */
          const swirl = (Math.random() - 0.5) * kick * 0.45;
          particle.velX += (-outwardDy / outwardDistance) * swirl;
          particle.velY += (outwardDx / outwardDistance) * swirl;
        }

        if (turbulence > 0) {
          particle.velX += (Math.random() - 0.5) * turbulence;
          particle.velY += (Math.random() - 0.5) * turbulence * 0.7;
        }

        if (!holding && pointerActive && pointerEnergy > 0.02 && repelField > 0) {
          const pointerDx = x - pointerLocalX;
          const pointerDy = y - pointerLocalY;
          const pointerDistanceSq = pointerDx * pointerDx + pointerDy * pointerDy;
          if (pointerDistanceSq < repelField * repelField) {
            const pointerDistance = Math.sqrt(pointerDistanceSq) || 0.001;
            const falloff = 1 - pointerDistance / repelField;
            const push = REPEL_STRENGTH * falloff * falloff * pointerEnergy * delta;
            particle.velX += (pointerDx / pointerDistance) * push;
            particle.velY += (pointerDy / pointerDistance) * push;
          }
        }


        particle.velX += -SPREAD_STIFFNESS * particle.offX * delta;
        particle.velY += -SPREAD_STIFFNESS * particle.offY * delta;
        const spreadDamping = Math.exp(-SPREAD_DAMPING * delta);
        particle.velX *= spreadDamping;
        particle.velY *= spreadDamping;

        const speed = Math.sqrt(
          particle.velX * particle.velX + particle.velY * particle.velY,
        );
        if (speed > MAX_SPREAD_SPEED) {
          const speedScale = MAX_SPREAD_SPEED / speed;
          particle.velX *= speedScale;
          particle.velY *= speedScale;
        }

        particle.offX += particle.velX * delta;
        particle.offY += particle.velY * delta;

        const offsetDistance = Math.sqrt(
          particle.offX * particle.offX + particle.offY * particle.offY,
        );
        const particleLimit = maxSpread * particle.spreadLimit;
        if (offsetDistance > particleLimit && offsetDistance > 0) {
          const pullBack = particleLimit / offsetDistance;
          particle.offX *= pullBack;
          particle.offY *= pullBack;
          particle.velX *= 0.65;
          particle.velY *= 0.65;
        }
        const spreadRatio = particleLimit > 0 ? offsetDistance / particleLimit : 0;
        spreadTotal += spreadRatio;

        /* The silhouette gathers a little extra dust-light. */
        const projected = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY) * perspective;
        alpha *= 1 + RIM_BOOST * Math.min(projected, 1.25) ** 2;

        const spread = particle.sparkle
          ? SPARKLE_SPREAD
          : particle.bokeh
            ? BOKEH_SPREAD
            : DUST_SPREAD;
        const spriteSize = drawSize * spread;

        let sprite: HTMLCanvasElement;
        if (particle.sparkle) {
          sprite = sprites.sparkle;
        } else {
          let band = 0;
          while (band < thresholds.length && depth > thresholds[band]) band += 1;
          sprite = sprites.dust[band];
        }

        context.globalAlpha = clamp(alpha * (1 + SPREAD_ALPHA_BOOST * spreadRatio), 0, 1);
        context.drawImage(
          sprite,
          x + particle.offX - spriteSize / 2,
          y + particle.offY - spriteSize / 2,
          spriteSize,
          spriteSize,
        );
      }

      spreadVisual = approach(
        spreadVisual,
        particles.length > 0 ? spreadTotal / particles.length : 0,
        7,
        delta,
      );


      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    };

    const updateParallax = (delta: number) => {
      let targetX = 0;
      let targetY = 0;

      if (pointerActive && rectWidth > 0) {
        const centerX = rectLeft + rectWidth / 2;
        const centerY = rectTop + rectHeight / 2 - (scrollNow - scrollAtMeasure);
        const normalX = clamp(
          (pointerX - centerX) / Math.max(viewportWidth * 0.5, 1),
          -1,
          1,
        );
        const normalY = clamp(
          (pointerY - centerY) / Math.max(viewportHeight * 0.5, 1),
          -1,
          1,
        );
        targetX = normalX * POINTER_PULL;
        targetY = normalY * POINTER_PULL;
      }

      pullX = approach(pullX, targetX, POINTER_EASE, delta);
      pullY = approach(pullY, targetY, POINTER_EASE, delta);

      const scrollTarget = clamp(
        (scrollAtMeasure - scrollNow) * 0.05,
        -SCROLL_PULL,
        SCROLL_PULL,
      );
      scrollOffset = approach(scrollOffset, scrollTarget, SCROLL_EASE, delta);
    };

    const frame = (now: number) => {
      if (!running) return;
      const delta = Math.min(Math.max((now - lastFrame) / 1000, 0), 0.05);
      lastFrame = now;
      elapsed += delta;
      pointerEnergy *= Math.exp(-POINTER_ENERGY_DECAY * delta);
      burstFlash *= Math.exp(-7 * delta);

      if (holding) {
        holdCharge = Math.min(1, (now - holdStart) / (HOLD_SECONDS * 1000));
        setHint(holdCharge >= 1 ? "RELEASE" : "HOLD", true, holdX, holdY);
      }
      updateParallax(delta);
      draw(elapsed, delta);
      rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduced || !visible || width <= 0 || height <= 0) return;
      running = true;
      lastFrame = performance.now();
      rafId = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      if (rafId !== 0) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    /* One static frame for reduced motion — no rAF, no drift, no parallax. */
    const drawStatic = () => {
      if (width <= 0 || height <= 0) return;
      pullX = 0;
      pullY = 0;
      scrollOffset = 0;
      pointerEnergy = 0;
      holding = false;
      holdCharge = 0;
      setHint("", false);
      elapsed = STATIC_TIME;
      draw(STATIC_TIME, 1 / 60);
    };

    const applySize = (nextWidth: number, nextHeight: number) => {
      if (nextWidth <= 0 || nextHeight <= 0) {
        width = 0;
        height = 0;
        stop();
        return;
      }

      width = nextWidth;
      height = nextHeight;
      radius = Math.min(width, height) * ORB_RADIUS_RATIO;
      sizeScale = clamp(radius / 280, 0.62, 1.15);
      maxSpread = Math.min(width, height) * SPREAD_MAX_RATIO;
      repelField = Math.max(180, radius * REPEL_FIELD_RATIO);

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const pixelWidth = Math.max(1, Math.round(width * dpr));
      const pixelHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = particleCountFor(width, height);
      if (
        particles.length === 0 ||
        Math.abs(targetCount - particles.length) > Math.max(48, particles.length * 0.08)
      ) {
        particles = Array.from({ length: targetCount }, () => createParticle());
      }

      /* Read layout once per resize, not once per frame. */
      const rect = host.getBoundingClientRect();
      rectLeft = rect.left;
      rectTop = rect.top;
      rectWidth = rect.width;
      rectHeight = rect.height;
      scrollAtMeasure = window.scrollY;
      scrollNow = scrollAtMeasure;
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;

      if (reduced) {
        drawStatic();
      } else {
        draw(elapsed, 1 / 60);
        if (visible) start();
      }
    };

    /* ── Input + observers ────────────────────────────────────────────────── */

    /* Client → canvas-space conversion for the interaction fields. */
    const toCanvasPoint = (clientX: number, clientY: number) => {
      const scrollDelta = scrollNow - scrollAtMeasure;
      return { x: clientX - rectLeft, y: clientY - rectTop + scrollDelta };
    };

    /* "HOLD" pill that follows the cursor while it is over the orb. */
    const setHint = (label: string, visible: boolean, x?: number, y?: number) => {
      const el = hintRef.current;
      if (!el) return;
      el.textContent = label;
      el.style.opacity = visible ? "1" : "0";
      if (x !== undefined && y !== undefined) {
        el.style.transform = `translate3d(${Math.round(x + 16)}px, ${Math.round(y + 16)}px, 0)`;
      }
    };

    const isInsideOrb = (x: number, y: number) =>
      width > 0 && height > 0 && x >= 0 && y >= 0 && x <= width && y <= height;

    const handlePointerMove = (event: PointerEvent) => {
      const point = toCanvasPoint(event.clientX, event.clientY);
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerLocalX = point.x;
      pointerLocalY = point.y;
      pointerActive = true;
      hoveringOrb = isInsideOrb(point.x, point.y);
      pointerEnergy = holding ? 0 : 1;
      if (!holding) {
        if (hoveringOrb && !reduced) setHint("HOLD", true, point.x, point.y);
        else setHint("", false);
      }
    };

    const handlePointerLeave = () => {
      pointerActive = false;
      hoveringOrb = false;
      holding = false;
      holdCharge = 0;
      setHint("", false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (reduced) return;
      const point = toCanvasPoint(event.clientX, event.clientY);
      if (!isInsideOrb(point.x, point.y)) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerLocalX = point.x;
      pointerLocalY = point.y;
      pointerActive = true;
      hoveringOrb = true;
      holding = true;
      holdStart = performance.now();
      holdCharge = 0;
      holdX = point.x;
      holdY = point.y;
      pointerEnergy = 0;
      setHint("HOLD", true, point.x, point.y);
    };

    const handlePointerUp = () => {
      if (!holding) return;
      const charge = holdCharge;
      holding = false;
      holdCharge = 0;

      if (charge > 0.08) {
        /* Release energy scales with how long the orb was held. */
        burstLocalX = holdX;
        burstLocalY = holdY;
        pendingBurst = 0.3 + 0.7 * charge;
        burstFlash = 0.55 + 0.75 * charge;
        pointerEnergy = 1;
        setHint("BURST", true, holdX, holdY);
        window.setTimeout(() => {
          if (!holding) setHint("", false);
        }, 650);
      } else {
        setHint("", false);
      }
    };

    const handleScroll = () => {
      const next = window.scrollY;
      const scrollDelta = Math.abs(next - scrollNow);
      scrollNow = next;
      if (!reduced && !holding && scrollDelta > 1 && scrollDelta < 1200) {
        pendingTurbulence = Math.min(SCROLL_KICK, pendingTurbulence + scrollDelta * 22);
      }
    };

    const handleWindowResize = () => {
      /* Zoom / monitor changes can alter DPR without the element's CSS size
         changing, so re-apply from the current box. */
      const rect = host.getBoundingClientRect();
      applySize(rect.width, rect.height);
    };

    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleMotionPreference = () => {
      reduced = motionQuery.matches;
      if (reduced) {
        stop();
        drawStatic();
      } else {
        start();
      }
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        visible = entry.isIntersecting;
        if (!visible) {
          stop();
        } else if (reduced) {
          drawStatic();
        } else {
          start();
        }
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(canvas);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      applySize(entry.contentRect.width, entry.contentRect.height);
    });
    resizeObserver.observe(host);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerLeave, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleWindowResize);
    motionQuery.addEventListener("change", handleMotionPreference);

    const initialRect = host.getBoundingClientRect();
    if (initialRect.width > 0 && initialRect.height > 0) {
      applySize(initialRect.width, initialRect.height);
    }
    if (reduced) {
      drawStatic();
    } else {
      draw(elapsed, 1 / 60);
      start();
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleWindowResize);
      motionQuery.removeEventListener("change", handleMotionPreference);
    };
  }, [measured, dark]);

  const fallback = dark ? DARK_PALETTE.fallback : LIGHT_PALETTE.fallback;

  const rootStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    backgroundImage: fallback,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "100% 100%",
  };

  const canvasMask =
    "radial-gradient(closest-side, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 84%, rgba(0,0,0,0) 100%)";

  const canvasStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "block",
    pointerEvents: "none",
    /* Fade the cloud out before the canvas rectangle ends, so scattered
       particles never hit a visible square edge. */
    WebkitMaskImage: canvasMask,
    maskImage: canvasMask,
  };

  const rootClass = className
    ? `relative h-full w-full pointer-events-none ${className}`
    : "relative h-full w-full pointer-events-none";

  return (
    <div ref={hostRef} aria-hidden="true" className={rootClass} style={rootStyle}>
      {measured ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={canvasStyle}
        />
      ) : null}
      <div
        ref={hintRef}
        aria-hidden="true"
        className="site-mono pointer-events-none absolute left-0 top-0 z-10 select-none whitespace-nowrap rounded-full px-3 py-1.5 opacity-0 transition-opacity duration-200"
        style={{ background: "var(--site-ink)", color: "var(--site-bg)" }}
      />
    </div>
  );
}

export default VioletOrb;
