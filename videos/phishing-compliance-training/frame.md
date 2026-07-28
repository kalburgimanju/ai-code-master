---
colors:
  bg:
    primary: "#0B1A30"
    surface: "#14203E"
    surface_alt: "#1A2A4A"
    card: "#182848"
  text:
    primary: "#F0F4FF"
    secondary: "#8899B4"
    muted: "#5A6F8C"
    inverse: "#0B1A30"
  accent:
    teal: "#00D4AA"
    teal_dark: "#009977"
  semantic:
    amber: "#F59E0B"
    amber_muted: "#B8860B"
    danger: "#EF4444"
    success: "#10B981"
  decorative:
    glow_teal: "#00D4AA"
    glow_amber: "#F59E0B"
    grid: "#1E3355"
    rule: "#1E3355"
    rule_accent: "#233A60"

typography:
  display:
    family: "Montserrat"
    weight: 900
    size: "80-110px"
    letter_spacing: "-0.03em"
    line_height: 1.0
  headline:
    family: "Montserrat"
    weight: 700
    size: "48-72px"
    letter_spacing: "normal"
    line_height: 1.15
  subhead:
    family: "Montserrat"
    weight: 700
    size: "32-40px"
    letter_spacing: "0.02em"
    line_height: 1.2
  body:
    family: "IBM Plex Mono"
    weight: 400
    size: "24-32px"
    letter_spacing: "0.01em"
    line_height: 1.5
  label:
    family: "IBM Plex Mono"
    weight: 400
    size: "18-22px"
    letter_spacing: "0.08em"
    line_height: 1.3
  stat:
    family: "Montserrat"
    weight: 900
    size: "72-120px"
    letter_spacing: "-0.04em"
    line_height: 1.0
  caption:
    family: "IBM Plex Mono"
    weight: 400
    size: "16-18px"
    letter_spacing: "0.05em"
    line_height: 1.4
  lower_third_title:
    family: "Montserrat"
    weight: 700
    size: "28-34px"
    letter_spacing: "0.01em"
    line_height: 1.2
  lower_third_subtitle:
    family: "IBM Plex Mono"
    weight: 400
    size: "18-22px"
    letter_spacing: "0.06em"
    line_height: 1.3

spacing:
  base: 4
  scale: [4, 8, 16, 24, 32, 48, 64, 80, 100, 120]
  margin_h: 120
  margin_v: 80
  gutter: 24
  card_padding: 32
  section_gap: 48

borders:
  card:
    radius: 12
    stroke: 1.5
    color: "#1E3355"
  accent_bar:
    width: 4
    radius: 2
  callout:
    radius: 8
    stroke: 2
    color: "#233A60"
  pill:
    radius: 100
    padding: "12px 24px"
  lower_third:
    radius: 0
    stroke: 0

shadows:
  card: "0 4px 24px rgba(0,0,0,0.35)"
  elevated: "0 8px 40px rgba(0,0,0,0.45)"
  glow_teal: "0 0 30px rgba(0,212,170,0.25)"
  glow_amber: "0 0 30px rgba(245,158,11,0.25)"
  glow_danger: "0 0 30px rgba(239,68,68,0.25)"

grid:
  columns: 12
  column_width: 126
  gutter: 20
  safe_zone: "1720 x 920 (margins: 100h x 80v)"
  presenter_safe: "right 780px (presenter occupies left ~1140px of frame)"

components:
  logo_lockup:
    text: "CyberGuard"
    subtitle: "COMPLIANCE TRAINING"
    font: "Montserrat 700 / IBM Plex Mono 400 tracked 0.12em"
    size: "36px / 14px"
  progress_bar:
    height: 4
    fill: "teal"
    bg: "#1E3355"
    radius: 2
  lower_third:
    bg: "gradient(90deg, #14203E, transparent)"
    bar: "4px teal left edge"
    padding: "24px 32px"
    max_width: 700
  badge:
    bg: "teal at 12% opacity"
    text: "teal"
    radius: 100
    padding: "8px 20px"
    font: "IBM Plex Mono 400 16px 0.08em"
  divider:
    height: 1.5
    color: "#1E3355"
    style: "solid"
