# Hero background video — AI generation prompt

**Target:** a new hero background for the portfolio home page — replaces `public/hero-banner-scroll.mp4` + `public/hero-poster.jpg`, rendered behind the four scrubbed headline scenes in `ScrollVideoHero`.
**Format:** 10.0 s · 16:9 · 24 fps · 3840×2160 master, 1920×1080 delivery · silent · ≤ 4 MB.
**Written against (read-only):** `app/globals.css`, `app/components/motion/ScrollVideoHero.tsx`, `app/components/motion/FloatingPetals.tsx`, `app/lib/settings-db.ts`, `app/data/heroScenes.ts`, `prisma/scripts/seed-settings.ts`, `app/data/aboutChapters.ts`, `public/hero-poster.jpg`, `public/case-studies/{monili,pno,scanphys,t2g,vijit}.jpg`.

---

## 0 · Grounding — what this video has to sit inside

### 0.1 The public design tokens (`app/globals.css`)

| Role | Hex | Notes |
|---|---|---|
| Page shell / deepest shadow | `#0A0A0B` | `body` background, visible behind the rounded white content sheet |
| Ink / `--accent` | `#18181B` | near-black is the accent; `--accent-hover` is `#3F3F46` |
| Graphite | `#3F3F46` | secondary ink, rules, shadows |
| Muted zinc | `#71717A`, `#A1A1AA` | body copy, eyebrow labels |
| Paper / soft fill | `#F4F4F5` | image frames, chips, placeholders |
| Rules | `#E4E4E7` | 1 px editorial dividers |
| Content sheet | `#FFFFFF` | every section below the hero |
| Violet accent | `#8B5CF6` | link underline, CTA hover, reading-progress gradient start |
| Deep violet | `#7C3AED` | numbered labels, active nav |
| Lilac tints | `#C4B5FD`, `#F5F3FF` | hover fills |
| Blush (existing hero motif) | `#E0AEC7` | from `FloatingPetals` `hsla(330, 45%, 78%)`; the film now carries it on a paper offcut |
| Warm paper (case-study tint) | `#EDE8E2` | Monili project theme — optional warmth |
| Cool screen glow (new) | `#C4B5FD` | laptop-screen bloom and blurred artboards; keep under ~5 % of frame |

The accent is near-black, not colour. Violet appears only as a small, deliberate hit. That ratio is the whole palette rule: **graphite and ivory do the work; violet and blush are accents.**

### 0.2 Type and chrome

- Type is **Inter** (`next/font`, `--font-inter`), hero H1 **ExtraBold 800**, tracking **−0.04em**, leading **0.92**; micro-labels are uppercase with **0.2em** tracking and monospace counters. The video carries no type at all — it must feel like the quiet plane *under* that type: large calm fields, tiny precise details, nothing fussy.
- Site chrome: floating glass nav pill (52 px) top-centre; white body sheet with 2 rem rounded bottom corners on `#0A0A0B`; thin 1 px rules; white CTA pill; reading-progress gradient `#8B5CF6 → #C4B5FD`.

### 0.3 How the hero actually plays (`ScrollVideoHero.tsx`)

- The hero is **420 vh tall**; a **sticky 100 vh stage** holds the film. The `<video>` is desktop-only (`min-width: 768px`), muted, paused, and **seek-scrubbed** by scroll via `video.currentTime`; each decoded frame is painted to a `<canvas>` so seeking never blanks.
- **Canvas and poster both get `filter: saturate(1.2)`** — author colour at ~90 % saturation; vivid reds/violets will clip.
- Headline copy is **left-aligned white text** in a `max-w-2xl` block, vertically centred, with heavy text-shadows (`hero-shadow-*`). The first scene is `h1`; the rest are `h2`.
- That block occupies roughly **x 10–58 %, y 30–70 %** on common desktop widths. The video's **human subject, laptop and screen glow must live to its right in every frame** — never drift into the left band.
- **FloatingPetals** draws ~22 blush petals (`hsla(330,45%,78%)` ≈ `#E0AEC7`) drifting **top-right → bottom-left** above the video, below the text. The film echoes that wind direction with one or two paper offcuts — same wind, quieter objects — so the overlay petals and the film's offcuts read as one weather system; it must never compete with them.
- Bottom **256 px fades to `#FFFFFF`**; there is a thin progress bar at the bottom and a "Scroll" hint bottom-centre.
- Phones (< 768 px) **never load the video** — they show `hero-poster.jpg` full-bleed with a left-to-right dark wash. The poster is a real deliverable, not an afterthought.
- The video is **scrubbed**, not autoplayed or looped: scroll `p` maps linearly to `duration − 0.05 s`. It reaches its last frame exactly as the page settles on the CTA.

### 0.4 Current assets

| Asset | Facts |
|---|---|
| `public/hero-banner-scroll.mp4` | H.264, **1280×720**, **9.04 s**, **3,447,977 B** (≈ 3.05 Mbps), silent |
| `public/hero-poster.jpg` | 1280×720, 163,775 B |

