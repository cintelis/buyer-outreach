import { chromium, devices } from "playwright-core";
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browser = await chromium.launch({ executablePath: edge, headless: true });
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();

await page.goto("https://supabase.com", { waitUntil: "domcontentloaded", timeout: 40000 });
await page.waitForTimeout(2500);

// Find the hamburger: last button in nav with an svg, near top-right
const clicked = await page.evaluate(() => {
  const nav = document.querySelector('nav');
  if (!nav) return 'no-nav';
  const btns = [...nav.querySelectorAll('button')].filter(b => b.querySelector('svg'));
  // pick the right-most one
  btns.sort((a,b)=> b.getBoundingClientRect().right - a.getBoundingClientRect().right);
  if (btns[0]) { btns[0].click(); return 'clicked:' + (btns[0].className||'').toString().slice(0,40); }
  return 'no-btn';
});
console.log("menu trigger:", clicked);
await page.waitForTimeout(1200);

// Inspect the opened menu panel
const menu = await page.evaluate(() => {
  // Find a large overlay/panel that just appeared
  const panels = [...document.querySelectorAll('div,nav,aside')].filter(el => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    return (cs.position === 'fixed' || cs.position === 'absolute') && r.height > 300 && r.width > 250 && cs.display !== 'none';
  });
  panels.sort((a,b)=> (b.getBoundingClientRect().width*b.getBoundingClientRect().height) - (a.getBoundingClientRect().width*a.getBoundingClientRect().height));
  const p = panels[0];
  if (!p) return null;
  const cs = getComputedStyle(p); const r = p.getBoundingClientRect();
  return {
    position: cs.position, width: Math.round(r.width), height: Math.round(r.height),
    top: Math.round(r.top), left: Math.round(r.left),
    background: cs.backgroundColor, backdrop: cs.backdropFilter,
    transform: cs.transform, transition: cs.transition.slice(0,80), zIndex: cs.zIndex,
    fullScreen: r.width >= window.innerWidth - 2 && r.height >= window.innerHeight - 80,
    linkCount: p.querySelectorAll('a').length,
  };
});
console.log("\n=== open menu panel ===");
console.log(JSON.stringify(menu, null, 2));
await page.screenshot({ path: "sb-menu-open.png" });

await browser.close();
