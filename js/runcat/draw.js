/* Run Cat · dibujo (fondos, tiles, enemigos, gatita). Todo vectorial, sin imágenes. */
(function () {
"use strict";
var T = 30, TAU = Math.PI * 2, W = 360, H = 540;
var FONT = "'Nunito','Trebuchet MS',system-ui,sans-serif";

var TH = [
  { sky: ["#7fd3ff", "#eafaff"], top: "#6fdc7a", topD: "#3fb457", body: "#c98b5e", dot: "#a8693f", brick: "#ff9ec4", brickD: "#d9638f", mob: "#ff7eb9", mobD: "#c2307a", spk: "#9aa0b4" },
  { sky: ["#1b1038", "#3b2275"], top: "#a98bff", topD: "#7a62d6", body: "#4b3a85", dot: "#352866", brick: "#6f7bff", brickD: "#4452c9", mob: "#b07cff", mobD: "#6a35c9", spk: "#d7c6ff" },
  { sky: ["#ffd08a", "#fff1cc"], top: "#ffe3a1", topD: "#f0c27a", body: "#e9b565", dot: "#c88a3c", brick: "#d99a5b", brickD: "#a9692f", mob: "#ffb347", mobD: "#c26a00", spk: "#3fae5a" },
  { sky: ["#9fe3ff", "#ffd6f5"], top: "#ffffff", topD: "#dfe5ff", body: "#eef0ff", dot: "#d3d9ff", brick: "#ffd6f0", brickD: "#e79bd0", mob: "#9fd8ff", mobD: "#3b8fd1", spk: "#c9d0ff" },
  { sky: ["#2a0f1a", "#7a2a3a"], top: "#a8683f", topD: "#7a4a2c", body: "#4d2a18", dot: "#3a1e10", brick: "#8a5a3a", brickD: "#5d3a22", mob: "#e0554f", mobD: "#8a1f1a", spk: "#7a4a2c" }
];

function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function hills(c, cam, par, base, amp, freq, color) {
  c.fillStyle = color; c.beginPath(); c.moveTo(0, H);
  for (var x = 0; x <= W + 10; x += 10) c.lineTo(x, base + Math.sin((x + cam * par) * freq) * amp + Math.sin((x + cam * par) * freq * 2.3) * amp * .4);
  c.lineTo(W + 10, H); c.closePath(); c.fill();
}
function cloud(c, x, y, s, col) {
  c.fillStyle = col;
  [[0, 0, 16], [18, -9, 20], [40, 0, 16], [20, 6, 18]].forEach(function (p) { c.beginPath(); c.arc(x + p[0] * s, y + p[1] * s, p[2] * s, 0, TAU); c.fill(); });
}
function wrapX(v, span) { return ((v % span) + span) % span; }

/* ---------- Fondos con parallax ---------- */
function bg(c, th, cam, time) {
  var t = TH[th], g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, t.sky[0]); g.addColorStop(1, t.sky[1]);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  var i, x;
  if (th === 0) {
    c.fillStyle = "#fff3a0"; c.beginPath(); c.arc(290, 90, 30, 0, TAU); c.fill();
    c.fillStyle = "rgba(255,243,160,.3)"; c.beginPath(); c.arc(290, 90, 52, 0, TAU); c.fill();
    for (i = 0; i < 5; i++) cloud(c, wrapX(i * 190 - cam * .15 + time * .2, 950) - 100, 70 + (i % 3) * 55, .8 + (i % 2) * .3, "rgba(255,255,255,.95)");
    hills(c, cam, .25, 360, 26, .008, "#b6ecb0"); hills(c, cam, .45, 410, 22, .011, "#8fe097");
  } else if (th === 1) {
    for (i = 0; i < 14; i++) {
      x = wrapX(i * 90 - cam * .3, 1260) - 60;
      c.fillStyle = i % 2 ? "#2a1a5c" : "#34216e"; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 34, 0); c.lineTo(x + 17, 60 + (i % 4) * 28); c.closePath(); c.fill();
    }
    for (i = 0; i < 10; i++) {
      x = wrapX(i * 130 - cam * .45, 1300) - 40; var hh = 50 + (i % 3) * 22, gl = .35 + .25 * Math.sin(time * .05 + i);
      c.fillStyle = "rgba(160,130,255," + gl + ")"; c.beginPath(); c.moveTo(x, H - 40); c.lineTo(x + 14, H - 40 - hh); c.lineTo(x + 28, H - 40); c.closePath(); c.fill();
      c.fillStyle = "rgba(255,255,255," + gl * .6 + ")"; c.beginPath(); c.moveTo(x + 14, H - 40 - hh); c.lineTo(x + 20, H - 40); c.lineTo(x + 14, H - 40); c.closePath(); c.fill();
    }
    for (i = 0; i < 24; i++) { c.fillStyle = "rgba(255,255,255," + (.3 + .4 * Math.sin(time * .06 + i * 2)) + ")"; c.fillRect(wrapX(i * 71 - cam * .2, 360), (i * 53) % 400, 2, 2); }
  } else if (th === 2) {
    c.fillStyle = "#fff6c9"; c.beginPath(); c.arc(80, 110, 42, 0, TAU); c.fill();
    c.fillStyle = "rgba(255,246,201,.35)"; c.beginPath(); c.arc(80, 110, 70, 0, TAU); c.fill();
    hills(c, cam, .2, 380, 22, .006, "#f6c785");
    for (i = 0; i < 8; i++) {
      x = wrapX(i * 170 - cam * .35, 1360) - 60; c.fillStyle = "#c79a55"; rr(c, x, 395, 12, 55, 6); c.fill(); rr(c, x - 9, 410, 8, 22, 4); c.fill(); rr(c, x + 13, 405, 8, 22, 4); c.fill();
    }
    hills(c, cam, .5, 440, 18, .01, "#eab36d");
  } else if (th === 3) {
    var cols = ["#ff6b6b", "#ffa94d", "#ffe066", "#69db7c", "#4dabf7", "#b197fc"];
    c.lineWidth = 14; for (i = 0; i < 6; i++) { c.strokeStyle = cols[i]; c.globalAlpha = .55; c.beginPath(); c.arc(wrapX(240 - cam * .1, 900) - 200, 520, 300 - i * 14, Math.PI, TAU); c.stroke(); }
    c.globalAlpha = 1;
    for (i = 0; i < 7; i++) cloud(c, wrapX(i * 170 - cam * .2 + time * .25, 1190) - 100, 80 + (i % 4) * 70, .9 + (i % 3) * .25, "rgba(255,255,255,.85)");
    for (i = 0; i < 6; i++) cloud(c, wrapX(i * 230 - cam * .45, 1380) - 120, 440 + (i % 2) * 24, 1.3, "rgba(255,255,255,.9)");
  } else {
    c.fillStyle = "#3b1a28";
    for (i = 0; i < 9; i++) { x = wrapX(i * 150 - cam * .3, 1350) - 80; c.fillRect(x, 200 + (i % 3) * 30, 90, H); c.fillRect(x - 6, 180 + (i % 3) * 30, 14, 24); c.fillRect(x + 30, 180 + (i % 3) * 30, 14, 24); c.fillRect(x + 66, 180 + (i % 3) * 30, 14, 24); }
    for (i = 0; i < 6; i++) {
      x = wrapX(i * 210 - cam * .45, 1260) - 60; c.fillStyle = "#1c0a12"; c.beginPath(); c.arc(x + 15, 250, 15, Math.PI, 0); c.lineTo(x + 30, 300); c.lineTo(x, 300); c.closePath(); c.fill();
      c.fillStyle = "rgba(255,190,90," + (.55 + .25 * Math.sin(time * .1 + i)) + ")"; c.beginPath(); c.arc(x + 15, 252, 9, 0, TAU); c.fill();
    }
    for (i = 0; i < 5; i++) { x = wrapX(i * 260 - cam * .55 + 60, 1300) - 60; c.fillStyle = "#6b4030"; c.fillRect(x, 330, 5, 22); c.fillStyle = "rgba(255,150,40," + (.7 + .3 * Math.sin(time * .3 + i * 3)) + ")"; c.beginPath(); c.ellipse(x + 2.5, 322, 7, 11, 0, 0, TAU); c.fill(); }
  }
}

