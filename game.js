const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

//Player
const player = { x: 50, y: 300, w: 30, h: 30, dy: 0, grounded: false };
const gravity = 0.6;
const jumpPower = -12;
const keys = {};

//Platforms
const platforms = [
  { x: 0, y: 350, w: 800, h: 50 },
  { x: 200, y: 280, w: 100, h: 10 },
  { x: 350, y: 220, w: 100, h: 10 },
  { x: 500, y: 160, w: 100, h: 10 },
];

//Enemies
let enemies = [];
let spawnTimer= 0;

//Game State
let score = 0;
let gameOver = false;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

//Enemy Spawn
function spawnEnemy() {
  enemies.push({
    x: 800,
    y: 320,
    w: 30,
    h: 30,
    speed: 3 + Math.random() * 2
  });
}

//Reset Game
function resetGame() {
  player.x = 50;
  player.y = 300;
  player.dy = 0;
  player.grounded = false;
  enemies = [];
  score = 0;
  spawnTimer = 0;
  gameOver = false;
}

//Update Loop
function update() {
  if (gameOver) {
    ctx.fillStyle = "#fff";
    ctx.font = "24px monospace";
    ctx.fillText("HAHA YOU LOST! Press R to Restart", 180,200);
    return;
  }
// Movement with nextX/nextY
let moveSpeed = 5;
let nextX = player.x;
let nextY = player.y + player.dy;

// Horizontal movement
if (keys["a"]) nextX -= moveSpeed;
if (keys["d"]) nextX += moveSpeed;

// Jump
if (keys["w"] && player.grounded) {
  player.dy = jumpPower;
  player.grounded = false;
}

// Gravity
player.dy += gravity;
nextY = player.y + player.dy;

// Collision
player.grounded = false;
for (const p of platforms) {
  if (
    nextX < p.x + p.w &&
    nextX + player.w > p.x &&
    player.y + player.h <= p.y &&
    nextY + player.h >= p.y
  ) {
    nextY = p.y - player.h;
    player.dy = 0;
    player.grounded = true;
  }
}

// Apply movement after collision check
player.x = Math.max(0, Math.min(nextX, canvas.width - player.w));
player.y = nextY;


  //Enemy Logic
  spawnTimer--;
  if (spawnTimer <=0) {
    spawnEnemy();
    spawnTimer = 120 + Math.random() * 60; // every 2 seconds
  }

  for (const e of enemies) {
    e.x -= e.speed;
  

  //Enemy collide with player
  if (
    player.x < e.x + e.w && player.x + player.w > e.x &&
    player.y < e.y + e.h && player.y + player.h > e.y
  ) {
    gameOver = true;
  }
}

  //Remove off-screen enemies
  enemies = enemies.filter(e => e.x > -50);

  //Score
  score++;

// Draw
ctx.clearRect(0, 0, canvas.width, canvas.height);

  //Player
  ctx.fillStyle = "#0f0";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  //Platforms
  ctx.fillStyle = "#888";
  for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);

//Enemies
ctx.fillStyle = "#ff0";
for (const e of enemies) ctx.fillRect (e.x, e.y, e.w, e.h);

//Score
ctx.fillStyle = "#fff";
ctx.font = "20px monospace";
ctx.fillText(`Score: ${score}`, 20, 30);

  requestAnimationFrame(update);
}

//Restart
document.addEventListener("keydown", e => {
  if (e.key === "r" || e.key === "R") resetGame();
});

//Start Game
update();
