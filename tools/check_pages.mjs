// check_pages.mjs — headless-browser checks of the served site (IMP-007).
// Run: node tools/check_pages.mjs [--shots DIR]   (Node ≥ 22.7, Chrome or Chromium)
//
// Serves docs/ with a built-in static server, drives headless Chrome over
// the DevTools protocol, and checks the index and every built proposition:
// stepping, derived footers, claims, mouse and touch drags (BUG-004),
// phone width (AV-006), routing, and console errors. Proposition-specific
// drag checks live in SPECIFIC below. Exits non-zero if anything fails.
// Uses Node built-ins only; set CHROME=/path/to/chrome to choose a browser.

import { createServer } from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { readFile, mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { arcs, props, built } from "../docs/data/arcs.js";
import { citationsIn } from "../docs/js/cite.js";

const DOCS = resolve(fileURLToPath(new URL("../docs/", import.meta.url)));
const SHOTS = (() => { const i = process.argv.indexOf("--shots"); return i > 0 ? process.argv[i + 1] : null; })();
const pad = (n) => String(n).padStart(2, "0");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Results ──────────────────────────────────────────────────────────
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: !!ok, detail });
}

// ── Static server ────────────────────────────────────────────────────
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json",
};

function startServer() {
  const server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = normalize(join(DOCS, path));
    if (!file.startsWith(DOCS)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r(server)));
}

// ── Chrome ───────────────────────────────────────────────────────────
function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const names = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];
  for (const n of names) {
    try { return execFileSync("which", [n], { encoding: "utf8" }).trim(); } catch { /* next */ }
  }
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (existsSync(mac)) return mac;
  return null;
}

async function startChrome(bin) {
  const profile = await mkdtemp(join(tmpdir(), "stoicheia-chrome-"));
  const proc = spawn(bin, [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--window-size=1280,900", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
    "about:blank",
  ], { stdio: "ignore" });
  let port;
  for (let i = 0; i < 100 && !port; i++) {
    try { port = readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]; } catch { await wait(100); }
  }
  if (!port) throw new Error("Chrome did not start (no DevToolsActivePort)");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener("open", r); ws.addEventListener("error", j); });
  return { proc, profile, ws };
}

function cdp(ws) {
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") {
      errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    }
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
      errors.push(`${m.params.entry.text} ${m.params.entry.url ?? ""}`.trim());
    }
  });
  const send = (method, params = {}) => new Promise((r) => {
    const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params }));
  });
  const ev = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    return r.result?.result?.value;
  };
  return { send, ev, errors };
}

// ── Main ─────────────────────────────────────────────────────────────
const bin = findChrome();
if (!bin) {
  console.error("check_pages: no Chrome or Chromium found; set CHROME=/path/to/browser");
  process.exit(2);
}
const server = await startServer();
const BASE = `http://127.0.0.1:${server.address().port}`;
const chrome = await startChrome(bin);
const { send, ev, errors } = cdp(chrome.ws);
await send("Runtime.enable"); await send("Log.enable"); await send("Page.enable");
if (SHOTS) await mkdir(SHOTS, { recursive: true });

async function go(path) {
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 50; i++) {
    await wait(100);
    if (await ev("document.readyState === 'complete' && document.fonts.status === 'loaded'")) break;
  }
  await wait(200); // module scripts and miniatures
}
async function shot(name) {
  if (!SHOTS) return;
  const r = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(join(SHOTS, `${name}.png`), Buffer.from(r.result.data, "base64"));
}
async function desktop() {
  await send("Emulation.clearDeviceMetricsOverride");
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
}
async function phone() {
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
}
const centre = (sel) => ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null;
  const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
const toScreen = (x, y) => ev(`(() => { const p = new DOMPoint(${x}, ${y})
  .matrixTransform(document.getElementById('figure-svg').getScreenCTM()); return [p.x, p.y]; })()`);
const pointOf = (id) => ev(`(() => { const h = document.querySelector('.fig-handle[data-id=${JSON.stringify(id)}]');
  return h ? [+h.getAttribute('cx'), +h.getAttribute('cy')] : null; })()`);