---

# Brand Design Spec -- Phishing Compliance Training

## Brand

**Company:** CyberGuard -- fictional cybersecurity compliance brand used for this training module. The visual system is designed to work with any real corporate logo placed in the top-left lockup area.

**Brand voice:** Authoritative, clear, calm. Not alarmist. Speaks to employees as capable partners in security, not as risks to manage.

---

## Overview

This spec defines the motion-graphics overlay layer for a ~5min phishing compliance training video with an AI presenter (talking head). The frame designs here govern everything that is NOT the presenter video feed: kinetic typography, diagrams, stats, email mockups, lower-thirds, section transitions, and decorative backgrounds.

The canvas is **1920x1080**. The presenter occupies the left or center portion of the frame; motion graphics occupy the remaining zones. The **accent-primary** is a cybersecurity teal (`#00D4AA`) for safe/positive/secure states. The **accent-secondary** is a caution amber (`#F59E0B`) for watch-out, warning, and flag-this moments. This dual-accent system is intentional: it lets the viewer instantly read the emotional register of any graphic -- teal = "this protects you", amber = "pay attention".

---

## Color Palette

### Backgrounds

| Token     | Hex       | Usage                                           |
| --------- | --------- | ----------------------------------------------- |
| `bg`      | `#0B1A30` | Full-frame background (deep navy, near-black)   |
| `surface` | `#14203E` | Card backgrounds, lower-thirds, panel fills      |
| `surface_alt` | `#1A2A4A` | Alternate card, hover/highlight states         |
| `card`    | `#182848` | Data cards, stat blocks, email mockup surfaces   |

### Text

| Token           | Hex       | Usage                                     |
| --------------- | --------- | ----------------------------------------- |
| `text_primary`  | `#F0F4FF` | Headlines, body text, labels              |
| `text_secondary`| `#8899B4` | Supporting text, subheaders, metadata     |
| `text_muted`    | `#5A6F8C` | Captions, secondary labels, timestamps    |
| `text_inverse`  | `#0B1A30` | On-light-surface text (rare; badges only) |

### Accents

| Token            | Hex       | Usage                                                |
| ---------------- | --------- | ---------------------------------------------------- |
| `teal`           | `#00D4AA` | Primary accent: progress bars, active states, icons  |
| `teal_dark`      | `#009977` | Accent text on dark bg, hover states                 |
| `amber`          | `#F59E0B` | Warning accent: caution callouts, "watch out" flags  |
| `amber_muted`    | `#B8860B` | Subdued warning: secondary caution elements          |
| `danger`         | `#EF4444` | Danger: threat indicators, critical alerts           |
| `success`        | `#10B981` | Success: positive confirmations, safe actions        |

### Decorative

| Token          | Hex       | Usage                                             |
| -------------- | --------- | ------------------------------------------------- |
| `glow_teal`    | `#00D4AA` | Teal glow effects -- 15-25% opacity radial blooms |
| `glow_amber`   | `#F59E0B` | Amber glow effects -- caution glow, 15-25%        |
| `grid`         | `#1E3355` | Grid lines, dot patterns, scan-line backgrounds   |
| `rule`         | `#1E3355` | Hairline dividers, horizontal rules               |
| `rule_accent`  | `#233A60` | Accent rules, stronger structural dividers        |

### Color use principles

- **One dominant accent per scene.** Use teal as the default accent. Switch to amber only during caution/warning moments. Never mix teal and amber as equal partners in a single frame.
- **Tint everything toward the brand.** All neutrals lean cool-blue, never dead gray. The background is navy-toned, not pure black. Rules and grid lines are blue-tinged.
- **Accent must be visible.** Teal and amber at full saturation for focal elements. For atmospheric glows, 15-25% opacity. Never below 10%.
- **No full-screen linear gradients.** On dark backgrounds they band under compression. Use radial gradients or solid fills + localized glows.

