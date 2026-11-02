/* Run Cat · interfaz: selector de niveles, HUD, pausa, victoria y derrota. Se conecta con el juego principal vía window.GCD. */
(function () {
"use strict";
var $ = function (id) { return document.getElementById(id); };
var G = window.GCD, RC = window.RC;
if (!G || !RC || !$("rc")) return;

var canvas = $("rc"), ctx = canvas.getContext("2d"), stage = G.stage, lastKey = {};
var ST = "★";

function fit() {
  var S = G.scale(), w = Math.round(360 * S), h = Math.round(540 * S);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  ctx.setTransform(S, 0, 0, S, 0, 0);
}
function stars(n, big) {
  var s = "";
  for (var i = 0; i < 3; i++) s += '<span style="color:' + (i < n ? "#ffc400" : "#d9c3d4") + ';text-shadow:0 .06em 0 ' + (i < n ? "#c77700" : "#bfa6ba") + '">' + ST + "</span>";
  return '<span style="font-size:' + (big ? "2.6em" : "1em") + ';letter-spacing:.05em">' + s + "</span>";
}
function setText(id, v) { var e = $(id); if (e && lastKey[id] !== v) { lastKey[id] = v; e.textContent = v; } }

/* ---------- HUD ---------- */
function hud() {
  var R = RC.get(), p = R.p;
  if (!p) return;
  var k = R.hearts + "|" + R.st;
  if (lastKey.hearts !== R.hearts) {
    lastKey.hearts = R.hearts; var h = "", n = Math.max(3, R.hearts);
    for (var i = 0; i < n; i++) h += G.heartSvg(i < R.hearts);
    $("rc-lives").innerHTML = h;
  }
  setText("rc-coins", String(R.coinsRun));
  var t = Math.max(0, Math.ceil(R.tleft));
  setText("rc-time", Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"));
  $("rc-time").parentNode.classList.toggle("low", t <= 20);
  setText("rc-prog", Math.min(100, Math.max(0, Math.round(p.x / R.flagX * 100))) + "%");
  setText("rc-name", "Nv " + (R.idx + 1));
}

/* ---------- Pantallas ---------- */
function openSelect() {
  var rc = G.sv.rc, list = $("rc-levels"); list.innerHTML = "";
  window.RC_LEVELS.forEach(function (L, i) {
    var locked = i + 1 > rc.unlocked, st = rc.stars[i] || 0;
    var li = document.createElement("div");
    li.className = "li rcl" + (locked ? " lock" : "");
    li.innerHTML = '<span class="ic" style="font-weight:900;color:#d63384">' + (locked ? "🔒" : (i + 1)) + "</span>" +
      '<div style="flex:1"><b>' + L.name + "</b><small>" + L.desc + "</small>" + (locked ? "" : "<small>" + stars(st) + "</small>") + "</div>" +
      (locked ? "" : '<button class="btn sm">▶</button>');
    if (!locked) li.querySelector("button").addEventListener("click", function () { startLevel(i); });
    list.appendChild(li);
  });
  $("rc-coins-sel").textContent = G.sv.coins;
  G.stage.dataset.view = "menu"; G.show("scr-rc-select");
}
function startLevel(idx) {
  G.ensureAudio(); G.musicStop();
  G.game.state = "rc"; G.keys.left = G.keys.right = false;
  stage.dataset.view = "rc"; G.show(null);
  Object.keys(lastKey).forEach(function (k) { delete lastKey[k]; });
  RC.start(idx, onWin, onOver);
  $("rc-pause").textContent = ""; $("rc-pause").innerHTML = '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="5" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="5" height="16" rx="1.5" fill="currentColor"/></svg>';
}
function exitTo(where) {
  RC.stop(); G.goMenu();
  if (where === "select") openSelect();
}
function onWin(r) {
  var L = window.RC_LEVELS[r.idx];
  $("rw-title").textContent = "¡" + L.name + " superado!";
  $("rw-stars").innerHTML = stars(r.stars, true);
  $("rw-coins").textContent = r.got + "/" + r.total;
  $("rw-bonus").textContent = "+" + r.bonus;
  $("rw-bank").textContent = "+" + r.bank + " 🪙";
  $("rw-time").textContent = Math.floor(r.used / 60) + ":" + String(r.used % 60).padStart(2, "0");
  $("rw-next").style.display = r.hasNext ? "" : "none";
  $("rw-hint").textContent = r.stars < 3 ? (r.lost ? "Termina sin perder corazones para ganar otra estrella." : "Junta más monedas para la tercera estrella.") : "¡Perfecto! 🎀";
  G.show("scr-rc-win");
}
function onOver(r) {
  $("ro-title").textContent = r.reason === "time" ? "¡Se acabó el tiempo! ⏱" : "¡Ay, te quedaste sin corazones! 💔";
  $("ro-coins").textContent = r.coins;
  $("ro-bank").textContent = "+" + r.bank + " 🪙";
  G.show("scr-rc-over");
}
function pauseGame() {
  if (G.game.state !== "rc") return;
  if (RC.pause()) { G.show("scr-rc-pause"); G.refreshMenu(); }
}
function resumeGame() { RC.resume(); G.show(null); }
function togglePause() { if (RC.get().paused) resumeGame(); else pauseGame(); }

/* ---------- Eventos ---------- */
$("b-rc").addEventListener("click", openSelect);
$("rc-pause").addEventListener("click", togglePause);
$("rcp-resume").addEventListener("click", resumeGame);
$("rcp-restart").addEventListener("click", function () { startLevel(RC.get().idx); });
$("rcp-levels").addEventListener("click", function () { exitTo("select"); });
$("rcp-menu").addEventListener("click", function () { exitTo("menu"); });
$("rw-next").addEventListener("click", function () { startLevel(RC.get().idx + 1); });
$("rw-again").addEventListener("click", function () { startLevel(RC.get().idx); });
$("rw-levels").addEventListener("click", function () { exitTo("select"); });
$("ro-again").addEventListener("click", function () { startLevel(RC.get().idx); });
$("ro-levels").addEventListener("click", function () { exitTo("select"); });

var jb = $("jump-btn");
jb.addEventListener("pointerdown", function (e) { e.preventDefault(); RC.jumpDown(); jb.classList.add("down"); try { jb.setPointerCapture(e.pointerId); } catch (x) {} });
["pointerup", "pointercancel", "lostpointercapture"].forEach(function (ev) { jb.addEventListener(ev, function () { RC.jumpUp(); jb.classList.remove("down"); }); });

window.addEventListener("keydown", function (e) {
  if (G.game.state !== "rc") return;
  var k = e.key;
  if (k === " " || k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); if (!e.repeat) RC.jumpDown(); }
  else if (k === "p" || k === "P" || k === "Escape") togglePause();
});
window.addEventListener("keyup", function (e) {
  if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") RC.jumpUp();
});
document.addEventListener("visibilitychange", function () { if (document.hidden) pauseGame(); });

/* El bucle principal del juego llama a esto en cada cuadro mientras se juega Run Cat */
G.rcFrame = function (dt) { RC.frame(dt); fit(); RC.render(ctx); hud(); };
})();