const status = () => ev("document.getElementById('readout-status').textContent");

async function mouseDrag(from, to) {
  const m = (type, x, y) => send("Input.dispatchMouseEvent",
    { type, x, y, button: "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1 });
  await m("mousePressed", ...from);
  for (let i = 1; i <= 12; i++) await m("mouseMoved", from[0] + (to[0] - from[0]) * i / 12, from[1] + (to[1] - from[1]) * i / 12);
  await m("mouseReleased", ...to);
  await wait(80);
}
async function dragPoint(id, x, y) {
  await mouseDrag(await centre(`.fig-handle[data-id="${id}"]`), await toScreen(x, y));
}
async function lastStep() {
  await ev("document.querySelectorAll('.pip')[document.querySelectorAll('.pip').length - 1].click()");
  await wait(60);
}
const holds = (s) => /✓ holds/.test(s) && !/✗|not yet supported|DEGENERATE/.test(s);

// Proposition-specific drag checks, keyed by number.
const SPECIFIC = {
  1: async () => {
    await go("/prop.html?p=1"); await lastStep();
    await dragPoint("A", 500, 290);
    const C = await ev(`(() => { const c = document.querySelector('.fig-point.role-result'); return [+c.getAttribute('cx'), +c.getAttribute('cy')]; })()`);
    check("I.1: A dragged past B puts C below AB, claim holds (D-008)", C[1] > 290 && holds(await status()), JSON.stringify(C));
    await dragPoint("A", 380, 290);
    check("I.1: A dropped onto B shows DEGENERATE (AV-001)", (await status()) === "DEGENERATE"
      && await ev("document.querySelector('.figure').classList.contains('is-degenerate')"));
    await dragPoint("B", 380, 150);
    check("I.1: dragging apart again recovers", holds(await status()), await status());
  },
};

// ── Index ────────────────────────────────────────────────────────────
await desktop();
await go("/");
const idx = await ev(`({
  arcs: document.querySelectorAll('.arc').length,
  cards: document.querySelectorAll('.card').length,
  links: [...document.querySelectorAll('a.card')].map(a => a.getAttribute('href')),
  problems: [...document.querySelectorAll('.card-kind')].filter(k => k.textContent === 'PROBLEM').length,
  minis: [...document.querySelectorAll('a.card .card-mini svg')].map(s => s.querySelectorAll('.fig-line, .fig-circle, .fig-poly').length),
  handles: document.querySelectorAll('.card-mini .fig-handle').length,
})`);
check("index: one section per arc", idx.arcs === arcs.length, `${idx.arcs}`);
check("index: 48 cards", idx.cards === 48, `${idx.cards}`);
check("index: built propositions, and only those, are links",
  JSON.stringify(idx.links) === JSON.stringify([...built].sort((a, b) => a - b).map((n) => `prop.html?p=${n}`)),
  JSON.stringify(idx.links));
check("index: problem count matches arcs.js", idx.problems === props.filter((p) => p.kind === "problem").length, `${idx.problems}`);
check("index: every built card has a drawn miniature", idx.minis.length === built.length && idx.minis.every((n) => n > 0), JSON.stringify(idx.minis));
check("index: miniatures have no drag handles", idx.handles === 0);
await shot("index");
await ev("document.querySelector('a.card').click()"); await wait(800);
check("index: first card opens its proposition", await ev("location.search") === `?p=${Math.min(...built)}`);

// ── Every built proposition ──────────────────────────────────────────
for (const n of built) {
  const data = (await import(`../docs/data/props/${pad(n)}.js`)).default;
  const tag = `I.${n}`;
  await desktop();
  await go(`/prop.html?p=${n}`);
  check(`${tag}: page loads with its title`, await ev("document.getElementById('prop-title').textContent") === data.title);
  check(`${tag}: one pip per step`, await ev("document.querySelectorAll('.pip').length") === data.steps.length);

  const footers = [];
  for (let i = 0; i < data.steps.length; i++) {
    if (i) { await ev("document.getElementById('step-next').click()"); await wait(40); }
    footers.push(await ev("document.getElementById('step-cite').textContent"));
  }
  const expected = data.steps.map((s) => s.given ? "Given" : (() => {
    const c = citationsIn(s.text); return c.length ? `[${c.join(", ")}]` : "";
  })());
  check(`${tag}: step footers match the citations in the text`, JSON.stringify(footers) === JSON.stringify(expected), JSON.stringify(footers));
  const finalStatus = await status();
  check(`${tag}: every claim holds at the final step`, holds(finalStatus), finalStatus);
  await shot(`p${pad(n)}-final`);

  const free = data.objects.filter((o) => o.free);
  for (const f of free) {
    await go(`/prop.html?p=${n}`); await lastStep();
    await dragPoint(f.id, f.at.x + 25, f.at.y + 15);
    const P = await pointOf(f.id);
    check(`${tag}: mouse drag moves ${f.id} and claims still hold`,
      P && Math.hypot(P[0] - f.at.x - 25, P[1] - f.at.y - 15) < 2 && holds(await status()),
      `${JSON.stringify(P)} ${await status()}`);
  }
  for (let i = 0; i < data.steps.length; i++) {
    await go(`/prop.html?p=${n}`);
    await ev(`document.querySelectorAll('.pip')[${i}].click()`); await wait(40);
    await dragPoint(free[0].id, free[0].at.x - 20, free[0].at.y + 20);
    const P = await pointOf(free[0].id);
    check(`${tag}: drag works at step ${i}`, P && Math.abs(P[0] - free[0].at.x + 20) < 2, JSON.stringify(P));
  }

  // Touch: a mostly vertical drag on a given point must not scroll (BUG-004).
  await phone();
  await go(`/prop.html?p=${n}`);
  await ev("window.scrollTo(0, 120)"); await wait(100);
  const start = await centre(`.fig-handle[data-id="${free[0].id}"]`);
  const before = await pointOf(free[0].id);
  const t = (type, x, y) => send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
  await t("touchStart", ...start);
  for (let i = 1; i <= 20; i++) { await t("touchMove", start[0] + i, start[1] - i * 4); await wait(16); }
  await t("touchEnd"); await wait(200);
  const after = await pointOf(free[0].id);
  const scrollY = await ev("scrollY");
  check(`${tag}: touch drag moves ${free[0].id} without scrolling the page`,
    scrollY === 120 && after && before[1] - after[1] > 100, `scrollY ${scrollY}, ${JSON.stringify(before)} → ${JSON.stringify(after)}`);
  check(`${tag}: no horizontal scroll at 390 px (AV-006)`, await ev("document.documentElement.scrollWidth") <= 390);
  await shot(`p${pad(n)}-phone`);
  await desktop();

  if (SPECIFIC[n]) await SPECIFIC[n]();
}

// ── Routing ──────────────────────────────────────────────────────────
await desktop();
await go("/prop.html?p=99");
check("routing: out-of-range p redirects to the index", await ev("location.pathname") === "/index.html");
const unbuilt = props.find((p) => !built.includes(p.n));
if (unbuilt) {
  await go(`/prop.html?p=${unbuilt.n}`);
  check(`routing: unbuilt I.${unbuilt.n} shows a notice`, /not built yet/.test(await ev("document.getElementById('prop-main').textContent")));
}

// ── Console ──────────────────────────────────────────────────────────
const expected404 = unbuilt ? `/data/props/${pad(unbuilt.n)}.js` : null;
const unexpected = errors.filter((e) => !/favicon\.ico/.test(e) && !(expected404 && e.includes(expected404)));
check("console: no exceptions or unexpected errors", unexpected.length === 0, unexpected.join(" | "));

// ── Report ───────────────────────────────────────────────────────────
chrome.ws.close();
chrome.proc.kill();
server.close();
await rm(chrome.profile, { recursive: true, force: true }).catch(() => {});

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "ok  " : "FAIL"}  ${r.name}${r.ok || !r.detail ? "" : `  — ${r.detail}`}`);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
