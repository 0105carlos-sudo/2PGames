import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  ArtGomoku,
  TrophyIcon,
  DrawIcon,
  RestartIcon,
  HomeIcon,
} from '../components/icons';
import './Gomoku.css';

const SIZE = 15;

const emptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

function checkWin(board, r, c, p) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    const cells = [[r, c]];
    for (const sign of [1, -1]) {
      for (let i = 1; i < 5; i++) {
        const nr = r + dr * i * sign;
        const nc = c + dc * i * sign;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== p) break;
        cells.push([nr, nc]);
      }
    }
    if (cells.length >= 5) return cells;
  }
  return null;
}

export default function Gomoku({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t, language } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

function patternValue(count, open) {
  if (count >= 5) return 10000000;
  if (count === 4) return open === 2 ? 1000000 : 120000;
  if (count === 3) return open === 2 ? 60000 : 6000;
  if (count === 2) return open === 2 ? 1200 : 120;
  return open === 2 ? 12 : 2;
}

function cellScore(b, r, c, p) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  let total = 0;
  for (const [dr, dc] of dirs) {
    let count = 1;
    let open = 0;
    for (const sign of [1, -1]) {
      let k = 1;
      while (true) {
        const nr = r + dr * k * sign;
        const nc = c + dc * k * sign;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || b[nr][nc] !== p) break;
        count++;
        k++;
      }
      const er = r + dr * k * sign;
      const ec = c + dc * k * sign;
      if (er >= 0 && er < SIZE && ec >= 0 && ec < SIZE && b[er][ec] === null) open++;
    }
    total += patternValue(count, open);
  }
  return total;
}

function pickGomokuMove(board) {
  const cand = new Set();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !board[nr][nc]) {
            cand.add(nr * SIZE + nc);
          }
        }
      }
    }
  }
  let best = null;
  let bestScore = -1;
  for (const key of cand) {
    const r = Math.floor(key / SIZE);
    const c = key % SIZE;
    const s = cellScore(board, r, c, 2) + cellScore(board, r, c, 1) * 0.95 + Math.random() * 10;
    if (s > bestScore) {
      bestScore = s;
      best = [r, c];
    }
  }
  return best;
}
  const [board, setBoard] = useState(emptyBoard);
  const [current, setCurrent] = useState(1);
  const [winner, setWinner] = useState(null);
  const [winCells, setWinCells] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [moves, setMoves] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const aiBusy = useRef(false);

  const place = (r, c) => {
    if (aiBusy.current || board[r][c] || winner) return;
    const nb = board.map((row) => row.slice());
    nb[r][c] = current;
    const nm = moves + 1;
    setBoard(nb);
    setMoves(nm);
    setLastMove([r, c]);
    const cells = checkWin(nb, r, c, current);
    if (cells) {
      setWinner(current);
      setWinCells(cells);
      setShowModal(true);
      onGameEnd?.(current);
    } else if (nm >= SIZE * SIZE) {
      setWinner('draw');
      setShowModal(true);
      onGameEnd?.('draw');
    } else {
      setCurrent(current === 1 ? 2 : 1);
    }
  };

  const restart = () => {
    setBoard(emptyBoard());
    setCurrent(1);
    setWinner(null);
    setWinCells([]);
    setLastMove(null);
    setMoves(0);
    setShowModal(false);
  };

  // Solo: computer (white) replies
  useEffect(() => {
    if (!isSolo || current !== 2 || winner) {
      aiBusy.current = false;
      return;
    }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      const mv = pickGomokuMove(board);
      if (mv) place(mv[0], mv[1]);
    }, 600);
    return () => clearTimeout(id);
  });

  const isWinCell = (r, c) => winCells.some(([wr, wc]) => wr === r && wc === c);

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><ArtGomoku size={20} /></span>
            {t('gomokuTitle')}
          </h1>
          <div className="game-status">
            {!winner && (
              <span className="status-item current-player">
                {t('currentPlayer')}: {label(current)}
                <span className={`stone-dot ${current === 1 ? 'black' : 'white'}`}></span>
              </span>
            )}
            {winner && winner !== 'draw' && (
              <span className="winner-badge">
                <TrophyIcon size={16} /> {t('winner')}: {label(winner)}
              </span>
            )}
            {winner === 'draw' && (
              <span className="winner-badge draw">
                <DrawIcon size={16} /> {t('draw')}
              </span>
            )}
          </div>
        </div>

        <div className="board-container">
          <div
            className="gomoku-board"
            role="grid"
            aria-label={t('gomokuTitle')}
            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={`g-cell ${isWinCell(r, c) ? 'win' : ''}`}
                  onClick={() => place(r, c)}
                  disabled={!!cell || !!winner}
                  aria-label={`${r + 1},${c + 1}`}
                >
                  {cell && (
                    <span className={`g-stone ${cell === 1 ? 'black' : 'white'}`}>
                      {lastMove && lastMove[0] === r && lastMove[1] === c && (
                        <span className="g-last" aria-hidden="true"></span>
                      )}
                    </span>
                  )}
                </button>
              ))
            )}
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
                  <p>{language === 'zh' ? '棋盤已滿，雙方平手！' : 'Board is full, it\'s a draw!'}</p>
                </>
              ) : (
                <>
                  <div className="modal-medal solid"><TrophyIcon size={28} /></div>
                  <h2>{t('congratulations')}</h2>
                  <p>{label(winner)} {t('wins')}</p>
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