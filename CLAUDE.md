# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build (outputs to dist/)
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

No test runner is configured.

## Architecture

Single-page React 19 application built with Vite. All content lives on one scrollable page — no routing library is used.

**Entry point flow:** `index.html` → `src/main.jsx` → `src/App.jsx`

**Component layout (rendered order in App.jsx):**
1. `Particles` — animated background (80 particles with staggered delays)
2. `Navbar` — fixed header; detects scroll via `useState` to apply glass-morphism style
3. `Hero` — main hero section with CTA that scrolls to `#careers`
4. `About` — 3 service cards using lucide-react icons (`MonitorPlay`, `Code2`, `Zap`)
5. `Careers` — hiring section with a mailto link (`tesisn8n6@gmail.com`)

**Structure:**
- `src/components/layout/` — Navbar, Particles
- `src/components/sections/` — Hero, About, Careers
- Each component has a co-located `.css` file
- `src/index.css` — CSS custom properties (dark theme vars, global resets, Outfit font)
- `src/animations.css` — shared keyframe animations (`fadeInUp`, `fadeInDown`, `fadeIn`, `scaleIn`, `shimmer`, `glow`, `sectionFadeIn`, `softGlow`, `subtle-glow`)

**Styling conventions:**
- Dark theme with CSS variables defined in `index.css` (e.g. `--bg-home: #050505`, `--text-main: #fcfcfc`)
- Smooth easing: `cubic-bezier(0.16, 1, 0.3, 1)` throughout
- Staggered animation delays via `.delay-1`, `.delay-2`, `.delay-3` classes
- Glass-morphism on Navbar uses `backdrop-filter: blur()`

**Navigation:** Navbar links and the Hero CTA use `document.getElementById().scrollIntoView({ behavior: 'smooth' })` — no React Router.

**State:** Only `Navbar.jsx` uses `useState` (scroll position). No global state, Context, or external state manager.
