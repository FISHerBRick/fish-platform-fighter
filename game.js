const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- Sprites ---
const walkFrames = [
  new Image(),
  new Image()
];
walkFrames[0].src = "https://raw.githubusercontent.com/kocho4671-jpg/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174912__2_-removebg-preview.png";
walkFrames[1].src = "https://raw.githubusercontent.com/kocho4671-jpg/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174923__2_-removebg-preview.png";

const jumpFrame = new Image();
jumpFrame.src = "https://raw.githubusercontent.com/kocho4671-jpg/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174930__2_-removebg-preview.png";

// --- Animation variables ---
let currentFrame = 0;
let frameCount = 0;
const frameSpeed = 10;
let currentFrames = walkFrames;

let cameraX = 0;
let hitParticles = [];

// --- Player ---
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

// --- Platforms ---
const platforms = [
  { x: 0, y: 350, w: 800, h: 50 },
  { x: 700, y: 300, w: 100, h: 10 },
  { x: 900, y: 250, w: 100, h: 10 },
  { x: 1100, y: 200, w: 100, h: 10 },
  { x: 1300, y: 150, w: 100, h: 10 }
];

// --- Enemy ---
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

// --- Game state ---
let score = 0;
let gameOver = false;

// --- Key listeners ---
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// --- Reset ---
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

// --- Restart ---
document.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") resetGame();
});

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

  // --- Player movement ---
  if (keys["d"]) { player.x += 5; player.facingRight = true; moving = true; }
  if (keys["a"]) { player.x -= 5; player.facingRight = false; moving = true; }
  if (keys["w"] && player.grounded) { player.dy = jumpPower; player.grounded = false; }

  currentFrames = player.grounded ? walkFrames : [jumpFrame];

  // --- Animate walking ---
  if (moving && player.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % currentFrames.length;
      frameCount = 0;
    }
  } else if (player.grounded) {
    currentFrame = 0;
  }

  // --- Gravity & collision ---
  player.dy += gravity;
  player.y += player.dy;
  player.grounded = false;

  for (const p of platforms) {
    if (
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h <= p.y &&
      player.y + player.h + player.dy >= p.y
    ) {
      player.y = p.y - player.h;
      player.dy = 0;
      player.grounded = true;
    }
  }
  if (player.x < 0) player.x = 0;

  // --- Attack ---
  if (keys["e"] && player.attackCooldown <= 0) {
    player.attacking = true;
    player.attackCooldown = 30;
    setTimeout(() => player.attacking = false, 200);
  } else if (player.attackCooldown > 0) {
    player.attackCooldown--;
  }

  // --- Enemy physics ---
  enemy.dy += enemy.gravity;
  enemy.y += enemy.dy;
  enemy.grounded = false;

  for (const p of platforms) {
    if (
      enemy.x + enemy.w > p.x &&
      enemy.x < p.x + p.w &&
      enemy.y + enemy.h <= p.y &&
      enemy.y + enemy.h + enemy.dy >= p.y
    ) {
      enemy.y = p.y - enemy.h;
      enemy.dy = 0;
      enemy.grounded = true;
    }
  }

  // --- Enemy AI ---
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (!enemy.triggered && dist < 300) enemy.triggered = true;

  if (enemy.triggered) {
    enemy.x += Math.sign(dx) * enemy.speed;
    if (enemy.grounded && dy < -40 && Math.abs(dx) < 150) {
      enemy.dy = enemy.jumpPower;
      enemy.grounded = false;
    }
  } else {
    enemy.x += enemy.patrolDir * 1;
    if (enemy.x > enemy.spawnX + 50) enemy.patrolDir = -1;
    if (enemy.x < enemy.spawnX - 50) enemy.patrolDir = 1;
  }

  // --- Collision with player ---
  if (
    player.x < enemy.x + enemy.w &&
    player.x + player.w > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.h > enemy.y
  ) gameOver = true;

  // --- Player attack hits enemy ---
  if (player.attacking) {
    const attackRange = 50;
    const facingRight = player.facingRight;

    const attackBox = {
      x: facingRight ? player.x + player.w : player.x - attackRange,
      y: player.y,
      w: attackRange,
      h: player.h
    };

    if (
      attackBox.x < enemy.x + enemy.w &&
      attackBox.x + attackBox.w > enemy.x &&
      attackBox.y < enemy.y + enemy.h &&
      attackBox.y + attackBox.h > enemy.y
    ) {
      score += 100;

      for (let i = 0; i < 10; i++) {
        hitParticles.push({
          x: enemy.x + enemy.w/2,
          y: enemy.y + enemy.h/2,
          dx: (Math.random()-0.5)*4,
          dy: (Math.random()-0.5)*4,
          size: Math.random()*5+2,
          life: 20 + Math.random()*10
        });
      }

      enemy.x = enemy.spawnX;
      enemy.y = 320;
      enemy.triggered = false;
    }

    // Debug attack box
    ctx.fillStyle = "rgba(0,255,0,0.3)";
    ctx.fillRect(attackBox.x - cameraX, attackBox.y, attackBox.w, attackBox.h);
  }

  // --- Camera ---
  cameraX = player.x - canvas.width / 2 + player.w/2;
  if (cameraX < 0) cameraX = 0;

  // --- Draw background ---
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Platforms ---
  ctx.fillStyle = "#888";
  for (const p of platforms) ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);

  // --- Enemy ---
  ctx.fillStyle = "#f00";
  ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.w, enemy.h);

  // --- Player ---
  const sprite = currentFrames[currentFrame];
  ctx.save();
  ctx.translate(player.x - cameraX + player.w/2, player.y + player.h/2);
  ctx.scale(player.facingRight ? 1 : -1, 1);
  ctx.drawImage(sprite, -player.w/2, -player.h/2, player.w, player.h);
  ctx.restore();

  // --- HUD ---
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText(`Score: ${score}`, 20, 30);

  // --- Hit particles ---
  for (let i = hitParticles.length - 1; i >= 0; i--) {
    const p = hitParticles[i];
    ctx.fillStyle = "yellow";
    ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
    if (p.life <= 0) hitParticles.splice(i, 1);
  }

  requestAnimationFrame(update);
}

// --- Start game after all images load ---
let imagesLoaded = 0;
[...walkFrames, jumpFrame].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 3) update();
  }
});
