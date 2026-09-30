import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtSnake, TrophyIcon, DrawIcon, RestartIcon, HomeIcon, PlayIcon, ChevUpIcon, ChevDownIcon } from '../components/icons';
import './Snake.css';

const GRID = 20;
const SIZE = 400;
const CELL = SIZE / GRID;
const SOLO_TARGET = 12;

const rndFood = (snake) => {
  const taken = new Set(snake.map(([x, y]) => y * GRID + x));
  const open = [];
  for (let i = 0; i < GRID * GRID; i++) if (!taken.has(i)) open.push(i);
  const i = open[Math.floor(Math.random() * open.length)];
  return [i % GRID, Math.floor(i / GRID)];
};

export default function Snake({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [phase, setPhase] = useState('ready'); // ready | play | between | over
  const [player, setPlayer] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [score, setScore] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);
  const canvasRef = useRef(null);
  const g = useRef({ snake: [], dir: [1, 0], next: [1, 0], food: [5, 5], alive: false });

  const end = (w) => {
    setPhase('over'); setWinner(w); setShowModal(true);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const die = () => {
    g.current.alive = false;
    const s = score;
    const ns = { ...scores, [player]: s };
    setScores(ns);
    if (!isSolo && player === 1) {
      setPhase('between');
    } else if (isSolo) {
      end(s >= SOLO_TARGET ? 1 : 2);
    } else {
      end(ns[1] === ns[2] ? 'draw' : ns[1] > ns[2] ? 1 : 2);
    }
  };

  const begin = (p) => {
    const cx = Math.floor(GRID / 2), cy = Math.floor(GRID / 2);
    const snake = [[cx, cy], [cx - 1, cy], [cx - 2, cy]];
    g.current = { snake, dir: [1, 0], next: [1, 0], food: rndFood(snake), alive: true };
    setPlayer(p); setScore(0); setPhase('play');
    draw();
  };

  const start = () => {
    reported.current = false;
    setScores({ 1: 0, 2: 0 }); setWinner(null); setShowModal(false);
    begin(1);
  };

  // game tick
  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => {
      const st = g.current;
      if (!st.alive) return;
      st.dir = st.next;
      const [hx, hy] = st.snake[0];
      const nx = hx + st.dir[0], ny = hy + st.dir[1];
      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID || st.snake.some(([x, y]) => x === nx && y === ny)) { die(); return; }
      st.snake.unshift([nx, ny]);
      if (nx === st.food[0] && ny === st.food[1]) {
        setScore((s) => s + 1);
        st.food = rndFood(st.snake);
      } else {
        st.snake.pop();
      }
      draw();
    }, 130);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, player, score]);

  const draw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const st = g.current;
    ctx.fillStyle = '#101013';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(st.food[0] * CELL + CELL / 2, st.food[1] * CELL + CELL / 2, CELL * 0.38, 0, Math.PI * 2);
    ctx.fill();
    st.snake.forEach(([x, y], i) => {
      ctx.fillStyle = i === 0 ? '#34c759' : '#248a3d';
      ctx.beginPath();
      ctx.roundRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 5);
      ctx.fill();
    });
  };

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const d = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] }[k];
      if (!d) return;
      e.preventDefault();
      const [dx, dy] = g.current.dir;
      if (d[0] !== -dx || d[1] !== -dy) g.current.next = d;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const steer = (dx, dy) => {
    const [cx, cy] = g.current.dir;
    if (dx !== -cx || dy !== -cy) g.current.next = [dx, dy];
  };

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtSnake size={20} /></span>{t('snakeTitle')}</h1>
          <div className="game-status">
            {phase === 'over' ? (
              winner === 'draw'
                ? <span className="winner-badge draw"><DrawIcon size={16} /> {t('draw')}</span>
                : <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            ) : (
              <span className="status-item current-player">
                {phase === 'play' ? `${label(player)} · 🍎${score}` : t('snakeReady')}
                {!isSolo && (phase === 'play' || phase === 'between') && ` · ${scores[1]} : ${scores[2]}`}
                {isSolo && phase === 'play' && ` · 🎯${SOLO_TARGET}`}
              </span>
            )}
          </div>
        </div>

        <div className="sn-wrap">
          <canvas ref={canvasRef} width={SIZE} height={SIZE} className="sn-canvas" />
          {phase === 'ready' && (
            <div className="pong-overlay">
              <p>{t('snakeTitle')}</p>
              <button className="btn btn-primary" onClick={start}><PlayIcon size={15} /> {t('startGame')}</button>
            </div>
          )}
          {phase === 'between' && (
            <div className="pong-overlay">
              <p>{label(1)}: {scores[1]} 🍎</p>
              <button className="btn btn-primary" onClick={() => begin(2)}><PlayIcon size={15} /> {label(2)} Go!</button>
            </div>
          )}
        </div>

        {phase === 'play' && (
          <div className="sn-pad">
            <button onClick={() => steer(0, -1)} aria-label="up"><ChevUpIcon size={22} /></button>
            <div>
              <button onClick={() => steer(-1, 0)} aria-label="left" style={{ transform: 'rotate(-90deg)' }}><ChevUpIcon size={22} /></button>
              <button onClick={() => steer(0, 1)} aria-label="down" style={{ transform: 'rotate(180deg)' }}><ChevUpIcon size={22} /></button>
              <button onClick={() => steer(1, 0)} aria-label="right" style={{ transform: 'rotate(90deg)' }}><ChevUpIcon size={22} /></button>
            </div>
            <button onClick={() => steer(0, 1)} aria-label="down"><ChevDownIcon size={22} /></button>
          </div>
        )}

        <div className="game-controls">
          {(phase === 'ready' || phase === 'over') && (
            <button className="btn btn-primary" onClick={start}><PlayIcon size={15} /> {t('startGame')}</button>
          )}
          <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
        </div>

        {showModal && !hideEndModal && phase === 'over' && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              {winner === 'draw' ? (
                <><div className="modal-medal draw"><DrawIcon size={28} /></div><h2>{t('draw')}</h2><p>{scores[1]} : {scores[2]}</p></>
              ) : (
                <><div className="modal-medal solid"><TrophyIcon size={28} /></div><h2>{t('congratulations')}</h2><p>{label(winner)} {t('wins')}（{scores[1]} : {scores[2]}）</p></>
              )}
              <div className="modal-buttons">
                <button className="btn btn-primary" onClick={() => { setShowModal(false); start(); }}><RestartIcon size={16} /> {t('restart')}</button>
                <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
