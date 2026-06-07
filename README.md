# Buyer Outreach Platform

A **no-build, client-side React prototype** of an M&A buyer-outreach / sell-side
workflow tool. It demos the full lifecycle of a sell-side mandate: *mandates →
buyer enrichment → email sequencing → reply triage → NDA → meeting*.

> All data is **mock**. There is no backend, no API, and no persistence — this
> is a UI/UX prototype intended for demonstration.

## Quick start

The `.jsx` files are fetched by Babel via `<script src>`, which most browsers
block over `file://`. Serve the directory over HTTP instead:

```bash
python -m http.server 8000
# then open http://localhost:8000/Buyer%20Outreach%20Platform.html

# or
npx serve .
```

A network connection is required — React 18, ReactDOM, Babel Standalone, and
Google Fonts are all loaded from CDNs.

## Architecture

- **No build step.** React, ReactDOM, and Babel Standalone load from unpkg CDNs;
  `.jsx` files are transpiled in the browser at load time.
- **Global-namespace module pattern.** There are no ES module imports/exports.
  Each file publishes its components onto `window` via `Object.assign(window, …)`
  (and `data.js` sets `window.VC`). **Load order is the dependency graph** and is
  fixed in `Buyer Outreach Platform.html`.
- **State & routing in `app.jsx`.** `<App/>` owns essentially all application
  state and passes it down via props (no Context/store). A string-based
  pseudo-router (`nav` state) drives which screen renders.
- **Styling.** Inline `style={{}}` objects reference CSS variables defined in
  `theme.css`, which provides design tokens for dark (default) and light themes.

### The "hero flow"

The product demo is a scripted progression of one buyer — *Arborfield Holdings*
(`b-arborfield`) in the `aurora` mandate — stepped through
`replied → flyer_sent → nda_signed_b → ready → meeting_req → interested_y`. The
floating **Tweaks** panel (bottom-right) exposes demo controls: reset, open the
Arborfield triage, and advance one step.

## Project layout

| File / dir | Purpose |
| --- | --- |
| `Buyer Outreach Platform.html` | Entry point; fixes script load order |
| `data.js` | Single read-only mock data store (`window.VC`) |
| `app.jsx` | Root component, app state, pseudo-router |
| `shell.jsx` | `Sidebar`, `Topbar`, `Copilot` right rail |
| `components.jsx` | Shared primitives (`Icon`, `Btn`, `Chip`, `Modal`, …) |
| `overview.jsx`, `mandate.jsx`, `queue.jsx`, `triage.jsx`, `nda.jsx`, `enrichment.jsx` | Screens |
| `buyerDrawer.jsx` | Right-side buyer detail drawer |
| `modals.jsx` | `SetupModal` / `IngestModal` / `DirectNdaModal` |
| `mobile.jsx` | Mobile layout |
| `tweaks-panel.jsx` | Floating dev/editor "Tweaks" panel |
| `theme.css` | Design tokens (dark/light themes) |
| `uploads/` | Original product specification documents |

See [`CLAUDE.md`](./CLAUDE.md) for deeper architectural notes.
