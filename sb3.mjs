import { chromium, devices } from "playwright-core";
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browser = await chromium.launch({ executablePath: edge, headless: true });
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
try {
  await page.goto("https://supabase.com/docs", { waitUntil: "domcontentloaded", timeout: 40000 });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const bars = [...document.querySelectorAll('body *')].filter(el => {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      return (cs.position==='fixed'||cs.position==='sticky') && r.height>20 && r.height<140 && r.width>200;
    }).slice(0,6).map(el=>{ const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      return { tag:el.tagName, pos:cs.position, top:Math.round(r.top), bottomGap:Math.round(window.innerHeight-r.bottom), h:Math.round(r.height), z:cs.zIndex, bg:cs.backgroundColor, backdrop:cs.backdropFilter }; });
    return { title: document.title.slice(0,40), bars };
  });
  console.log("\n=== docs mobile ===");
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: "sb-docs-top.png" });
} catch(e){ console.log("docs failed:", e.message); }
await browser.close();
