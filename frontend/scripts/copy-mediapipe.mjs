// Copies MediaPipe's WASM runtime into public/ so the browser pose tracker can load it
// from the app itself (see lib/pose.ts). Runs on `npm install` via the postinstall script.
import fs from "node:fs";
import path from "node:path";

const src = path.resolve("node_modules/@mediapipe/tasks-vision/wasm");
const dest = path.resolve("public/mediapipe/wasm");

if (!fs.existsSync(src)) {
  console.warn("[copy-mediapipe] @mediapipe/tasks-vision not installed; skipping");
  process.exit(0);
}
fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log("[copy-mediapipe] copied WASM runtime to public/mediapipe/wasm");
