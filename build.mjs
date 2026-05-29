// Build step for Cloudflare Pages.
//
// The app is authored as a no-build prototype: each .jsx file declares globals
// and publishes them onto `window`, and the browser order in the HTML is the
// dependency graph. For production we keep that exact model but pre-compile the
// JSX with esbuild (so visitors don't download/run the ~3MB Babel compiler) and
// vendor production React locally so the deployed site has no third-party
// runtime dependency.
//
// Output: dist/  (the directory deployed to Cloudflare Pages)

import * as esbuild from 'esbuild';
import { mkdir, rm, writeFile, cp } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const REACT_VERSION = require('react/package.json').version;

const OUT = 'dist';

// Load order — identical to "Buyer Outreach Platform.html". data.js first
// (sets window.VC), then shared/tweaks, then screens, then app.jsx (mounts).
const SCRIPTS = [
  'data.js',
  'tweaks-panel.jsx',
  'components.jsx',
  'shell.jsx',
  'overview.jsx',
  'mandate.jsx',
  'buyerDrawer.jsx',
  'queue.jsx',
  'triage.jsx',
  'nda.jsx',
  'enrichment.jsx',
  'modals.jsx',
  'mobile.jsx',
  'app.jsx',
];

async function clean() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
}

async function compileScripts() {
  // bundle:false → transpile each file individually, preserving the
  // top-level/global-publish semantics the runtime depends on.
  await esbuild.build({
    entryPoints: SCRIPTS,
    outdir: OUT,
    outExtension: { '.js': '.js' },
    bundle: false,
    minify: true,
    loader: { '.jsx': 'jsx' },
    jsx: 'transform', // classic runtime → React.createElement (React is global)
    target: ['es2019'],
    logLevel: 'info',
  });
}

async function compileCss() {
  await esbuild.build({
    entryPoints: ['theme.css'],
    outdir: OUT,
    bundle: false,
    minify: true,
    loader: { '.css': 'css' },
    logLevel: 'info',
  });
}

// React 19 no longer ships UMD builds, so we bundle a tiny shim that exposes
// React + react-dom on window — matching the global-React model the app's
// classic JSX (React.createElement) compiles against. Self-contained: no
// runtime CDN dependency. NODE_ENV define selects React's production build.
async function vendorReact() {
  await esbuild.build({
    stdin: {
      contents: [
        "import React from 'react';",
        "import { createRoot, hydrateRoot } from 'react-dom/client';",
        'window.React = React;',
        'window.ReactDOM = { createRoot, hydrateRoot };',
      ].join('\n'),
      resolveDir: process.cwd(),
      loader: 'js',
    },
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2019'],
    define: { 'process.env.NODE_ENV': '"production"' },
    outfile: path.join(OUT, 'react-globals.js'),
    logLevel: 'info',
  });
  console.log('vendored  react-globals.js (React ' + REACT_VERSION + ', production)');
}

function htmlFor() {
  // .jsx entry points emit .js outputs; reference those. `defer` keeps the
  // declared order (React first, then data.js, then app.jsx mounts last).
  // Per-build cache-buster: index.html is served must-revalidate, but JS/CSS
  // are cached for an hour — appending ?v=<build> forces returning visitors to
  // refetch code on every deploy instead of running a stale bundle.
  const v = Date.now().toString(36);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <title>Velocity Capital · Buyer Outreach Platform</title>
  <meta name="robots" content="noindex"/>
  <meta name="description" content="Buyer Outreach Platform — interactive front-end demonstration (no backend)."/>
  <link rel="icon" type="image/png" sizes="192x192" href="assets/velocity-favicon-192.png"/>
  <link rel="icon" type="image/png" sizes="32x32" href="assets/velocity-favicon-32.png"/>
  <link rel="apple-touch-icon" href="assets/velocity-apple-touch.png"/>
  <link rel="stylesheet" href="theme.css?v=${v}"/>

  <script defer src="react-globals.js?v=${v}"></script>
${SCRIPTS.map((s) => `  <script defer src="${s.replace(/\.jsx$/, '.js')}?v=${v}"></script>`).join('\n')}
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;
}

// Static brand assets (real Velocity Capital logo + favicons) live in assets/
// and are copied verbatim into dist/assets/.
async function copyAssets() {
  await cp('assets', path.join(OUT, 'assets'), { recursive: true });
  console.log('copied   assets/ → dist/assets/');
}

const HEADERS = `# Cloudflare Pages headers
/*.js
  Cache-Control: public, max-age=3600
  X-Content-Type-Options: nosniff
/*.css
  Cache-Control: public, max-age=3600
/index.html
  Cache-Control: public, max-age=0, must-revalidate
`;

async function main() {
  await clean();
  await Promise.all([compileScripts(), compileCss(), vendorReact(), copyAssets()]);
  await writeFile(path.join(OUT, 'index.html'), htmlFor());
  await writeFile(path.join(OUT, '_headers'), HEADERS);
  console.log('\n✓ Build complete → dist/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
