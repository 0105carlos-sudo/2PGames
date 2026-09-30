import { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  ArtDotsBoxes,
  TrophyIcon,
  DrawIcon,
  RestartIcon,
  HomeIcon,
} from '../components/icons';
import './DotsBoxes.css';

const DOTS = 5; // 5x5 dots -> 4x4 boxes
const BOX_COUNT = (DOTS - 1) * (DOTS - 1);

const emptyEdges = () => ({
  h: Array.from({ length: DOTS }, () => Array(DOTS - 1).fill(0)),
  v: Array.from({ length: DOTS - 1 }, () => Array(DOTS).fill(0)),
});

const boxDone = (br, bc, h, v) =>
  h[br][bc] !== 0 && h[br + 1][bc] !== 0 && v[br][bc] !== 0 && v[br][bc + 1] !== 0;

export default function DotsBoxes({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));
  const [edges, setEdges] = useState(emptyEdges);
  const [boxes, setBoxes] = useState(() =>
    Array.from({ length: DOTS - 1 }, () => Array(DOTS - 1).fill(0))
  );
  const [current, setCurrent] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const aiBusy = useRef(false);

  const scores = useMemo(() => {
    let s1 = 0, s2 = 0;
    for (const row of boxes) {
      for (const b of row) {
        if (b === 1) s1++;
        else if (b === 2) s2++;
      }
    }
    return { 1: s1, 2: s2 };
  }, [boxes]);

  const winner = !gameOver ? null : scores[1] === scores[2] ? 'draw' : scores[1] > scores[2] ? 1 : 2;

  const claim = (type, r, c) => {
    if (aiBusy.current || gameOver) return;
    if (type === 'h' && edges.h[r][c] !== 0) return;
    if (type === 'v' && edges.v[r][c] !== 0) return;

    const nh = edges.h.map((row) => row.slice());
    const nv = edges.v.map((row) => row.slice());
    if (type === 'h') nh[r][c] = current;
    else nv[r][c] = current;

    // Adjacent boxes that could be completed by this edge
    let candidates = [];
    if (type === 'h') {
      if (r > 0) candidates.push([r - 1, c]);
      if (r < DOTS - 1) candidates.push([r, c]);
    } else {
      if (c > 0) candidates.push([r, c - 1]);
      if (c < DOTS) candidates.push([r, c]);
    }

    const nb = boxes.map((row) => row.slice());
    let completed = 0;
    for (const [br, bc] of candidates) {
      if (nb[br][bc] === 0 && boxDone(br, bc, nh, nv)) {
        nb[br][bc] = current;
        completed++;
      }
    }

    setEdges({ h: nh, v: nv });
    setBoxes(nb);

    const filled = nb.flat().filter(Boolean).length;
    if (filled >= BOX_COUNT) {
      setGameOver(true);
      setShowModal(true);
      let s1 = 0;
      let s2 = 0;
      for (const row of nb) {
        for (const b of row) {
          if (b === 1) s1++;
          else if (b === 2) s2++;
        }
      }
      onGameEnd?.(s1 === s2 ? 'draw' : s1 > s2 ? 1 : 2);
    } else if (completed === 0) {
      setCurrent(current === 1 ? 2 : 1);
    }
    // completed > 0: same player continues
  };

  const restart = () => {
    setEdges(emptyEdges());
    setBoxes(Array.from({ length: DOTS - 1 }, () => Array(DOTS - 1).fill(0)));
    setCurrent(1);
    setGameOver(false);
    setShowModal(false);
  };

  // Solo: computer takes boxes when possible, otherwise plays safe edges
  const edgeMoves = () => {
    const ms = [];
    edges.h.forEach((row, r) => row.forEach((v, c) => { if (!v) ms.push({ type: 'h', r, c }); }));
    edges.v.forEach((row, r) => row.forEach((v, c) => { if (!v) ms.push({ type: 'v', r, c }); }));
    return ms;
  };

  const adjacentBoxes = (m) => {
    const list = [];
    if (m.type === 'h') {
      if (m.r > 0) list.push([m.r - 1, m.c]);
      if (m.r < DOTS - 1) list.push([m.r, m.c]);
    } else {
      if (m.c > 0) list.push([m.r, m.c - 1]);
      if (m.c < DOTS) list.push([m.r, m.c]);
    }
    return list;
  };

  const withMove = (m) => {
    const nh = edges.h.map((row) => row.slice());
    const nv = edges.v.map((row) => row.slice());
    if (m.type === 'h') nh[m.r][m.c] = 2;
    else nv[m.r][m.c] = 2;
    return [nh, nv];
  };

  const completesCount = (m) => {
    const [nh, nv] = withMove(m);
    return adjacentBoxes(m).filter(([br, bc]) => boxes[br][bc] === 0 && boxDone(br, bc, nh, nv)).length;
  };

  const dangerCount = (m) => {
    const [nh, nv] = withMove(m);
    const sides = (br, bc) =>
      (nh[br][bc] ? 1 : 0) + (nh[br + 1][bc] ? 1 : 0) + (nv[br][bc] ? 1 : 0) + (nv[br][bc + 1] ? 1 : 0);
    return adjacentBoxes(m).filter(([br, bc]) => boxes[br][bc] === 0 && sides(br, bc) === 3).length;
  };

  useEffect(() => {
    if (!isSolo || current !== 2 || gameOver) {
      if (!gameOver) aiBusy.current = false;
      return;
    }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      const ms = edgeMoves();
      if (!ms.length) return;
      const takes = ms.filter((m) => completesCount(m) > 0);
      let pick;
      if (takes.length) {
        pick = takes[Math.floor(Math.random() * takes.length)];
      } else {
        let best = Infinity;
        let pool = [];
        for (const m of ms) {
          const d = dangerCount(m);
          if (d < best) {
            best = d;
            pool = [m];
          } else if (d === best) {
            pool.push(m);
          }
        }
        pick = pool[Math.floor(Math.random() * pool.length)];
      }
      claim(pick.type, pick.r, pick.c);
    }, 700);
    return () => clearTimeout(id);
  });

  const size = 2 * DOTS - 1;
  const cells = [];
  for (let gr = 0; gr < size; gr++) {
    for (let gc = 0; gc < size; gc++) {
      const rEven = gr % 2 === 0;
      const cEven = gc % 2 === 0;
      const key = `${gr}-${gc}`;
      if (rEven && cEven) {
        cells.push(
          <div key={key} className="db-cell db-dot-cell" aria-hidden="true">
            <span className="db-dot"></span>
          </div>
        );
      } else if (rEven && !cEven) {
        const r = gr / 2, c = (gc - 1) / 2;
        const owner = edges.h[r][c];
        cells.push(
          <button
            key={key}
            type="button"
            className={`db-cell db-edge db-h ${owner ? `claimed p${owner}` : ''}`}
            onClick={() => claim('h', r, c)}
            disabled={owner !== 0 || gameOver}
            aria-label={`h ${r},${c}`}
          >
            <span className="bar"></span>
          </button>
        );
      } else if (!rEven && cEven) {
        const r = (gr - 1) / 2, c = gc / 2;
        const owner = edges.v[r][c];
        cells.push(
          <button
            key={key}
            type="button"
            className={`db-cell db-edge db-v ${owner ? `claimed p${owner}` : ''}`}
            onClick={() => claim('v', r, c)}
            disabled={owner !== 0 || gameOver}
            aria-label={`v ${r},${c}`}
          >
            <span className="bar"></span>
          </button>
        );
      } else {
        const br = (gr - 1) / 2, bc = (gc - 1) / 2;
        const owner = boxes[br][bc];
        cells.push(
          <div key={key} className={`db-cell db-box ${owner ? `p${owner}` : ''}`} aria-hidden="true">
            {owner ? <span>P{owner}</span> : null}
          </div>
        );
      }
    }
  }

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><ArtDotsBoxes size={20} /></span>
            {t('dbTitle')}
          </h1>
          <div className="game-status">
            {!gameOver ? (
              <span className="status-item current-player">
                {t('currentPlayer')}: {label(current)}
              </span>
            ) : winner === 'draw' ? (
              <span className="winner-badge draw">
                <DrawIcon size={16} /> {t('draw')}
              </span>
            ) : (
              <span className="winner-badge">
                <TrophyIcon size={16} /> {t('winner')}: {label(winner)}
              </span>
            )}
          </div>
        </div>

        <div className="db-scoreboard">
          <div className={`db-score p1 ${current === 1 && !gameOver ? 'active' : ''} ${winner === 1 ? 'winner' : ''}`}>
            <span className="db-score-name">{label(1)}</span>
            <span className="db-score-num">{scores[1]}</span>
          </div>
          <div className="vs-divider">VS</div>
          <div className={`db-score p2 ${current === 2 && !gameOver ? 'active' : ''} ${winner === 2 ? 'winner' : ''}`}>
            <span className="db-score-name">{label(2)}</span>
            <span className="db-score-num">{scores[2]}</span>
          </div>
        </div>

        <div className="board-container">
          <div
            className="db-board"
            role="grid"
            aria-label={t('dbTitle')}
            style={{ gridTemplateColumns: `repeat(${size}, var(--dbcell))` }}
          >
            {cells}
          </div>
        </div>

        <div className="game-controls">
          <button className="btn btn-primary" onClick={restart}>
            <RestartIcon size={16} /> {t('restart')}
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            <HomeIcon size={16} /> {t('backToMenu')}
          </button>
        </div>

        {showModal && !hideEndModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              {winner === 'draw' ? (
                <>
                  <div className="modal-medal draw"><DrawIcon size={28} /></div>
                  <h2>{t('draw')}</h2>
                  <p>{scores[1]} : {scores[2]}</p>
                </>
              ) : (
                <>
                  <div className="modal-medal solid"><TrophyIcon size={28} /></div>
                  <h2>{t('congratulations')}</h2>
                  <p>{label(winner)} {t('wins')}（{scores[1]} : {scores[2]}）</p>
                </>
              )}
              <div className="modal-buttons">
                <button className="btn btn-primary" onClick={restart}>
                  <RestartIcon size={16} /> {t('restart')}
                </button>
                <button className="btn btn-secondary" onClick={onBack}>
                  <HomeIcon size={16} /> {t('backToMenu')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}