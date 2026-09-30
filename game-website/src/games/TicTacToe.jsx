import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  ArtTicTacToe,
  CircleMark,
  CrossMark,
  TrophyIcon,
  DrawIcon,
  RestartIcon,
  HomeIcon,
} from '../components/icons';
import './TicTacToe.css';

const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function evaluateBoard(b) {
  for (const [a, c, d] of WIN_PATTERNS) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return b.includes(null) ? null : 'draw';
}

function minimax(b, isMax, depth) {
  const r = evaluateBoard(b);
  if (r === 2) return 10 - depth;
  if (r === 1) return depth - 10;
  if (r === 'draw') return 0;
  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = isMax ? 2 : 1;
    const s = minimax(b, !isMax, depth + 1);
    b[i] = null;
    best = isMax ? Math.max(best, s) : Math.min(best, s);
  }
  return best;
}

function bestMove(b) {
  let best = -1;
  let bestScore = -Infinity;
  const order = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const i of order) {
    if (b[i]) continue;
    b[i] = 2;
    const s = minimax(b, false, 0);
    b[i] = null;
    if (s > bestScore) {
      bestScore = s;
      best = i;
    }
  }
  return best;
}

export default function TicTacToe({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t, language } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const aiBusy = useRef(false);

  const checkWinner = (newBoard) => {
    for (const [a, b, c] of WIN_PATTERNS) {
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return { player: newBoard[a], cells: [a, b, c] };
      }
    }
    if (!newBoard.includes(null)) {
      return { player: 'draw', cells: [] };
    }
    return null;
  };

  const handleCellClick = (index) => {
    if (aiBusy.current || board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      if (result.player === 'draw') {
        setWinner('draw');
      } else {
        setWinner(result.player);
        setWinningCells(result.cells);
      }
      setShowModal(true);
      onGameEnd?.(result.player);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
    setShowModal(false);
  };

  const handleBack = () => {
    onBack();
  };

  // Solo: computer (player 2) replies with minimax
  useEffect(() => {
    if (!isSolo || currentPlayer !== 2 || winner) {
      aiBusy.current = false;
      return;
    }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      const i = bestMove([...board]);
      if (i >= 0) handleCellClick(i);
    }, 550);
    return () => clearTimeout(id);
  });

  return (
    <Layout showBack onBack={handleBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><ArtTicTacToe size={20} /></span>
            {t('tttTitle')}
          </h1>
          <div className="game-status">
            {!winner && (
              <span className="status-item current-player">
                {t('currentPlayer')}: {label(currentPlayer)}
                {currentPlayer === 1 ? <CircleMark size={16} sw={2.6} /> : <CrossMark size={16} sw={2.8} />}
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
          <div className="tic-tac-toe-board" role="grid" aria-label={t('tttTitle')} >
            {board.map((cell, index) => (
              <button
                key={index}
                className={`cell ${winningCells.includes(index) ? 'winning' : ''} ${cell ? 'filled' : ''}`}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner}
                role="gridcell"
                aria-label={`${index + 1}`}
                aria-disabled={!!cell || !!winner}
              >
                {cell === 1 && <span className="symbol o"><CircleMark size={52} /></span>}
                {cell === 2 && <span className="symbol x"><CrossMark size={52} /></span>}
              </button>
            ))}
          </div>
        </div>

        <div className="game-controls">
          <button className="btn btn-primary" onClick={handleRestart}>
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
                  <p>{language === 'zh' ? '雙方勢均力敵，平手收場！' : 'Both players are evenly matched, it\'s a draw!'}</p>
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