/* ---------- Tiles ---------- */
function tile(c, th, id, px, py, tx, ty, time, top) {
  var t = TH[th], h = (tx * 7 + ty * 13) % 5;
  if (id === 1) {
    c.fillStyle = t.body; c.fillRect(px, py, T, T);
    c.fillStyle = t.dot; c.beginPath(); c.arc(px + 6 + h * 4, py + 14 + (h % 2) * 8, 2.5, 0, TAU); c.arc(px + 22 - h * 2, py + 22 - (h % 3) * 5, 2, 0, TAU); c.fill();
    if (top) {
      if (th === 3) { c.fillStyle = t.top; for (var k = 0; k < 3; k++) { c.beginPath(); c.arc(px + 5 + k * 10, py + 4, 7, 0, TAU); c.fill(); } c.fillRect(px, py + 4, T, 8); c.fillStyle = t.topD; c.fillRect(px, py + 11, T, 2); }
      else { c.fillStyle = t.top; c.fillRect(px, py, T, 9); c.fillStyle = t.topD; c.fillRect(px, py + 8, T, 3); c.fillStyle = t.top; for (var j = 0; j < 3; j++) { c.beginPath(); c.arc(px + 5 + j * 10, py + 11, 4, 0, Math.PI); c.fill(); } }
    }
  } else if (id === 2) {
    c.fillStyle = t.brick; c.fillRect(px, py, T, T); c.strokeStyle = t.brickD; c.lineWidth = 2;
    c.strokeRect(px + 1, py + 1, T - 2, T - 2); c.beginPath(); c.moveTo(px, py + 15); c.lineTo(px + T, py + 15); c.moveTo(px + 15, py); c.lineTo(px + 15, py + 15); c.moveTo(px + 8, py + 15); c.lineTo(px + 8, py + T); c.moveTo(px + 23, py + 15); c.lineTo(px + 23, py + T); c.stroke();
  } else if (id === 3 || id === 9) {
    var pu = 1 + Math.sin(time * .1 + tx) * .04;
    c.fillStyle = id === 3 ? "#ffd23f" : "#ffb0d0"; rr(c, px + 1, py + 1, T - 2, T - 2, 5); c.fill();
    c.lineWidth = 2.5; c.strokeStyle = id === 3 ? "#c77700" : "#d6477f"; c.stroke();
    c.fillStyle = "rgba(255,255,255,.55)"; c.fillRect(px + 4, py + 4, T - 8, 3);
    c.fillStyle = "#fff"; c.strokeStyle = id === 3 ? "#c77700" : "#d6477f"; c.lineWidth = 3; c.font = "900 " + (19 * pu) + "px " + FONT; c.textAlign = "center"; c.textBaseline = "middle";
    c.strokeText("?", px + 15, py + 16); c.fillText("?", px + 15, py + 16); c.textAlign = "left"; c.textBaseline = "alphabetic";
  } else if (id === 8) {
    c.fillStyle = "#b9a088"; rr(c, px + 1, py + 1, T - 2, T - 2, 5); c.fill(); c.strokeStyle = "#7e6a55"; c.lineWidth = 2; c.stroke();
    c.fillStyle = "#7e6a55"; [[5, 5], [23, 5], [5, 23], [23, 23]].forEach(function (p) { c.beginPath(); c.arc(px + p[0], py + p[1], 1.8, 0, TAU); c.fill(); });
  } else if (id === 4) {
    var col = th === 2 ? "#3fae5a" : t.spk;
    if (th === 2) { c.fillStyle = col; rr(c, px + 11, py + 6, 9, 24, 4); c.fill(); rr(c, px + 4, py + 12, 6, 12, 3); c.fill(); rr(c, px + 20, py + 10, 6, 12, 3); c.fill(); c.strokeStyle = "#1f7a38"; c.lineWidth = 1.5; c.stroke(); }
    else { c.fillStyle = col; for (var s = 0; s < 3; s++) { c.beginPath(); c.moveTo(px + s * 10, py + T); c.lineTo(px + s * 10 + 5, py + 8); c.lineTo(px + s * 10 + 10, py + T); c.closePath(); c.fill(); c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 1.2; c.stroke(); } }
  } else if (id === 5) {
    var wv = Math.sin(time * .1 + tx) * 2;
    var lg = c.createLinearGradient(0, py, 0, py + T); lg.addColorStop(0, "#ffd54f"); lg.addColorStop(1, "#ff5722");
    c.fillStyle = lg; c.fillRect(px, py + 5 + wv, T, T); c.fillStyle = "#fff3a0"; c.fillRect(px, py + 5 + wv, T, 3);
    c.fillStyle = "rgba(255,255,255,.35)"; c.beginPath(); c.arc(px + 8 + (time * .3 + tx * 9) % 16, py + 16, 3, 0, TAU); c.fill();
  } else if (id === 6) {
    c.fillStyle = "#8b8fa3"; rr(c, px + 4, py + 24, 22, 6, 2); c.fill();
    c.strokeStyle = "#c9ced9"; c.lineWidth = 3; c.beginPath(); c.moveTo(px + 9, py + 24); c.lineTo(px + 21, py + 20); c.lineTo(px + 9, py + 16); c.lineTo(px + 21, py + 12); c.stroke();
    c.fillStyle = "#ff4f6d"; rr(c, px + 3, py + 8, 24, 6, 3); c.fill(); c.strokeStyle = "#a8203a"; c.lineWidth = 1.5; c.stroke();
  } else if (id === 7) {
    if (th === 3) { cloud(c, px + 1, py + 10, .4, "#fff"); c.fillStyle = "#fff"; c.fillRect(px, py + 6, T, 8); c.fillStyle = "#cfd6ff"; c.fillRect(px, py + 12, T, 3); }
    else { c.fillStyle = t.brick; rr(c, px, py, T, 9, 3); c.fill(); c.strokeStyle = t.brickD; c.lineWidth = 1.5; c.stroke(); }
  } else if (id === 10) {
    c.fillStyle = "#3a3f4f"; rr(c, px, py + 2, T, T - 2, 6); c.fill(); c.strokeStyle = "#1a1d27"; c.lineWidth = 2; c.stroke();
    c.fillStyle = "#12141b"; c.beginPath(); c.arc(px + 6, py + 15, 7, 0, TAU); c.fill();
    c.fillStyle = "#6b7287"; c.fillRect(px + 12, py + 7, 12, 3); c.fillStyle = "#e8505b"; c.beginPath(); c.arc(px + 22, py + 22, 3, 0, TAU); c.fill();
  } else if (id === 11) {
    c.fillStyle = "#6b3a1e"; c.fillRect(px, py, T, T); c.strokeStyle = "#3a1e0d"; c.lineWidth = 2; c.strokeRect(px + 1, py + 1, T - 2, T - 2);
    c.beginPath(); c.moveTo(px + 15, py); c.lineTo(px + 15, py + T); c.moveTo(px, py + 15); c.lineTo(px + T, py + 15); c.stroke();
    c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(px + 3, py + 3, 9, 9);
  }
}