So a ~9 s hero has historically shipped in **3.3 MB**; the new 10 s file should stay in the same envelope (< 4 MB).

### 0.5 The outgoing hero and why the direction changes

The current poster is a 3D forest — a laptop on a mossy stump, cherry petals in the air. It is soft and pleasant, but its greens/blues/sky sit outside the zinc-and-violet token system and it reads as stock 3D. The site's own case-study imagery is instead **desk-and-mockup photography** (Monili's jewellery desk, P&O's laptop by the pool, ScanPhys's laptop on a stand, Tip2Gether's phone on a pitch, Vijit's overhead desk).

The new hero keeps that desk language and its paper/ink/swatch vocabulary, and adds **one real human anchor: a graphic designer working at a laptop**. The figure is a man in his early thirties — short dark hair, a close-trimmed beard, thin dark rectangular glasses — seen from behind and slightly left in three-quarter rear profile, over the left shoulder. His head is turned towards the screen, so his jaw and the rim of his glasses catch the lilac glow while the **face is never front-on** to camera; the head and shoulder line stay softly out of focus. He reads as "someone at work", not a portrait or a stock model. That left-rear camera puts the designer and laptop in the right of frame, leaving the left band quiet for the site's headlines. The laptop is a prop: its screen is only a **soft lilac bloom with blurred artboards and mockup shapes**, never a readable interface, so nothing can garble behind the overlaid headlines. It keeps the outgoing hero's **soft depth and blush accent** — the accent now carried by print-shop paper offcuts while the live `FloatingPetals` overlay keeps the blossom motif — and retires the forest. If a human take cannot be made to hold up, the no-person fallback in **§5.3** keeps the same desk, palette and light.

### 0.6 The person the film represents (tone test, not literal subject)

- **Zayne Mundo** — Graphic Designer & Web Developer, UAE. Currently Graphic Designer at **Office Inspirations** (Jun 2025–present): account visibility **+640 %**, website visibility **+146 %**, engagement **35 % → 68 %**. Previously **Media OnClick FZ LLC** (Sep 2023–Feb 2024) and **Nordic Home Healthcare** (Feb 2024–Jun 2024; SEO, brochures, website rebuild). **BSc (Hons) Creative Computing, Bath Spa University, 2020–2023.**
- Practice: **2D illustration, mockups, visual design, social media management, HTML5/CSS3/JavaScript, WordPress, design research, responsive design, digital marketing, Figma**; tools Photoshop, Illustrator, Premiere, VS Code, ZOHO.
- Portfolio sectors: luxury jewellery e-commerce, marina/leisure, healthcare, real estate, sports tech.
- **Meaning map:** the designer's three-quarter profile and dark glasses = the person at work, anonymous · paper and print = brand/mockup craft · grid and contact sheet = web systems and campaign cadence · swatches/riso = campaign colour · screen glow = the digital half of the practice · blush paper offcut = the trimmed edges of the craft (the blossom motif stays in the `FloatingPetals` overlay) · light falloff = restraint and measured growth.
- Nothing literal: **no portrait, no front-on face, no name, no contact details** in the film. The designer is a soft three-quarter profile in dark glasses; the site already overlays the name.

---

## 1 · One-line brief

A silent, seamless 10-second macro film of a male graphic designer at a laptop — a man in his early thirties with a trimmed beard and thin dark rectangular glasses, seen in three-quarter rear profile over the left shoulder, never front-on — surrounded by ivory paper, a printed grid, risograph violet, colour swatches and two paper offcuts, blush and ivory, on deep graphite; built to scrub under four white headlines with the subject right of centre and the left 55 % quiet, and containing no readable text, logos or UI.

---

## 2 · Main prompt (primary deliverable)

### 2.1 Generation settings

| Setting | Value |
|---|---|
| Model | Veo 3 / 3.1, Sora, Runway Gen-4, Kling, Luma Ray (first/last-frame mode if available) |
| Subject | one male graphic designer (early 30s), short dark hair, close-trimmed beard, thin dark rectangular glasses; three-quarter rear profile over the left shoulder, head turned to the screen, face never front-on; hands mostly at rest |
| Aspect | 16:9 |
| Length | 10.0 s (240 frames @ 24 fps) |
| Resolution | 3840×2160, or 1920×1080 minimum |
| Frame rate | 24 fps, constant (24.000) |
| Camera | tripod behind the left shoulder (subject sits right of frame), one continuous slow push–pull, ≤ 4 % scale change; head turned ~45° so the glasses read in profile |
| Screen | abstract lilac glow (`#C4B5FD`), blurred artboards/mockups; no legible UI or text |
| Audio | none |
| Look reference | macro editorial/documentary still-life, matte, tactile |

### 2.2 Copy-paste prompt

