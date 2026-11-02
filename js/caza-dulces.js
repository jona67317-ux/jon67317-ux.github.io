(() => {
"use strict";

/* =====================================================================
   Utilidades
   ===================================================================== */
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const choice = arr => arr[Math.floor(Math.random() * arr.length)];
const TAU = Math.PI * 2;
const FONT = "'Nunito','Trebuchet MS',system-ui,sans-serif";

/* =====================================================================
   Guardado local
   ===================================================================== */
const SAVE_KEY = "gcd_save_v1";
const DEFAULTS = {
  coins: 0, best: { classic: 0, time: 0 }, scores: [],
  owned: ["skin_cream", "acc_none"], equipped: { skin: "skin_cream", acc: "acc_none" },
  ach: {}, stats: { candies: 0, coins: 0, powerups: 0, games: 0, stomps: 0 }, sound: true, music: true,
  rc: { unlocked: 1, stars: {}, done: {} }
};
function loadSave() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) {}
  const d = JSON.parse(JSON.stringify(DEFAULTS));
  for (const k in d) {
    if (s[k] === undefined) continue;
    if (d[k] && typeof d[k] === "object" && !Array.isArray(d[k])) Object.assign(d[k], s[k]);
    else d[k] = s[k];
  }
  return d;
}
let sv = loadSave();
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(sv)); } catch (e) {} }

/* =====================================================================
   Datos del juego
   ===================================================================== */
const SKINS = [
  { id: "skin_cream",  name: "Crema",     fur: "#fff4e0", line: "#e89b6b", inner: "#ffb6c9", price: 0 },
  { id: "skin_gray",   name: "Nube",      fur: "#e8ebf4", line: "#8d93a8", inner: "#ffc2d4", price: 60 },
  { id: "skin_orange", name: "Naranjita", fur: "#ffc98f", line: "#d9803a", inner: "#ffb6c9", price: 90 },
  { id: "skin_pink",   name: "Algodón",   fur: "#ffd3e6", line: "#e0709f", inner: "#ffffff", price: 120 },
  { id: "skin_choco",  name: "Chocolate", fur: "#c9a183", line: "#7a5233", inner: "#ffb6c9", price: 150 },
  { id: "skin_blue",   name: "Galaxia",   fur: "#cfe0ff", line: "#5b78d1", inner: "#ffc2f0", price: 200 }
];
const ACCS = [
  { id: "acc_none",    name: "Ninguno",      price: 0 },
  { id: "acc_flower",  name: "Flor",         price: 60 },
  { id: "acc_party",   name: "Gorro fiesta", price: 90 },
  { id: "acc_glasses", name: "Lentes",       price: 120 },
  { id: "acc_crown",   name: "Corona",       price: 220 }
];
const ACH = [
  { id: "first_star", icon: "⭐", name: "Primera estrella", desc: "Atrapa una estrella", reward: 10 },
  { id: "combo10",    icon: "🔥", name: "En racha", desc: "Logra un combo de 10", reward: 15 },
  { id: "combo25",    icon: "💥", name: "Imparable", desc: "Logra un combo de 25", reward: 40 },
  { id: "candies100", icon: "🍓", name: "Golosa", desc: "Atrapa 100 dulces en total", reward: 25 },
  { id: "candies500", icon: "🧁", name: "Pastelera", desc: "Atrapa 500 dulces en total", reward: 60 },
  { id: "score500",   icon: "🥈", name: "Medalla de plata", desc: "500 puntos en una partida", reward: 20 },
  { id: "score1500",  icon: "🥇", name: "Medalla de oro", desc: "1500 puntos en una partida", reward: 60 },
  { id: "level5",     icon: "🌈", name: "Cielo de colores", desc: "Llega al nivel 5", reward: 30 },
  { id: "nobomb",     icon: "🛡️", name: "Intocable", desc: "Llega al nivel 3 sin tocar bombas", reward: 30 },
  { id: "coins100",   icon: "🪙", name: "Ahorradora", desc: "Junta 100 monedas en total", reward: 30 },
  { id: "power10",    icon: "✨", name: "Poderosa", desc: "Atrapa 10 poderes", reward: 25 },
  { id: "shopper",    icon: "🛍️", name: "De compras", desc: "Compra tu primer artículo", reward: 0 },
  { id: "rc_first",   icon: "🏁", name: "Primera meta", desc: "Supera un nivel de Run Cat", reward: 20 },
  { id: "rc_stomp",   icon: "👟", name: "Aplastadora", desc: "Aplasta 30 enemigos en Run Cat", reward: 30 },
  { id: "rc_boss",    icon: "👑", name: "Rey derrotado", desc: "Vence al Rey Bombón", reward: 50 },
  { id: "rc_all",     icon: "🏆", name: "Reina del camino", desc: "Supera los 5 niveles de Run Cat", reward: 80 }
];
const THEMES = [
  { name: "☀️ Mañana soleada",  top: "#7fd3ff", bot: "#eafaff", hill: ["#8be28d", "#5fcf73"] },
  { name: "🌇 Atardecer",       top: "#8b7bff", mid: "#ff8fb1", bot: "#ffe0a8", hill: ["#7a6fd1", "#5c4fb5"] },
  { name: "🌙 Noche de estrellas", top: "#14123a", bot: "#5b3a8c", hill: ["#3b2c78", "#2a1f5c"] },
  { name: "🍭 Mundo dulce",     top: "#ffc7e6", bot: "#fff3b8", hill: ["#ffb0d2", "#ff8fc0"] },
  { name: "🌈 Arcoíris",        top: "#9fe3ff", bot: "#fff7e6", hill: ["#8be28d", "#5fcf73"] }
];
const SIZE = { strawberry: 44, bow: 46, cupcake: 46, lollipop: 46, bomb: 46, star: 46, heart: 42, coin: 36, magnet: 48, shield: 48, slow: 48, big: 48 };
const VALUE = { strawberry: 10, lollipop: 15, bow: 20, cupcake: 25, star: 50 };
const CANDY = ["strawberry", "lollipop", "bow", "cupcake", "star"];
const POWERS = ["magnet", "shield", "slow", "big"];
const DUR = { magnet: 480, shield: 720, slow: 360, big: 480 };
const POWER_NAME = { magnet: "¡Imán!", shield: "¡Escudo!", slow: "¡Cámara lenta!", big: "¡Gatita gigante!" };

/* =====================================================================
   Lienzo
   ===================================================================== */
const W = 360, H = 540, BY = H - 22;
const stage = $("stage"), canvas = $("game"), mainCtx = canvas.getContext("2d");
let ctx = mainCtx, S = 1;
function resize() {
  S = clamp((window.devicePixelRatio || 1) * (stage.clientWidth / W), 1, 3);
  canvas.width = Math.round(W * S); canvas.height = Math.round(H * S);
}
window.addEventListener("resize", resize);
resize();
function withCtx(c, fn) { const old = ctx; ctx = c; try { fn(); } finally { ctx = old; } }
function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function radial(x, y, r0, r1, c0, c1) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, c0); g.addColorStop(1, c1); return g;
}

/* =====================================================================
   Estado
   ===================================================================== */
const game = {
  state: "menu", mode: "classic", resume: "playing",
  score: 0, lives: 3, level: 1, combo: 0, bestCombo: 0, timeLeft: 60,
  coinsRun: 0, candiesRun: 0, hitBomb: false, cd: 0, cdIdx: -1, lastSec: -1,
  comboPulse: 0, newBest: false, bonus: 0, pow: { magnet: 0, shield: 0, slow: 0, big: 0 }
};
const player = { cx: W / 2, w: 77, h: 55, scale: 1.1, tscale: 1.1, target: null, blink: 0, happy: 0, sad: 0 };
const keys = { left: false, right: false };
const bg = { cur: 0, prev: 0, t: 1 };
let items = [], particles = [], floaters = [];
let spawnTimer = 0, shake = 0, hurt = 0, time = 0, last = performance.now();

/* =====================================================================
   Audio (todo generado por código, sin archivos)
   ===================================================================== */
