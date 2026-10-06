// Captures real ShadowAthlete screens (phone viewport, 3x) into public/screens/.
//
// Needs the app running (frontend :3000, backend :8000) and a signed-in token:
//   SA_TOKEN=<jwt> APP_URL=http://127.0.0.1:3000 npm run capture
//
// Every <video> is hidden before capture so no third-party footage ends up in the demo; the
// app's own overlays (skeletons, cards, charts) are captured as-is.

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "public", "screens");
const APP = process.env.APP_URL ?? "http://127.0.0.1:3000";
const TOKEN = process.env.SA_TOKEN;
const CHROME = path.join(ROOT, "node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell");

if (!TOKEN) {
  console.error("Set SA_TOKEN to a valid ShadowAthlete access token.");
  process.exit(1);
}

const HIDE_FOOTAGE = "video { visibility: hidden !important; } nextjs-portal { display: none !important; }";
// Full-page shots: fixed bottom UI (nav bar, record button) would land mid-page, so it's
// hidden there and captured once as its own strip (nav.png).
const HIDE_FIXED_BOTTOM = "nav.fixed, button.fixed.right-4 { display: none !important; }";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SHOTS = [
  { name: "home", url: "/home", wait: 4000 },
  { name: "sports", url: "/sports", wait: 3000 },
  { name: "upload", url: "/capture/upload?sport=tennis", wait: 2500 },
  { name: "sessions", url: "/sessions", wait: 4000 },
  { name: "session-tennis", url: "/sessions/14", wait: 6000 },
  { name: "compare", url: "/compare?now=19&past=14", wait: 15000 },
  { name: "progress-tennis", url: "/progress?sport=tennis", wait: 7000 },
  { name: "progress-cricket", url: "/progress?sport=cricket", wait: 7000 },
  { name: "train", url: "/train?sport=cricket", wait: 5000 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  // Software WebGL so the in-browser pose tracker (MediaPipe) can run headless.
  args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
await page.setUserAgent(UA);
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await mkdir(OUT, { recursive: true });

async function shoot(name, { full = true } = {}) {
  await page.addStyleTag({ content: HIDE_FOOTAGE });
  if (full) await page.addStyleTag({ content: HIDE_FIXED_BOTTOM });
  await sleep(300);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });
  console.log("captured", name);
}

for (const s of SHOTS) {
  await page.goto(`${APP}/login`, { waitUntil: "networkidle2" });
  await page.evaluate((t) => (t ? localStorage.setItem("sa_token", t) : localStorage.removeItem("sa_token")), s.signedOut ? null : TOKEN);
  await page.goto(`${APP}${s.url}`, { waitUntil: "networkidle0", timeout: 90000 });
  await page.addStyleTag({ content: HIDE_FOOTAGE });
  await sleep(s.wait);
  await shoot(s.name);
  if (s.name === "home") {
    await page.reload({ waitUntil: "networkidle0" });
    await sleep(3000);
    await page.screenshot({ path: path.join(OUT, "nav.png"), clip: { x: 0, y: 844 - 96, width: 390, height: 96 } });
    console.log("captured nav");
  }
}

// Guided workout: start the next session, then step from warm-up into the first set.
await page.goto(`${APP}/train?sport=cricket`, { waitUntil: "networkidle2" });
await sleep(4000);
const clickText = (text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes(t));
    b?.click();
    return !!b;
  }, text);
if (await clickText("Start session")) {
  await sleep(1500);
  await shoot("workout-warmup", { full: false });
  await page.evaluate(() => [...document.querySelectorAll(".fixed button")].pop()?.click());
  await sleep(600);
  await page.evaluate(() => document.querySelector("[role=timer] button")?.click());
  await sleep(1500);
  await shoot("workout-set", { full: false });
}

await browser.close();
