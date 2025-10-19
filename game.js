const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Player images
const walkFrames = [new Image(), new Image()];
walkFrames[0].src = "https://raw.githubusercontent.com/kocho4671-jpg/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174912__2_-removebg-preview.png";
walkFrames[1].src = "https://raw.githubusercontent.com/kocho4671-jpg/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174923__2_-removebg-preview.png";

const jumpFrame = new Image();
jumpFrame.src = "https://raw.githubusercontent.com/kocho4671-jpg/FISHerBRick/fish-platform-fighter/main/Untitled9_20251019174930__2_-removebg-preview.png";

// Player
const player = {
  x: 100,
  y: 300,
  w: 50,
  h: 50,
  dy: 0,
  grounded: false,
  facingRight: true
};

// Physics
const gravity = 0.6;
const jumpPower = -12;
const keys = {};

// Platforms
const platforms = [
  { x: 0, y: 350, w: 800, h: 50 },
  { x: 700, y: 300, w: 100, h: 10 }
];

// Animation
let currentFrame = 0;
let frameCount = 0;
const frameSpeed = 10;
let currentFrames = walkFrames;

// Camera
let cameraX = 0;

// Key listeners
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Game loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player movement
  let moving = false;
  if (keys["d"]) { player.x += 5; player.facingRight = true; moving = true; }
  if (keys["a"]) { player.x -= 5; player.facingRight = false; moving = true; }
  if (keys["w"] && player.grounded) { player.dy = jumpPower; player.grounded = false; }

  // Gravity
  player.dy += gravity;
  player.y += player.dy;
  player.grounded = false;

  // Platform collision
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

  // Update animation
  currentFrames = player.grounded ? walkFrames : [jumpFrame];
  if (moving && player.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % currentFrames.length;
      frameCount = 0;
    }
  } else if (player.grounded) currentFrame = 0;

  // Camera
  cameraX = player.x - canvas.width / 2 + player.w / 2;
  if (cameraX < 0) cameraX = 0;

  // Draw background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw platforms
  ctx.fillStyle = "#888";
  for (const p of platforms) ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);

  // Draw player
  const sprite = currentFrames[currentFrame];
  ctx.save();
  ctx.translate(player.x - cameraX + player.w/2, player.y + player.h/2);
  ctx.scale(player.facingRight ? 1 : -1, 1);
  ctx.drawImage(sprite, -player.w/2, -player.h/2, player.w, player.h);
  ctx.restore();

  requestAnimationFrame(update);
}

// Wait for images to load
let imagesLoaded = 0;
[...walkFrames, jumpFrame].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 3) update();
  }
});
