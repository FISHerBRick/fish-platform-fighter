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
  y: 0,
  width: 100,
  height: 100,
  dy: 0,
  grounded: false,
  attacking: false,
  attackCooldown: 0,
  facingRight: true
};
// --- Physics ---
const playerSpeed = 0;   // really slow horizontal speed
const gravity = 0.3;       // slower falling
const jumpPower = -6;      // shorter jump


// --- Enemy ---
let enemy = {
  spawnX: 600, x: 600, y: 320, w: 30, h: 30,
  dy: 0, speed: 2, gravity: 0.6, jumpPower: -10,
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

// --- Game State ---
let keys = {}, currentFrame = 0, frameCount = 0, frameSpeed = 10, currentFrames = walkFrames;
let cameraX = 0, score = 0, gameOver = false, hitParticles = [];

// --- Key Listeners ---
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
document.addEventListener("keydown", e => { if(e.key.toLowerCase() === "r") resetGame(); });

// --- Reset Game ---
function resetGame() {
  player.x = 50;
  player.y = platforms[0].y - player.height; // start on first platform
  player.dy = 0;
  player.grounded = true; // make sure grounded is true
  score = 0;
  gameOver = false;

  enemy.x = enemy.spawnX;
  enemy.y = 320;
  enemy.dy = 0;
  enemy.grounded = false;
  enemy.triggered = false;

  hitParticles = [];
}

// --- Update Loop ---
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(gameOver){
    ctx.fillStyle = "#fff";
    ctx.font = "28px monospace";
    ctx.fillText("GAME OVER! Press R to Restart", 150, 200);
    requestAnimationFrame(update);
    return;
  }

  let moving = false;

// --- Player Movement ---
const step = 1; // move 1px at a time
if(keys["a"]) {
  player.x += -20; // slower speed
  player.facingRight = true;
  moving = true;
}
if(keys["d"]) {
  player.x -= -20;
  player.facingRight = false;
  moving = true;
}

if(keys["w"] && player.grounded) {
  player.dy = jumpPower;
  player.grounded = false;
}

// --- Animation ---
currentFrames = player.grounded ? walkFrames : [jumpFrame];
if(moving && player.grounded){
  frameCount++;
  if(frameCount >= frameSpeed){ currentFrame = (currentFrame + 1) % currentFrames.length; frameCount = 0; }
} else if(player.grounded){ currentFrame = 0; }

// --- Gravity & Collision ---
player.dy += gravity;
player.grounded = false;

let nextY = player.y + player.dy;

for(const p of platforms){
  const withinX = player.x + player.width > p.x && player.x < p.x + p.w;
  if(withinX){
    // falling down
    if(player.dy >= 0 && player.y + player.height <= p.y && nextY + player.height >= p.y){
      nextY = p.y - player.height;
      player.dy = 0;
      player.grounded = true;
    }
    // moving up (hit ceiling)
    if(player.dy < 0 && player.y >= p.y + p.h && nextY <= p.y + p.h){
      nextY = p.y + p.h;
      player.dy = 0;
    }
  }
}
player.y = nextY;

// keep player inside canvas
  if(player.y + player.height > canvas.height){
    player.y = platforms[0].y - player.height;
    player.dy = 0;
    player.grounded = true;
  }

  if(player.x < 0) player.x = 0;

  // --- Enemy Physics ---
  enemy.dy += enemy.gravity;
  enemy.y += enemy.dy;
  enemy.grounded = false;

  for(const p of platforms){
    if(enemy.x < p.x + p.w && enemy.x + enemy.w > p.x &&
       enemy.y + enemy.h < p.y + 10 && enemy.y + enemy.h + enemy.dy >= p.y){
      enemy.y = p.y - enemy.h;
      enemy.dy = 0;
      enemy.grounded = true;
    }
  }

  // --- Enemy AI ---
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if(!enemy.triggered && dist < 300) enemy.triggered = true;

  if(enemy.triggered){
    enemy.x += Math.sign(dx) * enemy.speed;
    if(enemy.grounded && dy < -40 && Math.abs(dx) < 150){ enemy.dy = enemy.jumpPower; enemy.grounded = false; }
  } else {
    enemy.x += enemy.patrolDir * 1;
    if(enemy.x > enemy.spawnX + 50) enemy.patrolDir = -1;
    if(enemy.x < enemy.spawnX - 50) enemy.patrolDir = 1;
  }

  // --- Player-Enemy Collision ---
  if(player.x < enemy.x + enemy.w && player.x + player.width > enemy.x &&
     player.y < enemy.y + enemy.h && player.y + player.height > enemy.y){
    gameOver = true;
  }

  // --- Camera ---
  cameraX = player.x - canvas.width/2 + player.width/2;
  if(cameraX < 0) cameraX = 0;

  // --- Draw ---
  ctx.fillStyle = "#111"; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#888"; for(const p of platforms) ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);
  ctx.fillStyle = "#f00"; ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.w, enemy.h);

  // Draw player sprite
  const sprite = currentFrames[currentFrame];
  ctx.save();
  ctx.translate(player.x - cameraX + player.width/2, player.y + player.height/2);
  ctx.scale(player.facingRight?1:-1,1);
  ctx.drawImage(sprite, -player.width/2, -player.height/2, player.width, player.height);
  ctx.restore();

  // HUD
  ctx.fillStyle = "#fff"; ctx.font = "20px monospace";
  ctx.fillText(`Score: ${score}`,20,30);

  requestAnimationFrame(update);
}

// --- Start after images load ---
let imagesLoaded = 0;
[...walkFrames,jumpFrame].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if(imagesLoaded===3) resetGame(); update();
  }
});