> A 10-second, 16:9, 24 fps, 4K macro film of a graphic designer working at a laptop, one unbroken take. Camera behind and slightly left, over the left shoulder, three-quarter rear: a man in his early thirties — short dark hair, close-trimmed beard, thin dark rectangular glasses — sits at a matte charcoal desk (#0A0A0B, #18181B), head turned about 45° towards the screen so his jaw, cheekbone and the full side of his thin dark rectangular glasses catch the light; his face is never front-on and the background is softly out of focus. He wears a plain dark shirt. The laptop faces him and reads to camera only as a soft lilac bloom (#C4B5FD) with blurred artboards and mockup shapes — no readable interface, no text. Around it: layered ivory paper (#F4F4F5, #FFFFFF) a few millimetres apart, a faint printed grid and contact sheet, loose colour-swatch chips, risograph-printed shapes in violet (#8B5CF6), and two paper offcuts, blush-pink (#E0AEC7) and ivory. Hands are simple and mostly at rest on the desk and trackpad. Soft key light from the upper right, plus cool screen glow edging his glasses; the left half of frame stays in deep, even shade. The camera pushes in about 4 % over five seconds, then pulls back to exactly the opening framing by 10.0 seconds, closing a seamless loop — no cuts, no shake, no rack focus. The man stays right of centre; the left 55 % and bottom 20 % stay calm for overlaid type. Fine 35 mm grain, matte blacks, restrained saturation; no lettering or logos. Quiet, focused, editorial: a studio at work.

*(266 words. If a model rejects hex codes, substitute colour names in the same order: deep graphite, ivory, muted violet, lilac screen glow, blush pink.)*

### 2.3 Generator notes

- **Best loop method:** generate a graded 16:9 still of frame 0 first, then use **image-to-video with the same image as both first and last frame** (Veo 3.1 first/last frame, Kling start/end frame, Runway keyframes, Luma keyframes). The model supplies the motion between and the loop closes by construction. Text-to-video is the fallback; then trim to the frame nearest frame 0.
- Generate **3–4 takes minimum**, fixed seed where the tool allows; motion strength low (~30–40 %), camera motion "slow / subtle".
- **Human takes need more attempts than object takes** — budget 6–8. The model drifts anatomy, identity, head position, glasses and clothing most between cuts and between first/last frames. Control the face by composition (three-quarter rear profile, never front-on, soft focus) and treat the glasses as a fixed prop to check on every beat.
- **Keep hands still.** Moving hands are the main failure mode: extra/fused fingers, wrist warps and hand pop-in. "Simple and mostly at rest" in the prompt is deliberate — do not ask for typing, clicking or drawing motion; let the scroll provide the perceived activity.
- **Keep the paper offcuts rigid.** They should drift and rotate as flat paper, never flutter, flap or shape-shift. Pin one offcut down in frame 0 as an anchor, and expect to trim a take where the pieces duplicate or spawn extra chips.
- **The glasses carry the identity:** thin dark rectangular frames, clear lenses, one soft rim highlight. Ban UI/text reflections in the lenses, and check frames 0 / 120 / 239 for a single consistent pair — models warp, double, disappear or morph frames over a 10-second take. Short hair and a trimmed beard keep the "man" read without ever showing a full face.
- **Never name design software** (Figma, Photoshop, Illustrator): models often render their logos or a fake toolbar. "Blurred artboards and mockup shapes" is the safe level of detail; anything more will produce garbled UI at some scrub position.
- **No stock-model energy:** plain dark shirt, no smile, no eye contact, no businesswear, no corporate desk props. He looks at the screen, never the camera; quiet, focused posture only.
- **Frame 0 must be fully lit.** No fade-in from black: the component seeks to `0.001 s` and paints that frame next to the poster, so a black first frame produces a visible flash.
- If the tool caps at 8 s (Veo 3), keep the beat proportions and let the site retime (it scrubs by percentage): 0 / 2.1 / 4.0 / 5.8 s, ending at 8.0 s.
- Generate at the highest frame rate offered and conform to 24 fps in ffmpeg — this footage is slow enough that frame-rate conversion is invisible.
- **If the human keeps failing after ~6 takes, stop and use Option B in §5.3** (laptop-only). Do not waste the budget chasing hands or a full face the composition does not need.
- The prompt deliberately avoids "cinematic" as a mood word; it is doing specific work instead (light direction, screen abstraction, human placement, loop framing).

---

## 3 · Scene map — 10 seconds mapped to the 4 scroll scenes

Scene copy now lives in one place — `app/data/heroScenes.ts` — used by the seed, the DB fallback and the admin. The four windows are **0–0.28 / 0.26–0.52 / 0.50–0.74 / 0.72–0.90** of scroll progress. Scroll maps linearly to video time, so scene changes land at **≈ 2.6 s, 5.0 s, 7.2 s**. The 2.5 s grid below is close enough to be safe and easier to art-direct.

| Video time | Frames @24 | Scroll p | On-screen copy | What the film is doing | Text-safe zone |
|---|---|---|---|---|---|
| **0.0–2.5 s** | 0–60 | 0–0.25 | **"Zayne Mundo"** (H1) | Widest, darkest frame, and the poster: the designer's three-quarter rear profile — short hair, beard and glasses rim — sits at the right edge; the laptop is a small lilac glow (#C4B5FD); two paper offcuts, blush and ivory, sit top-centre-right, the blush one drifting; the left 55 % is soft graphite falloff with no human detail. Stable enough to ship as `hero-poster.jpg`. | x 8–58 %, y 22–72 % quiet |
| **2.5–5.0 s** | 60–120 | 0.25–0.50 | **"Design that moves the numbers"** | Camera pushes toward the designer and the screen: the lilac glow widens and lights the rim of his glasses; blurred artboards and the resting hand on the trackpad read; ivory paper, contact sheet and swatches come into alignment; the shoulder line holds at x ≈ 62–95 %. Rows and repeated marks read as a system — order and measurement. The blush offcut crosses the upper frame. | Focal objects x > 62 %; left band stays in shade |
| **5.0–7.5 s** | 120–180 | 0.50–0.75 | **"Every detail is a decision"** | Closest macro, **face out of frame**: a relaxed hand resting beside a trimmed ivory sheet and the laptop edge; paper fibre, letterpress emboss, halftone dots, riso misregistration; screen glow rims the wrist. Violet is at its strongest but still < 10 % of frame. Tactile detail stays bottom-right. | Detail concentrated bottom-right; left falloff holds |
| **7.5–10.0 s** | 180–239 | 0.75–1.00 | **"Let's make something worth sharing."** + CTA "Get in touch" | Camera eases back to the opening framing; the shoulder and glasses return to their frame-0 positions and the screen glow settles to its opening level; the blush offcut exits lower-left by ~9.4 s. The CTA arrives at ~7.2 s and stays while the image settles — at 10.0 s the composition exactly matches 0.0 s, so scrolling back up retraces the same path. | Left clean, bottom 20 % quiet for the white fade and progress bar |

### 3.1 Start-frame / end-frame match (the seamless loop)

- **The loop device is the push–pull:** 100 % → ~104 % at 5.0 s → 100 % at 10.0 s. Frame 0 and frame 239 must be the same composition, same light, same **shoulder/head/glasses position, screen-glow level and offcut positions**. Any drift in the human's silhouette is a visible pop when the hero settles on the CTA.
- **Tolerance for acceptance:** SSIM ≥ 0.95 between first and last frame; scale drift ≤ 1 %; colour drift ΔE ≤ 2; no exposure step. Check with the command in §6.6.
- **Do not fix the hero loop with a crossfade.** The site scrubs the file; a dissolve at the ends would show as a smeared frame while scrolling. If the model cannot close the loop, trim the take to the frame nearest frame 0.
- For the standalone mobile and Reels loops (§5), a 6-frame crossfade is acceptable because those files autoplay rather than scrub.
- The site itself never autoplays or loops this clip, so loop closure is about reuse and polish; the first-view requirement is simply that **frame 0 is beautiful and the poster matches it**.
- **Copy-version note:** scene copy was consolidated into `app/data/heroScenes.ts` (four scenes, windows above). The film deliberately works without reading a word of it — the beats are visual, so later copy edits cannot break the mapping.

---

## 4 · Negative prompt

Paste into the negative field; if the tool has only a short field, use the priority line below it. **The human is allowed** — this list bans what makes AI humans fail (faces, hands, stock poses, screen text), not people in general.

```text
readable text, letters, words, typography, handwriting, numbers, captions, subtitles, watermark, signature, logos, brand marks, icons, barcodes, QR codes, UI screens, website interfaces, browser chrome, readable screen content, front-on face, direct eye contact, full-face portrait, face morphing, distorted face, distorted anatomy, extra fingers, missing fingers, fused fingers, extra limbs, extra hands, deformed hands, malformed wrists, mannequin, doll, plastic skin, waxy skin, uncanny valley, stock-photo model, posed portrait, smiling, corporate office, second person, duplicated head, cloned person, warped glasses, doubled glasses, extra lenses, melting frames, floating glasses, UI reflections in lenses, fast cuts, jump cuts, transitions, wipes, motion blur, speed ramps, camera shake, handheld, dutch angle, zoom punch, rack focus, strobing, flicker, flashing, morphing, melting, warping, wobbling objects, duplicated objects, extra paper offcuts, flower petals, blossom petals, falling leaves, confetti, object pop-in, floating debris, dust motes, oversaturated neon, magenta cast, teal-and-orange grade, heavy vignette, HDR glow, bloom, lens flare, bokeh balls, chromatic aberration, glitch, VHS, film burn, freeze frame, stutter, low frame rate, stock-photo look, laptop on a stump, photoreal forest, 3D render look, plastic CGI surfaces, cartoon, low-poly, illustration outlines, oversharpening, heavy denoise, JPEG artifacts, colour banding, noise flicker.
```

**Priority short version (small negative fields):**

```text
readable text, watermark, logos, front-facing face, warped glasses, deformed hands, extra fingers, UI screens, cuts, camera shake, morphing, flicker, oversaturated neon, stock footage, flower petals, 3D render
```

---

## 5 · Variants (plus a no-person fallback)

### 5.1 Variant A — 5-second tight loop (mobile / low bandwidth)

**Use:** low-bandwidth or smaller-screen playback, tablets at 768–1023 px, or a future mobile hero. Note that phones currently never fetch the hero video (`ScrollVideoHero` gates on `min-width: 768px`) — this file does not go live unless playback is enabled for them.

| Setting | Value |
|---|---|
| Length | 5.0 s (120 frames) |
| Aspect / res | 16:9, 1280×720 (960×540 acceptable) |
| Frame rate | 24 fps |
| Size target | **≤ 1.2 MB** (ceiling 1.5 MB) |
| Loop | 100 % → 102 % → 100 %; frame 0 = frame 119 |

**Prompt:**

> A 5-second, 16:9, 24 fps macro loop of a graphic designer working at a laptop, for low-bandwidth playback. Camera behind and slightly left, over the left shoulder: a man in his early thirties with short dark hair, a trimmed beard and thin dark rectangular glasses, head turned towards the screen in three-quarter rear profile, face never front-on, softly out of focus, at a matte charcoal desk (#0A0A0B, #18181B). The laptop screen is a soft lilac bloom (#C4B5FD) with blurred artboards — no readable UI or text. Ivory paper (#F4F4F5), a faint printed grid and contact sheet, three colour-swatch chips, small risograph shapes in violet (#8B5CF6) and one blush-pink paper offcut (#E0AEC7) sit around it. Soft upper-right key light, screen glow, left half in deep even shade. The camera pushes 2 % and returns to the exact opening frame by 5.0 seconds; the designer stays right of centre, left 55 % calm. Fine grain, matte blacks. No lettering, logos or readable screen text.

> **Encode:** see command 6.3c. Do **not** simply cut the first 5 s of the 10 s master — that ends on the close-up and will not loop.

### 5.2 Variant B — 9:16 vertical, 6 seconds (Instagram Reels / LinkedIn)

**Use:** social cuts of the same hero look; also fine as a teaser clip. For LinkedIn's feed, centre-crop to 4:5 (1080×1350) — same file, different export.

| Setting | Value |
|---|---|
| Length | 6.0 s (144 frames) |
| Aspect / res | 9:16, 1080×1920 |
| Frame rate | 24 fps |
| Codec | H.264 High, CRF 22–24, ~8–12 Mbps, 6–10 MB |
| Safe areas | y 0–12 % and y 82–100 % kept calm (Reels UI); focal column x 18–82 % |
| Loop | 100 % → 103 %, downward drift, back to 100 %; frame 0 = frame 143 |

**Prompt:**

> A 6-second, 9:16, 24 fps vertical film of a graphic designer working at a laptop. Camera behind and slightly left, over the left shoulder, composed as a vertical stack: the designer's dark shoulder, short dark hair and softly out-of-focus three-quarter profile with thin dark rectangular glasses fill the upper right, face never front-on; the laptop below with a soft lilac screen bloom (#C4B5FD) and blurred artboards — no readable UI or text; ivory paper (#F4F4F5, #FFFFFF), a printed grid and contact sheet, four colour-swatch chips and one blush-pink paper offcut (#E0AEC7) on a matte charcoal desk (#0A0A0B, #18181B). Soft upper-right key plus screen glow, deep even shade on the left, fine 35 mm grain, matte blacks. The camera drifts down about 3 % and returns to exactly the opening framing by 6.0 seconds; the designer stays in the right 45 % of frame. Keep the top 12 % and bottom 15 % calm for platform UI. No lettering, logos or readable screen text.

> **Encode:** see command 6.3d. Platform captions and UI will cover the top and bottom bands — that is why they are empty.

### 5.3 Option B — no person (laptop-only close-up)

Use if the human takes keep failing, or the user later prefers an object-only hero. Same charcoal desk, palette, light, grain, push–pull loop and encode specs as §6.1. (The male-designer-with-glasses brief applies to the main film and variants A/B only — this fallback has no human.)

- **Composition:** laptop open at right of centre, lid at 30–40°; screen a soft lilac bloom (`#C4B5FD`) with blurred artboard rectangles and mockup thumbnails — glow only, no readable UI or text. Ivory paper, contact sheet, swatch chips, two violet riso shapes and one blush-pink paper offcut around it; left 55 % and bottom 20 % empty.
- **Prompt (copy-paste):** "A 10-second, 16:9, 24 fps macro film of an open laptop on a matte charcoal designer's desk (#0A0A0B, #18181B), in one unbroken take. The screen is a soft lilac bloom (#C4B5FD) with blurred artboards and mockup shapes — no readable interface, no text. Around it, layered ivory paper (#F4F4F5), a faint printed grid and contact sheet, colour-swatch chips, risograph shapes in violet (#8B5CF6) and one blush-pink paper offcut (#E0AEC7). Soft upper-right key light plus screen glow; deep even shade on the left. The camera pushes in about 4 % over five seconds and pulls back to the exact opening framing by 10.0 seconds, closing a seamless loop — no cuts, no shake. The laptop stays right of centre, leaving the left 55 % and bottom 20 % calm for overlaid type. Fine 35 mm grain, matte blacks, restrained saturation. No lettering, logos or readable screen text."
- **Loop and QC:** identical to §3.1 and §6.6 (frame 0 = frame 239); the human-specific checks in §7 are simply not needed.

**Not recommended — literal "designer inside the laptop":** a tiny figure working on the display is a charming surreal image, but for a scroll-scrubbed hero it fights the overlaid headlines, invites garbled UI at arbitrary scrub points, and breaks the restrained editorial tone. Keep it as a one-off social image, not the hero.

---

## 6 · Technical hand-off

### 6.1 Delivery specs

| Item | Spec |
|---|---|
| Container / codec | MP4 · H.264 High profile, level 4.0 |
| Resolution | 1920×1080 (master 3840×2160, ProRes 422 HQ or DNxHR HQX) |
| Frame rate | 24.000 fps, constant |
| Duration | 10.000 s / 240 frames |
| Pixel format / colour | `yuv420p`, 8-bit, BT.709 primaries/transfer, limited (TV) range |
| Video bitrate | 2.7–3.0 Mbps capped VBR (CRF 27 + maxrate 3.0 M) |
| GOP / keyframes | **12 frames (0.5 s)**, scene-cut detection off |
| Audio | **none** (`-an`) |
| Streaming | `+faststart` (moov atom first) |
| File size | **3.4–3.8 MB target, 4.0 MB ceiling** |
| Poster | frame 0, 1920×1080 JPEG, ~150–350 KB |

**Why dense keyframes:** the hero issues a `currentTime` seek on every scroll step. A 0.5 s GOP makes scrub response feel direct; the cost is ~10–15 % bitrate. If size is tight, raise GOP to 24 **before** touching resolution. Grain is the other bitrate eater — reduce grain to 2 % before dropping from 1080p.

### 6.2 Where the files go

- Drop-in replacement: **`public/hero-banner-scroll.mp4`** + **`public/hero-poster.jpg`** — `heroVideoUrl` / `heroPosterUrl` default to these paths.
- **If the dashboard has already uploaded a hero**, the DB stores an absolute Blob URL; replacing files in `public/` will **not** change what the site loads. Upload through the admin hero screen (`/homepage/hero`) or update `heroVideoUrl` / `heroPosterUrl`.
- Admin accepts MP4/WebM up to 100 MB and posters up to 10 MB — that is just the upload guard; the page budget is the < 4 MB target.
- **No code change needed** for desktop. Mobile still shows the poster by design.
- The poster must be exported from the **delivered video's frame 0** (same grade), so the poster → canvas handover is invisible.
- Suggested names for variants: `public/hero-banner-scroll-5s.mp4`, `public/hero-banner-reels.mp4`.

### 6.3 Compression commands (PowerShell, from the repo root)

If ffmpeg is missing on Windows: `winget install Gyan.FFmpeg`, then reopen the terminal. Commands target ffmpeg 6+/7+ (x264, SVT-AV1).

**a) Master → 1080p delivery**

```powershell
ffmpeg -i "hero-master.mov" -vf "scale=1920:1080:flags=lanczos,format=yuv420p" -r 24 `
  -c:v libx264 -profile:v high -level 4.0 -preset slow -tune film `
  -crf 27 -maxrate 3.0M -bufsize 6.0M -g 12 -keyint_min 12 -sc_threshold 0 `
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv `
  -movflags +faststart -an "public/hero-banner-scroll.mp4"
```

**b) Poster from the delivered file (frame 0, same grade)**

