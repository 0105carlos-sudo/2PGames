import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtMines, TrophyIcon, DrawIcon, RestartIcon, HomeIcon } from '../components/icons';
import './Mines.css';

const N = 8;
const MINES = 10;

const adjIdx = (i) => {
  const r = Math.floor(i / N), c = i % N;
  const out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < N && cc >= 0 && cc < N) out.push(rr * N + cc);
  }
  return out;
};

function makeMines(safe) {
  const s = new Set();
  while (s.size < MINES) {
    const i = Math.floor(Math.random() * N * N);
    if (i !== safe) s.add(i);
  }
  return s;
}

function adjCount(mines, i) {
  return adjIdx(i).filter((j) => mines.has(j)).length;
}

export default function Mines({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [mines, setMines] = useState(null);
  const [revealed, setRevealed] = useState([]);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [turn, setTurn] = useState(1);
  const [winner, setWinner] = useState(null);
  const [boom, setBoom] = useState(-1);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);
  const aiBusy = useRef(false);

  const revSet = new Set(revealed);
  const total = N * N - MINES;

  const end = (w) => {
    setWinner(w); setShowModal(true);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const open = (p, i, m, rev) => {
    if (m.has(i)) { setBoom(i); end(p === 1 ? 2 : 1); return; }
    // flood fill
    const queue = [i];
    const seen = new Set(rev);
    const fresh = [];
    while (queue.length) {
      const cur = queue.pop();
      if (seen.has(cur) || m.has(cur)) continue;
      seen.add(cur); fresh.push(cur);
      if (adjCount(m, cur) === 0) for (const nb of adjIdx(cur)) if (!seen.has(nb)) queue.push(nb);
    }
    const nr = [...rev, ...fresh];
    setRevealed(nr);
    const ns = { ...scores, [p]: scores[p] + fresh.length };
    setScores(ns);
    if (nr.length >= total) {
      end(ns[1] === ns[2] ? 'draw' : ns[1] > ns[2] ? 1 : 2);
    } else {
      setTurn(p === 1 ? 2 : 1);
    }
  };

  const click = (i) => {
    if (winner || revSet.has(i) || (isSolo && turn === 2) || aiBusy.current) return;
    let m = mines;
    if (!m) { m = makeMines(i); setMines(m); }
    open(turn, i, m, revealed);
  };

  useEffect(() => {
    if (!isSolo || turn !== 2 || winner) { aiBusy.current = false; return; }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      const choices = [];
      for (let i = 0; i < N * N; i++) if (!revSet.has(i)) choices.push(i);
      if (!choices.length) return;
      const i = choices[Math.floor(Math.random() * choices.length)];
      open(2, i, mines, revealed);
    }, 650);
    return () => clearTimeout(id);
  });

  const restart = () => {
    setMines(null); setRevealed([]); setScores({ 1: 0, 2: 0 });
    setTurn(1); setWinner(null); setBoom(-1); setShowModal(false); reported.current = false;
  };

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtMines size={20} /></span>{t('minesTitle')}</h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">{t('currentPlayer')}: {label(turn)} · {scores[1]} : {scores[2]}</span>
            ) : winner === 'draw' ? (
              <span className="winner-badge draw"><DrawIcon size={16} /> {t('draw')}</span>
            ) : (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            )}
          </div>
        </div>

        <div className="board-container">
          <div className="mn-board" role="grid" aria-label={t('minesTitle')}>
            {Array.from({ length: N * N }).map((_, i) => {
              const open_ = revSet.has(i);
              const isMine = mines?.has(i);
              const n = mines ? adjCount(mines, i) : 0;
              return (
                <button
                  key={i}
                  role="gridcell"
                  className={`mn-cell ${open_ ? 'open' : ''} ${i === boom ? 'boom' : ''} ${open_ && n > 0 ? `n${n}` : ''}`}
                  onClick={() => click(i)}
                  disabled={open_ || !!winner}
                >
                  {open_ && (isMine ? '💣' : n > 0 ? n : '')}
                  {!open_ && winner && isMine ? '💣' : ''}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mn-note">{t('minesNote')}</p>

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
