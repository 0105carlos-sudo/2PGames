import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtSos, TrophyIcon, DrawIcon, RestartIcon, HomeIcon } from '../components/icons';
import './Sos.css';

const N = 6;
const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const inB = (r, c) => r >= 0 && r < N && c >= 0 && c < N;

// count new SOS lines created by placing letter at (r,c)
function countSos(g, r, c) {
  let n = 0;
  const at = (rr, cc) => (inB(rr, cc) ? g[rr * N + cc] : null);
  for (const [dr, dc] of DIRS) {
    const line = [at(r - 2 * dr, c - 2 * dc), at(r - dr, c - dc), at(r, c)];
    if (line.join('') === 'SOS') n++;
    const line2 = [at(r - dr, c - dc), at(r, c), at(r + dr, c + dc)];
    if (line2.join('') === 'SOS') n++;
    const line3 = [at(r, c), at(r + dr, c + dc), at(r + 2 * dr, c + 2 * dc)];
    if (line3.join('') === 'SOS') n++;
  }
  return n;
}

export default function Sos({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [grid, setGrid] = useState(Array(N * N).fill(null));
  const [letter, setLetter] = useState('S');
  const [turn, setTurn] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);
  const aiBusy = useRef(false);

  const end = (s) => {
    const w = s[1] === s[2] ? 'draw' : s[1] > s[2] ? 1 : 2;
    setWinner(w); setShowModal(true);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const place = (p, i, L, g, s) => {
    const ng = [...g]; ng[i] = L;
    const k = countSos(ng, Math.floor(i / N), i % N);
    const ns = { ...s, [p]: s[p] + k };
    setGrid(ng); setScores(ns);
    if (ng.every(Boolean)) end(ns);
    else if (k === 0) { setTurn(p === 1 ? 2 : 1); setLetter('S'); }
  };

  const click = (i) => {
    if (winner || grid[i] || (isSolo && turn === 2) || aiBusy.current) return;
    place(turn, i, letter, grid, scores);
  };

  useEffect(() => {
    if (!isSolo || turn !== 2 || winner) { aiBusy.current = false; return; }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      const empty = [];
      for (let i = 0; i < N * N; i++) if (!grid[i]) empty.push(i);
      if (!empty.length) return;
      // take immediate SOS if available
      for (const i of empty) {
        for (const L of ['S', 'O']) {
          const ng = [...grid]; ng[i] = L;
          if (countSos(ng, Math.floor(i / N), i % N) > 0) { place(2, i, L, grid, scores); return; }
        }
      }
      const i = empty[Math.floor(Math.random() * empty.length)];
      place(2, i, Math.random() < 0.6 ? 'S' : 'O', grid, scores);
    }, 600);
    return () => clearTimeout(id);
  });

  const restart = () => {
    setGrid(Array(N * N).fill(null)); setLetter('S'); setTurn(1);
    setScores({ 1: 0, 2: 0 }); setWinner(null); setShowModal(false); reported.current = false;
  };

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtSos size={20} /></span>{t('sosTitle')}</h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">{label(turn)} · {scores[1]} : {scores[2]}</span>
            ) : winner === 'draw' ? (
              <span className="winner-badge draw"><DrawIcon size={16} /> {t('draw')}</span>
            ) : (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            )}
          </div>
        </div>

        {(!winner && !(isSolo && turn === 2)) && (
          <div className="sos-picker">
            {['S', 'O'].map((L) => (
              <button key={L} className={`sos-pick ${letter === L ? 'on' : ''}`} onClick={() => setLetter(L)}>{L}</button>
            ))}
          </div>
        )}

        <div className="board-container">
          <div className="sos-board" role="grid" aria-label={t('sosTitle')}>
            {grid.map((v, i) => (
              <button key={i} className={`sos-cell ${v ? 'filled' : ''}`} onClick={() => click(i)} disabled={!!v || !!winner}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="game-controls">
          <button className="btn btn-primary" onClick={restart}><RestartIcon size={16} /> {t('restart')}</button>
          <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
        </div>

        {showModal && !hideEndModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              {winner === 'draw' ? (
                <><div className="modal-medal draw"><DrawIcon size={28} /></div><h2>{t('draw')}</h2><p>{scores[1]} : {scores[2]}</p></>
              ) : (
                <><div className="modal-medal solid"><TrophyIcon size={28} /></div><h2>{t('congratulations')}</h2><p>{label(winner)} {t('wins')}（{scores[1]} : {scores[2]}）</p></>
              )}
              <div className="modal-buttons">
                <button className="btn btn-primary" onClick={restart}><RestartIcon size={16} /> {t('restart')}</button>
                <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
