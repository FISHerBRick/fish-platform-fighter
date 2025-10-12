const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let cameraX = 0;

// Player
const player = { x: 50, y: 300, w: 30, h: 30, dy: 0, grounded: false attacking: true, 
  attackCooldown: 0 };
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

  enemy.x = 600;
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
    return;
  }

  // Player movement
  if (keys["d"]) player.x += 5;
  if (keys["a"]) player.x -= 5;
  if (keys["w"] && player.grounded) {
    player.dy = jumpPower;
    player.grounded = false;
  }

  // Attack input
if (keys["k"] && player.attackCooldown <= 0) {
  player.attacking = true;
  player.attackCooldown = 30; // ~0.5s cooldown (30 frames)
  setTimeout(() => player.attacking = false, 200); // Attack lasts 200ms
} else {
  player.attackCooldown--;
}


  // Gravity + collision
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

  // Enemy Physics
  enemy.dy += enemy.gravity;
  enemy.y += enemy.dy;
  enemy.grounded = false;

  // Platform collision for enemy
  for (const p of platforms) {
    if (
      enemy.x < p.x + p.w &&
      enemy.x + enemy.w > p.x &&
      enemy.y + enemy.h < p.y + 10 &&
      enemy.y + enemy.h + enemy.dy >= p.y
    ) {
      enemy.y = p.y - enemy.h;
      enemy.dy = 0;
      enemy.grounded = true;
    }
  }
  
  // Enemy chase
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (!enemy.triggered && dist < 300) enemy.triggered = true;
  
if (enemy.triggered) {
    // Chase player
    enemy.x += Math.sign(dx) * enemy.speed;

    // Jump if player is above and close
  if (enemy.grounded && dy < -40 && Math.abs(dx) < 150) {
      enemy.dy = enemy.jumpPower;
      enemy.grounded = false;
  }
} else {
  // Patrol: move left/right around spawn point
  enemy.x += enemy.patrolDir * 1; // Patrol speed
  //Turn around at limits (+-50px from spawn)
  if (enemy.x > enemy.spawnX + 50) enemy.patrolDir = -1;
  if (enemy.x < enemy.spawnX - 50) enemy.patrolDir = 1;
}

  // Collision with player
  if (
    player.x < enemy.x + enemy.w &&
    player.x + player.w > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.h > enemy.y
  ) gameOver = true;

// Player attack hits enemy
if (player.attacking) {
  const attackRange = 50; // pixels
  const facingRight = keys["d"] || (!keys["a"] && enemy.x > player.x);

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
    // Enemy "killed"
    score += 100;
    // Respawn enemy elsewhere
    enemy.x = enemy.spawnX;
    enemy.y = 320;
    enemy.triggered = false;
  }

  // Optional: draw the attack box (for debugging)
  ctx.fillStyle = "rgba(0,255,0,0.3)";
  ctx.fillRect(attackBox.x - cameraX, attackBox.y, attackBox.w, attackBox.h);
}

  
  // Camera
  cameraX = player.x - canvas.width / 2 + player.w / 2;
  if (cameraX < 0) cameraX = 0;

  // Draw
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#888";
  for (const p of platforms) ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);

  ctx.fillStyle = "#f00";
  ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.w, enemy.h);

  ctx.fillStyle = "#0f0";
ctx.fillRect(player.x - cameraX, player.y, player.w, player.h);


  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText(`Score: ${score}`, 20, 30);

  requestAnimationFrame(update);
}

// Start game
update();
