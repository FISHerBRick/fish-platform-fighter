const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let cameraX = 0;

//Player
const player = { x: 50, y: 300, w: 30, h: 30, dy: 0, grounded: false };
const gravity = 0.6;
const jumpPower = -12;
const keys = {};

//Platforms
const platforms = [
  { x: 0, y: 350, w: 800, h: 50 },
  { x: 700, y: 300, w: 100, h: 10 },
  { x: 900, y: 250, w: 100, h: 10 },
  { x: 1100, y: 200, w: 100, h: 10 },
  { x: 1300, y: 150, w: 100, h: 10 }
];

//Enemy
let enemy = { x: 600, y: 320, w: 30, h: 30, speed: 2, triggered: false };

//Game State
let score = 0;
let gameOver = false;

//Controls
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

//Reset Game
function resetGame() {
  player.x = 50;
  player.y = 300;
  player.dy = 0;
  player.grounded = false;
  score = 0;
  gameOver = false;

  //Reset enemy position and trigger
  enemy.x = 600;
  enemy.y = 320;
  enemy.triggered = false;
}

//Update Loop
function update() {
  // Clear screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px monospace";
    ctx.fillText("YOU LOST!", 300, 200);
    ctx.font = "20px monospace";
    ctx.fillText("Press R to Restart", 280, 240);
    requestAnimationFrame(update);
    return;
  }

  // Player movement
  if (keys["d"]) player.x += 5;
  if (keys["a"]) player.x -= 5;
  if (keys["w"] && player.grounded) {
    player.dy = jumpPower;
    player.grounded = false;
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

  // Keep player in world bounds
  if (player.x < 0) player.x = 0;

  // Enemy logic
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  // Trigger chase if player is close
  if (!enemy.triggered && dist < 300) {
    enemy.triggered = true;
  }

  // Enemy moves if triggered
  if (enemy.triggered) {
    enemy.x += Math.sign(dx) * enemy.speed;
    enemy.y += Math.sign(dy) * enemy.speed;
  }

  // Enemy collide with player
  if (
    player.x < enemy.x + enemy.w &&
    player.x + player.w > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.h > enemy.y
  ) {
    gameOver = true;
  }

  // Camera follow
  cameraX = player.x - canvas.width / 2 + player.w / 2;
  if (cameraX < 0) cameraX = 0;

  // Draw background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw platforms
  ctx.fillStyle = "#888";
  for (const p of platforms) {
    ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);
  }

  // Draw enemy
  ctx.fillStyle = "#f00";
  ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.w, enemy.h);

  // Draw player
  ctx.fillStyle = "#0f0";
  ctx.fillRect(player.x - cameraX, player.y, player.w, player.h);

  // Draw score
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText(`Score: ${score}`, 20, 30);

  score++;

  requestAnimationFrame(update);
}

//Restart on R
document.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") resetGame();
});

//Start game
update();