---

## Typography

### Pairing strategy

**Montserrat (sans display) + IBM Plex Mono (mono body).** This crosses the sans/mono boundary (never pair two sans-serifs on video). Montserrat 700/900 brings the authoritative, bold headline voice for corporate compliance. IBM Plex Mono brings the technical/security register -- it signals "this is serious, this is systems-level" without being cold. The weight contrast is extreme: 900 display vs 400 body, which reads clearly at a glance on video.

### Font roles

| Role               | Family           | Weight | Size        | Letter-spacing | Line-height | Usage                                      |
| ------------------ | ---------------- | ------ | ----------- | -------------- | ----------- | ------------------------------------------ |
| **Display**        | Montserrat       | 900    | 80-110px    | -0.03em        | 1.0         | Hero section titles, chapter openers       |
| **Headline**       | Montserrat       | 700    | 48-72px     | normal         | 1.15        | Scene headings, callout headers            |
| **Subhead**        | Montserrat       | 700    | 32-40px     | +0.02em        | 1.2         | Section sub-titles, card headers           |
| **Body**           | IBM Plex Mono    | 400    | 24-32px     | +0.01em        | 1.5         | Paragraph text, explanations               |
| **Label**          | IBM Plex Mono    | 400    | 18-22px     | +0.08em        | 1.3         | Field labels, timestamps, metadata         |
| **Stat/Numbers**   | Montserrat       | 900    | 72-120px    | -0.04em        | 1.0         | Data points, counters, percentages         |
| **Caption**        | IBM Plex Mono    | 400    | 16-18px     | +0.05em        | 1.4         | Footnotes, sources, legal disclaimers      |
| **Lower-third: title**  | Montserrat   | 700    | 28-34px     | +0.01em        | 1.2         | Speaker name                               |
| **Lower-third: subtitle**| IBM Plex Mono | 400 | 18-22px    | +0.06em        | 1.3         | Speaker title, department                  |

### Typography rules

- **Weight contrast must be extreme.** On video, 400 vs 700 is not enough. Use 900 vs 400 as the standard pair.
- **Fixed reading time.** 3 seconds on screen = must be readable in 2. Fewer words, larger type.
- **Tracking tighter than web.** -0.03 to -0.05em on display/stat sizes (video encoding compresses letter detail). Body gets a slight +0.01 to aid readability against dark backgrounds.
- **Increased line-height on dark.** Light-on-dark creates an illusion of tighter spacing. Add +0.05 to body line-height vs the light-background value.
- **UPPERCASE for labels only.** Labels and metadata get IBM Plex Mono uppercase with wide tracking (0.08em). Everything else uses sentence case.

---

## Design Tokens

### Spacing scale

The base unit is 4px. All spacing snaps to this scale.

| Token | Pixels | Usage                           |
| ----- | ------ | ------------------------------- |
| 1x    | 4      | Tiny separation, icon padding   |
| 2x    | 8      | Tight padding, gap              |
| 4x    | 16     | Label-to-value spacing          |
| 6x    | 24     | Content-to-border, card gap     |
| 8x    | 32     | Card inner padding              |
| 12x   | 48     | Section gap, sub-scene gap      |
| 16x   | 64     | Major section separation        |
| 20x   | 80     | Vertical margin from edges      |
| 25x   | 100    | Horizontal margin from edges    |
| 30x   | 120    | Wide separation, hero margins   |

### Borders and radius