```powershell
ffmpeg -y -i "public/hero-banner-scroll.mp4" -frames:v 1 -vf "scale=1920:1080:flags=lanczos" -q:v 4 "public/hero-poster.jpg"
```

**c) 5-second low-bandwidth loop**

```powershell
ffmpeg -i "hero-master-5s.mov" -vf "scale=1280:720:flags=lanczos,format=yuv420p" -r 24 `
  -c:v libx264 -profile:v high -preset slow -crf 30 -maxrate 1.8M -bufsize 3.6M `
  -g 12 -keyint_min 12 -sc_threshold 0 -movflags +faststart -an "public/hero-banner-scroll-5s.mp4"
```

**d) 9:16 Reels / LinkedIn cut**

```powershell
ffmpeg -i "hero-master-9x16.mov" -vf "scale=1080:1920:flags=lanczos,format=yuv420p" -r 24 `
  -c:v libx264 -profile:v high -level 4.2 -preset slow -crf 23 -maxrate 12M -bufsize 24M `
  -g 12 -keyint_min 12 -sc_threshold 0 `
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 `
  -movflags +faststart -an "hero-reels-9x16.mp4"
```

**e) AV1 / WebM alternative (≈ 35–45 % smaller)**

```powershell
ffmpeg -i "hero-master.mov" -vf "scale=1920:1080:flags=lanczos,format=yuv420p" -r 24 `
  -c:v libsvtav1 -preset 6 -crf 34 -g 12 -an "public/hero-banner-scroll-av1.webm"
