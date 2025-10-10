import { levels } from './levels.js';

let currentLevel = 0;
let platforms = structuredClone(levels[currentLevel]);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = { x: 50, y: 300, w: 30, h: 30, dy: 0, grounded: false };
const gravity = 0.6;
const jumpPower = -12;
const keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function nextLevel() {
  currentLevel++;
  if (currentLevel >= levels.length) currentLevel = 0; // loop back
  platforms = structuredClone(levels[currentLevel]);
  player.x = 50;
  player.y = 300;
  player.dy = 0;
}

function update() {
  
if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
  player.x += 5;
}

// Move Left → ArrowLeft or A
if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
  player.x -= 5;
}

// Jump → Space, W, or ArrowUp
if ((keys[" "] || keys["w"] || keys["W"] || keys["ArrowUp"]) && player.grounded) {
  player.dy = jumpPower;
  player.grounded = false;
}


  // Simple level completion: reach the right edge
  if (player.x > canvas.width) nextLevel();

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f0";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "#888";
  for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);

  requestAnimationFrame(update);
}

update();