function plat(c, th, p, w, time) {
  var t = TH[th];
  if (th === 3) { cloud(c, p.x + 4, p.y + 8, .45, "#fff"); c.fillStyle = "#fff"; rr(c, p.x, p.y + 4, w, 12, 6); c.fill(); c.fillStyle = "#cfd6ff"; c.fillRect(p.x + 4, p.y + 12, w - 8, 3); return; }
  c.fillStyle = t.brick; rr(c, p.x, p.y, w, 12, 4); c.fill(); c.strokeStyle = t.brickD; c.lineWidth = 2; c.stroke();
  c.fillStyle = "rgba(255,255,255,.5)"; c.fillRect(p.x + 4, p.y + 3, w - 8, 2);
  c.fillStyle = t.brickD; for (var x = p.x + 8; x < p.x + w - 4; x += 20) { c.beginPath(); c.arc(x, p.y + 7, 1.8, 0, TAU); c.fill(); }
}

function coin(c, x, y, time, ph) {
  var sx = Math.max(.2, Math.abs(Math.cos(time * .09 + ph)));
  c.save(); c.translate(x, y + Math.sin(time * .08 + ph) * 1.5); c.scale(sx, 1);
  c.fillStyle = "#ffc400"; c.beginPath(); c.arc(0, 0, 8.5, 0, TAU); c.fill();
  c.lineWidth = 2; c.strokeStyle = "#c77700"; c.stroke();
  c.fillStyle = "#fff3a0"; c.beginPath(); c.arc(-2, -2, 3, 0, TAU); c.fill();
  c.strokeStyle = "rgba(199,119,0,.6)"; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, 5.5, 0, TAU); c.stroke();
  c.restore();
}