```

> Caveat: `ScrollVideoHero` renders a **single `<video src>`**, with no `<source>` fallback. A WebM/AV1-only file shows the poster on Safari builds without AV1. Keep H.264 as the live file; AV1 is a future option once a `<source>` ladder exists.

*`avconvert` (macOS) is a preset-only wrapper — `avconvert --preset Preset1920x1080 --source hero-master.mov --output hero-banner-scroll.mp4` gets you a file, but with no control over GOP, bitrate or faststart. Prefer ffmpeg.*

### 6.4 If the file comes out over 4 MB

1. Raise CRF to 29–30 (biggest lever, slight quality cost on grain).
2. Reduce baked-in grain from 4 % to 2 % and re-export from the master.
3. Raise GOP from 12 → 24 (scrub response degrades slightly).
4. Drop delivery to 1600×900 and keep 24 fps.
5. Do not drop below 1600×900; the canvas is displayed full-viewport.

### 6.5 Verify the encode

```powershell
ffprobe -v error -select_streams v:0 `
  -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,pix_fmt,bit_rate:format=duration,size `
  -of default=noprint_wrappers=1 "public/hero-banner-scroll.mp4"
```

Expect: `h264`, `1920`, `1080`, `24/1`, `240`, `yuv420p`, ~`2700000–3000000`, `duration=10.0`, `size≈3400000–3800000`.

### 6.6 Loop and legibility QC

```powershell
# 10-frame contact sheet — fastest way to judge the whole beat
ffmpeg -y -i "public/hero-banner-scroll.mp4" -vf "fps=1,scale=384:-1,tile=5x2" -frames:v 1 "hero-contact-sheet.jpg"

