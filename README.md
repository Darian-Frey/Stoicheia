> **Status:** Active
> **Provenance:** Shane Hartley (author); Claude (scaffolding and layout mock-ups, 2026-10-27 → 2026-10-29)
> **Last reviewed:** 2026-10-29
> **Why this status:** Design direction settled (Instrument theme); Phase 1 (kernel + Proposition I.1) about to begin.

# Stoicheia

Stoicheia (Στοιχεῖα, "Elements") is an interactive rebuild of Euclid's *Elements*, Book I — all 48 propositions — as a static website. Each proposition is a live construction: the given points can be dragged, the dependent construction recomputes, the proof is revealed step by step, and a readout panel shows the claimed equality holding numerically as you move things. It is built for one reader first (the author, working through Euclidean geometry on the way to mechanics) and for anyone else who wants to see the first book of the *Elements* move rather than read it flat. It is deliberately plain: HTML, vanilla JavaScript and SVG, no build step, served from GitHub Pages.

**Live:** [Proposition I.1](https://darian-frey.github.io/Stoicheia/prop.html?p=1). Only I.1 is built so far; the index page arrives in Phase 2.

## Quick Start

```bash
git clone https://github.com/Darian-Frey/stoicheia.git
cd stoicheia
python3 -m http.server -d docs 8000
# open http://localhost:8000
```

No build step. Any static file server will do; the `python3` one-liner is simply the shortest path.

## Build requirements

- A modern browser (ES2020 modules, SVG 1.1). No transpilation.
- Python 3 (or any static server) for local preview only.
- GitHub Pages serves `docs/` from `main` for deployment.

There is no `BUILD.md`; see `DECISIONS.md` D-005 for the recorded exemption.

## Project structure

```
stoicheia/
├── docs/                 # Everything GitHub Pages serves
│   ├── index.html        # 48-card index, grouped by arc
│   ├── prop.html         # Proposition page shell (reads ?p=NN)
│   ├── defs.html         # Definitions, postulates, common notions
│   ├── graph.html        # Dependency graph (Phase 5)
│   ├── css/instrument.css
│   ├── fonts/            # Vendored woff2 + OFL licence (D-009)
│   ├── js/
│   │   ├── geom.js       # Geometry kernel: points, lines, circles, intersections
│   │   ├── scene.js      # Dependency graph of objects; recompute on drag
│   │   ├── render.js     # Scene → SVG
│   │   ├── stepper.js    # Step reveal and transport controls
│   │   ├── readout.js    # Measurements and QED check
│   │   └── prop.js       # Page bootstrap: loads data, wires modules
│   └── data/
│       ├── props/        # One file per proposition: 01.js … 48.js
│       ├── arcs.js       # Arc groupings for the index
│       └── foundations.js# Definitions, postulates, common notions
├── tools/                # Author-side scripts (xref check, data lint)
├── design/instrument/    # Reference mock-up of I.1 (HTML + PDF); never served
└── *.md                  # Project documentation (see below)
```

## Documentation

- [Features](FEATURES.md) — what the site does, with acceptance criteria
- [Roadmap](ROADMAP.md) — phases, one per arc of Book I
- [Architecture](ARCHITECTURE.md) — module boundaries and data flow
- [Decisions](DECISIONS.md) — design choices and their reversal conditions
- [Spec](SPEC.md) — kernel contracts, proposition data schema, theme tokens
- [Attack vectors](ATTACK_VECTORS.md) — how a construction can silently go wrong
- [Bugs](BUGS.md) · [Improvements](IMPROVEMENTS.md)
- [Changelog](CHANGELOG.md)
- [CLAUDE.md](CLAUDE.md) — handoff for AI-assisted sessions

## License

MIT — see [LICENSE](LICENSE). Proof text follows Heath's 1908 translation, which is in the public domain.