| Token              | Value                 | Usage                                  |
| ------------------ | --------------------- | -------------------------------------- |
| `radius_card`      | 12px                  | Card containers, panels                |
| `radius_callout`   | 8px                   | Warning boxes, highlight boxes         |
| `radius_pill`      | 100px                 | Badges, labels, progress-bar caps      |
| `radius_none`      | 0                     | Lower-thirds, full-width dividers       |
| `stroke_card`      | 1.5px `#1E3355`      | Card borders (subtle, visible on dark) |
| `stroke_callout`   | 2px `#233A60`        | Warning/emphasis borders               |
| `stroke_accent_bar`| 4px                   | Left-edge accent bars on cards         |
| `stroke_rule`      | 1.5px `#1E3355`      | Horizontal rules, dividers             |
| `stroke_rule_accent`| 1.5px `#00D4AA`     | Accent rules on teal-secure moments    |
| `stroke_rule_warn` | 1.5px `#F59E0B`      | Accent rules on caution moments        |

### Shadows and glows

| Token              | Value                                  | Usage                            |
| ------------------ | -------------------------------------- | -------------------------------- |
| `shadow_card`      | `0 4px 24px rgba(0,0,0,0.35)`         | Card elevation                   |
| `shadow_elevated`  | `0 8px 40px rgba(0,0,0,0.45)`         | Modal panels, hero cards         |
| `glow_teal`        | `0 0 30px rgba(0,212,170,0.25)`       | Teal accent glow (focal points)  |
| `glow_amber`       | `0 0 30px rgba(245,158,11,0.25)`      | Amber warning glow               |
| `glow_danger`      | `0 0 30px rgba(239,68,68,0.25)`       | Danger alert glow                |
| `glow_subtle`      | `0 0 60px rgba(0,212,170,0.08)`       | Atmospheric background bloom     |

---

## Layout Grid

### Canvas dimensions

- **Full canvas:** 1920 x 1080
- **Content safe zone:** 1720 x 920, inset from edges: 100px horizontal, 80px vertical
- **12-column grid:** each column is ~126px wide with 20px gutters

### Presenter-aware zones

This video has a talking-head AI presenter. The presenter typically occupies the left ~40-50% of the frame (~768-960px). The layout adapts:

| Zone               | Position               | Width     | Used for                                 |
| ------------------ | ---------------------- | --------- | ---------------------------------------- |
| **Presenter**      | Left or center         | ~40-50%   | AI avatar video feed                     |
| **Content right**  | Right side             | ~50-60%   | Kinetic typography, diagrams, bullets    |
| **Full-frame**     | Edge to edge           | 100%      | Hero titles, stat splashes, full-bleed   |
| **Lower-third**    | Bottom-left            | ~700px    | Presenter name/title overlay             |
| **Bottom bar**     | Bottom, full-width     | 100%      | Progress indicator, branding, section ID |

### Zone behavior per scene type

- **Presenter-only scenes:** The presenter fills center frame. Motion graphics are minimal -- lower-third overlay and subtle background decoratives only.
- **Presenter + graphics (split):** Presenter on left (or picture-in-picture at top-right). Motion graphics occupy the right ~55%. Left margin for content is 100px; right margin for content is 100px.
- **Full-screen motion graphics:** No presenter visible. Content uses the full safe zone. Usually for section headers, stat splashes, and transition bumpers.
- **Ghost presenter:** Presenter is visible but dimmed/desaturated at ~30% opacity in background. Motion graphics overlay on top. Used sparingly for emotional emphasis moments.

---

## Scene Type Designs

### 1. Section Title (hero opener / chapter break)

**Layout:** Full-frame. No presenter. Display headline centered or left-anchored.

- **Background:** Solid `#0B1A30` with teal radial glow at ~50% left-center (breathing ambient)
- **Content:** Single display headline (Montserrat 900, 80-110px). Subhead below (Montserrat 700, 32-40px, `#8899B4`). Section number in top-right as monospace label (IBM Plex Mono, 18px, `#5A6F8C`, 0.08em tracking)
- **Decorative:** Ghost grid pattern (1px rules at `#1E3355`, 5% opacity). Slow horizontal drift. A single hairline rule beneath the headline, animating scaleX from 0 to 1 on entrance.
- **Motion:** Headline enters from y:40 with opacity 0 -> 1 over 0.6s (power3.out). Subhead delayed 0.2s. Rule scales in from center. Decorative grid slow-drifts at 30s cycle.
- **Duration:** ~4-6s