let actx = null;
function ensureAudio() {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
  } catch (e) {}
}
function tone(freq, dur, type, vol, slide, delay, kind) {
  if (!actx) return;
  if (kind === "music" ? !sv.music : !sv.sound) return;
  try {
    const t = actx.currentTime + (delay || 0);
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol || .12, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + dur + .03);
  } catch (e) {}
}
const sfx = {
  catch: p => tone(660 * (p || 1), .09, "triangle", .14, 200),
  bow:   () => { tone(880, .08, "triangle", .14, 300); tone(1175, .1, "triangle", .11, 0, .07); },
  star:  () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, .13, "triangle", .12, 0, i * .06)),
  coin:  () => { tone(1318, .07, "square", .05); tone(1760, .14, "square", .05, 0, .06); },
  heart: () => { tone(523, .12, "sine", .14); tone(784, .2, "sine", .14, 0, .1); },
  power: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .1, "sawtooth", .045, 0, i * .05)),
  shield:() => tone(300, .25, "sine", .15, 500),
  bomb:  () => { tone(160, .35, "sawtooth", .2, -100); tone(90, .3, "square", .1, -40); },
  level: () => [523, 659, 784].forEach((f, i) => tone(f, .12, "square", .07, 0, i * .09)),
  over:  () => [440, 349, 262].forEach((f, i) => tone(f, .25, "triangle", .15, 0, i * .18)),
  tick:  () => tone(520, .1, "sine", .12),
  go:    () => { tone(784, .25, "triangle", .15); tone(1047, .3, "triangle", .12, 0, .08); },
  buy:   () => { tone(880, .08, "triangle", .12); tone(1319, .14, "triangle", .12, 0, .08); },
  nope:  () => tone(180, .18, "square", .08, -40),
  ach:   () => [659, 784, 988, 1319].forEach((f, i) => tone(f, .14, "triangle", .1, 0, i * .07))
};

// Música de fondo: melodía pentatónica que se acelera con el nivel
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
const MEL_A = [0, -1, 2, -1, 3, -1, 2, -1, 0, -1, 2, 4, 3, -1, 2, -1];
const MEL_B = [4, -1, 3, -1, 2, -1, 0, -1, 2, -1, 3, 4, 5, -1, 4, -1];
const BASS = [261.6, 220, 174.6, 196];
const mus = { on: false, step: 0, timer: 0 };
function musicStart() { if (mus.on) return; mus.on = true; mus.step = 0; musicTick(); }
function musicStop() { mus.on = false; clearTimeout(mus.timer); }
function musicTick() {
  if (!mus.on) return;
  if (game.state === "playing" || game.state === "countdown") {
    const i = mus.step % 16, pat = (Math.floor(mus.step / 16) % 2) ? MEL_B : MEL_A, n = pat[i];
    if (n >= 0) tone(SCALE[n], .24, "triangle", .04, 0, 0, "music");
    if (i % 4 === 0) tone(BASS[i / 4], .55, "sine", .055, 0, 0, "music");
  }
  mus.step++;
  mus.timer = setTimeout(musicTick, 60000 / (106 + Math.min(game.level, 10) * 5) / 2);
}

/* =====================================================================
   Dibujo: objetos que caen (vectoriales, centrados en 0,0)
   ===================================================================== */
function starPath(r, inner) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * inner : r;
    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
}

function drawStrawberry(r) {
  ctx.beginPath();
  ctx.moveTo(0, r * .98);
  ctx.bezierCurveTo(-r * 1.2, r * .35, -r * 1.05, -r * .75, 0, -r * .6);
  ctx.bezierCurveTo(r * 1.05, -r * .75, r * 1.2, r * .35, 0, r * .98);
  ctx.closePath();
  ctx.fillStyle = radial(-r * .3, -r * .1, r * .1, r * 1.3, "#ff8a9b", "#e0102f"); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = "#a8081f"; ctx.stroke();
  ctx.fillStyle = "#ffe066";
  [[-.5, -.2], [.1, -.3], [.55, -.1], [-.3, .25], [.3, .2], [0, .6], [-.55, .5], [.55, .5]].forEach(p => {
    ctx.beginPath(); ctx.ellipse(p[0] * r, p[1] * r, r * .09, r * .14, 0, 0, TAU); ctx.fill();
  });
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath(); ctx.ellipse(-r * .5, -r * .35, r * .16, r * .3, -.5, 0, TAU); ctx.fill();
  ctx.fillStyle = "#3ddc57"; ctx.strokeStyle = "#1f8f35"; ctx.lineWidth = 1.5; ctx.lineJoin = "round";
  [-.9, -.45, 0, .45, .9].forEach(a => {
    ctx.save(); ctx.translate(0, -r * .6); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-r * .22, -r * .25, 0, -r * .5); ctx.quadraticCurveTo(r * .22, -r * .25, 0, 0);
    ctx.fill(); ctx.stroke(); ctx.restore();
  });
}

function drawBow(r) {
  ctx.lineJoin = "round"; ctx.fillStyle = "#c2185b"; ctx.strokeStyle = "#880e4f"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-r * .1, r * .1); ctx.lineTo(-r * .55, r * .95); ctx.lineTo(-r * .15, r * .75); ctx.lineTo(r * .1, r * .15); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(r * .1, r * .1); ctx.lineTo(r * .55, r * .95); ctx.lineTo(r * .15, r * .75); ctx.lineTo(-r * .1, r * .15); ctx.closePath(); ctx.fill(); ctx.stroke();
  [-1, 1].forEach(s => {
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * r * .5, -r * .95, s * r * 1.35, -r * .6, s * r * 1.2, r * .1);
    ctx.bezierCurveTo(s * r * 1.3, r * .7, s * r * .5, r * .75, 0, 0); ctx.closePath();
    const g = ctx.createLinearGradient(s * r * 1.2, -r * .6, 0, r * .4);
    g.addColorStop(0, "#ff7eb9"); g.addColorStop(1, "#e91e8c");
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = "#880e4f"; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    [[.55, -.1, .1], [.85, .15, .08], [.8, -.35, .07]].forEach(d => { ctx.beginPath(); ctx.arc(s * r * d[0], r * d[1], r * d[2], 0, TAU); ctx.fill(); });
  });
  ctx.fillStyle = radial(-r * .08, -r * .08, 1, r * .35, "#ffb3d9", "#d81b7a");
  ctx.beginPath(); ctx.arc(0, 0, r * .3, 0, TAU); ctx.fill(); ctx.strokeStyle = "#880e4f"; ctx.stroke();
}

function drawCupcake(r) {
  ctx.lineJoin = "round"; ctx.fillStyle = "#ff8fc0"; ctx.strokeStyle = "#c2307a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-r * .72, -r * .02); ctx.lineTo(r * .72, -r * .02); ctx.lineTo(r * .5, r * .95); ctx.lineTo(-r * .5, r * .95); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.65)"; ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * r * .27, r * .04); ctx.lineTo(i * r * .19, r * .9); ctx.stroke(); }
  [[-r * .12, r * .88, "#fff1f8"], [-r * .46, r * .64, "#ffc4de"], [-r * .76, r * .4, "#fff1f8"]].forEach(l => {
    ctx.beginPath(); ctx.ellipse(0, l[0], l[1], r * .3, 0, 0, TAU);
    ctx.fillStyle = l[2]; ctx.fill(); ctx.strokeStyle = "#e0709f"; ctx.lineWidth = 1.5; ctx.stroke();
  });
  const sp = ["#4dabf7", "#ffd23f", "#8e44ff", "#51cf66"];
  [[-.4, -.5], [.35, -.55], [0, -.8], [-.15, -.3], [.45, -.2], [-.5, -.15]].forEach((p, i) => {
    ctx.save(); ctx.translate(p[0] * r, p[1] * r); ctx.rotate(i); ctx.fillStyle = sp[i % 4]; ctx.fillRect(-r * .1, -r * .03, r * .2, r * .06); ctx.restore();
  });
  ctx.fillStyle = radial(-r * .05, -r * 1.1, 1, r * .22, "#ff8a9b", "#d50032");
  ctx.beginPath(); ctx.arc(0, -r * 1.02, r * .2, 0, TAU); ctx.fill();
  ctx.strokeStyle = "#7a1f42"; ctx.lineWidth = 1.2; ctx.stroke();
}