function flag(c, x, gy, time, goal) {
  c.fillStyle = "#c9ced9"; c.fillRect(x - 2, gy - 150, 4, 150); c.strokeStyle = "#7d8396"; c.lineWidth = 1.5; c.strokeRect(x - 2, gy - 150, 4, 150);
  c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(x, gy - 152, 5, 0, TAU); c.fill();
  var w = Math.sin(time * .15) * 3;
  c.fillStyle = goal ? "#ff4f9d" : "#8e44ff"; c.beginPath(); c.moveTo(x + 2, gy - 146); c.lineTo(x + 40, gy - 132 + w); c.lineTo(x + 2, gy - 112); c.closePath(); c.fill();
  c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = "#fff"; c.beginPath(); c.arc(x + 14, gy - 130 + w / 2, 4, 0, TAU); c.fill();
}
function checkpoint(c, x, gy, on, time) {
  c.fillStyle = "#9aa0b4"; c.fillRect(x - 1.5, gy - 54, 3, 54);
  var w = on ? Math.sin(time * .2) * 2 : 0;
  c.fillStyle = on ? "#ff4f9d" : "#b8bccb"; c.beginPath(); c.moveTo(x + 1, gy - 54); c.lineTo(x + 24, gy - 46 + w); c.lineTo(x + 1, gy - 36); c.closePath(); c.fill();
  c.fillStyle = "#6b7287"; c.beginPath(); c.arc(x, gy - 55, 3, 0, TAU); c.fill();
}

