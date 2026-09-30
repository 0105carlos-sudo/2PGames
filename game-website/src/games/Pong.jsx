import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import {
  ArtPong,
  TrophyIcon,
  DrawIcon,
  PauseIcon,
  PlayIcon,
  RestartIcon,
  HomeIcon,
  ChevUpIcon,
  ChevDownIcon,
} from '../components/icons';
import './Pong.css';

const W = 800;
const H = 450;
const PADDLE_W = 12;
const PADDLE_H = 86;
const PADDLE_SPEED = 460;
const BALL_R = 9;
const BASE_SPEED = 340;
const MAX_SPEED = 900;
const WIN_SCORE = 5;
// Crazy mode: every paddle hit splits one ball into two,
// 60-240s countdown, plus one ball fired from alternating sides every 3s
const CRAZY_TIMES = [60, 120, 180, 240];
const MAX_BALLS = 24;
const SPLIT_HITS = 1;
const SPAWN_EVERY = 3;

const fmtTime = (s) => {
  const c = Math.max(0, Math.ceil(s));
  return `${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}`;
};

export default function Pong({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('ready'); // ready | playing | paused | over
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [winner, setWinner] = useState(null);
  const [variant, setVariant] = useState('classic'); // classic | crazy
  const [duration, setDuration] = useState(CRAZY_TIMES[0]);
  const [timeLeft, setTimeLeft] = useState(CRAZY_TIMES[0]);

  const gameRef = useRef({
    p1Y: H / 2 - PADDLE_H / 2,
    p2Y: H / 2 - PADDLE_H / 2,
    balls: [],
    nextId: 1,
    side: 1,
    s1: 0,
    s2: 0,
  });

  const statusRef = useRef(status);
  const keysRef = useRef(new Set());
  const touchRef = useRef({ p1Up: false, p1Down: false, p2Up: false, p2Down: false });
  const themeRef = useRef(theme);
  const reportedRef = useRef(false);
  const modeRef = useRef(mode);
  const variantRef = useRef('classic');
  const durationRef = useRef(CRAZY_TIMES[0]);
  const totalRef = useRef(CRAZY_TIMES[0]);
  const timeRef = useRef(CRAZY_TIMES[0]);
  const spawnTimerRef = useRef(null);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const serve = useCallback((dir) => {
    const g = gameRef.current;
    const a = Math.random() * 0.5 - 0.25; // shallow random angle
    g.balls = [{
      x: W / 2,
      y: H / 2,
      vx: dir * BASE_SPEED * Math.cos(a),
      vy: BASE_SPEED * Math.sin(a) * (Math.random() < 0.5 ? 1 : -1),
      hits: 0,
      id: g.nextId++,
    }];
  }, []);

  // Crazy mode: fire one ball in from alternating side boundaries
  const spawnSide = useCallback(() => {
    const g = gameRef.current;
    if (g.balls.length >= MAX_BALLS) return;
    const dir = g.side === 1 ? -1 : 1;
    g.side = dir;
    const a = Math.random() * 0.9 - 0.45; // paddle-dominant cone toward the far side
    const speed = BASE_SPEED * (0.9 + Math.random() * 0.3);
    g.balls.push({
      x: dir > 0 ? 50 : W - 50,
      y: 70 + Math.random() * (H - 140),
      vx: dir * speed * Math.cos(a),
      vy: speed * Math.sin(a),
      hits: 0,
      id: g.nextId++,
    });
  }, []);

  const startMatch = useCallback((v, d) => {
    const nv = v || variantRef.current;
    const nd = d || durationRef.current;
    variantRef.current = nv;
    durationRef.current = nd;
    setVariant(nv);
    setDuration(nd);
    const g = gameRef.current;
    reportedRef.current = false;
    g.p1Y = H / 2 - PADDLE_H / 2;
    g.p2Y = H / 2 - PADDLE_H / 2;
    g.s1 = 0;
    g.s2 = 0;
    timeRef.current = nd;
    totalRef.current = nd;
    spawnTimerRef.current = SPAWN_EVERY;
    setScores({ 1: 0, 2: 0 });
    setTimeLeft(nd);
    setWinner(null);
    if (nv === 'crazy') {
      g.balls = [];
      spawnSide(); // opening ball fires in immediately
    } else {
      serve(Math.random() < 0.5 ? 1 : -1);
    }
    setStatus('playing');
  }, [serve, spawnSide]);

  // Keyboard controls
  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', ' '].includes(k)) e.preventDefault();
      if (k === ' ') {
        if (statusRef.current === 'playing') setStatus('paused');
        else if (statusRef.current === 'paused') setStatus('playing');
        return;
      }
      keysRef.current.add(k);
    };
    const up = (e) => keysRef.current.delete(e.key.toLowerCase());
    const blur = () => {
      keysRef.current.clear();
      if (statusRef.current === 'playing') setStatus('paused');
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  // Game loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const step = (now) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (statusRef.current !== 'playing') return;

      const g = gameRef.current;
      const keys = keysRef.current;
      const tch = touchRef.current;

      // Paddles
      const p1Move =
        (keys.has('w') || tch.p1Up ? -1 : 0) + (keys.has('s') || tch.p1Down ? 1 : 0);
      g.p1Y = Math.max(0, Math.min(H - PADDLE_H, g.p1Y + p1Move * PADDLE_SPEED * dt));
      if (modeRef.current === 'solo') {
        // Computer paddle: track the nearest incoming ball with limited speed
        const incoming = g.balls.filter((bb) => bb.vx > 0).sort((a, b) => b.x - a.x);
        const tb = incoming[0] || g.balls[0];
        let target = H / 2 - PADDLE_H / 2;
        if (tb && tb.vx > 0) target = tb.y - PADDLE_H / 2 + Math.sin(now / 650) * 24;
        const diff = target - g.p2Y;
        const maxStep = PADDLE_SPEED * 0.82 * dt;
        g.p2Y = Math.max(0, Math.min(H - PADDLE_H, g.p2Y + Math.max(-maxStep, Math.min(maxStep, diff))));
      } else {
        const p2Move =
          (keys.has('arrowup') || tch.p2Up ? -1 : 0) + (keys.has('arrowdown') || tch.p2Down ? 1 : 0);
        g.p2Y = Math.max(0, Math.min(H - PADDLE_H, g.p2Y + p2Move * PADDLE_SPEED * dt));
      }

      const crazy = variantRef.current === 'crazy';

      // Crazy countdown
      if (crazy) {
        timeRef.current -= dt;
        if (timeRef.current <= 0) {
          timeRef.current = 0;
          const w = g.s1 === g.s2 ? 'draw' : g.s1 > g.s2 ? 1 : 2;
          setWinner(w);
          setStatus('over');
          if (!reportedRef.current) {
            reportedRef.current = true;
            onGameEnd?.(w);
          }
          return;
        }
      }

      // Crazy: one fresh ball fires in from a side boundary every few seconds
      if (crazy) {
        if (spawnTimerRef.current == null) spawnTimerRef.current = SPAWN_EVERY;
        spawnTimerRef.current -= dt;
        if (spawnTimerRef.current <= 0) {
          spawnTimerRef.current = SPAWN_EVERY;
          spawnSide();
        }
      }

      const bounceP1 = (b) => {
        const offset = (b.y - (g.p1Y + PADDLE_H / 2)) / (PADDLE_H / 2);
        const speed = Math.min(Math.hypot(b.vx, b.vy) * 1.05, MAX_SPEED);
        const ang = Math.max(-1.1, Math.min(1.1, offset * 0.9));
        b.vx = Math.abs(Math.cos(ang)) * speed;
        b.vy = Math.sin(ang) * speed;
        b.x = 20 + PADDLE_W + BALL_R;
      };

      const bounceP2 = (b) => {
        const offset = (b.y - (g.p2Y + PADDLE_H / 2)) / (PADDLE_H / 2);
        const speed = Math.min(Math.hypot(b.vx, b.vy) * 1.05, MAX_SPEED);
        const ang = Math.max(-1.1, Math.min(1.1, offset * 0.9));
        b.vx = -Math.abs(Math.cos(ang)) * speed;
        b.vy = Math.sin(ang) * speed;
        b.x = W - 20 - PADDLE_W - BALL_R;
      };

      // Split one ball into two (classic never splits: single ball rules)
      const splitBall = (b) => {
        const speed = Math.hypot(b.vx, b.vy);
        const base = Math.atan2(b.vy, b.vx);
        return [0.5, -0.5].map((da) => {
          const a = base + da;
          return {
            x: b.x,
            y: b.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            hits: 0,
            id: g.nextId++,
          };
        });
      };

      // Crazy only: every paddle hit splits into two.
      // Generous safety cap only: balls never vanish, extras just bounce on.
      let growth = 0;
      const registerHit = (b, next) => {
        b.hits += 1;
        if (b.hits < SPLIT_HITS) {
          next.push(b);
          return;
        }
        if (g.balls.length + growth + 1 <= MAX_BALLS) {
          growth += 1;
          next.push(...splitBall(b));
        } else {
          b.hits = 0;
          next.push(b);
        }
      };

      const score = (side) => {
        if (side === 1) g.s1 += 1;
        else g.s2 += 1;
        setScores({ 1: g.s1, 2: g.s2 });
        if (!crazy) {
          if (g.s2 >= WIN_SCORE) {
            setWinner(2);
            setStatus('over');
            if (!reportedRef.current) {
              reportedRef.current = true;
              onGameEnd?.(2);
            }
          } else if (g.s1 >= WIN_SCORE) {
            setWinner(1);
            setStatus('over');
            if (!reportedRef.current) {
              reportedRef.current = true;
              onGameEnd?.(1);
            }
          } else {
            serve(side === 2 ? 1 : -1);
          }
        }
      };

      // Balls (swept paddle check: no tunnelling even at max speed)
      const next = [];
      for (const b of g.balls) {
        const px = b.x;
        const py = b.y;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.y - BALL_R < 0) { b.y = BALL_R; b.vy = Math.abs(b.vy); }
        if (b.y + BALL_R > H) { b.y = H - BALL_R; b.vy = -Math.abs(b.vy); }

        // Interpolated height when crossing the paddle face plane
        const yAt = (xPlane) => {
          const dx = b.x - px;
          if (Math.abs(dx) < 1e-6) return b.y;
          return py + ((b.y - py) * (xPlane - px)) / dx;
        };

        // Paddle collisions: crazy splits on every hit
        if (b.vx < 0 && px > 20 && b.x <= 20 + PADDLE_W + BALL_R) {
          const yc = yAt(20 + PADDLE_W + BALL_R);
          if (yc >= g.p1Y - BALL_R && yc <= g.p1Y + PADDLE_H + BALL_R) {
            bounceP1(b);
            if (crazy) registerHit(b, next);
            else next.push(b);
            continue;
          }
        }
        if (b.vx > 0 && px < W - 20 && b.x >= W - 20 - PADDLE_W - BALL_R) {
          const yc = yAt(W - 20 - PADDLE_W - BALL_R);
          if (yc >= g.p2Y - BALL_R && yc <= g.p2Y + PADDLE_H + BALL_R) {
            bounceP2(b);
            if (crazy) registerHit(b, next);
            else next.push(b);
            continue;
          }
        }

        // Scoring
        if (b.x < -BALL_R * 2) {
          score(2);
          continue;
        }
        if (b.x > W + BALL_R * 2) {
          score(1);
          continue;
        }
        next.push(b);
      }
      g.balls = next;
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [serve, spawnSide]);

  // Render
  useEffect(() => {
    let raf = 0;
    const draw = (t = 0) => {
      raf = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const g = gameRef.current;
      const st = statusRef.current;
      const dark = themeRef.current === 'dark';
      const pal = dark
        ? { field: '#101013', line: 'rgba(255,255,255,0.16)', ink: '#f5f5f7', score: 'rgba(255,255,255,0.25)', dim: 'rgba(0,0,0,0.5)', danger: '#ff6961' }
        : { field: '#ffffff', line: 'rgba(0,0,0,0.12)', ink: '#1d1d1f', score: 'rgba(0,0,0,0.22)', dim: 'rgba(255,255,255,0.45)', danger: '#c70000' };

      ctx.fillStyle = pal.field;
      ctx.fillRect(0, 0, W, H);

      // Center line
      ctx.strokeStyle = pal.line;
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 12]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      const drawPaddle = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, PADDLE_W, PADDLE_H, 6);
        ctx.fill();
      };
      drawPaddle(20, g.p1Y, pal.ink);
      drawPaddle(W - 20 - PADDLE_W, g.p2Y, pal.ink);

      // Balls (every paddle hit splits, so no rings needed)
      for (const b of g.balls) {
        ctx.fillStyle = pal.ink;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scores
      ctx.fillStyle = pal.score;
      ctx.font = 'bold 64px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(g.s1), W / 2 - 70, 80);
      ctx.fillText(String(g.s2), W / 2 + 70, 80);

      // Crazy countdown + progress bar (bottom centre, clear of the scores)
      if (variantRef.current === 'crazy' && (st === 'playing' || st === 'paused')) {
        const left = Math.max(0, timeRef.current);
        const urgent = left <= 10;
        ctx.globalAlpha = urgent ? 0.55 + 0.45 * Math.sin(t / 130) : 1;
        const bw = 200;
        ctx.fillStyle = pal.line;
        ctx.fillRect(W / 2 - bw / 2, H - 38, bw, 4);
        ctx.fillStyle = urgent ? pal.danger : pal.score;
        ctx.fillRect(W / 2 - bw / 2, H - 38, bw * (left / totalRef.current), 4);
        ctx.fillStyle = urgent ? pal.danger : pal.score;
        ctx.font = 'bold 26px ui-monospace, "SF Mono", Menlo, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(fmtTime(left), W / 2, H - 12);
        ctx.globalAlpha = 1;
      }

      if (st === 'ready' || st === 'over' || st === 'paused') {
        ctx.fillStyle = pal.dim;
        ctx.fillRect(0, 0, W, H);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Crazy timer readout (DOM updates ~4x/sec, physics stays on canvas)
  useEffect(() => {
    if (variant !== 'crazy') return;
    const id = setInterval(() => {
      if (statusRef.current === 'playing') setTimeLeft(Math.max(0, timeRef.current));
    }, 250);
    return () => clearInterval(id);
  }, [variant]);

  // Ready screen acts as setup: pick without starting.
  // Anywhere else, picking jumps straight into a new match.
  const selectVariant = (v) => {
    variantRef.current = v;
    setVariant(v);
    if (statusRef.current !== 'ready') startMatch(v);
  };

  const selectDuration = (s) => {
    durationRef.current = s;
    setDuration(s);
    if (statusRef.current !== 'ready') startMatch(undefined, s);
  };

  const bindHold = (key) => ({    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      touchRef.current[key] = true;
    },
    onPointerUp: () => { touchRef.current[key] = false; },
    onPointerCancel: () => { touchRef.current[key] = false; },
    onPointerLeave: () => { touchRef.current[key] = false; },
    onContextMenu: (e) => e.preventDefault(),
  });

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container pong-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><ArtPong size={20} /></span>
            {t('pongTitle')}
          </h1>
          <div className="game-status">
            <span className="status-item pong-score">
              {label(1)} <strong>{scores[1]}</strong> : <strong>{scores[2]}</strong> {label(2)}
            </span>
            {variant === 'crazy' && (
              <span className="status-item current-player pong-timer">{fmtTime(timeLeft)}</span>
            )}
          </div>
        </div>

        {(status === 'ready' || status === 'over') && (
          <div className="variant-row">
            <div className="count-seg">
              <button
                className={`seg-btn ${variant === 'classic' ? 'selected' : ''}`}
                onClick={() => selectVariant('classic')}
              >
                {t('classicMode')}
              </button>
              <button
                className={`seg-btn ${variant === 'crazy' ? 'selected' : ''}`}
                onClick={() => selectVariant('crazy')}
              >
                {t('crazyMode')}
              </button>
            </div>
          </div>
        )}

        {variant === 'crazy' && (status === 'ready' || status === 'over') && (
          <div className="variant-row">
            <div className="count-seg">
              {CRAZY_TIMES.map((s) => (
                <button
                  key={s}
                  className={`seg-btn ${duration === s ? 'selected' : ''}`}
                  onClick={() => selectDuration(s)}
                >
                  {s / 60} {t('minutes')}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pong-wrap">
          <canvas ref={canvasRef} width={W} height={H} className="pong-canvas" aria-label={t('pongTitle')} />
          {status === 'ready' && (
            <div className="pong-overlay">
              <div className="modal-medal"><ArtPong size={28} /></div>
              <p>{t('pongTitle')}</p>
              <button className="btn btn-primary" onClick={() => startMatch()}>
                <PlayIcon size={15} /> {t('startGame')}
              </button>
            </div>
          )}
          {status === 'paused' && (
            <div className="pong-overlay">
              <div className="modal-medal"><PauseIcon size={26} /></div>
              <p>{t('pause')}</p>
              <button className="btn btn-primary" onClick={() => setStatus('playing')}>
                <PlayIcon size={15} /> {t('resume')}
              </button>
            </div>
          )}
          {status === 'over' && !hideEndModal && (
            <div className="pong-overlay">
              {winner === 'draw' ? (
                <div className="modal-medal draw"><DrawIcon size={28} /></div>
              ) : (
                <div className="modal-medal solid"><TrophyIcon size={28} /></div>
              )}
              {variant === 'crazy' && <p className="over-sub">{t('timeUp')}</p>}
              <p>{winner === 'draw' ? t('draw') : <>{label(winner)} {t('wins')}</>}</p>
              <p className="over-score">{scores[1]} : {scores[2]}</p>
              <button className="btn btn-primary" onClick={() => startMatch()}>
                <RestartIcon size={16} /> {t('playAgain')}
              </button>
            </div>
          )}
        </div>

        {variant === 'crazy' && (
          <p className="crazy-hint">{t('crazyHint')}</p>
        )}

        <div className="pong-controls-hint">
          <span><kbd>W</kbd>/<kbd>S</kbd> {label(1)}</span>
          {!isSolo && (
            <span><kbd>↑</kbd>/<kbd>↓</kbd> {label(2)}</span>
          )}
          <span><kbd>Space</kbd> {t('pause')}</span>
        </div>

        <div className="pong-touch">
          <div className="pong-touch-group">
            <span>{label(1)}</span>
            <div>
              <button type="button" aria-label="up" {...bindHold('p1Up')}><ChevUpIcon size={20} /></button>
              <button type="button" aria-label="down" {...bindHold('p1Down')}><ChevDownIcon size={20} /></button>
            </div>
          </div>
          {!isSolo && (
            <div className="pong-touch-group">
              <span>{label(2)}</span>
              <div>
                <button type="button" aria-label="up" {...bindHold('p2Up')}><ChevUpIcon size={20} /></button>
                <button type="button" aria-label="down" {...bindHold('p2Down')}><ChevDownIcon size={20} /></button>
              </div>
            </div>
          )}
        </div>

        <div className="game-controls">
          {status === 'playing' && (
            <button className="btn btn-primary" onClick={() => setStatus('paused')}>
              <PauseIcon size={15} /> {t('pause')}
            </button>
          )}
          {status === 'paused' && (
            <button className="btn btn-primary" onClick={() => setStatus('playing')}>
              <PlayIcon size={15} /> {t('resume')}
            </button>
          )}
          {(status === 'playing' || status === 'paused' || status === 'over') && (
            <button className="btn btn-secondary" onClick={() => startMatch()}>
              <RestartIcon size={16} /> {t('restart')}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onBack}>
            <HomeIcon size={16} /> {t('backToMenu')}
          </button>
        </div>
      </div>
    </Layout>
  );
}