function drawLollipop(r) {
  ctx.lineCap = "round";
  ctx.strokeStyle = "#9a7aa0"; ctx.lineWidth = r * .2 + 2; ctx.beginPath(); ctx.moveTo(0, r * .2); ctx.lineTo(0, r * 1.05); ctx.stroke();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = r * .2; ctx.beginPath(); ctx.moveTo(0, r * .2); ctx.lineTo(0, r * 1.05); ctx.stroke();
  const cy = -r * .25, R = r * .78, cols = ["#ff4f9d", "#ffffff", "#8e44ff", "#ffffff", "#ffd23f", "#ffffff"];
  for (let i = 0; i < 6; i++) {
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.arc(0, cy, R, i * TAU / 6, (i + 1) * TAU / 6); ctx.closePath();
    ctx.fillStyle = cols[i]; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, cy, R, 0, TAU); ctx.lineWidth = 2.5; ctx.strokeStyle = "#c2307a"; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, cy, R * .35, 0, TAU); ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(194,48,122,.5)"; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.ellipse(-R * .45, cy - R * .45, R * .16, R * .1, -.7, 0, TAU); ctx.fill();
  ctx.lineCap = "butt";
}

function drawBomb(r, rot) {
  const pulse = .35 + Math.sin(time * .18 + rot) * .15;
  ctx.fillStyle = "rgba(255,40,40," + pulse + ")";
  ctx.beginPath(); ctx.arc(0, r * .15, r * 1.2, 0, TAU); ctx.fill();
  ctx.fillStyle = radial(-r * .3, -r * .1, r * .1, r * .95, "#6b6f80", "#14141c");
  ctx.beginPath(); ctx.arc(0, r * .15, r * .85, 0, TAU); ctx.fill(); ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.beginPath(); ctx.ellipse(-r * .38, -r * .2, r * .2, r * .12, -.6, 0, TAU); ctx.fill();
  ctx.fillStyle = "#f5f5f5"; ctx.beginPath(); ctx.arc(0, r * .2, r * .3, 0, TAU); ctx.fill();
  ctx.fillStyle = "#14141c"; ctx.beginPath(); ctx.arc(-r * .11, r * .16, r * .08, 0, TAU); ctx.arc(r * .11, r * .16, r * .08, 0, TAU); ctx.fill();
  ctx.fillStyle = "#9aa0b4"; ctx.strokeStyle = "#4a4f63"; ctx.lineWidth = 1.5;
  rr(ctx, -r * .25, -r * .78, r * .5, r * .28, 3); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#8d5a2b"; ctx.lineWidth = 3; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, -r * .78); ctx.quadraticCurveTo(r * .35, -r * 1.05, r * .6, -r * .85); ctx.stroke();
  const f = 1 + Math.sin(time * .5) * .25;
  ctx.save(); ctx.translate(r * .6, -r * .85); ctx.rotate(time * .15); ctx.fillStyle = "#ffd60a"; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rad = (i % 2 ? r * .13 : r * .3) * f; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
  ctx.closePath(); ctx.fill(); ctx.fillStyle = "#ff6d00"; ctx.beginPath(); ctx.arc(0, 0, r * .1, 0, TAU); ctx.fill(); ctx.restore();
  ctx.lineCap = "butt";
}

function drawStar(r) {
  ctx.shadowColor = "#ffd54f"; ctx.shadowBlur = 16;
  starPath(r * 1.1, .48); ctx.fillStyle = radial(0, -r * .1, r * .1, r * 1.1, "#fff9c4", "#ffb300"); ctx.fill();
  ctx.shadowBlur = 0; ctx.lineJoin = "round"; ctx.lineWidth = 2.5; ctx.strokeStyle = "#ff8f00"; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(-r * .2, -r * .25, r * .12, 0, TAU); ctx.fill();
}

function drawHeart(r) {
  const beat = 1 + Math.sin(time * .2) * .07; ctx.scale(beat, beat);
  ctx.shadowColor = "#ff4081"; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(0, r * .9);
  ctx.bezierCurveTo(-r * 1.5, -r * .1, -r * .9, -r * 1.1, 0, -r * .35);
  ctx.bezierCurveTo(r * .9, -r * 1.1, r * 1.5, -r * .1, 0, r * .9); ctx.closePath();
  ctx.fillStyle = radial(-r * .3, -r * .3, r * .1, r * 1.3, "#ff9ec4", "#e91e63"); ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 2; ctx.strokeStyle = "#ad1457"; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.beginPath(); ctx.ellipse(-r * .5, -r * .3, r * .15, r * .27, -.6, 0, TAU); ctx.fill();
}

function drawCoin(r, rot) {
  const sx = Math.max(.22, Math.abs(Math.cos(time * .09 + rot)));
  ctx.save(); ctx.scale(sx, 1);
  ctx.shadowColor = "#ffc400"; ctx.shadowBlur = 10;
  ctx.fillStyle = radial(-r * .25, -r * .25, r * .1, r * 1.1, "#fff3a0", "#f5a300");
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 2.5; ctx.strokeStyle = "#c77700"; ctx.stroke();
  ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(199,119,0,.55)"; ctx.beginPath(); ctx.arc(0, 0, r * .72, 0, TAU); ctx.stroke();
  starPath(r * .46, .5); ctx.fillStyle = "#e08e00"; ctx.fill();
  ctx.restore();
}

function drawPower(type, r) {
  const col = { magnet: "#e53935", shield: "#1e88e5", slow: "#8e44ff", big: "#2ecc71" }[type];
  const bob = Math.sin(time * .12) * 1.5;
  ctx.save(); ctx.translate(0, bob);
  ctx.shadowColor = col; ctx.shadowBlur = 14;
  ctx.fillStyle = radial(-r * .3, -r * .3, r * .1, r * 1.1, "rgba(255,255,255,.98)", "rgba(240,240,255,.7)");
  ctx.beginPath(); ctx.arc(0, 0, r * .98, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 3.5; ctx.strokeStyle = col; ctx.stroke();
  ctx.lineCap = "butt"; ctx.lineJoin = "round";
  if (type === "magnet") {
    ctx.lineWidth = r * .3; ctx.strokeStyle = "#e53935";
    ctx.beginPath(); ctx.arc(0, -r * .02, r * .38, Math.PI, 0); ctx.moveTo(-r * .38, -r * .02); ctx.lineTo(-r * .38, r * .2); ctx.moveTo(r * .38, -r * .02); ctx.lineTo(r * .38, r * .2); ctx.stroke();
    ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(-r * .38, r * .2); ctx.lineTo(-r * .38, r * .44); ctx.moveTo(r * .38, r * .2); ctx.lineTo(r * .38, r * .44); ctx.stroke();
  } else if (type === "shield") {
    ctx.beginPath(); ctx.moveTo(0, -r * .52); ctx.lineTo(r * .42, -r * .34); ctx.lineTo(r * .4, r * .08);
    ctx.quadraticCurveTo(r * .3, r * .42, 0, r * .56); ctx.quadraticCurveTo(-r * .3, r * .42, -r * .4, r * .08); ctx.lineTo(-r * .42, -r * .34); ctx.closePath();
    ctx.fillStyle = "#1e88e5"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#0d47a1"; ctx.stroke();
    ctx.save(); ctx.translate(0, -r * .02); starPath(r * .22, .5); ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore();
  } else if (type === "slow") {
    ctx.beginPath(); ctx.arc(0, 0, r * .46, 0, TAU); ctx.fillStyle = "#f3e8ff"; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = "#8e44ff"; ctx.stroke();
    ctx.lineCap = "round"; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * .3); ctx.moveTo(0, 0); ctx.lineTo(r * .2, r * .08); ctx.stroke();
  } else {
    ctx.font = "900 " + (r * .85) + "px " + FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 3; ctx.strokeStyle = "#fff"; ctx.strokeText("XL", 0, r * .04);
    ctx.fillStyle = "#1b9e55"; ctx.fillText("XL", 0, r * .04); ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  }
  ctx.restore();
}

function drawItemShape(type, r, rot) {
  switch (type) {
    case "strawberry": drawStrawberry(r); break;
    case "lollipop": drawLollipop(r); break;
    case "bow": drawBow(r); break;
    case "cupcake": drawCupcake(r); break;
    case "bomb": drawBomb(r, rot); break;
    case "star": drawStar(r); break;
    case "heart": drawHeart(r); break;
    case "coin": drawCoin(r, rot); break;
    default: drawPower(type, r);
  }
}

