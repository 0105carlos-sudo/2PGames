import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  ArtConnectFour,
  TrophyIcon,
  DrawIcon,
  RestartIcon,
  HomeIcon,
} from '../components/icons';
import './ConnectFour.css';

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

const checkWinner = (board, row, col, player) => {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal \
    [1, -1],  // diagonal /
  ];

  for (const [dr, dc] of directions) {
    let count = 1;
    const winningCells = [[row, col]];

    // Check positive direction
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
        winningCells.push([r, c]);
      } else break;
    }

    // Check negative direction
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
        winningCells.unshift([r, c]);
      } else break;
    }

    if (count >= 4) return winningCells;
  }
  return null;
};

const isBoardFull = (board) => board[0].every(cell => cell !== null);

function scoreBoard(b) {
  let s = 0;
  const line = (cells) => {
    const mine = cells.filter((v) => v === 2).length;
    const opp = cells.filter((v) => v === 1).length;
    const empty = cells.filter((v) => v === null).length;
    if (mine === 4) s += 100000;
    else if (mine === 3 && empty === 1) s += 140;
    else if (mine === 2 && empty === 2) s += 14;
    if (opp === 4) s -= 100000;
    else if (opp === 3 && empty === 1) s -= 170;
  };
  const at = (r, c) => (r >= 0 && r < ROWS && c >= 0 && c < COLS ? b[r][c] : undefined);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c + 3 < COLS) line([at(r, c), at(r, c + 1), at(r, c + 2), at(r, c + 3)]);
      if (r + 3 < ROWS) line([at(r, c), at(r + 1, c), at(r + 2, c), at(r + 3, c)]);
      if (r + 3 < ROWS && c + 3 < COLS) line([at(r, c), at(r + 1, c + 1), at(r + 2, c + 2), at(r + 3, c + 3)]);
      if (r + 3 < ROWS && c - 3 >= 0) line([at(r, c), at(r + 1, c - 1), at(r + 2, c - 2), at(r + 3, c - 3)]);
    }
  }
  for (let r = 0; r < ROWS; r++) {
    if (b[r][3] === 2) s += 6;
    else if (b[r][3] === 1) s -= 6;
  }
  return s;
}

function lowestRow(b, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (b[r][col] === null) return r;
  }
  return -1;
}