### 2. Presenter + Bullet Points (explanation scene)

**Layout:** Presenter left, content right (split).

- **Background:** Solid `#0B1A30` with subtle grid overlay on right content zone
- **Presenter:** Full-frame left zone. Lower-third overlay: name on Montserrat 700 30px, title on IBM Plex Mono 400 18px, 4px teal left-bar, gradient bg
- **Content (right):** Headline (Montserrat 700, 40px) at top of content zone. Bullet points below (IBM Plex Mono 400, 24px, 1.5 line-height). Bullets use a teal dot (8px diameter) or numbered list.
- **Decorative:** Hairline rule beneath headline (1.5px, `#1E3355`). Section indicator badge at bottom-right: "Chapter 2 of 6" (IBM Plex Mono, 14px, 0.08em tracking, `#5A6F8C`)
- **Motion:** Headline enters y:20 over 0.4s. Bullets stagger in with 0.15s delay each, y:15. Bullet dot animates scale 0->1 before text.
- **Duration:** Variable (per narration)

### 3. Caution / Warning Callout

**Layout:** Full-frame or right-zone, depending on presenter presence.

- **Background:** Solid `#0B1A30` with amber radial glow at center-right
- **Container:** Card (`#14203E`, 12px radius, 2px `#233A60` border) with 4px amber left-edge bar
- **Content:** Amber badge (IBM Plex Mono, 16px, uppercase, amber text on amber-bg at 12% opacity): "WATCH OUT" or "RED FLAG". Headline (Montserrat 700, 44px, `#F0F4FF`) below. Supporting body (IBM Plex Mono 400, 24px, `#8899B4`).
- **Decorative:** Amber glow behind the card at 15% opacity. Subtle amber pulsing ring around the badge area.
- **Motion:** Card slides in from right, x:80 -> 0, opacity 0->1, 0.5s (power2.out). Amber bar enters from top (scaleY) simultaneously. Badge fades in at 0.3s delay.
- **Note:** Every caution scene must show the amber accent. Do NOT use teal in caution moments.

### 4. Stat / Data Splash

**Layout:** Full-frame. No presenter (or presenter pip at top-right corner if continuous).

- **Background:** Solid `#0B1A30` with dual radial glows (teal from upper-left, subtle blue from lower-right)
- **Content:** One BIG stat center or two stats side by side. Stat number (Montserrat 900, 96-120px, `#00D4AA`). Label below (IBM Plex Mono 400, 20px, `#8899B4`, 0.08em tracking). If two stats: max 50% width each with 48px gap.
- **Decorative:** Horizontal rule above the label at 1.5px `#1E3355`. Ghost number at 5% opacity behind the stat (same value, much larger, blurred 4px). Two hairline crosshairs at the top-right quadrant for visual structure.
- **Motion:** Stat number counts up (or animates scale 0.8->1 with opacity). Counter animation: use a GSAP snap function on the text content. Label appears after number settles. Ghost number slow-drifts behind.
- **Duration:** ~4-5s

### 5. Email Mockup / Example

**Layout:** Full-frame or right-zone card.

- **Background:** Solid `#0B1A30` with very subtle grid pattern
- **Email card:** `#182848` surface, 12px radius, 1.5px `#1E3355` border. Simulated email fields:
  - **From:** label (IBM Plex Mono 400, 16px, `#5A6F8C`) + value (IBM Plex Mono 400, 20px, `#F0F4FF`)
  - **Subject:** label + value (Montserrat 700, 22px, `#F0F4FF`)
  - **Body:** placeholder text (IBM Plex Mono 400, 18px, `#8899B4`, 1.4 line-height)