function drawItems() {
  items.forEach(it => {
    const r = it.size / 2;
    ctx.save(); ctx.translate(it.x, it.y);
    if (it.type === "star") ctx.rotate(it.rot);
    else if (it.type === "strawberry" || it.type === "bow" || it.type === "cupcake" || it.type === "lollipop") ctx.rotate(Math.sin(time * .08 + it.rot) * .16);
    else if (it.type === "bomb") ctx.rotate(Math.sin(time * .1 + it.rot) * .12);
    drawItemShape(it.type, r, it.rot);
    ctx.restore();
  });
}

/* =====================================================================
   Dibujo: la gatita (c = contexto, cx/by = centro-base, s = escala)
   ===================================================================== */
function drawCat(c, cx, by, s, skin, acc, o) {
  o = o || {};
  c.save(); c.translate(cx, by); c.scale(s, s); c.lineJoin = "round"; c.lineCap = "round";
  // canasta
  c.fillStyle = "#ffd6e8"; rr(c, -31, -24, 62, 24, 10); c.fill();
  c.strokeStyle = "#ff69b4"; c.lineWidth = 3; c.stroke();
  c.strokeStyle = "rgba(255,105,180,.45)"; c.lineWidth = 1.5;
  for (let i = 1; i < 4; i++) { const lx = -31 + i * 15.5; c.beginPath(); c.moveTo(lx, -22); c.lineTo(lx, -3); c.stroke(); }
  // orejas
  c.lineWidth = 2.5;
  [-1, 1].forEach(sd => {
    c.fillStyle = skin.fur; c.strokeStyle = skin.line;
    c.beginPath(); c.moveTo(sd * 27, -28); c.lineTo(sd * 23, -52); c.lineTo(sd * 11, -30); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = skin.inner; c.beginPath(); c.moveTo(sd * 21, -33); c.lineTo(sd * 23, -44); c.lineTo(sd * 14, -34); c.closePath(); c.fill();
  });
  // cara
  c.fillStyle = skin.fur; c.strokeStyle = skin.line; c.lineWidth = 2.5;
  c.beginPath(); c.ellipse(0, -30, 27, 18, 0, 0, TAU); c.fill(); c.stroke();
  // ojos
  c.fillStyle = "#4a2c2a"; c.strokeStyle = "#4a2c2a"; c.lineWidth = 2;
  [-10, 10].forEach(dx => {
    if (o.sad) { c.beginPath(); c.moveTo(dx - 4, -34); c.lineTo(dx + 4, -28); c.moveTo(dx + 4, -34); c.lineTo(dx - 4, -28); c.stroke(); }
    else if (o.blink || o.happy) { c.beginPath(); c.arc(dx, -31, 4, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    else { c.beginPath(); c.arc(dx, -31, 3.5, 0, TAU); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(dx + 1.1, -32.3, 1.1, 0, TAU); c.fill(); c.fillStyle = "#4a2c2a"; }
  });
  // nariz, boca, mejillas
  c.fillStyle = "#ff8fab"; c.beginPath(); c.arc(0, -26, 2.4, 0, TAU); c.fill();
  c.strokeStyle = "#4a2c2a"; c.lineWidth = 1.6; c.beginPath();
  if (o.sad) c.arc(0, -17, 5, Math.PI * 1.15, Math.PI * 1.85);
  else if (o.happy) c.arc(0, -25, 6, .1 * Math.PI, .9 * Math.PI);
  else { c.arc(-3, -24, 3, .1 * Math.PI, .9 * Math.PI); c.moveTo(6, -23.5); c.arc(3, -24, 3, .1 * Math.PI, .9 * Math.PI); }
  c.stroke();
  c.fillStyle = "rgba(255,120,150,.45)";
  c.beginPath(); c.ellipse(-18, -25, 5, 3, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(18, -25, 5, 3, 0, 0, TAU); c.fill();
  // accesorios
  if (acc === "acc_flower") {
    c.save(); c.translate(-22, -47);
    for (let i = 0; i < 5; i++) { const a = i * TAU / 5; c.fillStyle = "#ff8fc0"; c.strokeStyle = "#e0709f"; c.lineWidth = .8; c.beginPath(); c.arc(Math.cos(a) * 4.6, Math.sin(a) * 4.6, 3.6, 0, TAU); c.fill(); c.stroke(); }
    c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 0, 2.7, 0, TAU); c.fill(); c.restore();
  } else if (acc === "acc_party") {
    c.beginPath(); c.moveTo(-10, -45); c.lineTo(0, -73); c.lineTo(10, -45); c.closePath();
    c.fillStyle = "#8e44ff"; c.fill(); c.strokeStyle = "#5f23b8"; c.lineWidth = 1.8; c.stroke();
    c.strokeStyle = "#ffd23f"; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -52); c.lineTo(6, -52); c.moveTo(-3.4, -60); c.lineTo(3.4, -60); c.stroke();
    c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, -73, 3.2, 0, TAU); c.fill();
  } else if (acc === "acc_glasses") {
    c.fillStyle = "rgba(40,30,70,.92)"; c.strokeStyle = "#1d1533"; c.lineWidth = 1.8;
    [-10, 10].forEach(dx => { c.beginPath(); c.arc(dx, -31, 7.6, 0, TAU); c.fill(); c.stroke(); });
    c.beginPath(); c.moveTo(-2.5, -31); c.lineTo(2.5, -31); c.stroke();
    c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1.6;
    [-10, 10].forEach(dx => { c.beginPath(); c.arc(dx, -31, 4.6, Math.PI * 1.15, Math.PI * 1.55); c.stroke(); });
  } else if (acc === "acc_crown") {
    c.beginPath(); c.moveTo(-12, -45); c.lineTo(-13, -60); c.lineTo(-6, -53); c.lineTo(0, -63); c.lineTo(6, -53); c.lineTo(13, -60); c.lineTo(12, -45); c.closePath();
    const g = c.createLinearGradient(0, -63, 0, -45); g.addColorStop(0, "#ffe27a"); g.addColorStop(1, "#ffb300");
    c.fillStyle = g; c.fill(); c.strokeStyle = "#c77700"; c.lineWidth = 1.8; c.stroke();
    [[-6, "#ff4f6d"], [0, "#4dabf7"], [6, "#51cf66"]].forEach(j => { c.fillStyle = j[1]; c.beginPath(); c.arc(j[0], -49, 1.9, 0, TAU); c.fill(); });
    c.fillStyle = "#fff6b0"; [[-13, -60], [0, -63], [13, -60]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 1.7, 0, TAU); c.fill(); });
  }
  // moñito original (siempre puesto)
  const bx = 25, bY = -46;
  c.fillStyle = "#9d4edd"; c.strokeStyle = "#5a189a"; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(bx, bY); c.lineTo(bx + 11, bY - 7); c.lineTo(bx + 11, bY + 7); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(bx, bY); c.lineTo(bx - 11, bY - 7); c.lineTo(bx - 11, bY + 7); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "#c77dff"; c.beginPath(); c.arc(bx, bY, 3.5, 0, TAU); c.fill(); c.stroke();
  c.restore();
}