# first and last frame, then compare (SSIM ≥ 0.95 for the loop)
ffmpeg -y -i "public/hero-banner-scroll.mp4" -vf "select=eq(n\,0)" -frames:v 1 "frame-000.png"
ffmpeg -y -i "public/hero-banner-scroll.mp4" -vf "select=eq(n\,239)" -frames:v 1 "frame-239.png"
ffmpeg -i "frame-000.png" -i "frame-239.png" -lavfi ssim -f null -

# average luma in the text block's home (x 8–58 %, y 25–75 %); aim ≤ 80/255, hard ceiling 110.
# The designer and screen glow are the main risk to this zone — check it on every take.
ffmpeg -i "public/hero-banner-scroll.mp4" -vf "crop=iw*0.50:ih*0.50:iw*0.08:ih*0.25,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null - 2>&1 | Select-String "YAVG" | Select-Object -First 6
```

---

## 7 · Do / Don't checklist — accept or reject a take in 30 seconds

### Accept only if

- [ ] **Frame 0 is fully lit and could ship as the poster on its own** — no fade-in, no black, no title card feel.
- [ ] **The designer reads as a man with glasses:** three-quarter rear profile, short dark hair, close-trimmed beard, and one consistent pair of thin dark rectangular glasses. Face never front-on, eyes never staring at the camera.
- [ ] **Hands are anatomically plausible:** correct finger count, relaxed, mostly at rest. Compare frames 0 / 120 / 239 for finger count, wrist shape and hand pop-in.
- [ ] **One person only:** same plain dark shirt, same head/shoulder/glasses position, no duplicate head or limbs, no pop-in between frames.
- [ ] **Glasses hold:** straight frames, clear lenses, one pair only, no UI/text reflection, same shape at frames 0 / 120 / 239 — no warping, doubling or disappearing between beats.
- [ ] **The subject stays right of centre in every frame:** shoulder, laptop and screen glow confined to x > 62 %; the left band (x 8–58 %, y 22–72 %) stays quiet. Check at least frames 0, 60, 120, 180, 239.
- [ ] **The screen is abstract:** lilac glow and blurred artboard/mockup shapes only — no readable UI, text, browser chrome, code or brand marks at 100 % zoom.
- [ ] **Palette obeys the ratio:** graphite/ivory dominate; violet is a small deliberate hit (< 8 % of frame); blush is 2–4 %; screen glow stays lilac, not cyan or white-hot.
- [ ] **White type is comfortable at every scroll position** at 1440, 1920 and 2560 px widths.
- [ ] **Motion is one continuous take:** ≤ 4 % scale change, no cuts, no shake, background drift essentially imperceptible.
- [ ] **The texture is tactile, not digital:** paper fibre, letterpress emboss, static halftone, matte blacks, fine grain. No HDR bloom, no plastic surfaces.
- [ ] **Objects hold their shape:** grid lines straight, sheet edges crisp, paper-offcut count constant from first to last frame.
- [ ] **The loop closes:** frame 0 ↔ 239 SSIM ≥ 0.95 — including shoulder/head/glasses position and screen-glow level; no exposure or colour step.
- [ ] **The encode is right:** 1920×1080, 24 fps, H.264, < 4 MB, silent, faststart.

### Reject immediately if

- Any readable glyph, watermark, "AI" mark, or paper with printed words.
- A front-on or near-frontal face, direct eye contact, or the head turning toward the camera.
- Face morphing between frames (even if hidden at the start), a second face, or a duplicated head.
- Warped, doubled, missing or extra glasses; mirrored UI or text in the lenses.
- Distorted hands: extra, fused or missing fingers, wrist warps, an arm entering from off-frame, hands that pop in.
- A mannequin, doll, plastic/waxy-skinned or uncanny-valley human; a 3D-render person.
- Stock-photo energy: smile, eye contact, businesswear, posed portrait, corporate office.
- A laptop screen with readable text, UI, browser chrome, code, or design-software logos.
- The designer drifting into the left band, or the shoulder/laptop sliding across frame between beats.
- A second person, a clothing change, or the chair/desk warping around the figure.
- Stock-photo desk: coffee cup, plants, spiral notebook with text, sticky notes — the Vijit flat-lay already uses that look; do not repeat it in the hero.
- Photoreal forest, moss, stump, or laptop-on-a-stump — that is the outgoing hero.
- Camera shake, speed ramp, zoom punch, cut, morph/warp, object popping, extra paper offcuts, flower petals.
- Neon violet, teal-and-orange grade, heavy vignette, HDR glow, lens flare, bokeh balls.
- Flat 3D-render/plastic CGI look; oversharpened, denoised or banded.
- A dark or underexposed first frame (poster flash risk).

### Site QA (once per accepted file)

1. `npm run dev` (Next 16.2.10) → `http://localhost:3000`.
2. Scroll slowly, fast, and back up; confirm the scrub follows the scroll without stalls and the text crossfades stay readable.
3. Hard-reload to check poster → video handover; there must be no flash or shift.
4. Check widths **390** (poster only; centre ~32 % crop — expect quiet dark desk and at most the edge of the shoulder/profile, not the whole figure; the text must still read), **768**, **1024**, **1440**, **1920**, **2560**.
5. Enable reduced motion: the video must not mount; the poster is the entire hero.
6. Run `npm run build && npm run start` once — image optimisation only runs in production (`app/lib/image-src.ts`), so the poster's optimised variants only appear there.
7. Test in Chrome and Safari (scrub seeking differs); accept only if both are smooth.