- **Callout elements:** Amber-bg arrow/circle pointing at red-flag details (mismatched domain, urgent language, suspicious attachment). Annotation text (IBM Plex Mono, 16px, amber, 0.08em tracking) beside the callout.
- **Decorative:** Scan line overlay at the top of the card (1px teal line, 60% width, representing email security scanning). Tilted red tag in top-right corner: "PHISHING" (IBM Plex Mono, 14px, `#EF4444`, rotated -3deg, 4px solid border).
- **Motion:** Email card fades in from scale 0.95. Callout arrows animate in sequentially (staggered 0.25s) with a subtle bounce.

### 6. Action / Takeaway Card

**Layout:** Full-frame or right-zone. Positive, solution-oriented.

- **Background:** Solid `#0B1A30` with teal radial glow at center
- **Container:** Card (`#14203E`, 12px radius) with 4px teal left-edge bar or full teal border
- **Content:** Teal badge (IBM Plex Mono, 16px, uppercase, teal text on teal-bg at 12% opacity): "DO THIS" or "ACTION". Headline (Montserrat 700, 40px). Action steps (numbered, IBM Plex Mono 400, 22px, 1.5 line-height, with teal checkmark circles).
- **Decorative:** Teal dot progress at the base (3 dots, filled=done). Subtle 4px success ring around the badge.
- **Motion:** Card enters from bottom, y:40 -> 0, 0.5s. Steps stagger in. Each checkmark scales up with a small bounce.
- **Note:** Use teal, never amber, in action scenes. The visual psychology is "safe path forward."

### 7. Transition Bumper

**Layout:** Full-frame. Brief (<3s) transition between sections.

- **Background:** Solid `#0B1A30` with one intense teal or amber radial bloom (color matches the emotional register of the next scene)
- **Content:** Section number large (Montserrat 900, 180px, 5% opacity) filling the frame. Section title small below (IBM Plex Mono 400, 20px, `#5A6F8C`, 0.08em tracking). Hairline rule (1.5px, accent color) sweeping across center.
- **Decorative:** The rule is the primary motion -- it sweeps from left to full-width. Section number fades up then back down.
- **Motion:** Rule scales from 0 to 100% width over 0.6s. Section title fades in at midpoint. Total bumper duration ~2-2.5s.

---

## Brand Elements

### Logo lockup

The CyberGuard logo is a typographic lockup. No icon, no symbol -- pure type:

```
CYBERGUARD          <- Montserrat 700, 36px, #00D4AA
Compliance Training <- IBM Plex Mono 400, 14px, #8899B4, 0.12em tracking uppercase
```

Position: Top-left of the frame, 100px from left, 40px from top. Used during title/ending credits and as a persistent bottom-right stamp during non-presenter sections.

If a real corporate logo replaces CyberGuard, it occupies the same position. The spec adapts to any logo at that anchor.

### Progress indicator

A persistent element during long explanation scenes. Bottom-center or bottom-right:

- **Bar:** 4px height, `#1E3355` background, `#00D4AA` fill, 2px cap radius
- **Label:** IBM Plex Mono 400, 14px, `#5A6F8C`, 0.08em tracking: "Section 3 of 6"

### Badge system

Used to label the emotional register of each card/callout:

