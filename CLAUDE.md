# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **no-build, client-side React prototype** of "Velocity Capital · Buyer Outreach Platform" — a demo of an M&A buyer-outreach / sell-side workflow tool (mandates → buyer enrichment → email sequencing → reply triage → NDA → meeting). All data is mock; there is no backend, no API, no persistence.

There is **no package.json, no bundler, no install step, and no tests/lint**. React 18, ReactDOM, and Babel Standalone are loaded from unpkg CDNs; `.jsx` files are transpiled in the browser at load time.

## Running it

Open `Buyer Outreach Platform.html` — but the `.jsx` files are fetched by Babel via `<script src>`, which most browsers block over `file://`. Serve the directory over HTTP instead:

```
python -m http.server 8000      # then open http://localhost:8000/Buyer%20Outreach%20Platform.html
# or
npx serve .
```

A CDN/network connection is required (React + Babel + Google Fonts are all remote).

## Architecture

### Global-namespace module pattern (most important thing to know)
There are no ES modules, imports, or exports. Every file defines components/data, then publishes them onto `window` via `Object.assign(window, { ... })` (and `data.js` sets `window.VC`). Other files reference those globals directly.

**Consequence: load order is the dependency graph.** It is fixed in `Buyer Outreach Platform.html`:
`data.js` → `tweaks-panel.jsx` → `components.jsx` → `shell.jsx` → screens (`overview`, `mandate`, `buyerDrawer`, `queue`, `triage`, `nda`, `enrichment`) → `modals.jsx` → `app.jsx` (which calls `ReactDOM.createRoot`).

When adding a component, you **must** `Object.assign(window, {...})` it and add its `<script type="text/babel">` tag to the HTML *after* anything it depends on.

### Data: `data.js` → `window.VC`
Single read-only mock store. Key shapes: `STATES` (the buyer lifecycle state machine), `MANDATES`, `AURORA_BUYERS` (+ per-buyer detail like `ARBORFIELD_CONTACTS`), `HERO_REPLY`, `REPLY_BUCKETS`, `EMAIL_QUEUE`, `COPILOT_FEED`, `NDA_RECORDS`, `ENRICHMENT_GATE`, `PERSONA_GATE_BUYER`, `INGEST_FILE`. The buyer lifecycle (defined as `STATES`) is: `identified → enriched → verified → in_sequence → replied → flyer_sent → nda_signed_b → ready → meeting_req → interested_y/_n` (plus side states `on_hold`, `opted_out`, `stalled`, `bounced`).

### State & routing: `app.jsx`
`<App/>` owns essentially all application state and passes it down via props — there is no Context or external store. Navigation is a **string-based pseudo-router**: a `nav` state string (`overview`, `queue`, `triage`, `nda`, `enrichment`, `mandates`, or `mandate-<id>`) drives a switch that picks `currentScreen`. Modals/drawers and toasts are also booleans/arrays in `App`.

### The "hero flow" (scripted demo)
The product demo is a scripted progression of one buyer — `b-arborfield` (Arborfield Holdings) in the `aurora` mandate. `buyerOverrides['b-arborfield']` overrides that buyer's state; `handleTriageConfirm` and `advanceArborfield` step it through `replied → flyer_sent → nda_signed_b → ready → meeting_req → interested_y`, firing toasts at each step. The floating **Tweaks** panel (bottom-right) exposes demo controls: reset, open Arborfield triage, advance one step.

### Layout & shared UI
- `shell.jsx` — `Sidebar` (nav, active-mandate list, count badges), `Topbar` (breadcrumb, search, co-pilot toggle), `Copilot` (right rail driven by `window.VC.COPILOT_FEED`).
- `components.jsx` — shared primitives: `Icon` (inline-SVG library, Lucide-style; add new glyphs to its `paths` map), `Btn`, `Chip`/`StateChip`, `Avatar`, `Flag`, `Stat`, `SectionHeader`, `SparkBar`, `Modal`, `Drawer`, `ToastHost`, `LoadingDots`.
- Screens are one file each (`overview.jsx`, `mandate.jsx`, `queue.jsx`, `triage.jsx`, `nda.jsx`, `enrichment.jsx`); `buyerDrawer.jsx` is the right-side buyer detail; `modals.jsx` holds `SetupModal` / `IngestModal` / `DirectNdaModal`.

### Styling: `theme.css` + inline styles
All styling is **inline `style={{}}` objects referencing CSS variables** from `theme.css` — there are essentially no component classNames beyond a few utilities (`.chip`, `.btn`, `.eyebrow`, `.mono`, `.kbd`). `theme.css` defines design tokens for `[data-theme="dark"]` (default/primary) and `[data-theme="light"]`; `App` sets `data-theme` on `<html>`. A recurring **tone vocabulary** — `accent`, `brass`, `pos`, `warn`, `neg`, `info`, `purple`, `neutral` — maps to CSS-var triples (e.g. `--pos`, `--pos-bg`, `--pos-line`) and is threaded through `Chip`, `Avatar`, `StateChip`, toasts, etc.

### `tweaks-panel.jsx` — host editor tooling (not app logic)
A reusable floating "Tweaks" dev panel plus form controls (`TweakSlider`, `TweakRadio`, `TweakToggle`, `TweakColor`, …) and the `useTweaks` hook. It implements a `postMessage` protocol with a host (`__activate_edit_mode`, `__edit_mode_set_keys`, etc.) and persists defaults via the `/*EDITMODE-BEGIN*/{...}/*EDITMODE-END*/` block in `app.jsx`, which the host rewrites on disk. **Do not hand-reformat the EDITMODE block** — it is parsed/regenerated by tooling.

> Note: `app.jsx` calls `useTweaks`/`TweakRadio` with an object-style API (`tweaks.theme`, `tweaks.set`, `tweak`/`setTweak`/`tweakKey` props), but `tweaks-panel.jsx` currently exports an array-style `useTweaks` (`[values, setTweak]`) and a `value`/`onChange` `TweakRadio`. They are out of sync, so the in-app theme toggle is effectively inert. Reconcile the two APIs if you need the theme switch to work.

## Reference
`uploads/` contains the original product specification (`Velocity_Capital_BuyerOutreach_Specification_v2.docx`) and a related HTML export — consult these for intended product behavior rather than inferring it from the mock data.
