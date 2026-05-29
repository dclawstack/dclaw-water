/**
 * Playwright demo recorder — produces frontend/public/demo.webm
 * Run AFTER the stack is up: node record-demo.mjs
 *
 * Uses playwright from ~/dclaw-crm/node_modules (no local install needed).
 * Requires: NODE_PATH=/home/satish/dclaw-crm/node_modules node record-demo.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, renameSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const BASE     = "http://localhost:3055";
const OUT_DIR  = "/home/satish/dclaw-water/frontend/public";
const TMP_DIR  = "/tmp/water-demo-recording";

mkdirSync(TMP_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx     = await browser.newContext({
  viewport:    { width: 1280, height: 720 },
  recordVideo: { dir: TMP_DIR, size: { width: 1280, height: 720 } },
});

const page = await ctx.newPage();
const wait = (ms) => page.waitForTimeout(ms);

console.log("🎬  Recording DClaw Water demo…");

// ── 1. LANDING PAGE — hero (0–2.5s) ─────────────────────────────────────────
console.log("  → Landing page hero");
await page.goto(BASE, { waitUntil: "networkidle" });
await wait(2500);

// ── 2. LANDING PAGE — scroll through features (2.5–5s) ──────────────────────
console.log("  → Scrolling features");
await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }));
await wait(1000);
await page.evaluate(() => window.scrollBy({ top: 700, behavior: "smooth" }));
await wait(1500);

// ── 3. LOGIN (5–9s) ──────────────────────────────────────────────────────────
console.log("  → Login");
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await wait(600);
await page.locator("#email").fill("oc@dclaw.dev");
await wait(350);
await page.locator("#password").fill("oc123");
await wait(350);
await page.locator("button[type='submit']").first().click();
await page.waitForURL("**/dashboard", { timeout: 10000 });
await wait(1800);

// ── 4. DASHBOARD — KPI overview (9–13s) ──────────────────────────────────────
console.log("  → Dashboard");
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await wait(2000);
// Scroll down to show top consumers + recent alerts
await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
await wait(1500);

// ── 5. METERS PAGE (13–16s) ──────────────────────────────────────────────────
console.log("  → Meters");
await page.goto(`${BASE}/meters`, { waitUntil: "networkidle" });
await wait(2800);

// ── 6. LEAK ALERTS (16–20s) ──────────────────────────────────────────────────
console.log("  → Leak Alerts");
await page.goto(`${BASE}/leaks`, { waitUntil: "networkidle" });
await wait(3200);

// ── 7. QUALITY MONITORING (20–23s) ───────────────────────────────────────────
console.log("  → Quality monitoring");
await page.goto(`${BASE}/quality`, { waitUntil: "networkidle" });
await wait(2800);

// ── 8. AI COPILOT (23–30s) ───────────────────────────────────────────────────
console.log("  → AI Copilot");
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await wait(800);

// Open copilot FAB
await page.locator("button[aria-label='AI Copilot']").click();
await wait(1000);

// Type a question character by character for visible effect
const question = "What are the active leak alerts?";
const inputSel = "input[placeholder*='Ask']";
await page.locator(inputSel).click();
for (const ch of question) {
  await page.keyboard.type(ch);
  await wait(40);
}
await wait(400);
await page.keyboard.press("Enter");

// Wait for AI response (backend call)
await page.waitForFunction(
  () => document.querySelectorAll("[style*='F1EEF8']").length >= 2,
  { timeout: 12000 }
).catch(() => {});
await wait(2500);

// ── 9. READINGS — quick peek (30–32s) ────────────────────────────────────────
console.log("  → Readings");
await page.goto(`${BASE}/readings`, { waitUntil: "networkidle" });
await wait(2000);

// ── DONE ─────────────────────────────────────────────────────────────────────
console.log("  → Closing browser…");
await ctx.close();
await browser.close();

const files = readdirSync(TMP_DIR).filter((f) => f.endsWith(".webm"));
if (!files.length) {
  console.error("❌  No .webm found in", TMP_DIR);
  process.exit(1);
}

const dest = join(OUT_DIR, "demo.webm");
renameSync(join(TMP_DIR, files[0]), dest);
console.log("✅  Saved →", dest);