function minimaxC4(b, depth, alpha, beta, max) {
  const cols = [];
  for (let c = 0; c < COLS; c++) {
    if (b[0][c] === null) cols.push(c);
  }
  if (depth === 0 || cols.length === 0) return scoreBoard(b);
  cols.sort((a, b2) => Math.abs(a - 3) - Math.abs(b2 - 3));
  if (max) {
    let best = -Infinity;
    for (const c of cols) {
      const r = lowestRow(b, c);
      b[r][c] = 2;
      if (checkWinner(b, r, c, 2)) {
        b[r][c] = null;
        return 1000000;
      }
      best = Math.max(best, minimaxC4(b, depth - 1, alpha, beta, false));
      b[r][c] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const c of cols) {
    const r = lowestRow(b, c);
    b[r][c] = 1;
    if (checkWinner(b, r, c, 1)) {
      b[r][c] = null;
      return -1000000;
    }
    best = Math.min(best, minimaxC4(b, depth - 1, alpha, beta, true));
    b[r][c] = null;
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function pickComputerCol(board) {
  const cols = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === null) cols.push(c);
  }
  // Win now
  for (const c of cols) {
    const nb = board.map((row) => row.slice());
    const r = lowestRow(nb, c);
    nb[r][c] = 2;
    if (checkWinner(nb, r, c, 2)) return c;
  }
  // Block now
  for (const c of cols) {
    const nb = board.map((row) => row.slice());
    const r = lowestRow(nb, c);
    nb[r][c] = 1;
    if (checkWinner(nb, r, c, 1)) return c;
  }
  // Search
  let bestC = cols[0];
  let bestS = -Infinity;
  const ordered = [...cols].sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
  for (const c of ordered) {
    const nb = board.map((row) => row.slice());
    const r = lowestRow(nb, c);
    nb[r][c] = 2;
    const s = minimaxC4(nb, 3, -Infinity, Infinity, false) + Math.random() * 8;
    if (s > bestS) {
      bestS = s;
      bestC = c;
    }
  }
  return bestC;
}

export default function ConnectFour({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t, language } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [animating, setAnimating] = useState(null);
  const [hoverCol, setHoverCol] = useState(-1);
  const aiBusy = useRef(false);

  const dropDisc = useCallback((col) => {
    if (aiBusy.current || winner || animating !== null || board[0][col] !== null) return;

    // Find the lowest empty row
    let targetRow = -1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        targetRow = row;
        break;
      }
    }
    if (targetRow === -1) return;

    // Animate the disc falling
    setAnimating({ col, targetRow, player: currentPlayer });
    
    // Simulate animation delay
    setTimeout(() => {
      const newBoard = board.map((row, r) => 
        row.map((cell, c) => 
          c === col && r === targetRow ? currentPlayer : cell
        )
      );
      setBoard(newBoard);
      setAnimating(null);

      const winCells = checkWinner(newBoard, targetRow, col, currentPlayer);
      if (winCells) {
        setWinner(currentPlayer);
        setWinningCells(winCells);
        setShowModal(true);
        onGameEnd?.(currentPlayer);
      } else if (isBoardFull(newBoard)) {
        setWinner('draw');
        setShowModal(true);
        onGameEnd?.('draw');
      } else {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      }
    }, 300);
  }, [board, currentPlayer, winner, animating]);

  const handleRestart = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
    setShowModal(false);
    setAnimating(null);
    setHoverCol(-1);
  };

  const handleBack = () => onBack();

  // Solo: computer (player 2) replies
  useEffect(() => {
    if (!isSolo || currentPlayer !== 2 || winner || animating !== null) {
      if (!winner) aiBusy.current = false;
      return;
    }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      dropDisc(pickComputerCol(board));
    }, 600);
    return () => clearTimeout(id);
  });

  const getCellClass = (row, col) => {
    const classes = ['c4-cell'];
    if (board[row][col] === 1) classes.push('player1');
    if (board[row][col] === 2) classes.push('player2');
    if (winningCells.some(([r, c]) => r === row && c === col)) classes.push('winning');
    if (animating && animating.col === col && animating.targetRow === row) classes.push('animating');
    if (hoverCol === col && row === 0 && !winner && !animating && board[0][col] === null) classes.push('hover');
    return classes.join(' ');
  };

  return (
    <Layout showBack onBack={handleBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><ArtConnectFour size={20} /></span>
            {t('c4Title')}
          </h1>
          <div className="game-status">
            {!winner && (
              <span className="status-item current-player">
                {t('currentPlayer')}: {label(currentPlayer)}
                <span className={`disc-indicator player${currentPlayer}`}></span>
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
          <div className="connect-four-board" role="grid" aria-label={t('c4Title')}>
            {/* Column hover indicators */}
            <div className="column-hover">
              {[...Array(COLS)].map((_, col) => (
                <div 
                  key={col} 
                  className="hover-target"
                  onMouseEnter={() => !winner && !animating && board[0][col] === null && setHoverCol(col)}
                  onMouseLeave={() => setHoverCol(-1)}
                  onClick={() => dropDisc(col)}
                  aria-label={`${t('player1')} / ${t('player2')}: ${t('currentPlayer')}`}
                >
                  {hoverCol === col && !winner && !animating && board[0][col] === null && (
                    <div className={`preview-disc player${currentPlayer}`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Game board */}
            <div className="board-grid">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row" role="row">
                  {row.map((cell, colIndex) => (
                    <button
                      key={colIndex}
                      type="button"
                      className={getCellClass(rowIndex, colIndex)}
                      aria-label={`${rowIndex}, ${colIndex}`}
                      onClick={() => dropDisc(colIndex)}
                      disabled={!!winner || !!animating || board[0][colIndex] !== null}
                    >
                      <span className="disc" aria-hidden="true"></span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="game-controls">
          <button className="btn btn-primary" onClick={handleRestart} disabled={animating !== null}>
            <RestartIcon size={16} /> {t('restart')}
          </button>
          <button className="btn btn-secondary" onClick={handleBack}>
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
                <button className="btn btn-primary" onClick={handleRestart}>
                  <RestartIcon size={16} /> {t('restart')}
                </button>
                <button className="btn btn-secondary" onClick={handleBack}>
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