function drawPlayer() {
  const skin = SKINS.find(s => s.id === sv.equipped.skin) || SKINS[0];
  const acc = sv.equipped.acc;
  const bob = game.state === "menu" ? Math.sin(time * .08) * 2 : 0;
  const mid = BY - player.h * .5;
  if (game.pow.magnet > 0) {
    ctx.save(); ctx.strokeStyle = "rgba(229,57,53,.45)"; ctx.lineWidth = 2.5; ctx.setLineDash([7, 9]); ctx.lineDashOffset = -time * .6;
    ctx.beginPath(); ctx.arc(player.cx, mid, 78 + Math.sin(time * .1) * 5, 0, TAU); ctx.stroke(); ctx.restore();
  }
  drawCat(ctx, player.cx, BY + bob, player.scale, skin, acc, { blink: player.blink > 225, happy: player.happy > 0, sad: player.sad > 0 });
  if (game.pow.shield > 0) {
    const rad = Math.max(player.w, player.h) * .78, al = game.pow.shield < 120 ? (Math.sin(time * .5) > 0 ? .9 : .3) : 1;
    ctx.save(); ctx.globalAlpha = al;
    ctx.fillStyle = radial(player.cx - rad * .3, mid - rad * .3, rad * .1, rad, "rgba(160,215,255,.05)", "rgba(80,170,255,.38)");
    ctx.beginPath(); ctx.arc(player.cx, mid, rad, 0, TAU); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(60,150,255,.85)"; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.beginPath(); ctx.ellipse(player.cx - rad * .45, mid - rad * .5, rad * .14, rad * .08, -.7, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/* =====================================================================
   Dibujo: fondos por nivel
   ===================================================================== */
const bgStars = Array.from({ length: 40 }, () => ({ x: rand(0, W), y: rand(0, H * .72), r: rand(.8, 2.2), p: rand(0, TAU) }));
const bgClouds = Array.from({ length: 5 }, (_, i) => ({ x: rand(0, W), y: 70 + i * 62 + rand(-12, 12), s: rand(.7, 1.3), v: rand(.1, .28) }));
const bgBokeh = Array.from({ length: 14 }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(10, 30), v: rand(.1, .35), c: choice(["#ff8fc0", "#ffd23f", "#8e44ff", "#4fd1ff", "#7ae582"]) }));

function drawCloud(x, y, s, color) {
  ctx.fillStyle = color;
  [[0, 0, 16], [18, -9, 20], [40, 0, 16], [20, 6, 18]].forEach(p => { ctx.beginPath(); ctx.arc(x + p[0] * s, y + p[1] * s, p[2] * s, 0, TAU); ctx.fill(); });
}
function drawSun(x, y, r, color) {
  ctx.fillStyle = radial(x, y, r * .2, r * 2.6, color, "rgba(255,255,255,0)"); ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, TAU); ctx.fill();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
function drawTheme(i, a) {
  const th = THEMES[i];
  ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, th.top); if (th.mid) g.addColorStop(.55, th.mid); g.addColorStop(1, th.bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (i === 0) {
    drawSun(285, 95, 30, "#fff3a0");
    bgClouds.forEach(c => drawCloud(c.x, c.y, c.s, "rgba(255,255,255,.95)"));
  } else if (i === 1) {
    drawSun(110, 330, 38, "#ffd9a0");
    bgClouds.forEach(c => drawCloud(c.x, c.y, c.s, "rgba(255,214,230,.85)"));
  } else if (i === 2) {
    bgStars.forEach(s => { ctx.fillStyle = "rgba(255,255,255," + (.45 + .5 * Math.sin(time * .05 + s.p)) + ")"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill(); });
    ctx.fillStyle = "#fff6c9"; ctx.beginPath(); ctx.arc(70, 100, 26, 0, TAU); ctx.fill();
    ctx.fillStyle = "#241d5c"; ctx.beginPath(); ctx.arc(80, 94, 23, 0, TAU); ctx.fill();
  } else if (i === 3) {
    bgBokeh.forEach(b => { ctx.globalAlpha = a * .32; ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); });
    ctx.globalAlpha = a;
  } else {
    const cols = ["#ff6b6b", "#ffa94d", "#ffe066", "#69db7c", "#4dabf7", "#b197fc"];
    ctx.lineWidth = 13;
    cols.forEach((col, k) => { ctx.strokeStyle = col; ctx.globalAlpha = a * .75; ctx.beginPath(); ctx.arc(W / 2, H * .8, 250 - k * 13, Math.PI, TAU); ctx.stroke(); });
    ctx.globalAlpha = a;
    bgClouds.forEach(c => drawCloud(c.x, c.y, c.s, "rgba(255,255,255,.95)"));
  }
  const hg = ctx.createLinearGradient(0, H - 52, 0, H); hg.addColorStop(0, th.hill[0]); hg.addColorStop(1, th.hill[1]);
  ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(0, H - 34);
  ctx.quadraticCurveTo(W * .25, H - 54, W * .5, H - 34); ctx.quadraticCurveTo(W * .75, H - 14, W, H - 34);
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
}
function drawBackground() {
  if (bg.t < 1) drawTheme(bg.prev, 1);
  drawTheme(bg.cur, bg.t);
}

/* =====================================================================
   Efectos
   ===================================================================== */
function burst(x, y, colors, n, shape) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), sp = rand(1, 4);
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, life: 1, color: choice(colors), size: rand(2, 4.5), shape: shape || "c", rot: rand(0, TAU) });
  }
}
function floatText(text, x, y, color) { floaters.push({ text, x: clamp(x, 50, W - 50), y, life: 1, color: color || "#d63384" }); }

function drawFX() {
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
    if (p.shape === "r") { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill(); }
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = "center"; ctx.font = "900 19px " + FONT; ctx.lineJoin = "round";
  floaters.forEach(f => {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 1.6));
    ctx.lineWidth = 4; ctx.strokeStyle = "#fff"; ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
  });
  ctx.globalAlpha = 1;
  if (game.state === "playing" && game.combo >= 3) {
    const s = 1 + game.comboPulse * .22, mult = Math.min(5, 1 + Math.floor(game.combo / 5));
    ctx.save(); ctx.translate(W / 2, 140); ctx.scale(s, s); ctx.font = "900 18px " + FONT;
    ctx.lineWidth = 4.5; ctx.strokeStyle = "#fff"; ctx.strokeText("🔥 COMBO " + game.combo + (mult > 1 ? "  ·  x" + mult : ""), 0, 0);
    ctx.fillStyle = "#8e44ff"; ctx.fillText("🔥 COMBO " + game.combo + (mult > 1 ? "  ·  x" + mult : ""), 0, 0); ctx.restore();
  }
  ctx.textAlign = "left";
  if (hurt > 0) { ctx.fillStyle = "rgba(255,0,60," + (hurt * .3) + ")"; ctx.fillRect(0, 0, W, H); }
}

/* =====================================================================
   Lógica del juego
   ===================================================================== */
function heartWanted() { return game.mode === "time" || game.lives < 5; }

function spawnItem(deco) {
  const lvl = game.level, r = Math.random();
  const bombP = deco ? 0 : Math.min(.12 + lvl * .012, .22);
  let c = bombP, type;
  if (r < c) type = "bomb";
  else if (r < (c += .09)) type = "coin";
  else if (r < (c += .04)) type = "star";
  else if (r < (c += .025) && !deco && heartWanted()) type = "heart";
  else if (r < (c += .04) && !deco) type = choice(POWERS);
  else type = choice(["strawberry", "strawberry", "bow", "cupcake", "lollipop"]);
  const size = SIZE[type] || 44, rad = size / 2;
  items.push({
    type, size, x: rand(rad + 6, W - rad - 6), y: -rad - 6, deco: !!deco,
    speed: (2.2 + Math.random() * 1.6) * (1 + (Math.min(lvl, 14) - 1) * .1),
    rot: rand(0, TAU), spin: rand(-.04, .04)
  });
}

function movePlayer(dt) {
  player.scale += (player.tscale - player.scale) * .12 * dt;
  player.w = 70 * player.scale; player.h = 50 * player.scale;
  const sp = 7.5 * dt;
  if (keys.left) { player.cx -= sp; player.target = null; }
  if (keys.right) { player.cx += sp; player.target = null; }
  if (player.target !== null) player.cx += clamp(player.target - player.cx, -sp * 2.4, sp * 2.4);
  player.cx = clamp(player.cx, player.w / 2, W - player.w / 2);
  player.blink = (player.blink + dt) % 240;
  if (player.happy > 0) player.happy -= dt;
  if (player.sad > 0) player.sad -= dt;
}

