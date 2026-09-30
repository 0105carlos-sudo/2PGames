import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtBattle, TrophyIcon, RestartIcon, HomeIcon } from '../components/icons';
import './Battleship.css';

const N = 6;
const SHIP_LENS = [3, 2, 2];

function placeShips() {
  const taken = new Set();
  const ships = [];
  for (const len of SHIP_LENS) {
    let ok = false, guard = 0;
    while (!ok && guard++ < 600) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * N), c = Math.floor(Math.random() * N);
      const cells = [];
      for (let k = 0; k < len; k++) {
        const rr = horiz ? r : r + k, cc = horiz ? c + k : c;
        if (rr >= N || cc >= N) break;
        cells.push(rr * N + cc);
      }
      if (cells.length !== len || cells.some((i) => taken.has(i))) continue;
      cells.forEach((i) => taken.add(i));
      ships.push(cells); ok = true;
    }
  }
  return ships;
}

export default function Battleship({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [fleets, setFleets] = useState(() => ({ 1: placeShips(), 2: placeShips() }));
  const [shots, setShots] = useState({ 1: {}, 2: {} });
  const [turn, setTurn] = useState(1);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lastShot, setLastShot] = useState(null);
  const reported = useRef(false);
  const aiBusy = useRef(false);

  const end = (w) => {
    setWinner(w); setShowModal(true);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const sunkCount = (ships, s) => ships.filter((sh) => sh.every((i) => s[i] === 'hit')).length;
  const allSunk = (ships, s) => ships.every((sh) => sh.every((i) => s[i] === 'hit'));

  const fire = (p, i) => {
    if (winner || shots[p][i]) return;
    const foe = p === 1 ? 2 : 1;
    const cells = new Set(fleets[foe].flat());
    const ns = { ...shots, [p]: { ...shots[p], [i]: cells.has(i) ? 'hit' : 'miss' } };
    setShots(ns);
    setLastShot({ p, i, hit: cells.has(i) });
    if (allSunk(fleets[foe], ns[p])) end(p);
    else setTurn(foe);
  };

  const click = (i) => {
    if (winner || isSolo || myShots[i]) return;
    fire(turn, i);
  };

  const soloClick = (i) => {
    if (winner || aiBusy.current || turn !== 1 || shots[1][i]) return;
    fire(1, i);
  };

  useEffect(() => {
    if (!isSolo || turn !== 2 || winner) { aiBusy.current = false; return; }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      // hunt: prefer neighbours of hits
      const s = shots[2];
      const cand = [];
      for (const k of Object.keys(s)) {
        if (s[k] !== 'hit') continue;
        const i = +k, r = Math.floor(i / N), c = i % N;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
          const rr = r + dr, cc = c + dc;
          if (rr >= 0 && rr < N && cc >= 0 && cc < N) {
            const j = rr * N + cc;
            if (!s[j]) cand.push(j);
          }
        });
      }
      let i;
      if (cand.length) i = cand[Math.floor(Math.random() * cand.length)];
      else {
        const open = [];
        for (let j = 0; j < N * N; j++) if (!s[j]) open.push(j);
        i = open[Math.floor(Math.random() * open.length)];
      }
      if (i !== undefined) fire(2, i);
    }, 700);
    return () => clearTimeout(id);
  });

  const restart = () => {
    setFleets({ 1: placeShips(), 2: placeShips() });
    setShots({ 1: {}, 2: {} }); setTurn(1); setWinner(null);
    setShowModal(false); setLastShot(null); reported.current = false;
  };

  const me = isSolo ? 1 : turn;
  const foe = me === 1 ? 2 : 1;
  const myShots = shots[me];
  const foeShots = shots[foe];
  const myFleet = new Set(fleets[me].flat());

  const cellCls = (i, board) => {
    if (board === 'target') {
      if (myShots[i] === 'hit') return 'hit';
      if (myShots[i] === 'miss') return 'miss';
      return 'fog';
    }
    if (foeShots[i] === 'hit') return 'hit';
    if (foeShots[i] === 'miss') return 'miss';
    return myFleet.has(i) ? 'ship' : 'sea';
  };

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtBattle size={20} /></span>{t('battleTitle')}</h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">
                {t('currentPlayer')}: {label(isSolo ? 1 : turn)}
                {lastShot && <em> · {lastShot.hit ? '🔥' : '💧'}</em>}
              </span>
            ) : (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            )}
          </div>
        </div>

        <div className="bs-wrap">
          <div className="bs-panel">
            <h3>🎯 {isSolo ? t('battleEnemy') : `${label(turn)} → ${label(turn === 1 ? 2 : 1)}`} ({sunkCount(fleets[foe], myShots)}/{fleets[foe].length})</h3>
            <div className="bs-board" role="grid">
              {Array.from({ length: N * N }).map((_, i) => (
                <button
                  key={i}
                  className={`bs-cell ${cellCls(i, 'target')}`}
                  onClick={() => (isSolo ? soloClick(i) : click(i))}
                  disabled={!!winner || !!myShots[i] || (isSolo && turn !== 1)}
                >
                  {myShots[i] === 'hit' ? '🔥' : myShots[i] === 'miss' ? '·' : ''}
                </button>
              ))}
            </div>
          </div>
          <div className="bs-panel">
            <h3>🛡️ {t('battleFleet')} ({sunkCount(fleets[me], foeShots)}/{fleets[me].length})</h3>
            <div className="bs-board lock" role="grid">
              {Array.from({ length: N * N }).map((_, i) => (
                <span key={i} className={`bs-cell ${cellCls(i, 'own')}`}>
                  {foeShots[i] === 'hit' ? '🔥' : foeShots[i] === 'miss' ? '·' : myFleet.has(i) ? '🚢' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="game-controls">
          <button className="btn btn-primary" onClick={restart}><RestartIcon size={16} /> {t('restart')}</button>
          <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
        </div>

        {showModal && !hideEndModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-medal solid"><TrophyIcon size={28} /></div>
              <h2>{t('congratulations')}</h2>
              <p>{label(winner)} {t('wins')}</p>
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
