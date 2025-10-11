const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

const player = { x: 50, y: 300, w: 30, h: 30, dy: 0, grounded: false };
const gravity = 0.6;
const jumpPower = -12;
const keys = {};

let platforms = [];
let mapWidthPx = 0;
let mapHeightPx = 0;
let mapLoaded = false;

const camera = { x: 0, y: 0 };

// Load map
fetch("levels/tutorial.tmj")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load map JSON");
    return res.json();
  })
  .then(map => {
    console.log("Map loaded", map);

    const tileW = map.tilewidth;
    const tileH = map.tileheight;
    mapWidthPx = map.width * tileW;
    mapHeightPx = map.height * tileH;

    const layer = map.layers.find(l => l.type === "tilelayer");
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = layer.data[y * map.width + x];
        if (tile !== 0) {
          platforms.push({
            x: x * tileW,
            y: y * tileH,
            w: tileW,
            h: tileH
          });
        }
      }
    }

    const objLayer = map.layers.find(l => l.name === "Objects");
    if (objLayer) {
      const spawn = objLayer.objects.find(o => o.name === "PlayerSpawn");
      if (spawn) {
        player.x = spawn.x;
        player.y = spawn.y - player.h;
      }
    }

    mapLoaded = true;
    update();  // start loop
  })
  .catch(err => {
    console.error("Error loading map:", err);
  });

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function update() {
  if (!mapLoaded) {
    requestAnimationFrame(update);
    return;
  }

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

  // Camera targeting
  const targetX = player.x + player.w / 2 - canvas.width / 2;
  const targetY = player.y + player.h / 2 - canvas.height / 2;

  // Smooth follow
  camera.x += (targetX - camera.x) * 0.1;
  camera.y += (targetY - camera.y) * 0.1;

  // Clamp within map bounds
  camera.x = Math.max(0, Math.min(camera.x, mapWidthPx - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, mapHeightPx - canvas.height));

  // Draw background
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw platforms
  ctx.fillStyle = "#888";
  for (const p of platforms) {
    ctx.fillRect(p.x - camera.x, p.y - camera.y, p.w, p.h);
  }

  // Draw player
  ctx.fillStyle = "#0f0";
  ctx.fillRect(player.x - camera.x, player.y - camera.y, player.w, player.h);

  requestAnimationFrame(update);
}
