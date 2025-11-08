// ======================
// CONFIGURABLE ASSETS
// ======================
const BIRD_IMG_SRC = "assets/bird.png"; // replaceable bird image
const FLAP_AUDIO_SRC = "assets/flap.mp3";
const GAME_OVER_AUDIO_SRC = "assets/gameover.mp3";
const BG_MUSIC_SRC = "assets/bg.mp3";

// ======================
// ELEMENTS
// ======================
const startCanvas = document.getElementById("startCanvas");
const ctxStart = startCanvas.getContext("2d");
const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");
const playBtn = document.getElementById("play-btn");
const startScreen = document.getElementById("start-screen");

// ======================
// ASSETS
// ======================
let birdImg = new Image();
birdImg.src = BIRD_IMG_SRC;

let bgAudio = new Audio(BG_MUSIC_SRC);
bgAudio.loop = true;
bgAudio.volume = 0.4;

let flapAudio = new Audio(FLAP_AUDIO_SRC);
let gameOverAudio = new Audio(GAME_OVER_AUDIO_SRC);

// ======================
// START SCREEN
// ======================
let birdY = 200;
let direction = 1;

birdImg.onload = function () {
  animateStartScreen();
};

function animateStartScreen() {
  ctxStart.clearRect(0, 0, startCanvas.width, startCanvas.height);
  ctxStart.drawImage(birdImg, 180, birdY, 40, 30);
  birdY += direction * 0.6;
  if (birdY > 220 || birdY < 180) direction *= -1;
  requestAnimationFrame(animateStartScreen);
}

bgAudio.play().catch(() => {
  console.log("Waiting for user interaction to start background music...");
});

// ======================
// GAME VARIABLES
// ======================
let bird, pipes, gravity, score, frames, gameRunning;

function startGame() {
  startScreen.style.display = "none";
  gameCanvas.style.display = "block";
  bgAudio.play();
  resetGame();
  requestAnimationFrame(loop);
}

playBtn.addEventListener("click", startGame);

function resetGame() {
  bird = { x: 50, y: 150, w: 34, h: 26, velocity: 0, jump: -3 };
  pipes = [];
  gravity = 0.12;
  score = 0;
  frames = 0;
  gameRunning = true;
}

document.addEventListener("mousedown", flap);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") flap();
});

function flap() {
  if (!gameRunning) return;
  bird.velocity = bird.jump;
  flapAudio.currentTime = 0;
  flapAudio.play();
}

// ======================
// MAIN GAME LOOP
// ======================
function loop() {
  update();
  draw();
  if (gameRunning) requestAnimationFrame(loop);
}

function update() {
  frames++;
  bird.velocity += gravity;
  bird.y += bird.velocity;

  // spawn simple flame blocks
  if (frames % 110 === 0) {
    let gap = 160; // vertical space between flames
    let topY = Math.random() * -150 - 100;
    pipes.push({ x: 400, y: topY, gap, passed: false });
  }

  // update and check collision
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= 2;

    if (
      bird.x + bird.w > p.x &&
      bird.x < p.x + 60 &&
      (bird.y < p.y + 220 || bird.y + bird.h > p.y + 220 + p.gap)
    ) {
      gameOver();
    }

    if (!p.passed && p.x + 60 < bird.x) {
      p.passed = true;
      score++;
    }

    if (p.x + 60 < 0) {
      pipes.splice(i, 1);
      i--;
    }
  }

  if (bird.y + bird.h >= gameCanvas.height || bird.y < 0) {
    gameOver();
  }
}

function draw() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // sky background
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // draw flame blocks (simple rectangles)
  for (let p of pipes) {
    drawFlameBlock(p.x, p.y, 220, true); // top
    drawFlameBlock(p.x, p.y + 220 + p.gap, 500, false); // bottom
  }

  // draw bird
  ctx.drawImage(birdImg, bird.x, bird.y, bird.w, bird.h);

  // score text
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

// ======================
// SIMPLE FLAME BLOCKS
// ======================
function drawFlameBlock(x, y, h, top) {
  // bright fiery gradient
  let grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, "#ffb347"); // light orange
  grad.addColorStop(0.5, "#ff8008"); // orange
  grad.addColorStop(1, "#ff0000"); // red

  ctx.fillStyle = grad;
  ctx.fillRect(x, y, 60, h);

  // small glowing border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 60, h);
}

// ======================
// GAME OVER
// ======================
function gameOver() {
  if (!gameRunning) return;
  gameRunning = false;
  bgAudio.pause();
  gameOverAudio.currentTime = 0;
  gameOverAudio.play();

  setTimeout(() => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.fillText("GAME OVER!", 100, 240);
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, 160, 280);
    ctx.fillText("Click to Restart", 120, 320);

    gameCanvas.addEventListener("mousedown", restartGame, { once: true });
  }, 100);
}

function restartGame() {
  bgAudio.play();
  resetGame();
  requestAnimationFrame(loop);
}
