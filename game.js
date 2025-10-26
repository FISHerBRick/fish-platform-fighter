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
    dx: 0,
    dy: 0,
    grounded: false,
    facingRight: true,
};

// --- Tunables ---
const PLAYER_SPEED = 6;
const GRAVITY = 0.7;
const JUMP_POWER = -12;
const WORLD_WIDTH = 2600;

// --- Enemy ---
let enemy = {
    spawnX: 600, x: 600, y: 320, w: 30, h: 30,
    dy: 0, speed: 1.2, gravity: 0.6, jumpPower: -8,
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

// --- State ---
let keys = {};
let currentFrame = 0, frameCount = 0, frameSpeed = 10;
let cameraX = 0, score = 0, gameOver = false;

// --- Input ---
document.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    if (["w","a","d"].includes(k)) e.preventDefault();
    if (k === "w") keys.up = true;
    if (k === "a") keys.left = true;
    if (k === "d") keys.right = true;
    if (k === "r") resetGame();
});

document.addEventListener("keyup", e => {
    const k = e.key.toLowerCase();
    if (k === "w") keys.up = false;
    if (k === "a") keys.left = false;
    if (k === "d") keys.right = false;
});

// --- Reset Game ---
function resetGame() {
    player.x = 50;
    player.y = platforms[0].y - player.height;
    player.dx = 0;
    player.dy = 0;
    player.grounded = true;
    player.facingRight = true;
    score = 0;
    gameOver = false;

    enemy.x = enemy.spawnX;
    enemy.y = 320;
    enemy.dy = 0;
    enemy.grounded = false;
    enemy.triggered = false;
}

// --- Collision Utility ---
function rectIntersect(a, b) {
    return !(a.x + a.width < b.x || a.x > b.x + b.w || a.y + a.height < b.y || a.y > b.y + b.h);
}

// --- Update ---
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = "#fff";
        ctx.font = "28px monospace";
        ctx.fillText("GAME OVER! Press R to Restart", 150, 200);
        requestAnimationFrame(update);
        return;
    }

    let moving = false;

    // --- Horizontal Movement ---
    player.dx = 0;
    if (keys.left && !keys.right) { player.dx = -PLAYER_SPEED; player.facingRight = false; moving = true; }
    if (keys.right && !keys.left) { player.dx = PLAYER_SPEED; player.facingRight = true; moving = true; }
    player.x += player.dx;
    player.x = Math.max(0, Math.min(player.x, WORLD_WIDTH - player.width));

    // --- Vertical Movement ---
    player.dy += GRAVITY;
    let nextY = player.y + player.dy;
    player.grounded = false;

    // --- Check collisions with platforms vertically ---
    for (const p of platforms) {
        const overlapsX = player.x + player.width > p.x && player.x < p.x + p.w;
        if (!overlapsX) continue;

        // Landing on top
        if (player.dy >= 0 && player.y + player.height <= p.y && nextY + player.height >= p.y) {
            nextY = p.y - player.height;
            player.dy = 0;
            player.grounded = true;
        }
        // Hitting bottom
        if (player.dy < 0 && player.y >= p.y + p.h && nextY <= p.y + p.h) {
            nextY = p.y + p.h;
            player.dy = 0;
        }
    }

    // --- Jump ---
    if (keys.up && player.grounded) {
        player.dy = JUMP_POWER;
        player.grounded = false;
    }

    player.y = nextY;

    // --- Enemy Update ---
    enemy.dy += enemy.gravity;
    enemy.y += enemy.dy;
    enemy.grounded = false;
    for (const p of platforms) {
        if (enemy.x < p.x + p.w && enemy.x + enemy.w > p.x &&
            enemy.y + enemy.h <= p.y && enemy.y + enemy.h + enemy.dy >= p.y) {
            enemy.y = p.y - enemy.h;
            enemy.dy = 0;
            enemy.grounded = true;
        }
    }

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    if (!enemy.triggered && dist < 300) enemy.triggered = true;

    if (enemy.triggered) {
        enemy.x += Math.sign(dx) * enemy.speed;
        if (enemy.grounded && dy < -40 && Math.abs(dx) < 150) {
            enemy.dy = enemy.jumpPower;
            enemy.grounded = false;
        }
    } else {
        enemy.x += enemy.patrolDir * 0.6;
        if (enemy.x > enemy.spawnX + 50) enemy.patrolDir = -1;
        if (enemy.x < enemy.spawnX - 50) enemy.patrolDir = 1;
    }
    enemy.x = Math.max(0, Math.min(enemy.x, WORLD_WIDTH - enemy.w));

    // --- Player <-> Enemy Collision ---
    if (rectIntersect(player, enemy)) {
        if (player.y + player.height - player.dy <= enemy.y) {
            player.dy = JUMP_POWER / 2;
            enemy.triggered = false;
            score += 100;
        } else {
            gameOver = true;
        }
    }

    // --- Animation ---
    const frames = player.grounded ? walkFrames : [jumpFrame];
    if (moving && player.grounded) {
        frameCount++;
        if (frameCount >= frameSpeed) {
            currentFrame = (currentFrame + 1) % frames.length;
            frameCount = 0;
        }
    } else if (player.grounded) currentFrame = 0;

    // --- Camera ---
    cameraX = player.x - canvas.width / 2 + player.width / 2;
    cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - canvas.width));

    // --- Draw ---
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#888";
    for (const p of platforms) ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);

    ctx.fillStyle = "#f00";
    ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.w, enemy.h);

    const sprite = frames[currentFrame];
    ctx.save();
    ctx.translate(player.x - cameraX + player.width / 2, player.y + player.height / 2);
    ctx.scale(player.facingRight ? 1 : -1, 1);
    ctx.drawImage(sprite, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();

    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.fillText(`Score: ${score}`, 20, 30);

    requestAnimationFrame(update);
}

// --- Start game ---
let imagesLoaded = 0;
[...walkFrames, jumpFrame].forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 3) {
            resetGame();
            update();
        }
    };
});