| Badge            | Bg color (12% opacity) | Text color | Context                          |
| ---------------- | ---------------------- | ---------- | -------------------------------- |
| DID YOU KNOW?    | teal                   | teal       | Positive info, statistics        |
| WATCH OUT        | amber                  | amber      | Caution, red flags               |
| DO THIS          | teal                   | teal       | Positive actions, takeaways       |
| RED FLAG         | danger (#EF4444)       | danger     | Critical threat indicators       |
| QUICK TIP        | teal                   | teal       | Helpful additional information   |

### Divider

A 1.5px horizontal rule at `#1E3355` used between logical groups within a scene. For accent-dividers separating idea shifts: 1.5px `#00D4AA` (teal sections) or 1.5px `#F59E0B` (caution sections). Animates from center: scaleX 0 -> 1.

---

## Motion Principles

### Ambient background motion

Every scene needs 2-4 decorative elements with slow ambient animation. Without these, scenes feel static during entrance staggering:

1. **Radial glows** -- teal or amber, 15-25% opacity, breathing scale (1.0 <-> 1.05, 8-12s cycle, sine.easeInOut)
2. **Grid lines** -- 1px `#1E3355` at 5% opacity, slow horizontal drift (36px over 30s, linear)
3. **Ghost text** -- Large section numbers at 3-5% opacity, very slow vertical drift
4. **Pulse rings** -- Subtle expanding/contracting circles behind focal content, 6s cycle

### Entrance motion default values

| Element           | Duration | Ease        | Direction     | Stagger |
| ----------------- | -------- | ----------- | ------------- | ------- |
| Headline          | 0.5-0.6s | power3.out  | y: 30 -> 0    | lead    |
| Body text         | 0.4-0.5s | power2.out  | y: 20 -> 0    | +0.15s  |
| Card / container  | 0.5-0.6s | power2.out  | y: 40 -> 0    | lead    |
| Badge             | 0.35s    | back.out(1.2)| scale: 0 -> 1 | +0.2s   |
| Divider / rule    | 0.5-0.6s | power3.out  | scaleX: 0 -> 1| head    |
| Stat number       | 0.8-1.2s | power1.out  | scale: 0.8->1+| lead    |
| Bullet stagger    | 0.35s    | power2.out  | x: -15 -> 0   | 0.15s   |
| Callout indicator | 0.4s     | back.out(1.4)| scale: 0 -> 1| 0.25s   |
| Lower-third       | 0.4s     | power2.out  | x: -60 -> 0   | lead    |

### Scene transitions

- **Between major sections:** Brief bumper scene (2-2.5s, see scene type 7) with a full-screen wipe or radial reveal. Use a 0.3s crossfade at the bumper edges.
- **Between sub-points within a scene:** Fade existing content out (0.2s), ambient decoratives stay. New content fades in.
- **Presenter-only -> motion graphics:** Presenter dims to 30% opacity over 0.3s, motion graphics layer builds on top. Reverse for return.

---

## Do's and Don'ts

### Do

- Use teal as the default accent for most scenes.
- Switch to amber for caution/warning moments only.
- Use ghost text and radial glows to fill negative space during entrances.
- Stagger related elements with 0.1-0.15s delays for visual rhythm.
- Use IBM Plex Mono for everything stats-adjacent -- labels, counters, body copy. Montserrat only for headlines and display text.
- Make accent colors visible (full saturation for focal elements, 15-25% for atmospheric).
- Keep cards on dark surface (`#14203E`) with a subtle border (`#1E3355`).

### Don't

- Never use Inter, Roboto, Lato, or Open Sans (these are design defaults that produce monoculture).
- Never mix teal and amber as equal partners in a single frame -- one dominates.
- Never center-and-float content. Anchor to edges or use defined zones.
- Never use full-screen linear gradients (band under H.264 compression).
- Never use pure black (`#000`) or pure white (`#fff`). Tint everything toward the brand navy/cool range.
- Never put a decorative element at <10% opacity (invisible on video).
- Never use body text under 20px or labels under 14px.
- Never use two sans-serif fonts together (always cross the category boundary: sans + mono or serif + sans).
- Never use web-sized shadows (1px borders with 2px blur are invisible at 1920x1080).

---

## File reference

This spec is consumed as the brand layer. The video composition in `index.html` imports these values at the top level. For composition rules (background layers, midground, foreground, density, entrance choreography), see `video-composition.md` in the creative references.
