// game.js - Full replacement (copy & paste)

// get canvas
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- Sprites ---
const walkFrames = [new Image(), new Image()];
walkFrames[0].src = "https://raw.githubusercontent.com/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174912__2_-removebg-preview.png";
walkFrames[1].src = "https://raw.githubusercontent.com/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174923__2_-removebg-preview.png";
const jumpFrame = new Image();
jumpFrame.src = "https://raw.githubusercontent.com/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174930__2_-removebg-preview.png";

// --- Player ---
const player = {
  x: 50,
  y: 0,               // will be set in resetGame()
  width: 100,
  height: 100,
  dy: 0,
  grounded: false,
  facingRight: true
};

// --- World / physics ---
const playerSpeed = 1.4;   // << tuned slow & smooth
const gravity = 0.45;
const jumpPower = -10;

// world width (prevents running forever off to the right)
const WORLD_WIDTH = 2600;

// --- Enemy ---
let enemy = {
  spawnX: 600, x: 600, y: 320, w: 30, h: 30,
  dy: 0, speed: 0.9, gravity: 0.6, jumpPower: -10,
  grounded: false, triggered: false, patrolDir: 1
};

// --- Platforms ---
const platforms = [
  { x: 0, y: 350, w: 800, h: 50 },
  { x: 700, y: 300, w: 100, h: 10 },
  { x: 900, y: 250, w: 100, h: 10 },
  { x: 1100, y: 200, w: 100, h: 10 },
  { x: 1300, y: 150, w: 100, h: 10 },
  { x: 1600, y: 250, w: 120, h: 10 },
  { x: 1800, y: 200, w: 100, h: 10 },
  { x: 2000, y: 350, w: 400, h: 30 }
];

// --- State ---
let keys = {}; // keys[e.key] will be stored lowercased
let currentFrame = 0, frameCount = 0, frameSpeed = 10;
let cameraX = 0, score = 0, gameOver = false;

// --- Input listeners (lowercase keys)
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "r") resetGame();
});

// --- Reset ---
function resetGame() {
  player.x = 50;
  player.y = platforms[0].y - player.height; // place on first platform
  player.dy = 0;
  player.grounded = true;
  player.facingRight = true;
  score = 0;
  gameOver = false;

  enemy.x = enemy.spawnX;
  enemy.y = 320;
  enemy.dy = 0;
  enemy.grounded = false;
  enemy.triggered = false;
}

// --- Update loop ---
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

  // --- Horizontal movement (A = left, D = right) ---
  if (keys["a"]) {
    player.x -= playerSpeed; // LEFT
    player.facingRight = false;
    moving = true;
  }
  if (keys["d"]) {
    player.x += playerSpeed; // RIGHT
    player.facingRight = true;
    moving = true;
  }

  // clamp player inside world bounds (prevents running away)
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > WORLD_WIDTH) player.x = WORLD_WIDTH - player.width;

  // --- Jump ---
  if (keys["w"] && player.grounded) {
    player.dy = jumpPower;
    player.grounded = false;
  }

  // --- Vertical physics + collision
  player.dy += gravity;
  // calculate tentative nextY once, then resolve collisions, then assign
  let nextY = player.y + player.dy;

  player.grounded = false; // will be set true if collision below

  for (const p of platforms) {
    // horizontal overlap check
    const overlapsX = player.x + player.width > p.x && player.x < p.x + p.w;

    if (!overlapsX) continue;

    // landing from above
    const willLand = player.y + player.height <= p.y && nextY + player.height >= p.y && player.dy >= 0;
    if (willLand) {
      nextY = p.y - player.height;
      player.dy = 0;
      player.grounded = true;
    }

    // head hit (moving upward into a platform)
    const hitHead = player.y >= p.y + p.h && nextY <= p.y + p.h && player.dy < 0;
    if (hitHead) {
      nextY = p.y + p.h;
      player.dy = 0;
    }
  }

  player.y = nextY;

  // keep player from falling through bottom
  if (player.y + player.height > canvas.height) {
    player.y = platforms[0].y - player.height;
    player.dy = 0;
    player.grounded = true;
  }

  // --- Enemy physics & AI (reduced speed)
  enemy.dy += enemy.gravity;
  enemy.y += enemy.dy;
  enemy.grounded = false;

  for (const p of platforms) {
    if (enemy.x < p.x + p.w && enemy.x + enemy.w > p.x &&
        enemy.y + enemy.h < p.y + 10 && enemy.y + enemy.h + enemy.dy >= p.y) {
      enemy.y = p.y - enemy.h;
      enemy.dy = 0;
      enemy.grounded = true;
    }
  }

  // chase player if in range
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  if (!enemy.triggered && dist < 300) enemy.triggered = true;

  if (enemy.triggered) {
    enemy.x += Math.sign(dx) * enemy.speed;
    // enemy jump logic
    if (enemy.grounded && dy < -40 && Math.abs(dx) < 150) {
      enemy.dy = enemy.jumpPower;
      enemy.grounded = false;
    }
  } else {
    enemy.x += enemy.patrolDir * 0.6;
    if (enemy.x > enemy.spawnX + 50) enemy.patrolDir = -1;
    if (enemy.x < enemy.spawnX - 50) enemy.patrolDir = 1;
  }

  // clamp enemy to world
  if (enemy.x < 0) enemy.x = 0;
  if (enemy.x + enemy.w > WORLD_WIDTH) enemy.x = WORLD_WIDTH - enemy.w;

  // --- Player / enemy collision (game over) ---
  if (player.x < enemy.x + enemy.w &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.h &&
      player.y + player.height > enemy.y) {
    gameOver = true;
  }

  // --- Animation frames ---
  const frames = player.grounded ? walkFrames : [jumpFrame];
  if (moving && player.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % frames.length;
      frameCount = 0;
    }
  } else if (player.grounded) {
    currentFrame = 0;
  }

  // --- Camera (follows player but not negative) ---
  cameraX = player.x - canvas.width / 2 + player.width / 2;
  if (cameraX < 0) cameraX = 0;
  // don't scroll past world right edge
  const maxCamera = WORLD_WIDTH - canvas.width;
  if (cameraX > maxCamera) cameraX = maxCamera;

  // --- Draw ---
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // platforms
  ctx.fillStyle = "#888";
  for (const p of platforms) ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);

  // enemy
  ctx.fillStyle = "#f00";
  ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.w, enemy.h);

  // player sprite
  const sprite = frames[currentFrame];
  ctx.save();
  ctx.translate(player.x - cameraX + player.width / 2, player.y + player.height / 2);
  ctx.scale(player.facingRight ? 1 : -1, 1);
  ctx.drawImage(sprite, -player.width / 2, -player.height / 2, player.width, player.height);
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
    if (imagesLoaded === 3) {
      resetGame();
      update();
    }
  };
});
