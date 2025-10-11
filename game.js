const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = { x: 50, y: 300, w: 30, h: 30, dy: 0, grounded: false };
const gravity = 0.6;
const jumpPower = -12;
const keys = {};

let platforms = [];
let mapLoaded = false;

// Load the Tiled map (.tmj)
fetch("tutorial.js")
  .then(res => res.json())
  .then(map => {
    const tileWidth = map.tilewidth;
    const tileHeight = map.tileheight;
    const layer = map.layers.find(l => l.type === "tilelayer");

    // Build platform rectangles from tile data
    const cols = map.width;
    const rows = map.height;
    const data = layer.data;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tile = data[y * cols + x];
        if (tile !== 0) { // A non-zero tile means solid
          platforms.push({
            x: x * tileWidth,
            y: y * tileHeight,
            w: tileWidth,
            h: tileHeight
          });
        }
      }
    }

    // Get PlayerSpawn object from "Objects" layer
    const objLayer = map.layers.find(l => l.name === "Objects");
    const spawn = objLayer.objects.find(o => o.name === "PlayerSpawn");
    player.x = spawn.x;
    player.y = spawn.y - player.h; // adjust for height

    mapLoaded = true;
    update();
  });

// Movement keys
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function update() {
  if (!mapLoaded) return requestAnimationFrame(update);

  // Movement
  if (keys["d"]) player.x += 5;
  if (keys["a"]) player.x -= 5;
  if (keys["w"] && player.grounded) {
    player.dy = jumpPower;
    player.grounded = false;
  }

  // Gravity
  player.dy += gravity;
  player.y += player.dy;

  // Collision
  player.grounded = false;
  for (const p of platforms) {
    if (player.x < p.x + p.w && player.x + player.w > p.x &&
        player.y + player.h < p.y + 10 && player.y + player.h + player.dy >= p.y) {
      player.y = p.y - player.h;
      player.dy = 0;
      player.grounded = true;
    }
  }

  // Draw
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f0";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "#888";
  for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);

  requestAnimationFrame(update);
}
