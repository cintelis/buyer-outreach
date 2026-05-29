import { chromium, devices } from "playwright-core";
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const iphone = devices["iPhone 13"];
const browser = await chromium.launch({ executablePath: edge, headless: true });
const ctx = await browser.newContext({ ...iphone });
const page = await ctx.newPage();

async function probe(url, label) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 40000 });
    await page.waitForTimeout(2500);
  } catch (e) { console.log(`[${label}] goto failed: ${e.message}`); return; }
  // Header / nav probe
  const info = await page.evaluate(() => {
    const out = {};
    // candidate header/nav elements
    const header = document.querySelector('header') || document.querySelector('nav');
    if (header) {
      const cs = getComputedStyle(header);
      const r = header.getBoundingClientRect();
      out.header = { tag: header.tagName, position: cs.position, top: cs.top, height: Math.round(r.height),
        background: cs.backgroundColor, backdrop: cs.backdropFilter, zIndex: cs.zIndex, borderBottom: cs.borderBottomWidth };
    }
    // Any fixed/sticky bars
    out.fixedBars = [...document.querySelectorAll('body *')].filter(el => {
      const cs = getComputedStyle(el);
      return (cs.position === 'fixed' || cs.position === 'sticky') && el.getBoundingClientRect().height < 120 && el.getBoundingClientRect().height > 20;
    }).slice(0, 8).map(el => {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      return { tag: el.tagName, cls: (el.className||'').toString().slice(0,60), position: cs.position,
        top: Math.round(r.top), bottom: Math.round(window.innerHeight - r.bottom), h: Math.round(r.height), z: cs.zIndex };
    });
    // Hamburger / menu button candidates
    out.menuButtons = [...document.querySelectorAll('button,[role=button],a')].filter(el => {
      const al = (el.getAttribute('aria-label')||'').toLowerCase();
      const t = (el.textContent||'').trim().toLowerCase();
      return al.includes('menu') || al.includes('navigation') || t === 'menu' || el.querySelector('svg') && el.closest('header,nav') && (el.getAttribute('aria-expanded')!==null);
    }).slice(0,5).map(el => ({ aria: el.getAttribute('aria-label'), expanded: el.getAttribute('aria-expanded'), cls: (el.className||'').toString().slice(0,50) }));
    return out;
  });
  console.log(`\n===== [${label}] ${url} =====`);
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: `sb-${label}-top.png` });
}

await probe("https://supabase.com", "marketing");
await browser.close();
