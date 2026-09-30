import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtOthello, TrophyIcon, DrawIcon, RestartIcon, HomeIcon } from '../components/icons';
import './Othello.css';

const N = 8;
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const inB = (r, c) => r >= 0 && r < N && c >= 0 && c < N;

function initBoard() {
  const b = Array.from({ length: N }, () => Array(N).fill(null));
  b[3][3] = 2; b[3][4] = 1; b[4][3] = 1; b[4][4] = 2;
  return b;
}

function flipsFor(b, r, c, p) {
  if (b[r][c]) return [];
  const out = [];
  for (const [dr, dc] of DIRS) {
    const line = [];
    let i = r + dr, j = c + dc;
    while (inB(i, j) && b[i][j] && b[i][j] !== p) { line.push([i, j]); i += dr; j += dc; }
    if (line.length && inB(i, j) && b[i][j] === p) out.push(...line);
  }
  return out;
}

function validMoves(b, p) {
  const m = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
    if (!b[r][c] && flipsFor(b, r, c, p).length) m.push([r, c]);
  return m;
}

function countB(b) {
  let a = 0, c = 0;
  for (const row of b) for (const v of row) { if (v === 1) a++; else if (v === 2) c++; }
  return [a, c];
}

export default function Othello({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));
  const [board, setBoard] = useState(initBoard);
  const [turn, setTurn] = useState(1);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);
  const aiBusy = useRef(false);

  const moves = validMoves(board, turn);
  const oppMoves = validMoves(board, turn === 1 ? 2 : 1);
  const [s1, s2] = countB(board);

  const finish = (b) => {
    const [a, c] = countB(b);
    const w = a === c ? 'draw' : a > c ? 1 : 2;
    setWinner(w); setShowModal(true);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const apply = (r, c) => {
    if (winner || board[r][c]) return false;
    const flips = flipsFor(board, r, c, turn);
    if (!flips.length) return false;
    const nb = board.map((row) => [...row]);
    nb[r][c] = turn;
    for (const [i, j] of flips) nb[i][j] = turn;
    const next = turn === 1 ? 2 : 1;
    setBoard(nb);
    if (validMoves(nb, next).length) setTurn(next);
    else if (validMoves(nb, turn).length) setTurn(turn); // opponent passes
    else finish(nb);
    return true;
  };

  const click = (r, c) => {
    if (aiBusy.current || winner) return;
    if (isSolo && turn === 2) return;
    apply(r, c);
  };

  // Solo AI: greedy max flips, prefer corners/edges
  useEffect(() => {
    if (!isSolo || turn !== 2 || winner) { aiBusy.current = false; return; }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      const ms = validMoves(board, 2);
      if (!ms.length) { // pass
        if (validMoves(board, 1).length) setTurn(1);
        else finish(board);
        return;
      }
      const score = ([r, c]) => {
        let s = flipsFor(board, r, c, 2).length;
        if ((r === 0 || r === 7) && (c === 0 || c === 7)) s += 20;
        else if (r === 0 || r === 7 || c === 0 || c === 7) s += 4;
        else if ((r === 1 || r === 6) && (c === 1 || c === 6)) s -= 6;
        return s + Math.random() * 2;
      };
      ms.sort((a, b) => score(b) - score(a));
      const [r, c] = ms[0];
      // reuse apply logic with fresh state
      const flips = flipsFor(board, r, c, 2);
      const nb = board.map((row) => [...row]);
      nb[r][c] = 2;
      for (const [i, j] of flips) nb[i][j] = 2;
      setBoard(nb);
      if (validMoves(nb, 1).length) setTurn(1);
      else if (validMoves(nb, 2).length) setTurn(2);
      else finish(nb);
    }, 600);
    return () => clearTimeout(id);
  });

  // 2P pass handling: if current player has no moves but opponent does, auto-pass
  useEffect(() => {
    if (winner || isSolo) return;
    if (moves.length === 0 && oppMoves.length > 0) {
      const id = setTimeout(() => setTurn(turn === 1 ? 2 : 1), 700);
      return () => clearTimeout(id);
    }
    if (moves.length === 0 && oppMoves.length === 0) finish(board);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

  const restart = () => {
    setBoard(initBoard()); setTurn(1); setWinner(null); setShowModal(false); reported.current = false;
  };

  const moveSet = new Set(moves.map(([r, c]) => r * 8 + c));

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtOthello size={20} /></span>{t('othelloTitle')}</h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">
                {t('currentPlayer')}: {label(turn)}
                <span className={`ot-disc mini p${turn}`} />
                {moves.length === 0 && oppMoves.length > 0 && <em> · {t('otPass')}</em>}
              </span>
            ) : winner === 'draw' ? (
              <span className="winner-badge draw"><DrawIcon size={16} /> {t('draw')}</span>
            ) : (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            )}
          </div>
        </div>

        <div className="ot-scorebar">
          <span className={`ot-score p1 ${turn === 1 && !winner ? 'live' : ''}`}><span className="ot-disc p1" />{label(1)} · {s1}</span>
          <span className={`ot-score p2 ${turn === 2 && !winner ? 'live' : ''}`}>{label(2)} · {s2}<span className="ot-disc p2" /></span>
        </div>

        <div className="board-container">
          <div className="ot-board" role="grid" aria-label={t('othelloTitle')}>
            {board.map((row, r) => row.map((v, c) => (
              <button
                key={`${r}-${c}`}
                role="gridcell"
                className={`ot-cell ${moveSet.has(r * 8 + c) && !winner ? 'hint' : ''}`}
                onClick={() => click(r, c)}
                disabled={!!winner || !!v}
                aria-label={`${r + 1},${c + 1}`}
              >
                {v && <span className={`ot-disc p${v}`} />}
                {!v && moveSet.has(r * 8 + c) && !winner && <span className="ot-hint-dot" />}
              </button>
            )))}
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
                <><div className="modal-medal draw"><DrawIcon size={28} /></div><h2>{t('draw')}</h2><p>{s1} : {s2}</p></>
              ) : (
                <><div className="modal-medal solid"><TrophyIcon size={28} /></div><h2>{t('congratulations')}</h2><p>{label(winner)} {t('wins')}（{s1} : {s2}）</p></>
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
