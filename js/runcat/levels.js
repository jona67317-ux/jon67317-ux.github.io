/* Run Cat · niveles. Generados con semilla fija: siempre salen iguales, pero cada mundo tiene su propia mezcla. */
(function () {
"use strict";
var T = 30, ROWS = 18, GR = 15;

function rng(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Tiles: 0 aire · 1 suelo · 2 ladrillo · 3 bloque ? · 4 pinchos · 5 lava · 6 resorte
          7 plataforma de un solo sentido · 8 bloque usado · 9 bloque corazón · 10 cañón · 11 compuerta */
function Builder(cols, seed) {
  var b = { stride: cols, t: new Uint8Array(cols * ROWS), ents: [], plats: [], coins: [], cps: [],
            gt: GR, x: 0, r: rng(seed), flag: 0, boss: null, end: 0 };
  b.set = function (x, y, v) { if (x >= 0 && x < cols && y >= 0 && y < ROWS) b.t[y * cols + x] = v; };
  b.put = b.set;
  b.ground = function (x0, x1, top) {
    if (top == null) top = b.gt;
    b.gt = top;
    for (var x = x0; x <= x1; x++) for (var y = top; y < ROWS; y++) b.set(x, y, 1);
  };
  b.pit = function (x0, x1, lava) {
    if (!lava) return;
    for (var x = x0; x <= x1; x++) { b.set(x, ROWS - 2, 5); b.set(x, ROWS - 1, 5); }
  };
  b.row = function (x0, x1, y, id) { for (var x = x0; x <= x1; x++) b.set(x, y, id); };
  b.coin = function (x, y) { b.coins.push([x, y]); };
  b.coinRow = function (x, y, n) { for (var i = 0; i < n; i++) b.coin(x + i, y); };
  b.coinArc = function (x, y, n, h) {
    for (var i = 0; i < n; i++) b.coin(x + i, y - Math.round(h * Math.sin(Math.PI * (n > 1 ? i / (n - 1) : .5))));
  };
  b.en = function (k, x, y, o) { var e = o || {}; e.k = k; e.x = x; e.y = y; b.ents.push(e); };
  b.mp = function (x, y, w, axis, range, sp, ph) { b.plats.push({ x: x, y: y, w: w, axis: axis, range: range, sp: sp, ph: ph || 0 }); };
  return b;
}

function pickW(b, w) {
  var s = 0, k;
  for (k in w) s += w[k];
  var r = b.r() * s;
  for (k in w) { r -= w[k]; if (r <= 0) return k; }
  return Object.keys(w)[0];
}

function foe(b, d, c, x, y) {
  var kinds = c.walk.slice();
  if (d > .3) kinds = kinds.concat(c.hop);
  var k = kinds[Math.floor(b.r() * kinds.length)];
  if (k === "spiky" && d < .2) k = "slime";
  var o = {};
  if (k === "slime" || k === "spiky") o.dir = b.r() < .5 ? -1 : 1;
  b.en(k, x, y, o);
}

var S = {
  flat: function (b, d, c) {
    var w = 6 + Math.floor(b.r() * 7), x = b.x, g = b.gt;
    b.ground(x, x + w - 1);
    if (b.r() < .7) b.coinRow(x + 1, g - 2, Math.min(6, w - 2));
    if (b.r() < .5 + d * .35) foe(b, d, c, x + 2 + Math.floor(b.r() * (w - 4)), g - 1);
    if (d > .25 && c.fly.length && b.r() < .35) b.en("bat", x + Math.floor(w / 2), g - 4);
    b.x += w;
  },
  gap: function (b, d, c) {
    var g = b.gt;
    b.ground(b.x, b.x + 2); b.x += 3;
    var gw = 3 + (b.r() < .35 + d * .35 ? 1 : 0);
    b.pit(b.x, b.x + gw - 1, c.lava);
    b.coinArc(b.x, g - 2, gw, 1);
    b.x += gw;
  },
  blocks: function (b, d, c) {
    var g = b.gt, x = b.x;
    b.ground(x, x + 10);
    b.row(x, x + 1, g - 2, 2);
    for (var i = 0; i < 5; i++) {
      var id = i === 2 ? 3 : (b.r() < .12 ? 9 : (b.r() < .5 ? 2 : 3));
      b.put(x + 3 + i, g - 4, id);
    }
    b.coinRow(x + 3, g - 5, 5);
    if (b.r() < .5) foe(b, d, c, x + 8, g - 1);
    b.x += 11;
  },
  plats: function (b, d, c) {
    var g = b.gt, x = b.x;
    b.ground(x, x + 12);
    b.row(x + 2, x + 4, g - 3, c.pt); b.coinRow(x + 2, g - 4, 3);
    b.row(x + 7, x + 9, g - 6, c.pt); b.coinRow(x + 7, g - 7, 3);
    if (c.fly.length && b.r() < .5) b.en("bat", x + 6, g - 5);
    else if (b.r() < .5) foe(b, d, c, x + 11, g - 1);
    b.x += 13;
  },
  stairs: function (b, d, c) {
    var g = b.gt, x = b.x, hs = [0, 1, 2, 3, 2, 1, 0];
    for (var i = 0; i < hs.length; i++) b.ground(x + i * 2, x + i * 2 + 1, g - hs[i]);
    b.gt = g;
    b.coinRow(x + 6, g - 5, 2);
    if (b.r() < .6) foe(b, d, c, x + 7, g - 4);
    b.x += 14;
  },
  spikes: function (b, d, c) {
    var g = b.gt, x = b.x, n = 2 + (d > .5 && b.r() < .5 ? 1 : 0);
    b.ground(x, x + 9);
    for (var i = 0; i < n; i++) b.put(x + 4 + i, g - 1, 4);
    b.coinArc(x + 3, g - 3, n + 2, 1);
    b.x += 10;
  },
  mplat: function (b, d, c) {
    var g = b.gt, rg = (c.bigGap && b.r() < .6) ? 6 : 4;
    b.ground(b.x, b.x + 2); b.x += 3;
    var px = b.x;
    b.pit(px, px + rg + 2, c.lava);
    b.mp(px, g, 3, "x", rg, .022, 0);
    b.coinRow(px + 1, g - 3, rg + 1);
    b.x += rg + 3;
  },
  spring: function (b, d, c) {
    var g = b.gt, x = b.x;
    b.ground(x, x + 11);
    b.put(x + 3, g - 1, 6);
    b.row(x + 5, x + 8, g - 6, c.pt);
    b.coinRow(x + 5, g - 7, 4);
    b.coinRow(x + 1, g - 2, 2);
    b.x += 12;
  },
  cannon: function (b, d, c) {
    var g = b.gt, x = b.x;
    b.ground(x, x + 13);
    b.put(x + 11, g - 1, 10);
    b.en("cannon", x + 11, g - 1, { dir: -1 });
    b.coinRow(x + 2, g - 2, 4);
    b.x += 14;
  },
  alley: function (b, d, c) {
    var g = b.gt, x = b.x, n = 2 + (d > .5 ? 1 : 0);
    b.ground(x, x + 15);
    for (var i = 0; i < n; i++) foe(b, Math.max(d, .35), c, x + 3 + i * 4 + Math.floor(b.r() * 2), g - 1);
    b.coinRow(x + 2, g - 2, 3); b.coinRow(x + 10, g - 2, 3);
    if (d > .3 && c.fly.length) b.en("bat", x + 8, g - 4);
    b.x += 16;
  },
  checkpoint: function (b) {
    b.ground(b.x, b.x + 7);
    b.cps.push(b.x + 3);
    b.coinRow(b.x + 1, b.gt - 2, 6);
    b.x += 8;
  }
};

var CFG = [
  { name: "Pradera Dulce", theme: 0, cols: 220, seed: 11, time: 260, pt: 2, walk: ["slime"], hop: [], fly: [], lava: false,
    desc: "Colinas de caramelo. Ideal para empezar.", w: { flat: 3, gap: 2, blocks: 3, plats: 2, stairs: 1, alley: 1.5 } },
  { name: "Cueva de Cristal", theme: 1, cols: 240, seed: 22, time: 290, pt: 2, walk: ["slime", "spiky"], hop: [], fly: ["bat"], lava: true,
    desc: "Murciélagos, cristales con pinchos y lava.", w: { flat: 2, gap: 2, blocks: 1.5, plats: 1.5, stairs: 1, spikes: 2, mplat: 2, alley: 2 } },
  { name: "Desierto de Galletas", theme: 2, cols: 260, seed: 33, time: 320, pt: 2, walk: ["slime", "spiky"], hop: ["hopper"], fly: [], lava: false,
    desc: "Cactus, conejos saltarines y resortes.", w: { flat: 2, gap: 2.5, blocks: 1.5, plats: 1, stairs: 1.5, spikes: 2.5, spring: 2, alley: 2.5 } },
  { name: "Nubes y Arcoíris", theme: 3, cols: 280, seed: 44, time: 350, pt: 7, walk: ["slime"], hop: [], fly: ["bat"], lava: false, bigGap: true,
    desc: "Saltos largos entre nubes y plataformas móviles.", w: { flat: 1.5, gap: 2, plats: 3, mplat: 3, spring: 2, blocks: 1, alley: 1.5 } },
  { name: "Castillo de Chocolate", theme: 4, cols: 300, seed: 55, time: 400, pt: 2, walk: ["slime", "spiky"], hop: ["hopper"], fly: ["bat"], lava: true, boss: true,
    desc: "Cañones, lava y el Rey Bombón al final.", w: { flat: 1.5, gap: 2, blocks: 1, plats: 1, stairs: 1, spikes: 2, mplat: 2, spring: 1, cannon: 2.5, alley: 2.5 } }
];

function build(c) {
  var b = Builder(c.cols + 80, c.seed);
  b.ground(0, 11); b.coinRow(5, b.gt - 2, 4); b.x = 12;
  var stop = c.cols - (c.boss ? 56 : 16), cpAt = Math.floor(c.cols * .5), cpDone = false;
  while (b.x < stop) {
    if (!cpDone && b.x >= cpAt) { S.checkpoint(b); cpDone = true; continue; }
    var d = b.x / c.cols;
    S[pickW(b, c.w)](b, d, c);
  }
  if (c.boss) {
    S.checkpoint(b);
    var ax = b.x;
    b.ground(ax, ax + 29);
    b.coinRow(ax + 2, b.gt - 2, 5);
    b.boss = { ax0: ax * T, ax1: (ax + 30) * T };
    b.en("boss", ax + 20, b.gt - 1);
    var gx = ax + 30;
    b.ground(gx, gx + 15);
    for (var y = b.gt - 6; y < b.gt; y++) b.set(gx, y, 11);
    b.flag = gx + 9;
    b.x = gx + 16;
  } else {
    b.ground(b.x, b.x + 15);
    b.flag = b.x + 8;
    b.x += 16;
  }
  b.end = b.x;
  return { name: c.name, theme: c.theme, time: c.time, desc: c.desc, stride: b.stride, tiles: b.t, width: b.end,
           ents: b.ents, plats: b.plats, coins: b.coins, cps: b.cps, flag: b.flag, boss: b.boss, lava: !!c.lava };
}

window.RC_LEVELS = CFG.map(build);
window.RC_CONST = { T: T, ROWS: ROWS };
})();
