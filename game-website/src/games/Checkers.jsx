import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtCheckers, TrophyIcon, RestartIcon, HomeIcon } from '../components/icons';
import './Checkers.css';

const N = 8;
const inB = (r, c) => r >= 0 && r < N && c >= 0 && c < N;

function initBoard() {
  const b = Array.from({ length: N }, () => Array(N).fill(null));
  for (let r = 0; r < 3; r++) for (let c = 0; c < N; c++)
    if ((r + c) % 2 === 1) b[r][c] = { p: 2, k: false };
  for (let r = 5; r < 8; r++) for (let c = 0; c < N; c++)
    if ((r + c) % 2 === 1) b[r][c] = { p: 1, k: false };
  return b;
}

function pieceMoves(b, r, c) {
  const pc = b[r][c];
  if (!pc) return { quiet: [], caps: [] };
  const dirs = pc.k ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : pc.p === 1 ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]];
  const quiet = [], caps = [];
  for (const [dr, dc] of dirs) {
    const r1 = r + dr, c1 = c + dc, r2 = r + 2 * dr, c2 = c + 2 * dc;
    if (inB(r1, c1) && !b[r1][c1]) quiet.push([r1, c1]);
    if (inB(r2, c2) && !b[r2][c2] && inB(r1, c1) && b[r1][c1] && b[r1][c1].p !== pc.p) caps.push([r2, c2]);
  }
  return { quiet, caps };
}

function allMoves(b, p) {
  const ms = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (b[r][c]?.p !== p) continue;
    const { quiet, caps } = pieceMoves(b, r, c);
    for (const [tr, tc] of caps) ms.push({ from: [r, c], to: [tr, tc], cap: true });
    for (const [tr, tc] of quiet) ms.push({ from: [r, c], to: [tr, tc], cap: false });
  }
  return ms;
}

function applyMove(b, m) {
  const nb = b.map((row) => row.map((x) => (x ? { ...x } : null)));
  const [[fr, fc], [tr, tc]] = [m.from, m.to];
  nb[tr][tc] = nb[fr][fc]; nb[fr][fc] = null;
  if (m.cap) nb[(fr + tr) / 2][(fc + tc) / 2] = null;
  const pc = nb[tr][tc];
  if (!pc.k && ((pc.p === 1 && tr === 0) || (pc.p === 2 && tr === N - 1))) pc.k = true;
  return nb;
}

export default function Checkers({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [board, setBoard] = useState(initBoard);
  const [turn, setTurn] = useState(1);
  const [sel, setSel] = useState(null);
  const [chain, setChain] = useState(null); // [r,c] must continue capturing
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);
  const aiBusy = useRef(false);

  const selMoves = sel ? [...pieceMoves(board, sel[0], sel[1]).caps, ...pieceMoves(board, sel[0], sel[1]).quiet].map(([r, c]) => r * N + c) : [];
  const mustFrom = chain ? chain[0] * N + chain[1] : null;

  const end = (w) => {
    setWinner(w); setShowModal(true); setSel(null); setChain(null);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const afterMove = (nb, mover, kept) => {
    const foe = mover === 1 ? 2 : 1;
    const foeMoves = allMoves(nb, foe);
    const foeCount = nb.flat().filter((x) => x?.p === foe).length;
    if (foeCount === 0 || foeMoves.length === 0) { setBoard(nb); end(mover); return; }
    if (kept) { setBoard(nb); setChain(kept); setSel(kept); return; }
    setBoard(nb); setTurn(foe); setSel(null); setChain(null);
  };

  const tryMove = (mover, m) => {
    const nb = applyMove(board, m);
    let kept = null;
    if (m.cap) {
      const more = pieceMoves(nb, m.to[0], m.to[1]).caps;
      if (more.length) kept = m.to;
    }
    afterMove(nb, mover, kept);
  };

  const click = (r, c) => {
    if (winner || aiBusy.current || (isSolo && turn === 2)) return;
    if (chain && !(r === chain[0] && c === chain[1]) && !selMoves.includes(r * N + c)) return;
    const pc = board[r][c];
    if (pc?.p === turn && (!chain || (r === chain[0] && c === chain[1]))) { setSel([r, c]); return; }
    if (sel && selMoves.includes(r * N + c)) {
      const { caps } = pieceMoves(board, sel[0], sel[1]);
      const isCap = caps.some(([tr, tc]) => tr === r && tc === c);
      tryMove(turn, { from: sel, to: [r, c], cap: isCap });
    } else setSel(null);
  };

  useEffect(() => {
    if (!isSolo || turn !== 2 || winner) { aiBusy.current = false; return; }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      const ms = allMoves(board, 2);
      if (!ms.length) { end(1); return; }
      const caps = ms.filter((m) => m.cap);
      const pool = caps.length ? caps : ms;
      const m = pool[Math.floor(Math.random() * pool.length)];
      // chain captures automatically for AI
      let nb = applyMove(board, m);
      let cur = m;
      let guard = 0;
      while (cur.cap && guard++ < 10) {
        const more = pieceMoves(nb, cur.to[0], cur.to[1]).caps;
        if (!more.length) break;
        const [tr, tc] = more[Math.floor(Math.random() * more.length)];
        cur = { from: cur.to, to: [tr, tc], cap: true };
        nb = applyMove(nb, cur);
      }
      const foeMoves = allMoves(nb, 1);
      const foeCount = nb.flat().filter((x) => x?.p === 1).length;
      if (foeCount === 0 || foeMoves.length === 0) { setBoard(nb); end(2); return; }
      setBoard(nb); setTurn(1); setSel(null); setChain(null);
    }, 650);
    return () => clearTimeout(id);
  });

  const restart = () => {
    setBoard(initBoard()); setTurn(1); setSel(null); setChain(null);
    setWinner(null); setShowModal(false); reported.current = false;
  };

  const c1 = board.flat().filter((x) => x?.p === 1).length;
  const c2 = board.flat().filter((x) => x?.p === 2).length;

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtCheckers size={20} /></span>{t('checkersTitle')}</h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">{t('currentPlayer')}: {label(turn)} · ⚫{c1} ⚪{c2}</span>
            ) : (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            )}
          </div>
        </div>

        <div className="board-container">
          <div className="ck-board" role="grid" aria-label={t('checkersTitle')}>
            {board.map((row, r) => row.map((pc, c) => {
              const dark = (r + c) % 2 === 1;
              const isSel = sel && sel[0] === r && sel[1] === c;
              const isTgt = selMoves.includes(r * N + c);
              const locked = chain && mustFrom !== r * N + c && !isTgt;
              return (
                <button
                  key={`${r}-${c}`}
                  className={`ck-sq ${dark ? 'dark' : 'light'} ${isSel ? 'sel' : ''} ${isTgt ? 'tgt' : ''}`}
                  onClick={() => click(r, c)}
                  disabled={!!winner || !dark || locked}
                >
                  {pc && <span className={`ck-pc p${pc.p} ${pc.k ? 'king' : ''}`}>{pc.k ? '♛' : ''}</span>}
                </button>
              );
            }))}
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
