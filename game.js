const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


// Dynamic resize
let mapData;
let tilesetImg;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const player = { x: 50, y: 300, w: 30, h: 30, dy: 0, grounded: false };
const camera = { x: 0, y: 0 };
const gravity = 1.6;
const jumpPower = -12;
const keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function update() {
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
  ctx.fillRect(player.x - camera.x, player.y - camera.y, player.w, player.h);

  requestAnimationFrame(update);

   // Update camera position
  camera.x = player.x - canvas.width / 2 + player.w / 2;
  camera.y = player.y - canvas.height / 2 + player.h / 2;
  camera.x = Math.max(0, Math.min(camera.x, mapData.width * mapData.tilewidth - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, mapData.height * mapData.tileheight - canvas.height));

  function drawMap() {
  const layer = mapData.layers.find(l => l.type === "tilelayer");
  if (!layer) return;

  const tw = mapData.tilewidth;
  const th = mapData.tileheight;
  const tiles = layer.data;
  const mapWidth = mapData.width;

    for (let i = 0; i < tiles.length; i++) {
      const id = tiles[i];
      if (id === 0) continue;

      const sx = ((id - 1) % 8) * tw;
      const sy = Math.floor((id - 1) / 8) * th;
      const dx = (i % mapWidth) * tw - camera.x; // subtract camera.x
      const dy = Math.floor(i / mapWidth) * th - camera.y; // subtract camera.y

      ctx.drawImage(tilesetImg, sx, sy, tw, th, dx, dy, tw, th);
    }
  }

}

async function loadLevel() {
  // Load the TMJ file
  const res = await fetch('tutoriallevel.tmj');
  mapData = await res.json();

  // Load the tileset image (make sure the filename matches your actual one)
  tilesetImg = new Image();
  tilesetImg.src = 'tileset.png';
  await new Promise(r => tilesetImg.onload = r);

  // Start the game loop
  update();
}

loadLevel(

  // Find spawn point from Tiled object layer
  const objectLayer = mapData.layers.find(l => l.type === "Objects");
  const spawn = objectLayer.objects.find(o => o.name === "PlayerSpawn");
  player.x = spawn.x;
  player.y = spawn.y - player.h;

);
