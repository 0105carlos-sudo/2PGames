import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtNim, TrophyIcon, RestartIcon, HomeIcon, MinusIcon, PlusIcon } from '../components/icons';
import './Nim.css';

const START = [3, 4, 5];

export default function Nim({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [piles, setPiles] = useState(START);
  const [sel, setSel] = useState(0);
  const [take, setTake] = useState(1);
  const [turn, setTurn] = useState(1);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);
  const aiBusy = useRef(false);

  const end = (w) => {
    setWinner(w); setShowModal(true);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const doTake = (p, pile, n) => {
    const np = [...piles]; np[pile] -= n;
    setPiles(np);
    if (np.every((x) => x === 0)) { end(p); return; }
    // fix selection
    let ns = pile;
    if (np[ns] === 0) ns = np.findIndex((x) => x > 0);
    setSel(Math.max(0, ns)); setTake(1);
    setTurn(p === 1 ? 2 : 1);
  };

  const confirm = () => {
    if (winner || piles[sel] <= 0) return;
    const n = Math.max(1, Math.min(take, piles[sel]));
    doTake(turn, sel, n);
  };

  useEffect(() => {
    if (!isSolo || turn !== 2 || winner) { aiBusy.current = false; return; }
    aiBusy.current = true;
    const id = setTimeout(() => {
      aiBusy.current = false;
      const xor = piles.reduce((a, b) => a ^ b, 0);
      let pile = -1, n = 1;
      if (xor !== 0) {
        for (let i = 0; i < piles.length; i++) {
          const target = piles[i] ^ xor;
          if (target < piles[i]) { pile = i; n = piles[i] - target; break; }
        }
      }
      if (pile < 0) { // losing pos: random move
        const nz = piles.map((x, i) => (x > 0 ? i : -1)).filter((i) => i >= 0);
        pile = nz[Math.floor(Math.random() * nz.length)];
        n = 1 + Math.floor(Math.random() * piles[pile]);
      }
      doTake(2, pile, n);
    }, 700);
    return () => clearTimeout(id);
  });

  const restart = () => {
    setPiles(START); setSel(0); setTake(1); setTurn(1);
    setWinner(null); setShowModal(false); reported.current = false;
  };

  const total = piles.reduce((a, b) => a + b, 0);

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtNim size={20} /></span>{t('nimTitle')}</h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">{t('currentPlayer')}: {label(turn)} · {t('nimLeft')}: {total}</span>
            ) : (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            )}
          </div>
        </div>

        <div className="nim-piles">
          {piles.map((n, i) => (
            <button
              key={i}
              className={`nim-pile ${sel === i ? 'on' : ''}`}
              onClick={() => { if (n > 0) { setSel(i); setTake(1); } }}
              disabled={n <= 0 || !!winner}
            >
              <span className="nim-name">{t('nimPile')} {i + 1}</span>
              <span className="nim-stones">
                {Array.from({ length: n }).map((_, k) => <i key={k} className="nim-stone" />)}
                {n === 0 && <em>—</em>}
              </span>
              <span className="nim-count">{n}</span>
            </button>
          ))}
        </div>

        {!winner && !(isSolo && turn === 2) && piles[sel] > 0 && (
          <div className="nim-take">
            <span>{t('nimTake')}</span>
            <div className="count-stepper">
              <button className="seg-btn step" onClick={() => setTake(Math.max(1, take - 1))} disabled={take <= 1} aria-label="-"><MinusIcon size={16} /></button>
              <span className="step-num">{take}</span>
              <button className="seg-btn step" onClick={() => setTake(Math.min(piles[sel], take + 1))} disabled={take >= piles[sel]} aria-label="+"><PlusIcon size={16} /></button>
            </div>
            <button className="btn btn-primary" onClick={confirm}>{t('nimConfirm')}</button>
          </div>
        )}

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
