const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Walk sprites
const walkFrames = [
  new Image(),
  new Image()
];
walkFrames[0].src = "https://raw.githubusercontent.com/kocho4671-jpg/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174912__2_-removebg-preview.png";
walkFrames[1].src = "https://raw.githubusercontent.com/kocho4671-jpg/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174923__2_-removebg-preview.png";

// Jump sprite
const jumpFrame = new Image();
jumpFrame.src = "https://raw.githubusercontent.com/kocho4671-jpg/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174930__2_-removebg-preview.png";

// Animation variables
let currentFrame = 0;
let frameCount = 0;
const frameSpeed = 10;
let currentFrames = walkFrames; // <--- initialize correctly

let cameraX = 0;
let hitParticles = [];

// Player
const player = { 
  x: 50, 
  y: 300, 
  w: 30, 
  h: 30, 
  dy: 0, 
  grounded: false, 
  attacking: false, 
  attackCooldown: 0,
  facingRight: true,
};
const gravity = 0.6;
const jumpPower = -12;
const keys = {};

// Platforms
const platforms = [
  { x: 0, y: 350, w: 800, h: 50 },
  { x: 700, y: 300, w: 100, h: 10 },
  { x: 900, y: 250, w: 100, h: 10 },
  { x: 1100, y: 200, w: 100, h: 10 },
  { x: 1300, y: 150, w: 100, h: 10 }
];

// Enemy
let enemy = {
  spawnX: 600,
  x: 600,
  y: 320,
  w: 30,
  h: 30,
  dy: 0,
  speed: 2,
  gravity: 0.6,
  jumpPower: -10,
  grounded: false,
  triggered: false,
  patrolDir: 1
};

// Game state
let score = 0;
let gameOver = false;

// Key listeners
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Reset game
function resetGame() {
  player.x = 50;
  player.y = 300;
  player.dy = 0;
  player.grounded = false;
  score = 0;
  gameOver = false;

  enemy.x = enemy.spawnX;
  enemy.y = 320;
  enemy.triggered = false;
}

// Restart listener
document.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") resetGame();
});

// Update loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    ctx.fillStyle = "#fff";
    ctx.font = "28px monospace";
    ctx.fillText("GAME OVER! Press R to Restart", 150, 200);
    requestAnimationFrame(update);
    return;
  }

  let moving = false;

  // Player movement
  if (keys["d"]) { player.x += 5; player.facingRight = true; moving = true; }
  if (keys["a"]) { player.x -= 5; player.facingRight = false; moving = true; }
  if (keys["w"] && player.grounded) { player.dy = jumpPower; player.grounded = false; }

  // Decide which animation frames to use
  currentFrames = player.grounded ? walkFrames : [jumpFrame];

  // Animate walking frames
  if (moving && player.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % currentFrames.length;
      frameCount = 0;
    }
  } else if (player.grounded) {
    currentFrame = 0; // idle frame
  }

  // Gravity & collision
  player.dy += gravity;
  player.y += player.dy;
  player.grounded = false;

  for (const p of platforms) {
    if (
      player.x < p.x + p.w &&
      player.x + player.w > p.x &&
      player.y + player.h < p.y + 10 &&
      player.y + player.h + player.dy >= p.y
    ) {
      player.y = p.y - player.h;
      player.dy = 0;
      player.grounded = true;
    }
  }
  if (player.x < 0) player.x = 0;

  // Camera
  cameraX = player.x - canvas.width / 2 + player.w/2;
  if (cameraX < 0) cameraX = 0;

  // Draw background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw platforms
  ctx.fillStyle = "#888";
  for (const p of platforms) ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);

  // Draw enemy
  ctx.fillStyle = "#f00";
  ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.w, enemy.h);

  // Draw player
  const sprite = currentFrames[currentFrame];
  ctx.save();
  ctx.translate(player.x - cameraX + player.w/2, player.y + player.h/2);
  ctx.scale(player.facingRight ? 1 : -1, 1);
  ctx.drawImage(sprite, -player.w/2, -player.h/2, player.w, player.h);
  ctx.restore();

  // HUD
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText(`Score: ${score}`, 20, 30);

  requestAnimationFrame(update);
}

// --- Start after images load ---
let imagesLoaded = 0;
[...walkFrames, jumpFrame].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 3) update();
  }
});