function stepItems(dt, deco) {
  const slow = game.pow.slow > 0 ? .5 : 1;
  const L = player.cx - player.w / 2 + 4, R = player.cx + player.w / 2 - 4, T = BY - player.h * .85;
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i], r = it.size / 2;
    it.y += it.speed * slow * dt; it.rot += it.spin * dt;
    if (!deco && game.pow.magnet > 0 && it.type !== "bomb") {
      const dx = player.cx - it.x, dy = (BY - player.h * .6) - it.y, d = Math.hypot(dx, dy);
      if (d < 170 && d > 1) { const pull = (1 - d / 170) * 5.5; it.x += dx / d * pull * dt; it.y += dy / d * pull * dt; }
    }
    const hr = r * .8;
    if (it.x + hr > L && it.x - hr < R && it.y + hr > T && it.y - hr < BY) {
      items.splice(i, 1);
      if (deco) { burst(it.x, it.y, ["#ff8fc0", "#ffd23f", "#fff"], 6); player.happy = 14; }
      else { collect(it); if (game.state !== "playing") break; }
      continue;
    }
    if (it.y - r > H) {
      if (!deco && CANDY.indexOf(it.type) >= 0) game.combo = 0;
      items.splice(i, 1);
    }
  }
}

function updatePlaying(dt) {
  movePlayer(dt);
  // poderes
  let changed = false;
  POWERS.forEach(k => {
    if (game.pow[k] > 0) {
      game.pow[k] -= dt; changed = true;
      if (game.pow[k] <= 0) { game.pow[k] = 0; if (k === "big") player.tscale = 1.1; }
    }
  });
  if (changed) updatePowers();
  // aparición
  spawnTimer += dt * (game.pow.slow > 0 ? .55 : 1);
  if (spawnTimer > Math.max(16, 40 - game.level * 2.5)) { spawnItem(false); spawnTimer = 0; }
  // contrarreloj
  if (game.mode === "time") {
    game.timeLeft -= dt / 60;
    const sec = Math.max(0, Math.ceil(game.timeLeft));
    if (sec !== game.lastSec) { game.lastSec = sec; updateHUD(); }
    if (game.timeLeft <= 0) { endGame(); return; }
  }
  stepItems(dt, false);
}

function updateAttract(dt) {
  spawnTimer += dt;
  if (spawnTimer > 36) { spawnItem(true); spawnTimer = 0; }
  let low = null;
  items.forEach(it => { if (it.y > 30 && (!low || it.y > low.y)) low = it; });
  player.target = low ? low.x : W / 2 + Math.sin(time * .02) * 60;
  movePlayer(dt * .8);
  stepItems(dt, true);
}

function updateCountdown(dt) {
  movePlayer(dt);
  game.cd += dt / 60;
  const idx = Math.floor(game.cd / .7);
  if (idx === game.cdIdx) return;
  game.cdIdx = idx;
  if (idx >= 4) { game.state = "playing"; $("countdown").style.display = "none"; spawnTimer = 30; return; }
  const el = $("countdown");
  el.style.display = "flex"; el.textContent = ["3", "2", "1", "¡YA!"][idx];
  el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
  if (idx === 3) sfx.go(); else sfx.tick();
}

function update(dt) {
  if (game.state === "paused") return;
  time += dt;
  bgClouds.forEach(c => { c.x += c.v * dt; if (c.x > W + 90) c.x = -110; });
  bgBokeh.forEach(b => { b.y -= b.v * dt; if (b.y < -40) b.y = H + 40; });
  if (bg.t < 1) bg.t = Math.min(1, bg.t + .02 * dt);
  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .15 * dt; p.life -= .03 * dt; p.rot += .2 * dt; });
  particles = particles.filter(p => p.life > 0);
  floaters.forEach(f => { f.y -= .7 * dt; f.life -= .017 * dt; });
  floaters = floaters.filter(f => f.life > 0);
  if (shake > 0) shake -= dt;
  if (hurt > 0) hurt = Math.max(0, hurt - .05 * dt);
  if (game.comboPulse > 0) game.comboPulse = Math.max(0, game.comboPulse - .06 * dt);
  if (game.state === "menu") updateAttract(dt);
  else if (game.state === "countdown") updateCountdown(dt);
  else if (game.state === "playing") updatePlaying(dt);
}

function draw() {
  ctx = mainCtx; ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.save();
  if (shake > 0) ctx.translate(rand(-4, 4), rand(-4, 4));
  drawBackground(); drawItems(); drawPlayer(); drawFX();
  ctx.restore();
}

/* ---------- Recoger objetos ---------- */
function collect(it) {
  const x = it.x, y = it.y;
  player.happy = 22;
  switch (it.type) {
    case "bomb": hitBomb(x, y); break;
    case "heart":
      if (game.mode === "time") { game.timeLeft += 5; floatText("+5 s", x, y, "#e91e63"); game.lastSec = -1; }
      else { game.lives = Math.min(5, game.lives + 1); floatText("+1 vida", x, y, "#e91e63"); }
      sfx.heart(); burst(x, y, ["#ff4081", "#ff9ec4", "#fff"], 14); break;
    case "coin":
      sv.coins++; sv.stats.coins++; game.coinsRun++; sfx.coin();
      burst(x, y, ["#ffd23f", "#ffb300"], 8); floatText("+1 🪙", x, y, "#d58a00");
      if (sv.stats.coins >= 100) unlock("coins100"); break;
    case "magnet": case "shield": case "slow": case "big": power(it.type, x, y); break;
    default: candy(it);
  }
  updateHUD();
}

function candy(it) {
  game.combo++; if (game.combo > game.bestCombo) game.bestCombo = game.combo;
  const mult = Math.min(5, 1 + Math.floor(game.combo / 5)), pts = VALUE[it.type] * mult;
  game.score += pts; game.candiesRun++; sv.stats.candies++; game.comboPulse = 1;
  const x = it.x, y = it.y;
  if (it.type === "star") {
    sfx.star(); burst(x, y, ["#ffd23f", "#ff4f9d", "#4dabf7", "#51cf66", "#8e44ff"], 18, "r"); unlock("first_star");
    if (game.mode === "time") { game.timeLeft += 3; game.lastSec = -1; floatText("+3 s", x, y - 22, "#2e9e44"); }
  } else if (it.type === "bow" || it.type === "cupcake") { sfx.bow(); burst(x, y, ["#ff69b4", "#fff", "#c77dff"], 9); }
  else { sfx.catch(it.type === "lollipop" ? 1.2 : 1); burst(x, y, ["#ff69b4", "#ff9ec4"], 8); }
  floatText("+" + pts + (mult > 1 ? "  x" + mult : ""), x, y);
  if (game.combo >= 10) unlock("combo10");
  if (game.combo >= 25) unlock("combo25");
  if (sv.stats.candies >= 100) unlock("candies100");
  if (sv.stats.candies >= 500) unlock("candies500");
  if (game.score >= 500) unlock("score500");
  if (game.score >= 1500) unlock("score1500");
  checkLevel();
}

function checkLevel() {
  const L = 1 + Math.floor(game.score / 150);
  if (L <= game.level) return;
  game.level = L;
  const t = (L - 1) % THEMES.length;
  if (t !== bg.cur) { bg.prev = bg.cur; bg.cur = t; bg.t = 0; floatText(THEMES[t].name, W / 2, H / 2 - 30, "#7b2cbf"); }
  sfx.level(); floatText("¡Nivel " + L + "!", W / 2, H / 2 - 62, "#d63384");
  if (L >= 3 && !game.hitBomb) unlock("nobomb");
  if (L >= 5) unlock("level5");
}

function hitBomb(x, y) {
  if (game.pow.shield > 0) {
    game.pow.shield = 0; sfx.shield(); burst(x, y, ["#4fc3f7", "#fff", "#1e88e5"], 16);
    floatText("¡Bloqueada!", x, y, "#1976d2"); updatePowers(); return;
  }
  game.hitBomb = true; game.combo = 0; shake = 14; hurt = 1; player.sad = 45;
  sfx.bomb(); burst(x, y, ["#555", "#ff7043", "#ffd54f"], 20, "r");
  if (navigator.vibrate) { try { navigator.vibrate(120); } catch (e) {} }
  if (game.mode === "classic") {
    game.lives--; floatText("¡Ay! 💥", x, y, "#b00020");
    if (game.lives <= 0) endGame();
  } else {
    game.timeLeft -= 5; game.lastSec = -1; floatText("-5 s", x, y, "#b00020");
    if (game.timeLeft <= 0) endGame();
  }
}