---

## 8 · Delivered take — 2026-11-07

First generated take shipped to the live site; recorded here so future work knows exactly what was accepted and what to fix next time.

- **Source:** user-supplied Designer_working_at_laptop_409da95e_1080p.mp4 — 1920×1080, 24 fps, 9.96 s, H.264 + AAC audio, 2.9 MB. Male designer with glasses: yes. Three-quarter rear profile, face never front-on: yes.
- **Delivered:** public/hero-banner-scroll.mp4 re-encoded to H.264 High, 1920×1080, 24.000 fps, CRF 26 + -maxrate 3.0M, GOP 12 / keyint-min 12 / sc-threshold 0, BT.709, faststart, **no audio**, **1.89 MB**. Poster: public/hero-poster.jpg, frame 0 exported from the delivered file (1920×1080, 66 KB).
- **Deviations from the brief (accepted):** the laptop screen shows a readable design-app UI and a macOS dock instead of the abstract lilac bloom; the camera **pulls back** from a tight frame to a wide desk shot — frame 0 ≠ frame 239 (SSIM ≈ 0.71, expected ≥ 0.95). That is acceptable only because the hero is **scroll-scrubbed and never loops on its own**; scroll down plays it forward, scroll up reverses it.
- **Added to the site:** a desktop-only left scrim in pp/components/motion/ScrollVideoHero.tsx — linear-gradient(to right, rgba(10,10,11,0.82) 0%, rgba(10,10,11,0.55) 28%, rgba(10,10,11,0.18) 55%, transparent 78%) — so the white headlines stay readable over the bright screen. Mobile keeps its existing dark wash; the scrim works for any future hero upload.
- **Next regeneration should enforce:** abstract screen (no dock, menu bar, tool panels or embedded mockups), static camera or a push–pull that returns to frame 0, a cooler charcoal grade closer to the token palette, and the blush/ivory paper offcuts.
