/* Run Cat · motor (física, enemigos, jefe, monedas, progreso). No toca el DOM: eso lo hace rc-ui.js */
(function () {
"use strict";
var T = 30, ROWS = 18, VW = 360;
var SOLID = { 1: 1, 2: 1, 3: 1, 8: 1, 9: 1, 10: 1, 11: 1 };
var SIZE = { slime: [24, 20], spiky: [24, 20], hopper: [22, 24], bat: [26, 18], boss: [66, 60] };
var R = { st: "idle", paused: false, idx: 0, L: null, p: null, time: 0, cam: 0, shake: 0, flash: 0, introT: 0, endT: 0 };
var inp = { jump: false, press: 0 };
var hitTile = { tx: 0, ty: 0 };
var cb = { win: null, over: null };

function G() { return window.GCD || {}; }
function tn(f, d, type, v, sl, dl, kind) { var g = G(); if (g.tone) g.tone(f, d, type, v, sl, dl, kind); }
var SFX = {
  jump: function () { tn(520, .14, "square", .045, 260); },
  coin: function () { tn(1318, .07, "square", .045); tn(1760, .14, "square", .045, 0, .06); },
  stomp: function () { tn(320, .12, "square", .08, -140); },
  hurt: function () { tn(220, .3, "sawtooth", .13, -130); },
  spring: function () { tn(380, .25, "sine", .14, 700); },
  block: function () { tn(240, .08, "square", .08); },
  heart: function () { tn(523, .12, "sine", .14); tn(784, .2, "sine", .14, 0, .1); },
  check: function () { [659, 784, 988].forEach(function (f, i) { tn(f, .12, "triangle", .1, 0, i * .07); }); },
  win: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tn(f, .16, "triangle", .12, 0, i * .09); }); },
  die: function () { [440, 349, 262].forEach(function (f, i) { tn(f, .22, "triangle", .13, 0, i * .16); }); },
  boom: function () { tn(140, .4, "sawtooth", .16, -80); },
  shoot: function () { tn(200, .15, "square", .06, -80); }
};

/* ---------- Mapa ---------- */
function tile(tx, ty) {
  if (tx < 0 || tx >= R.L.width) return 1;
  if (ty < 0 || ty >= ROWS) return 0;
  return R.tiles[ty * R.L.stride + tx];
}
function groundY(tx) {
  for (var ty = 0; ty < ROWS; ty++) { var t = tile(tx, ty); if (SOLID[t] || t === 7) return ty * T; }
  return ROWS * T;
}
function moveX(o, dx) {
  o.x += dx;
  var y0 = Math.floor(o.y / T), y1 = Math.floor((o.y + o.h - .01) / T), ty, tx;
  if (dx > 0) { tx = Math.floor((o.x + o.w) / T); for (ty = y0; ty <= y1; ty++) if (SOLID[tile(tx, ty)]) { o.x = tx * T - o.w; return true; } }
  else if (dx < 0) { tx = Math.floor(o.x / T); for (ty = y0; ty <= y1; ty++) if (SOLID[tile(tx, ty)]) { o.x = (tx + 1) * T; return true; } }
  return false;
}
function moveY(o, dy) { // 1 = suelo, 2 = techo, 0 = aire
  var prev = o.y + o.h, tx, ty, t;
  o.y += dy;
  var x0 = Math.floor(o.x / T), x1 = Math.floor((o.x + o.w - .01) / T);
  if (dy > 0) {
    ty = Math.floor((o.y + o.h) / T);
    for (tx = x0; tx <= x1; tx++) { t = tile(tx, ty); if (SOLID[t] || (t === 7 && prev <= ty * T + .01)) { o.y = ty * T - o.h; return 1; } }
  } else if (dy < 0) {
    ty = Math.floor(o.y / T);
    var cx = Math.floor((o.x + o.w / 2) / T), pick = -1;
    for (tx = x0; tx <= x1; tx++) if (SOLID[tile(tx, ty)]) { if (pick < 0 || tx === cx) pick = tx; }
    if (pick >= 0) { o.y = (ty + 1) * T; hitTile.tx = pick; hitTile.ty = ty; return 2; }
  }
  return 0;
}
function overlap(a, b, m) { m = m || 0; return a.x + m < b.x + b.w && a.x + a.w - m > b.x && a.y + m < b.y + b.h && a.y + a.h - m > b.y; }

