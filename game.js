const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let cameraX = 0;

//Player
const player = { x: 50, y: 300, w: 30, h: 30, dy: 0, grounded: false };
const gravity = 0.6;
const jumpPower = -12;
const keys = {};

//Platforms
platforms.push(
  { x: 700, y: 300, w: 100, h: 10 },
  { x: 900, y: 250, w: 100, h: 10 },
  { x: 1100, y: 200, w: 100, h: 10 },
  { x: 1300, y: 150, w: 100, h: 10 },
);

const platforms = [
  { x: 0, y: 350, w: 800, h: 50 },
  { x: 200, y: 280, w: 100, h: 10 },
  { x: 350, y: 220, w: 100, h: 10 },
  { x: 500, y: 160, w: 100, h: 10 },
  { x: 650, y: 200, w: 120, h: 10 }, // new platform
];


//Enemy
let enemy = { x: 600, y: 320, w: 30, h: 30, speed: 2 };

//Game State
let score = 0;
let gameOver = false;

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

  //Reset enemy position
  enemy.x = 600;
  enemy.y = 320;
}

//Update Loop
function update() {
  // 1️⃣ Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2️⃣ Handle game over
  if (gameOver) {
    // draw message etc.
    return;
  }

  // 3️⃣ Player movement
  if (keys["d"]) player.x += 5;
  if (keys["a"]) player.x -= 5;
  if (keys["w"] && player.grounded) {
    player.dy = jumpPower;
    player.grounded = false;
  }

  // 4️⃣ Gravity + collision
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

  // 5️⃣ Keep player in world bounds
  if (player.x < 0) player.x = 0;

 // Enemy chase logic (world coordinates)
const distanceX = player.x - enemy.x;
const distanceY = player.y - enemy.y;
const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

// Enemy only chases if player is within 200px
if (distance < 200) {
  enemy.x += Math.sign(distanceX) * enemy.speed;
  enemy.y += Math.sign(distanceY) * enemy.speed;
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

  // 7️⃣ 📸 CAMERA FOLLOW
  cameraX = player.x - canvas.width / 2 + player.w / 2;
  if (cameraX < 0) cameraX = 0;

  // 8️⃣ DRAW everything with camera offset
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



//Start Game
update();