/* ---------- Enemigos ---------- */
function eyes(c, cx, cy, dir, sp) {
  [-4.5, 4.5].forEach(function (dx) {
    c.fillStyle = "#fff"; c.beginPath(); c.arc(cx + dx, cy, sp || 3.4, 0, TAU); c.fill();
    c.fillStyle = "#2a1a2e"; c.beginPath(); c.arc(cx + dx + dir * 1.2, cy + .4, 1.7, 0, TAU); c.fill();
  });
}
function enemy(c, e, th, time) {
  var t = TH[th], cx = e.x + e.w / 2, by = e.y + e.h, k = e.k, sq = e.dead ? Math.max(.18, e.squash / 18) : 1;
  c.save(); c.translate(cx, by); c.scale(1, sq); c.lineJoin = "round";
  if (k === "slime") {
    var bob = 1 + Math.sin(time * .2 + e.x) * .06;
    c.scale(1 / bob, bob);
    c.fillStyle = t.mob; c.strokeStyle = t.mobD; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-13, 0); c.bezierCurveTo(-14, -14, -7, -21, 0, -21); c.bezierCurveTo(7, -21, 14, -14, 13, 0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "rgba(255,255,255,.45)"; c.beginPath(); c.ellipse(-6, -14, 3, 2, -.5, 0, TAU); c.fill();
    eyes(c, 0, -10, e.dir || 1);
  } else if (k === "spiky") {
    c.fillStyle = t.mobD; c.strokeStyle = "#1a0f1f"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-13, 0); c.bezierCurveTo(-14, -12, -8, -17, 0, -17); c.bezierCurveTo(8, -17, 14, -12, 13, 0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#e9ecf5"; c.strokeStyle = "#7d8396"; c.lineWidth = 1.2;
    for (var i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 5 - 4, -14 + Math.abs(i)); c.lineTo(i * 5, -26 + Math.abs(i) * 2); c.lineTo(i * 5 + 4, -14 + Math.abs(i)); c.closePath(); c.fill(); c.stroke(); }
    c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(-4.5, -8, 2.3, 0, TAU); c.arc(4.5, -8, 2.3, 0, TAU); c.fill();
    c.strokeStyle = "#1a0f1f"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-8, -12); c.lineTo(-2, -9); c.moveTo(8, -12); c.lineTo(2, -9); c.stroke();
  } else if (k === "hopper") {
    var st = clampN(1 + (e.vy || 0) * .03, .8, 1.3); c.scale(1 / st, st);
    c.fillStyle = "#e8b46a"; c.strokeStyle = "#a9692f"; c.lineWidth = 2;
    [-6, 6].forEach(function (dx) { c.beginPath(); c.ellipse(dx, -27, 3.4, 8, dx * .04, 0, TAU); c.fill(); c.stroke(); c.fillStyle = "#ffb6c9"; c.beginPath(); c.ellipse(dx, -27, 1.6, 5, 0, 0, TAU); c.fill(); c.fillStyle = "#e8b46a"; });
    c.beginPath(); c.arc(0, -12, 12, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = "#7a4a2c"; [[-6, -16], [5, -18], [-2, -6], [7, -9]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 1.6, 0, TAU); c.fill(); });
    eyes(c, 0, -13, e.dir || 1, 3);
  } else if (k === "bat") {
    var fl = Math.sin(time * .4 + e.x) * .7;
    c.translate(0, -9); c.fillStyle = th === 3 ? "#7fb5ff" : "#5a3aa8"; c.strokeStyle = "#1a0f1f"; c.lineWidth = 1.6;
    [-1, 1].forEach(function (s) { c.save(); c.scale(s, 1); c.rotate(-fl * .5); c.beginPath(); c.moveTo(4, -2); c.quadraticCurveTo(18, -14 - fl * 6, 24, 2); c.quadraticCurveTo(18, -2, 14, 6); c.quadraticCurveTo(9, 0, 4, 5); c.closePath(); c.fill(); c.stroke(); c.restore(); });
    c.beginPath(); c.ellipse(0, 0, 8, 9, 0, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-6, -7); c.lineTo(-5, -14); c.lineTo(-1, -8); c.moveTo(6, -7); c.lineTo(5, -14); c.lineTo(1, -8); c.fill(); c.stroke();
    c.fillStyle = "#ffe066"; c.beginPath(); c.arc(-3, -2, 2, 0, TAU); c.arc(3, -2, 2, 0, TAU); c.fill();
  } else if (k === "bullet") {
    c.scale(e.dir < 0 ? 1 : -1, 1); c.translate(0, -6);
    c.fillStyle = "#23232e"; c.strokeStyle = "#000"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-9, -6); c.lineTo(3, -6); c.arc(3, 0, 6, -Math.PI / 2, Math.PI / 2); c.lineTo(-9, 6); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(-2, -1, 3, 0, TAU); c.fill(); c.fillStyle = "#000"; c.beginPath(); c.arc(-3, -1, 1.5, 0, TAU); c.fill();
    c.fillStyle = "#ffb347"; c.beginPath(); c.moveTo(9, -4); c.lineTo(15 + Math.sin(time) * 2, 0); c.lineTo(9, 4); c.fill();
  }
  c.restore();
}
function clampN(v, a, b) { return Math.max(a, Math.min(b, v)); }

