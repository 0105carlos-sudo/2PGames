import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtLights, TrophyIcon, RestartIcon, HomeIcon } from '../components/icons';
import './LightsOut.css';

const N = 5;

function scrambled() {
  const g = Array(N * N).fill(false);
  const flip = (i) => {
    const r = Math.floor(i / N), c = i % N;
    g[i] = !g[i];
    if (r > 0) g[i - N] = !g[i - N];
    if (r < N - 1) g[i + N] = !g[i + N];
    if (c > 0) g[i - 1] = !g[i - 1];
    if (c < N - 1) g[i + 1] = !g[i + 1];
  };
  for (let k = 0; k < 14; k++) flip(Math.floor(Math.random() * N * N));
  if (g.every((x) => !x)) flip(6);
  return g;
}

export default function LightsOut({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [grid, setGrid] = useState(scrambled);
  const [turn, setTurn] = useState(1);
  const [moves, setMoves] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);

  const end = (w) => {
    setWinner(w); setShowModal(true);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const click = (i) => {
    if (winner) return;
    const ng = [...grid];
    const r = Math.floor(i / N), c = i % N;
    const flip = (j) => { ng[j] = !ng[j]; };
    flip(i);
    if (r > 0) flip(i - N);
    if (r < N - 1) flip(i + N);
    if (c > 0) flip(i - 1);
    if (c < N - 1) flip(i + 1);
    setGrid(ng);
    setMoves(moves + 1);
    if (ng.every((x) => !x)) end(turn);
    else setTurn(turn === 1 ? 2 : 1);
  };

  const restart = () => {
    setGrid(scrambled()); setTurn(1); setMoves(0);
    setWinner(null); setShowModal(false); reported.current = false;
  };

  const lit = grid.filter(Boolean).length;

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtLights size={20} /></span>{t('lightsTitle')}</h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">{t('currentPlayer')}: {label(turn)} · 💡{lit}</span>
            ) : (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            )}
          </div>
        </div>

        <div className="board-container">
          <div className="lo-board" role="grid" aria-label={t('lightsTitle')}>
            {grid.map((on, i) => (
              <button key={i} className={`lo-cell ${on ? 'on' : ''}`} onClick={() => click(i)} disabled={!!winner} aria-label={`${i + 1}`} />
            ))}
          </div>
        </div>
        <p className="mn-note">{isSolo ? t('lightsSoloNote') : t('lightsDuoNote')} · {t('restart')}: {moves}</p>

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