function power(type, x, y) {
  game.pow[type] = DUR[type]; sv.stats.powerups++; sfx.power();
  burst(x, y, ["#fff", "#ffd23f", { magnet: "#e53935", shield: "#1e88e5", slow: "#8e44ff", big: "#2ecc71" }[type]], 14);
  floatText(POWER_NAME[type], x, y, "#7b2cbf");
  if (type === "big") player.tscale = 1.6;
  if (sv.stats.powerups >= 10) unlock("power10");
  updatePowers();
}

/* =====================================================================
   Logros y avisos
   ===================================================================== */
let toastQ = [], toastBusy = false;
function toast(msg) { toastQ.push(msg); if (!toastBusy) nextToast(); }
function nextToast() {
  const m = toastQ.shift(), el = $("toast");
  if (!m) { toastBusy = false; return; }
  toastBusy = true; el.textContent = m; el.classList.add("show");
  setTimeout(() => { el.classList.remove("show"); setTimeout(nextToast, 260); }, 2300);
}
function unlock(id) {
  if (sv.ach[id]) return;
  const a = ACH.find(x => x.id === id); if (!a) return;
  sv.ach[id] = true; sv.coins += a.reward; persist(); sfx.ach();
  toast("🏅 " + a.name + (a.reward ? "  +" + a.reward + " 🪙" : ""));
}

/* =====================================================================
   HUD
   ===================================================================== */
function heartSvg(on) {
  return '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="' + (on ? "#ff3d71" : "#e7cfe0") + '" stroke="' + (on ? "#b3103f" : "#c9a9bf") + '" stroke-width="1.4"/></svg>';
}
let lastScoreShown = -1;
function updateHUD() {
  const se = $("h-score");
  se.textContent = game.score;
  if (game.score !== lastScoreShown && game.score > 0) { se.classList.remove("bump"); void se.offsetWidth; se.classList.add("bump"); }
  lastScoreShown = game.score;
  $("h-level").textContent = "Nv " + game.level;
  $("h-coins").textContent = sv.coins;
  const L = $("h-lives");
  if (game.mode === "time") {
    const t = Math.max(0, Math.ceil(game.timeLeft));
    L.innerHTML = '<span class="timer' + (t <= 10 ? " low" : "") + '">⏱ ' + Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0") + "</span>";
  } else {
    let h = ""; const n = Math.max(3, game.lives);
    for (let i = 0; i < n; i++) h += heartSvg(i < game.lives);
    L.innerHTML = h;
  }
}
const pwEls = {}, pwLast = {};
POWERS.forEach(k => { pwEls[k] = $("pw-" + k); pwLast[k] = -1; });
function updatePowers() {
  POWERS.forEach(k => {
    const v = game.pow[k], pct = v > 0 ? Math.max(1, Math.round(v / DUR[k] * 100)) : 0;
    if (pct === pwLast[k]) return;
    pwLast[k] = pct;
    pwEls[k].style.display = v > 0 ? "block" : "none";
    pwEls[k].querySelector("b").style.width = pct + "%";
  });
}

/* =====================================================================
   Flujo: menú / jugar / pausa / fin
   ===================================================================== */
function show(id) { document.querySelectorAll(".screen").forEach(s => s.classList.toggle("show", s.id === id)); }

function goMenu() {
  game.state = "menu"; musicStop();
  items = []; particles = []; floaters = []; spawnTimer = 0;
  game.pow = { magnet: 0, shield: 0, slow: 0, big: 0 }; game.combo = 0; game.level = 1; game.mode = "classic";
  player.tscale = 1.1; player.target = null; player.sad = 0;
  bg.cur = Math.floor(Math.random() * THEMES.length); bg.prev = bg.cur; bg.t = 1;
  $("countdown").style.display = "none"; updatePowers();
  stage.dataset.view = "menu"; refreshMenu(); show("scr-menu");
}
function refreshMenu() {
  $("m-best").textContent = sv.best.classic; $("m-best-t").textContent = sv.best.time; $("m-coins").textContent = sv.coins;
  document.querySelectorAll(".tg-sound").forEach(b => { b.textContent = sv.sound ? "🔊" : "🔇"; b.classList.toggle("off", !sv.sound); });
  document.querySelectorAll(".tg-music").forEach(b => b.classList.toggle("off", !sv.music));
}

function startGame(mode) {
  ensureAudio();
  Object.assign(game, { mode, state: "countdown", resume: "playing", score: 0, lives: 3, level: 1, combo: 0, bestCombo: 0, timeLeft: 60,
    coinsRun: 0, candiesRun: 0, hitBomb: false, cd: 0, cdIdx: -1, lastSec: -1, comboPulse: 0, newBest: false, bonus: 0 });
  game.pow = { magnet: 0, shield: 0, slow: 0, big: 0 };
  items = []; particles = []; floaters = []; spawnTimer = 0; shake = 0; hurt = 0;
  player.cx = W / 2; player.target = null; player.tscale = 1.1; player.scale = 1.1; player.sad = 0;
  bg.cur = 0; bg.prev = 0; bg.t = 1; lastScoreShown = -1;
  stage.dataset.view = "game"; show(null);
  updateHUD(); updatePowers(); musicStart(); last = performance.now();
}

function pauseGame() {
  if (game.state !== "playing" && game.state !== "countdown") return;
  game.resume = game.state; game.state = "paused"; show("scr-pause"); refreshMenu();
}
function resumeGame() {
  if (game.state !== "paused") return;
  game.state = game.resume; show(null); last = performance.now();
}
function togglePause() { if (game.state === "paused") resumeGame(); else pauseGame(); }

function endGame() {
  if (game.state === "over") return;
  game.state = "over"; musicStop(); sfx.over();
  game.pow = { magnet: 0, shield: 0, slow: 0, big: 0 }; updatePowers();
  game.bonus = Math.floor(game.score / 40); sv.coins += game.bonus;
  game.newBest = game.score > sv.best[game.mode] && game.score > 0;
  if (game.newBest) sv.best[game.mode] = game.score;
  sv.scores.push({ s: game.score, m: game.mode, d: Date.now() });
  sv.scores.sort((a, b) => b.s - a.s); sv.scores = sv.scores.slice(0, 40);
  sv.stats.games++; persist(); updateHUD();
  setTimeout(() => { if (game.state === "over") { fillOver(); show("scr-over"); } }, 800);
}
function fillOver() {
  $("o-title").textContent = game.mode === "time" ? "¡Se acabó el tiempo! ⏱" : "¡Juego terminado!";
  $("o-score").textContent = game.score;
  $("o-new").style.display = game.newBest ? "block" : "none";
  $("o-level").textContent = game.level; $("o-combo").textContent = game.bestCombo;
  $("o-candies").textContent = game.candiesRun; $("o-coins").textContent = game.coinsRun;
  $("o-bonus").textContent = game.bonus > 0 ? "Bonus por puntos: +" + game.bonus + " 🪙" : "";
}
async function shareScore() {
  const text = "🎀 ¡Hice " + game.score + " puntos en Gatita Caza-Dulces (nivel " + game.level + ")! ¿Puedes superarme?";
  const url = location.protocol.indexOf("http") === 0 ? location.href : undefined;
  try { if (navigator.share) { await navigator.share({ title: "Gatita Caza-Dulces", text, url }); return; } } catch (e) { return; }
  try { await navigator.clipboard.writeText(text + (url ? " " + url : "")); toast("Texto copiado 📋"); } catch (e) { toast(text); }
}

/* =====================================================================
   Tienda, logros, récords y ayuda
   ===================================================================== */
