import { clamp } from "../utils/math";

/**
 * Coordinate system:
 * - Vertical orientation (tall canvas)
 * - Paddles on left/right; ball moves in 2D.
 * - First to 7 wins.
 */

const KEY = {
  W: "KeyW",
  S: "KeyS",
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  P: "KeyP",
  R: "KeyR"
};

function nowSec() {
  return performance.now() / 1000;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function skinPalette(theme) {
  return {
    bg: theme?.bg ?? "#050b1a",
    line: "rgba(255,255,255,0.16)",
    text: "rgba(255,255,255,0.9)",
    accent: theme?.accent ?? "#ffffff",
    paddle: "rgba(255,255,255,0.9)",
    paddleGlow: theme?.accent ?? "#60a5fa",
    ball: "#ffffff"
  };
}

// PUBLIC_INTERFACE
export function createGameEngine({ canvas, mode, settings, theme, onHud, onPauseChange, onMatchEnd }) {
  /** Create and control a canvas-based vertical pong match. */
  const ctx = canvas.getContext("2d");

  const palette = skinPalette(theme);

  const state = {
    running: false,
    paused: false,
    startedAt: 0,
    lastT: 0,
    elapsed: 0,

    score: { p1: 0, p2: 0 },
    winScore: 7,

    // World
    w: canvas.width,
    h: canvas.height,

    paddle: {
      w: 14,
      h: 120,
      speed: 520 // px/sec
    },

    p1: { y: canvas.height / 2, vy: 0 },
    p2: { y: canvas.height / 2, vy: 0 },

    ball: {
      x: canvas.width / 2,
      y: canvas.height / 2,
      r: 8,
      vx: 220,
      vy: 180,
      max: 720
    },

    input: {
      w: false,
      s: false,
      up: false,
      down: false
    }
  };

  const difficulty = settings?.difficulty ?? "normal";
  const gameSpeed = clamp(settings?.gameSpeed ?? 1, 0.8, 1.3);

  const ai = {
    enabled: mode === "ai" || mode === "online",
    // reaction/smoothing vary by difficulty
    trackGain: difficulty === "easy" ? 0.065 : difficulty === "hard" ? 0.13 : 0.095,
    maxSpeedScale: difficulty === "easy" ? 0.85 : difficulty === "hard" ? 1.15 : 1.0
  };

  const emitHud = (message = "First to 7") => {
    onHud?.({
      p1: state.score.p1,
      p2: state.score.p2,
      message,
      elapsed: state.elapsed
    });
  };

  const resetPositions = (dir = 1) => {
    state.p1.y = state.h / 2;
    state.p2.y = state.h / 2;

    state.ball.x = state.w / 2;
    state.ball.y = state.h / 2;

    const base = 260 * (0.9 + Math.random() * 0.25);
    state.ball.vx = base * dir;
    state.ball.vy = (Math.random() * 2 - 1) * 220;
  };

  const restart = () => {
    state.score.p1 = 0;
    state.score.p2 = 0;
    state.elapsed = 0;
    state.startedAt = nowSec();
    resetPositions(Math.random() > 0.5 ? 1 : -1);
    emitHud("First to 7");
  };

  const clampPaddle = (y) => clamp(y, state.paddle.h / 2 + 14, state.h - state.paddle.h / 2 - 14);

  const draw = () => {
    ctx.clearRect(0, 0, state.w, state.h);

    // Background
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, state.w, state.h);

    // Center line
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.moveTo(state.w / 2, 20);
    ctx.lineTo(state.w / 2, state.h - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    const px = 26;
    const rx = state.w - 26 - state.paddle.w;

    const drawPaddle = (x, y) => {
      const top = y - state.paddle.h / 2;
      ctx.save();
      ctx.shadowColor = palette.paddleGlow;
      ctx.shadowBlur = 18;
      ctx.fillStyle = palette.paddle;
      ctx.fillRect(x, top, state.paddle.w, state.paddle.h);
      ctx.restore();
    };

    drawPaddle(px, state.p1.y);
    drawPaddle(rx, state.p2.y);

    // Ball
    ctx.save();
    ctx.shadowColor = palette.accent;
    ctx.shadowBlur = 14;
    ctx.fillStyle = palette.ball;
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Subtle corner vignette
    const grad = ctx.createRadialGradient(state.w / 2, state.h / 2, 10, state.w / 2, state.h / 2, state.h * 0.72);
    grad.addColorStop(0, "rgba(255,255,255,0.00)");
    grad.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, state.w, state.h);
  };

  const bounceFromPaddle = (paddleY, isRight) => {
    const rel = (state.ball.y - paddleY) / (state.paddle.h / 2);
    const angle = clamp(rel, -1, 1) * (Math.PI / 3.2); // up to ~56°
    const speed = clamp(Math.hypot(state.ball.vx, state.ball.vy) * 1.04, 240, state.ball.max);

    const dir = isRight ? -1 : 1;
    state.ball.vx = Math.cos(angle) * speed * dir;
    state.ball.vy = Math.sin(angle) * speed;

    // Add tiny "english"
    state.ball.vy += (Math.random() * 2 - 1) * 18;
  };

  const step = (dt) => {
    // Inputs -> P1 velocity
    const pSpeed = state.paddle.speed * gameSpeed;

    state.p1.vy = 0;
    if (state.input.w) state.p1.vy -= pSpeed;
    if (state.input.s) state.p1.vy += pSpeed;

    // P2 velocity
    if (mode === "local") {
      state.p2.vy = 0;
      if (state.input.up) state.p2.vy -= pSpeed;
      if (state.input.down) state.p2.vy += pSpeed;
    } else if (ai.enabled) {
      // Predictive-ish AI: track ball Y with smoothing and a max speed limit
      const targetY = state.ball.y;
      const error = targetY - state.p2.y;
      const desired = clamp(error * (pSpeed * ai.trackGain), -pSpeed, pSpeed);
      state.p2.vy = lerp(state.p2.vy ?? 0, desired, 0.22) * ai.maxSpeedScale;
    }

    // Update paddles
    state.p1.y = clampPaddle(state.p1.y + state.p1.vy * dt);
    state.p2.y = clampPaddle(state.p2.y + state.p2.vy * dt);

    // Update ball
    state.ball.x += state.ball.vx * dt * gameSpeed;
    state.ball.y += state.ball.vy * dt * gameSpeed;

    // Wall bounce (top/bottom)
    if (state.ball.y - state.ball.r < 10) {
      state.ball.y = 10 + state.ball.r;
      state.ball.vy *= -1;
    }
    if (state.ball.y + state.ball.r > state.h - 10) {
      state.ball.y = state.h - 10 - state.ball.r;
      state.ball.vy *= -1;
    }

    // Paddle collision
    const px = 26;
    const rx = state.w - 26 - state.paddle.w;

    const p1Rect = {
      x: px,
      y: state.p1.y - state.paddle.h / 2,
      w: state.paddle.w,
      h: state.paddle.h
    };
    const p2Rect = {
      x: rx,
      y: state.p2.y - state.paddle.h / 2,
      w: state.paddle.w,
      h: state.paddle.h
    };

    const ballLeft = state.ball.x - state.ball.r;
    const ballRight = state.ball.x + state.ball.r;
    const ballTop = state.ball.y - state.ball.r;
    const ballBottom = state.ball.y + state.ball.r;

    const hitRect = (r) =>
      ballRight > r.x && ballLeft < r.x + r.w && ballBottom > r.y && ballTop < r.y + r.h;

    if (state.ball.vx < 0 && hitRect(p1Rect)) {
      state.ball.x = p1Rect.x + p1Rect.w + state.ball.r + 0.5;
      bounceFromPaddle(state.p1.y, false);
    } else if (state.ball.vx > 0 && hitRect(p2Rect)) {
      state.ball.x = p2Rect.x - state.ball.r - 0.5;
      bounceFromPaddle(state.p2.y, true);
    }

    // Scoring
    if (state.ball.x < -30) {
      state.score.p2 += 1;
      emitHud("Point for P2");
      resetPositions(1);
    } else if (state.ball.x > state.w + 30) {
      state.score.p1 += 1;
      emitHud("Point for P1");
      resetPositions(-1);
    }

    // Win
    if (state.score.p1 >= state.winScore || state.score.p2 >= state.winScore) {
      const msg = state.score.p1 > state.score.p2 ? "P1 wins" : "P2 wins";
      emitHud(msg);
      onMatchEnd?.({ p1: state.score.p1, p2: state.score.p2 });
      togglePause(true);
    }
  };

  const loop = (t) => {
    if (!state.running) return;
    requestAnimationFrame(loop);

    const ts = t / 1000;
    const dt = state.lastT ? clamp(ts - state.lastT, 0, 1 / 30) : 1 / 60;
    state.lastT = ts;

    if (!state.paused) {
      state.elapsed = nowSec() - state.startedAt;
      step(dt);
    }

    draw();
    emitHud();
  };

  const onKeyDown = (e) => {
    if (e.code === KEY.W) state.input.w = true;
    if (e.code === KEY.S) state.input.s = true;
    if (e.code === KEY.UP) state.input.up = true;
    if (e.code === KEY.DOWN) state.input.down = true;

    if (e.code === KEY.P) {
      e.preventDefault();
      togglePause();
    }
    if (e.code === KEY.R) {
      e.preventDefault();
      restart();
    }
  };

  const onKeyUp = (e) => {
    if (e.code === KEY.W) state.input.w = false;
    if (e.code === KEY.S) state.input.s = false;
    if (e.code === KEY.UP) state.input.up = false;
    if (e.code === KEY.DOWN) state.input.down = false;
  };

  const togglePause = (force) => {
    const next = typeof force === "boolean" ? force : !state.paused;
    state.paused = next;
    onPauseChange?.(state.paused);
  };

  return {
    // PUBLIC_INTERFACE
    start() {
      /** Start the game loop and input listeners. */
      if (state.running) return;
      state.running = true;
      state.paused = false;
      state.startedAt = nowSec();
      state.lastT = 0;

      restart();

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      requestAnimationFrame(loop);
    },

    // PUBLIC_INTERFACE
    stop() {
      /** Stop the game loop and detach listeners. */
      state.running = false;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    },

    // PUBLIC_INTERFACE
    togglePause() {
      /** Toggle pause state. */
      togglePause();
    },

    // PUBLIC_INTERFACE
    restart() {
      /** Restart match scores and reset positions. */
      restart();
      onPauseChange?.(false);
      state.paused = false;
    }
  };
}