function boss(c, b, time) {
  if (b.vis === false) return;
  var cx = b.x + b.w / 2, by = b.y + b.h, sq = b.dying ? Math.max(.15, b.dyT / 60) : 1;
  c.save(); c.translate(cx, by); c.scale(1, sq); c.lineJoin = "round";
  var fl = b.inv > 0 && Math.floor(b.inv / 4) % 2 === 0;
  c.fillStyle = fl ? "#ffffff" : "#6b3a1e"; c.strokeStyle = "#2c140a"; c.lineWidth = 3;
  rr(c, -33, -56, 66, 56, 22); c.fill(); c.stroke();
  c.fillStyle = fl ? "#ffe9f2" : "#f5dcc0"; c.beginPath(); c.ellipse(0, -18, 20, 14, 0, 0, TAU); c.fill();
  c.fillStyle = "#ffd23f"; c.strokeStyle = "#c77700"; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(-18, -54); c.lineTo(-18, -70); c.lineTo(-9, -62); c.lineTo(0, -74); c.lineTo(9, -62); c.lineTo(18, -70); c.lineTo(18, -54); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "#ff4f6d"; c.beginPath(); c.arc(0, -60, 3, 0, TAU); c.fill();
  var ang = b.hp === 1;
  c.fillStyle = "#fff"; c.beginPath(); c.ellipse(-11, -38, 7, 8, 0, 0, TAU); c.ellipse(11, -38, 7, 8, 0, 0, TAU); c.fill();
  c.fillStyle = ang ? "#e0102f" : "#2a1a2e"; c.beginPath(); c.arc(-11 + b.dir * 2, -37, 3.6, 0, TAU); c.arc(11 + b.dir * 2, -37, 3.6, 0, TAU); c.fill();
  c.strokeStyle = "#2c140a"; c.lineWidth = 3.2; c.beginPath(); c.moveTo(-19, -49); c.lineTo(-5, -43); c.moveTo(19, -49); c.lineTo(5, -43); c.stroke();
  c.fillStyle = "#fff"; c.strokeStyle = "#cfc0b0"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -24); c.quadraticCurveTo(-20, -30, -26, -20); c.quadraticCurveTo(-12, -16, 0, -22); c.quadraticCurveTo(12, -16, 26, -20); c.quadraticCurveTo(20, -30, 0, -24); c.fill(); c.stroke();
  c.fillStyle = "#6b3a1e"; c.strokeStyle = "#2c140a"; c.lineWidth = 2.5;
  [-14, 14].forEach(function (dx) { c.beginPath(); c.ellipse(dx, -2, 10, 5, 0, 0, TAU); c.fill(); c.stroke(); });
  c.restore();
}