let shopTab = "skin", boardTab = "classic";
function previewCat(cv, skin, accId) {
  const c = cv.getContext("2d"); c.setTransform(2, 0, 0, 2, 0, 0); c.clearRect(0, 0, 90, 90);
  const g = c.createRadialGradient(45, 50, 4, 45, 50, 45); g.addColorStop(0, "#fff"); g.addColorStop(1, "#ffe0f0");
  c.fillStyle = g; c.beginPath(); c.arc(45, 45, 44, 0, TAU); c.fill();
  drawCat(c, 45, 80, 1, skin, accId, {});
}
function renderShop() {
  $("s-coins").textContent = sv.coins;
  document.querySelectorAll("#scr-shop .tab").forEach(t => t.classList.toggle("on", t.dataset.tab === shopTab));
  const grid = $("shop-grid"); grid.innerHTML = "";
  (shopTab === "skin" ? SKINS : ACCS).forEach(item => {
    const owned = sv.owned.indexOf(item.id) >= 0, eq = sv.equipped[shopTab] === item.id;
    const card = document.createElement("div"); card.className = "card" + (eq ? " eq" : "");
    const cv = document.createElement("canvas"); cv.width = 180; cv.height = 180;
    previewCat(cv, shopTab === "skin" ? item : (SKINS.find(s => s.id === sv.equipped.skin) || SKINS[0]), shopTab === "acc" ? item.id : sv.equipped.acc);
    const nm = document.createElement("div"); nm.className = "nm"; nm.textContent = item.name;
    const bt = document.createElement("button");
    bt.className = "btn sm" + (eq ? " ghost" : "") + (!owned && sv.coins < item.price ? " poor" : "");
    bt.textContent = eq ? "Equipado ✓" : owned ? "Equipar" : "🪙 " + item.price;
    bt.addEventListener("click", () => {
      if (owned) sv.equipped[shopTab] = item.id;
      else if (sv.coins >= item.price) { sv.coins -= item.price; sv.owned.push(item.id); sv.equipped[shopTab] = item.id; sfx.buy(); unlock("shopper"); }
      else { sfx.nope(); toast("Te faltan " + (item.price - sv.coins) + " monedas 🪙"); return; }
      persist(); renderShop();
    });
    card.append(cv, nm, bt); grid.append(card);
  });
}
function renderAch() {
  const list = $("ach-list"); list.innerHTML = ""; let n = 0;
  ACH.forEach(a => {
    const got = !!sv.ach[a.id]; if (got) n++;
    const li = document.createElement("div"); li.className = "li" + (got ? "" : " lock");
    li.innerHTML = '<span class="ic">' + a.icon + '</span><div><b>' + a.name + '</b><small>' + a.desc + (a.reward ? " · +" + a.reward + " 🪙" : "") + "</small></div>";
    list.append(li);
  });
  $("a-count").textContent = n + "/" + ACH.length;
}
function renderBoard() {
  document.querySelectorAll("#scr-board .tab").forEach(t => t.classList.toggle("on", t.dataset.btab === boardTab));
  const list = $("board-list"); list.innerHTML = "";
  const rows = sv.scores.filter(s => s.m === boardTab).slice(0, 5);
  if (!rows.length) { list.innerHTML = '<div class="muted" style="padding:1.2em">Aún no hay partidas.<br>¡Juega para aparecer aquí! 🎀</div>'; return; }
  rows.forEach((r, i) => {
    const d = new Date(r.d), li = document.createElement("div"); li.className = "li";
    li.innerHTML = '<span class="rank">' + (["🥇", "🥈", "🥉"][i] || (i + 1)) + '</span><div><b>' + r.s + ' pts</b><small>' + d.toLocaleDateString("es") + '</small></div>';
    list.append(li);
  });
}
let helpDone = false;
function renderHelp() {
  if (helpDone) return; helpDone = true;
  const rows = [["strawberry", "Fresa", "+10 puntos"], ["lollipop", "Paleta", "+15 puntos"], ["bow", "Lazo", "+20 puntos"], ["cupcake", "Cupcake", "+25 puntos"],
    ["star", "Estrella", "+50 puntos (+3 s en contrarreloj)"], ["coin", "Moneda", "Úsalas en la tienda"], ["heart", "Corazón", "+1 vida (+5 s en contrarreloj)"],
    ["magnet", "Imán", "Atrae los dulces hacia ti"], ["shield", "Escudo", "Bloquea una bomba"], ["slow", "Cámara lenta", "Todo cae más despacio"],
    ["big", "Gatita gigante", "Canasta más grande"], ["bomb", "Bomba", "¡Esquívala! Resta vida (o 5 s)"]];
  const list = $("help-list");
  rows.forEach(r => {
    const li = document.createElement("div"); li.className = "li";
    const cv = document.createElement("canvas"); cv.width = 88; cv.height = 88;
    const c = cv.getContext("2d"); c.setTransform(2, 0, 0, 2, 22, 22);
    withCtx(c, () => drawItemShape(r[0], (SIZE[r[0]] || 44) / 2 * .85, 0));
    const t = document.createElement("div"); t.innerHTML = "<b>" + r[1] + "</b><small>" + r[2] + "</small>";
    li.append(cv, t); list.append(li);
  });
}

/* =====================================================================
   Entrada
   ===================================================================== */
window.addEventListener("pointerdown", ensureAudio, { once: true });
window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
  if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
  if (e.key === " " || e.key === "Enter") {
    if (game.state === "menu") { e.preventDefault(); startGame("classic"); }
    else if (game.state === "over") { e.preventDefault(); startGame(game.mode); }
  }
  if (e.key === "p" || e.key === "Escape") togglePause();
});
window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
});
function holdBtn(id, key) {
  const b = $(id);
  b.addEventListener("pointerdown", e => { e.preventDefault(); keys[key] = true; player.target = null; b.classList.add("down"); try { b.setPointerCapture(e.pointerId); } catch (x) {} });
  const off = () => { keys[key] = false; b.classList.remove("down"); };
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => b.addEventListener(ev, off));
}
holdBtn("left-btn", "left"); holdBtn("right-btn", "right");

function canvasX(e) { const r = canvas.getBoundingClientRect(); return (e.clientX - r.left) * (W / (r.width || W)); }
let dragging = false;
canvas.addEventListener("pointerdown", e => {
  if (game.state !== "playing" && game.state !== "countdown") return;
  dragging = true; player.target = canvasX(e); try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
});
canvas.addEventListener("pointermove", e => { if (dragging && (game.state === "playing" || game.state === "countdown")) player.target = canvasX(e); });
["pointerup", "pointercancel"].forEach(ev => canvas.addEventListener(ev, () => { dragging = false; }));
document.addEventListener("visibilitychange", () => { if (document.hidden) pauseGame(); });

$("b-pause").addEventListener("click", togglePause);
$("b-classic").addEventListener("click", () => startGame("classic"));
$("b-time").addEventListener("click", () => startGame("time"));
$("b-shop").addEventListener("click", () => { renderShop(); show("scr-shop"); });
$("b-ach").addEventListener("click", () => { renderAch(); show("scr-ach"); });
$("b-board").addEventListener("click", () => { renderBoard(); show("scr-board"); });
$("b-help").addEventListener("click", () => { renderHelp(); show("scr-help"); });
document.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", goMenu));
document.querySelectorAll("#scr-shop .tab").forEach(t => t.addEventListener("click", () => { shopTab = t.dataset.tab; renderShop(); }));
document.querySelectorAll("#scr-board .tab").forEach(t => t.addEventListener("click", () => { boardTab = t.dataset.btab; renderBoard(); }));
$("p-resume").addEventListener("click", resumeGame);
$("p-restart").addEventListener("click", () => startGame(game.mode));
$("p-menu").addEventListener("click", goMenu);
$("o-again").addEventListener("click", () => startGame(game.mode));
$("o-menu").addEventListener("click", goMenu);
$("o-share").addEventListener("click", shareScore);
document.querySelectorAll(".tg-sound").forEach(b => b.addEventListener("click", () => { sv.sound = !sv.sound; persist(); refreshMenu(); if (sv.sound) { ensureAudio(); sfx.tick(); } }));
document.querySelectorAll(".tg-music").forEach(b => b.addEventListener("click", () => { sv.music = !sv.music; persist(); refreshMenu(); }));

/* =====================================================================
   Bucle principal (independiente de los FPS del dispositivo)
   ===================================================================== */
function loop(now) {
  const dt = Math.min((now - last) / 16.667, 3); last = now;
  if (game.state === "rc" && window.GCD.rcFrame) window.GCD.rcFrame(dt);
  else { update(dt); draw(); }
  requestAnimationFrame(loop);
}
// API para el segundo juego (Run Cat, en runcat.js)
window.GCD = { sv, persist, SKINS, tone, ensureAudio, unlock, show, goMenu, refreshMenu, game, stage, keys, musicStop, heartSvg, scale: () => S, rcFrame: null };
goMenu();
requestAnimationFrame(loop);

if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
})();