/* ---------- Efectos ---------- */
function burst(x, y, cols, n) {
  for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = 1 + Math.random() * 3.2; R.parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.6, life: 1, c: cols[i % cols.length], s: 2 + Math.random() * 3 }); }
}
function pop(x, y, text, col) { R.pops.push({ x: x, y: y, text: text, col: col || "#d63384", life: 1 }); }
function vib(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

/* ---------- Carga de nivel ---------- */
function spawnEnt(e) {
  if (e.k === "cannon") return { k: "cannon", x: e.x * T, y: e.y * T, w: T, h: T, dir: e.dir || -1, cd: 80 + Math.random() * 60, dead: false };
  var s = SIZE[e.k];
  var o = { k: e.k, w: s[0], h: s[1], x: e.x * T + (T - s[0]) / 2, y: (e.y + 1) * T - s[1], vx: 0, vy: 0, dir: e.dir || -1, dead: false, squash: 0, on: false };
  if (e.k === "slime") { o.sp = .7; o.edge = true; }
  else if (e.k === "spiky") { o.sp = .55; o.edge = true; }
  else if (e.k === "hopper") { o.sp = 1.5; o.jt = 40 + Math.random() * 60; }
  else if (e.k === "bat") { o.y = e.y * T; o.x0 = o.x; o.y0 = o.y; o.ph = Math.random() * 6; o.range = 60; }
  else if (e.k === "boss") { o.hp = 3; o.inv = 0; o.active = false; o.jt = 90; o.dying = false; o.dyT = 0; }
  return o;
}
function load(idx) {
  var L = window.RC_LEVELS[idx];
  R.idx = idx; R.L = L; R.tiles = new Uint8Array(L.tiles);
  R.coins = L.coins.map(function (c, i) { return { x: c[0] * T + T / 2, y: c[1] * T + T / 2, got: false, ph: i * .7 }; });
  R.plats = L.plats.map(function (p) { return { x0: p.x * T, y0: p.y * T, x: p.x * T, y: p.y * T, w: p.w * T, axis: p.axis, range: p.range * T, sp: p.sp, ph: p.ph, dx: 0, dy: 0 }; });
  R.ents = L.ents.map(spawnEnt);
  R.bul = []; R.parts = []; R.pops = []; R.bump = {};
  R.cps = L.cps.map(function (c) { return { x: c * T + T / 2, gy: groundY(c), on: false }; });
  R.flagX = L.flag * T + T / 2; R.flagGy = groundY(L.flag);
  var gy = groundY(2);
  R.spawn = { x: 2 * T + 5, y: gy - 26 };
  R.p = { x: R.spawn.x, y: R.spawn.y, w: 20, h: 26, vx: 0, vy: 0, on: false, face: 1, coy: 0, jb: 0, jumping: false, inv: 0, phase: 0, hurtT: 0, ride: null };
  R.hearts = 3; R.coinsRun = 0; R.stompsRun = 0; R.lost = false; R.tleft = L.time; R.time = 0; R.cam = 0; R.shake = 0; R.flash = 0;
  R.paused = false; R.st = "intro"; R.introT = 100; R.endT = 0; R.bossDone = false;
  inp.jump = false; inp.press = 0;
}

/* ---------- Jugador ---------- */
function hurt(srcX) {
  var p = R.p;
  if (p.inv > 0 || R.st !== "play") return;
  R.hearts--; R.lost = true; p.inv = 110; p.hurtT = 30; p.vy = -6.5; p.on = false;
  p.vx = (p.x + p.w / 2 < srcX ? -1 : 1) * 3.2;
  SFX.hurt(); vib(100); R.shake = 10; R.flash = .6;
  burst(p.x + p.w / 2, p.y + 10, ["#ff4f6d", "#fff"], 8);
  if (R.hearts <= 0) finish("hearts");
}
function die() {
  if (R.st !== "play") return;
  R.hearts--; R.lost = true; SFX.die(); vib(150);
  if (R.hearts <= 0) { finish("hearts"); return; }
  var p = R.p; p.x = R.spawn.x; p.y = R.spawn.y; p.vx = p.vy = 0; p.inv = 130; p.jumping = false; p.ride = null;
  R.cam = Math.max(0, Math.min(R.L.width * T - VW, p.x - 130)); R.flash = 1;
  pop(p.x + 10, p.y - 10, "¡Ánimo! 💪", "#7b2cbf");
}
function hitBlock(tx, ty) {
  var i = ty * R.L.stride + tx, t = R.tiles[i], cx = tx * T + T / 2, cy = ty * T;
  R.bump[i] = 12;
  if (t === 3) { R.tiles[i] = 8; R.coinsRun++; SFX.coin(); pop(cx, cy - 4, "+1 🪙", "#d58a00"); burst(cx, cy, ["#ffd23f", "#fff"], 6); }
  else if (t === 9) {
    R.tiles[i] = 8; SFX.heart();
    if (R.hearts < 5) { R.hearts++; pop(cx, cy - 4, "+1 vida ❤", "#e91e63"); } else { R.coinsRun += 3; pop(cx, cy - 4, "+3 🪙", "#d58a00"); }
    burst(cx, cy, ["#ff4081", "#ffb0d0"], 10);
  } else SFX.block();
  R.ents.forEach(function (e) { // enemigos encima del bloque
    if (!e.dead && e.k !== "cannon" && e.k !== "bat" && e.k !== "boss" && Math.abs(e.y + e.h - ty * T) < 3 && e.x + e.w > tx * T && e.x < (tx + 1) * T) { e.dead = true; e.squash = 18; burst(e.x + e.w / 2, e.y, ["#fff", "#ffd23f"], 6); }
  });
}
function stepPlats(s) {
  var p = R.p;
  R.plats.forEach(function (pl) {
    var u = .5 - .5 * Math.cos(R.time * pl.sp + pl.ph), nx = pl.x0, ny = pl.y0;
    if (pl.axis === "x") nx += pl.range * u; else ny += pl.range * u;
    pl.dx = nx - pl.x; pl.dy = ny - pl.y; pl.x = nx; pl.y = ny;
    if (p.ride === pl) { moveX(p, pl.dx); p.y += pl.dy; }
  });
}
function stepPlayer(s, forced) {
  var p = R.p, K = G().keys || {}, dir = forced || ((K.right ? 1 : 0) - (K.left ? 1 : 0));
  if (dir) { p.vx += dir * (p.on ? .7 : .45) * s; p.face = dir; if (Math.abs(p.vx) > 3.5) p.vx = dir * 3.5; }
  else { p.vx *= Math.pow(p.on ? .78 : .94, s); if (Math.abs(p.vx) < .05) p.vx = 0; }
  if (p.on) p.coy = 6; else p.coy -= s;
  if (inp.press) { p.jb = 7; inp.press = 0; } else p.jb -= s;
  if (!forced && p.jb > 0 && p.coy > 0) { p.vy = -10.4; p.jb = 0; p.coy = 0; p.on = false; p.jumping = true; SFX.jump(); }
  if (!inp.jump && p.jumping && p.vy < -5.5) { p.vy = -5.5; p.jumping = false; }
  p.vy = Math.min(11, p.vy + .5 * s);
  p.ride = null;
  if (moveX(p, p.vx * s)) p.vx = 0;
  var prev = p.y + p.h, r = moveY(p, p.vy * s);
  p.on = false;
  if (r === 1) { p.on = true; p.vy = 0; p.jumping = false; }
  else if (r === 2) { p.vy = 0; if (R.st === "play") hitBlock(hitTile.tx, hitTile.ty); }
  else if (p.vy >= 0) {
    for (var i = 0; i < R.plats.length; i++) {
      var pl = R.plats[i];
      if (p.x + p.w > pl.x + 2 && p.x < pl.x + pl.w - 2 && prev <= pl.y + 6 && p.y + p.h >= pl.y) { p.y = pl.y - p.h; p.vy = 0; p.on = true; p.ride = pl; p.jumping = false; break; }
    }
  }
  if (p.on) p.phase += Math.abs(p.vx) * .17 * s;
  if (p.inv > 0) p.inv -= s;
  if (p.hurtT > 0) p.hurtT -= s;
  // resorte
  var fx = Math.floor((p.x + p.w / 2) / T), feet = p.y + p.h, fy = Math.floor((feet - 1) / T);
  if (tile(fx, fy) === 6 && p.vy >= 0 && feet >= fy * T + 14) { p.vy = -15; p.on = false; p.jumping = false; SFX.spring(); burst(fx * T + 15, fy * T + 20, ["#fff", "#ff4f6d"], 8); }
}
function interact(s) {
  var p = R.p, i, c;
  // monedas
  var pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
  for (i = 0; i < R.coins.length; i++) {
    c = R.coins[i];
    if (!c.got && Math.abs(c.x - pcx) < 16 && Math.abs(c.y - pcy) < 19) { c.got = true; R.coinsRun++; SFX.coin(); pop(c.x, c.y - 6, "+1", "#d58a00"); burst(c.x, c.y, ["#ffd23f", "#fff"], 4); }
  }
  // pinchos y lava
  var x0 = Math.floor(p.x / T), x1 = Math.floor((p.x + p.w) / T), y0 = Math.floor(p.y / T), y1 = Math.floor((p.y + p.h) / T), tx, ty, t;
  for (ty = y0; ty <= y1; ty++) for (tx = x0; tx <= x1; tx++) {
    t = tile(tx, ty);
    if (t === 4 && overlap({ x: p.x + 3, y: p.y + 3, w: p.w - 6, h: p.h - 4 }, { x: tx * T + 4, y: ty * T + 12, w: T - 8, h: T - 12 })) hurt(tx * T + 15);
    else if (t === 5 && overlap(p, { x: tx * T + 2, y: ty * T + 8, w: T - 4, h: T - 8 }, 3)) { die(); return; }
  }
  if (p.y > ROWS * T + 30) { die(); return; }
  // checkpoints
  R.cps.forEach(function (cp) { if (!cp.on && p.x + p.w / 2 >= cp.x) { cp.on = true; R.spawn = { x: cp.x - 10, y: cp.gy - 26 }; SFX.check(); pop(cp.x, cp.gy - 70, "¡Checkpoint! 🚩", "#d63384"); burst(cp.x + 10, cp.gy - 45, ["#ff4f9d", "#fff"], 10); } });
  // meta
  if (p.x + p.w > R.flagX - 4) win();
}

/* ---------- Enemigos ---------- */
function stomp(e) {
  var p = R.p;
  e.dead = true; e.squash = 18; p.vy = inp.jump ? -10.8 : -7.5; p.on = false; p.jumping = inp.jump;
  SFX.stomp(); R.coinsRun++; R.stompsRun++;
  pop(e.x + e.w / 2, e.y - 4, "+1 🪙", "#d58a00"); burst(e.x + e.w / 2, e.y + e.h / 2, ["#fff", "#ffd23f", "#ff9ec4"], 8);
  var g = G(); if (g.sv) { g.sv.stats.stomps = (g.sv.stats.stomps || 0) + 1; if (g.sv.stats.stomps >= 30 && g.unlock) g.unlock("rc_stomp"); }
}
function touch(e, stompable, s) {
  var p = R.p;
  if (e.dead || !overlap(p, e, 3)) return;
  if (stompable && p.vy > .3 && (p.y + p.h) - e.y < 17 + p.vy * s) stomp(e); else hurt(e.x + e.w / 2);
}
function walker(e, s) {
  e.vy = Math.min(11, e.vy + .5 * s);
  var sp = e.k === "hopper" ? (e.on ? 0 : e.sp) : e.sp;
  if (moveX(e, e.dir * sp * s)) e.dir *= -1;
  e.on = moveY(e, e.vy * s) === 1;
  if (e.on) e.vy = 0;
  if (e.on && e.edge) {
    var fx = Math.floor((e.dir > 0 ? e.x + e.w + 2 : e.x - 2) / T), ty = Math.floor((e.y + e.h + 2) / T), t = tile(fx, ty);
    if (!(SOLID[t] || t === 7)) e.dir *= -1;
  }
  if (e.k === "hopper" && e.on) {
    e.jt -= s;
    if (e.jt <= 0) { e.vy = -9; e.on = false; e.jt = 70 + Math.random() * 50; e.dir = R.p.x < e.x ? -1 : 1; }
  }
}
function openGates() {
  for (var ty = 0; ty < ROWS; ty++) for (var tx = 0; tx < R.L.width; tx++) {
    var i = ty * R.L.stride + tx;
    if (R.tiles[i] === 11) { R.tiles[i] = 0; burst(tx * T + 15, ty * T + 15, ["#6b3a1e", "#f5dcc0"], 4); }
  }
}
function stepBoss(e, s) {
  var B = R.L.boss, p = R.p;
  if (e.dying) { e.dyT -= s; if (Math.random() < .3) burst(e.x + Math.random() * e.w, e.y + Math.random() * e.h, ["#ffd23f", "#6b3a1e", "#fff"], 2); if (e.dyT <= 0) e.dead = true; return; }
  if (!e.active) { if (p.x > B.ax0 + 60) e.active = true; else return; }
  if (e.inv > 0) e.inv -= s;
  var sp = 1 + (3 - e.hp) * .45;
  e.vy = Math.min(11, e.vy + .5 * s);
  moveX(e, e.dir * sp * s);
  if (e.x <= B.ax0 + 8) e.dir = 1; else if (e.x + e.w >= B.ax1 - 8) e.dir = -1;
  e.on = moveY(e, e.vy * s) === 1;
  if (e.on) { if (e.vy > 6) R.shake = 6; e.vy = 0; }
  e.jt -= s;
  if (e.jt <= 0 && e.on) { e.vy = -10.5; e.jt = 100 - (3 - e.hp) * 22; SFX.shoot(); }
  if (e.inv <= 0 && overlap(p, e, 4)) {
    if (p.vy > .3 && (p.y + p.h) - e.y < 24 + p.vy * s) {
      e.hp--; e.inv = 70; p.vy = -11.5; p.on = false; p.jumping = false; SFX.boom(); R.shake = 12; vib(80);
      burst(e.x + e.w / 2, e.y, ["#ffd23f", "#6b3a1e", "#fff"], 14);
      pop(e.x + e.w / 2, e.y - 14, e.hp > 0 ? "¡Golpe!" : "¡Derrotado!", "#7b2cbf");
      if (e.hp <= 0) {
        e.dying = true; e.dyT = 60; openGates(); R.bossDone = true; R.coinsRun += 15; pop(p.x, p.y - 30, "+15 🪙", "#d58a00");
        var g = G(); if (g.unlock) g.unlock("rc_boss");
      }
    } else hurt(e.x + e.w / 2);
  }
}
function stepEnts(s) {
  var p = R.p, i, e;
  for (i = R.ents.length - 1; i >= 0; i--) {
    e = R.ents[i];
    if (e.dead) { e.squash -= s; if (e.squash <= 0) R.ents.splice(i, 1); continue; }
    if (e.k !== "boss" && Math.abs(e.x - p.x) > 520) continue;
    if (e.k === "slime" || e.k === "spiky" || e.k === "hopper") { walker(e, s); if (e.y > ROWS * T + 60) e.dead = true, e.squash = 0; touch(e, e.k !== "spiky", s); }
    else if (e.k === "bat") { e.x = e.x0 + Math.sin(R.time * .025 + e.ph) * 70; e.y = e.y0 + Math.sin(R.time * .06 + e.ph) * 24; e.dir = Math.cos(R.time * .025 + e.ph) > 0 ? 1 : -1; touch(e, true, s); }
    else if (e.k === "cannon") {
      e.cd -= s;
      var dx = p.x - e.x;
      if (e.cd <= 0 && Math.abs(dx) < 300 && Math.abs(dx) > 50) { e.cd = 170; e.dir = dx < 0 ? -1 : 1; SFX.shoot(); R.bul.push({ k: "bullet", x: e.x + (e.dir < 0 ? -14 : T - 4), y: e.y + 9, w: 18, h: 12, dir: e.dir, dead: false, squash: 0 }); burst(e.x + (e.dir < 0 ? 0 : T), e.y + 15, ["#bbb", "#fff"], 4); }
    }
    else if (e.k === "boss") stepBoss(e, s);
  }
  for (i = R.bul.length - 1; i >= 0; i--) {
    var b = R.bul[i];
    if (b.dead) { b.squash -= s; if (b.squash <= 0) R.bul.splice(i, 1); continue; }
    b.x += b.dir * 2.3 * s;
    if (SOLID[tile(Math.floor((b.x + b.w / 2) / T), Math.floor((b.y + b.h / 2) / T))] || Math.abs(b.x - p.x) > 520) { R.bul.splice(i, 1); continue; }
    touch(b, true, s);
  }
}

/* ---------- Fin de nivel ---------- */
function finish(reason) {
  if (R.st !== "play") return;
  R.st = "over"; R.endT = 70; R.reason = reason; R.flash = .5;
  var g = G(), bank = Math.floor(R.coinsRun / 2);
  if (g.sv) { g.sv.coins += bank; g.sv.stats.coins += R.coinsRun; g.persist(); if (g.sv.stats.coins >= 100) g.unlock("coins100"); }
  R.result = { reason: reason, coins: R.coinsRun, bank: bank, idx: R.idx };
  SFX.die();
}
function win() {
  if (R.st !== "play") return;
  R.st = "win"; R.endT = 80; SFX.win(); vib(60);
  var g = G(), L = R.L, got = R.coins.filter(function (c) { return c.got; }).length, pct = got / Math.max(1, R.coins.length);
  var stars = 1 + (pct >= .7 ? 1 : 0) + (!R.lost ? 1 : 0);
  var bonus = 15 + Math.floor(R.tleft / 10), bank = R.coinsRun + bonus;
  if (g.sv) {
    var rc = g.sv.rc;
    rc.stars[R.idx] = Math.max(rc.stars[R.idx] || 0, stars);
    rc.done[R.idx] = true;
    rc.unlocked = Math.max(rc.unlocked, Math.min(5, R.idx + 2));
    g.sv.coins += bank; g.sv.stats.coins += R.coinsRun; g.persist();
    if (g.unlock) { g.unlock("rc_first"); if ([0, 1, 2, 3, 4].every(function (k) { return rc.done[k]; })) g.unlock("rc_all"); if (g.sv.stats.coins >= 100) g.unlock("coins100"); }
  }
  R.result = { idx: R.idx, coins: R.coinsRun, got: got, total: R.coins.length, bonus: bonus, bank: bank, stars: stars, used: Math.round(L.time - R.tleft), lost: R.lost, hasNext: R.idx < 4 };
  burst(R.flagX, R.flagGy - 140, ["#ff4f9d", "#ffd23f", "#8e44ff", "#4dabf7", "#51cf66"], 30);
}

/* ---------- Bucle ---------- */
function step(s) {
  R.time += s;
  R.parts.forEach(function (q) { q.x += q.vx * s; q.y += q.vy * s; q.vy += .15 * s; q.life -= .03 * s; });
  R.parts = R.parts.filter(function (q) { return q.life > 0; });
  R.pops.forEach(function (q) { q.y -= .7 * s; q.life -= .016 * s; });
  R.pops = R.pops.filter(function (q) { return q.life > 0; });
  for (var k in R.bump) { R.bump[k] -= s; if (R.bump[k] <= 0) delete R.bump[k]; }
  if (R.shake > 0) R.shake -= s;
  if (R.flash > 0) R.flash = Math.max(0, R.flash - .04 * s);
  var p = R.p, tgt = p.x + p.w / 2 - 130 + p.face * 36;
  R.cam += (Math.max(0, Math.min(R.L.width * T - VW, tgt)) - R.cam) * .12 * s;
  if (R.st === "intro") { R.introT -= s; if (R.introT <= 0) R.st = "play"; return; }
  if (R.st === "play") {
    R.tleft -= s / 60;
    if (R.tleft <= 0) { R.tleft = 0; finish("time"); return; }
    stepPlats(s); stepPlayer(s, 0); interact(s); if (R.st === "play") stepEnts(s);
  } else if (R.st === "win") {
    stepPlats(s); stepPlayer(s, p.x + p.w < R.flagX + 90 ? 1 : 0); p.vx = Math.min(p.vx, 1.6); stepEnts(s);
    R.endT -= s; if (R.endT <= 0 && cb.win) { var f = cb.win; cb.win = null; f(R.result); }
  } else if (R.st === "over") {
    R.endT -= s; if (R.endT <= 0 && cb.over) { var f2 = cb.over; cb.over = null; f2(R.result); }
  }
}
function frame(dt) {
  if (R.st === "idle" || R.paused) return;
  var n = Math.max(1, Math.ceil(dt)), s = dt / n;
  for (var i = 0; i < n; i++) step(s);
}

/* ---------- Dibujo del mundo ---------- */
function render(c) {
  if (!R.L) return;
  var D = window.RCD, L = R.L, th = L.theme, cam = R.cam, g = G();
  var shx = R.shake > 0 ? (Math.random() - .5) * 6 : 0, shy = R.shake > 0 ? (Math.random() - .5) * 6 : 0;
  var skin = (g.SKINS || []).filter(function (k) { return g.sv && k.id === g.sv.equipped.skin; })[0] || { fur: "#fff4e0", line: "#e89b6b", inner: "#ffb6c9" };
  var t = R.time, tx0 = Math.max(0, Math.floor(cam / T)), tx1 = Math.min(L.width - 1, tx0 + 13), tx, ty, i;
  D.bg(c, th, cam, t);
  c.save(); c.translate(-Math.round(cam) + shx, shy);
  R.cps.forEach(function (cp) { D.checkpoint(c, cp.x, cp.gy, cp.on, t); });
  D.flag(c, R.flagX, R.flagGy, t, true);
  for (ty = 0; ty < ROWS; ty++) for (tx = tx0; tx <= tx1; tx++) {
    var id = R.tiles[ty * L.stride + tx];
    if (!id) continue;
    var b = R.bump[ty * L.stride + tx], off = b ? -Math.sin(Math.PI * (1 - b / 12)) * 6 : 0;
    D.tile(c, th, id, tx * T, ty * T + off, tx, ty, t, R.tiles[Math.max(0, ty - 1) * L.stride + tx] !== 1 || ty === 0);
  }
  R.plats.forEach(function (pl) { if (pl.x + pl.w > cam - 20 && pl.x < cam + VW + 20) D.plat(c, th, pl, pl.w, t); });
  R.coins.forEach(function (k) { if (!k.got && k.x > cam - 20 && k.x < cam + VW + 20) D.coin(c, k.x, k.y, t, k.ph); });
  R.ents.forEach(function (e) {
    if (e.k === "cannon" || e.x + e.w < cam - 60 || e.x > cam + VW + 60) return;
    if (e.k === "boss") D.boss(c, e, t); else D.enemy(c, e, th, t);
  });
  R.bul.forEach(function (b2) { D.enemy(c, b2, th, t); });
  D.player(c, R.p, skin, g.sv ? g.sv.equipped.acc : "acc_none", R.time);
  R.parts.forEach(function (q) { c.globalAlpha = Math.max(0, q.life); c.fillStyle = q.c; c.beginPath(); c.arc(q.x, q.y, q.s, 0, 6.283); c.fill(); });
  c.globalAlpha = 1; c.textAlign = "center"; c.font = "900 15px " + D.FONT; c.lineJoin = "round";
  R.pops.forEach(function (q) { c.globalAlpha = Math.min(1, q.life * 1.8); c.lineWidth = 4; c.strokeStyle = "#fff"; c.strokeText(q.text, q.x, q.y); c.fillStyle = q.col; c.fillText(q.text, q.x, q.y); });
  c.globalAlpha = 1;
  R.ents.forEach(function (e) { if (e.k === "boss" && e.active && !e.dying) { for (i = 0; i < 3; i++) { c.fillStyle = i < e.hp ? "#ff3d71" : "rgba(0,0,0,.25)"; c.beginPath(); c.arc(e.x + e.w / 2 + (i - 1) * 16, e.y - 84, 6, 0, 6.283); c.fill(); } } });
  c.restore();
  if (R.flash > 0) { c.fillStyle = "rgba(255,255,255," + R.flash * .5 + ")"; c.fillRect(0, 0, VW, 540); }
  if (R.st === "intro") {
    var a = Math.min(1, R.introT / 25, (100 - R.introT) / 15);
    c.globalAlpha = Math.max(0, a); c.textAlign = "center"; c.lineJoin = "round";
    c.font = "900 17px " + D.FONT; c.lineWidth = 5; c.strokeStyle = "#fff"; c.strokeText("NIVEL " + (R.idx + 1), 180, 200); c.fillStyle = "#8e44ff"; c.fillText("NIVEL " + (R.idx + 1), 180, 200);
    c.font = "900 30px " + D.FONT; c.lineWidth = 7; c.strokeText(L.name, 180, 240); c.fillStyle = "#d63384"; c.fillText(L.name, 180, 240);
    c.globalAlpha = 1;
  }
  c.textAlign = "left";
}

/* ---------- Música sencilla ---------- */
var mus = { on: false, i: 0, h: 0 };
var NOTES = [392, 440, 523.25, 587.33, 659.25, 783.99];
var MEL = [2, -1, 3, 2, 4, -1, 3, -1, 2, -1, 0, 1, 2, -1, -1, -1, 3, -1, 4, 3, 5, -1, 4, -1, 3, 2, 1, 0, 2, -1, -1, -1];
var BAS = [196, 196, 261.6, 220];
function musicTick() {
  if (!mus.on) return;
  if (!R.paused && (R.st === "play" || R.st === "intro")) {
    var n = MEL[mus.i % MEL.length]; if (n >= 0) tn(NOTES[n], .18, "square", .018, 0, 0, "music");
    if (mus.i % 8 === 0) tn(BAS[(mus.i / 8) % 4 | 0], .5, "triangle", .04, 0, 0, "music");
  }
  mus.i++; mus.h = setTimeout(musicTick, 105);
}

window.RC = {
  get: function () { return R; },
  start: function (idx, onWin, onOver) { cb.win = onWin; cb.over = onOver; load(idx); if (!mus.on) { mus.on = true; mus.i = 0; musicTick(); } },
  stop: function () { R.st = "idle"; mus.on = false; clearTimeout(mus.h); },
  pause: function () { if (R.st === "play" || R.st === "intro") { R.paused = true; inp.jump = false; return true; } return false; },
  resume: function () { R.paused = false; },
  jumpDown: function () { if (!inp.jump) inp.press = 1; inp.jump = true; },
  jumpUp: function () { inp.jump = false; },
  frame: frame, render: render
};
})();