/* ---------- La gatita corredora ---------- */
function player(c, p, skin, acc, time) {
  if (p.inv > 0 && Math.floor(p.inv / 4) % 2 === 1) return;
  var cx = p.x + p.w / 2, by = p.y + p.h, run = p.on && Math.abs(p.vx) > .4, ph = p.phase;
  var sqx = 1, sqy = 1;
  if (!p.on) { sqy = clampN(1 + Math.abs(p.vy) * .012, 1, 1.12); sqx = 1 / sqy; }
  c.save(); c.translate(cx, by); c.scale(p.face * sqx, sqy); c.lineJoin = "round"; c.lineCap = "round";
  var fur = skin.fur, line = skin.line, bob = run ? Math.abs(Math.sin(ph)) * 1.6 : Math.sin(time * .08) * .5;
  // cola
  c.strokeStyle = line; c.lineWidth = 6.5; c.beginPath(); c.moveTo(-7, -11 - bob); c.quadraticCurveTo(-18, -14 + Math.sin(time * .2) * 3, -15, -26 + Math.sin(time * .2 + 1) * 3); c.stroke();
  c.strokeStyle = fur; c.lineWidth = 3.6; c.stroke();
  // patas
  var a = run ? Math.sin(ph) * 5 : 0, b2 = run ? -Math.sin(ph) * 5 : 0;
  if (!p.on) { a = p.vy < 0 ? 5 : -2; b2 = p.vy < 0 ? -5 : 4; }
  c.fillStyle = fur; c.strokeStyle = line; c.lineWidth = 2;
  [[-5 + b2, 0], [5 + a, 0]].forEach(function (l, i) { rr(c, l[0] - 3.2, -7 + (!p.on && i ? -2 : 0), 6.4, 7, 3); c.fill(); c.stroke(); });
  // cuerpo
  c.beginPath(); c.ellipse(0, -11 - bob, 9.5, 8, 0, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = skin.inner; c.globalAlpha = .55; c.beginPath(); c.ellipse(1, -9 - bob, 5.5, 4.5, 0, 0, TAU); c.fill(); c.globalAlpha = 1;
  // cabeza
  var hy = -19 - bob;
  c.fillStyle = fur; c.strokeStyle = line; c.lineWidth = 2;
  [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(s * 9 + 2, hy - 5); c.lineTo(s * 8 + 2, hy - 15); c.lineTo(s * 1.5 + 2, hy - 8); c.closePath(); c.fill(); c.stroke(); c.fillStyle = skin.inner; c.beginPath(); c.moveTo(s * 7.5 + 2, hy - 7); c.lineTo(s * 7 + 2, hy - 12); c.lineTo(s * 3 + 2, hy - 8); c.fill(); c.fillStyle = fur; });
  c.beginPath(); c.ellipse(2, hy, 11.5, 9.5, 0, 0, TAU); c.fill(); c.stroke();
  // ojos
  var blink = (time % 240) > 232, hurt = p.hurtT > 0;
  c.fillStyle = "#4a2c2a"; c.strokeStyle = "#4a2c2a"; c.lineWidth = 1.6;
  [-3, 7].forEach(function (dx) {
    if (hurt) { c.beginPath(); c.moveTo(dx - 2, hy - 3); c.lineTo(dx + 2, hy + 1); c.moveTo(dx + 2, hy - 3); c.lineTo(dx - 2, hy + 1); c.stroke(); }
    else if (blink) { c.beginPath(); c.moveTo(dx - 2, hy - 1); c.lineTo(dx + 2, hy - 1); c.stroke(); }
    else { c.beginPath(); c.arc(dx, hy - 1, 2.3, 0, TAU); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(dx + .8, hy - 1.8, .8, 0, TAU); c.fill(); c.fillStyle = "#4a2c2a"; }
  });
  c.fillStyle = "#ff8fab"; c.beginPath(); c.arc(4, hy + 2.5, 1.5, 0, TAU); c.fill();
  c.fillStyle = "rgba(255,120,150,.45)"; c.beginPath(); c.ellipse(-6, hy + 3, 2.6, 1.7, 0, 0, TAU); c.ellipse(11, hy + 3, 2.6, 1.7, 0, 0, TAU); c.fill();
  // accesorios
  if (acc === "acc_flower") { c.save(); c.translate(-6, hy - 13); for (var i = 0; i < 5; i++) { var an = i * TAU / 5; c.fillStyle = "#ff8fc0"; c.beginPath(); c.arc(Math.cos(an) * 3, Math.sin(an) * 3, 2.3, 0, TAU); c.fill(); } c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 0, 1.8, 0, TAU); c.fill(); c.restore(); }
  else if (acc === "acc_party") { c.fillStyle = "#8e44ff"; c.strokeStyle = "#5f23b8"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-3, hy - 8); c.lineTo(2, hy - 25); c.lineTo(8, hy - 8); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(2, hy - 25, 2.2, 0, TAU); c.fill(); }
  else if (acc === "acc_glasses") { c.fillStyle = "rgba(40,30,70,.92)"; c.strokeStyle = "#1d1533"; c.lineWidth = 1.3; [-3, 7].forEach(function (dx) { c.beginPath(); c.arc(dx, hy - 1, 4.4, 0, TAU); c.fill(); c.stroke(); }); c.beginPath(); c.moveTo(1.4, hy - 1); c.lineTo(2.6, hy - 1); c.stroke(); }
  else if (acc === "acc_crown") { c.fillStyle = "#ffd23f"; c.strokeStyle = "#c77700"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-5, hy - 8); c.lineTo(-6, hy - 17); c.lineTo(-1, hy - 13); c.lineTo(2, hy - 19); c.lineTo(5, hy - 13); c.lineTo(10, hy - 17); c.lineTo(9, hy - 8); c.closePath(); c.fill(); c.stroke(); }
  // moñito morado (siempre)
  c.fillStyle = "#9d4edd"; c.strokeStyle = "#5a189a"; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(9, hy - 8); c.lineTo(15, hy - 12); c.lineTo(15, hy - 4); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(9, hy - 8); c.lineTo(3, hy - 12); c.lineTo(3, hy - 4); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "#c77dff"; c.beginPath(); c.arc(9, hy - 8, 2, 0, TAU); c.fill();
  c.restore();
}

window.RCD = { TH: TH, bg: bg, tile: tile, plat: plat, coin: coin, flag: flag, checkpoint: checkpoint, enemy: enemy, boss: boss, player: player, FONT: FONT };
})();
