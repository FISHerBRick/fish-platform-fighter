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

//Enemy
let enemy = { x: 600, y: 320, w: 30, h: 30, speed: 2 };

//Game State
let score = 0;
let gameOver = false;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

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

 // Movement
let moveSpeed = 5;
let nextX = player.x;
let nextY = player.y + player.dy;
  
 if (keys["d"]) player.x += 5;
  if (keys["a"]) player.x -= 5;
  if (keys["w"] && player.grounded) {
    player.dy = jumpPower;
    player.grounded = false;

  // Gravity
 player.dy += gravity;
nextY = player.y + player.dy;

  // Collision
  player.grounded = false;
  for (const p of platforms) {
    if (
      player.x < p.x + p.w && player.x + player.w > p.x &&
      player.y + player.h < p.y + 10 && player.y + player.h + player.dy >= p.y
    ) {
      player.y = p.y - player.h;
      player.dy = 0;
      player.grounded = true;
    }
  }

  //Enemy Logic
  const distanceX = player.x - enemy.x;
  const distanceY = player.y - enemy.y;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  if (distance < 200) { //Enemy detects player within 200px
    if (distanceX > 0) enemy.x += enemy.speed;
    if (distanceX < 0) enemy.x -= enemy.speed;
    if (distanceY > 0) enemy.y += enemy.speed;
    if (distanceY < 0) enemy.y -= enemy.speed;
  }

  //Enemy collide with player
  if (
    player.x < enemy.x + enemy.w &&
    player.x + player.w > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.h > enemy.y
  ) {
    gameOver = true;
  }
}

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

//Enemy
ctx.fillStyle = "#f00";
ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

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
