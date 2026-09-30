import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  Svg,
  MEMO_DECK,
  TrophyIcon,
  DrawIcon,
  RestartIcon,
  HomeIcon,
  ArtMemory,
} from '../components/icons';
import './DotsBoxes.css';
import './MemoryMatch.css';

function shuffledDeck() {
  const cards = [...MEMO_DECK, ...MEMO_DECK].map((entry, i) => ({ id: i, key: entry.key, Glyph: entry.Glyph }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryMatch({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));
  const [deck, setDeck] = useState(shuffledDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [current, setCurrent] = useState(1);
  const [lock, setLock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const seenRef = useRef({});
  const aiBusy = useRef(false);

  const winner =
    matched.length < 16
      ? null
      : scores[1] === scores[2]
        ? 'draw'
        : scores[1] > scores[2] ? 1 : 2;

  const flip = useCallback((index) => {
    if (aiBusy.current || lock || matched.includes(index) || flipped.includes(index) || matched.length >= 16) return;
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length < 2) return;

    setLock(true);
    const [a, b] = next;
    if (deck[a].key === deck[b].key) {
      setTimeout(() => {
        const nm = [...matched, a, b];
        const ns = { ...scores, [current]: scores[current] + 1 };
        delete seenRef.current[a];
        delete seenRef.current[b];
        setMatched(nm);
        setScores(ns);
        setFlipped([]);
        setLock(false);
        if (nm.length >= 16) {
          setShowModal(true);
          onGameEnd?.(ns[1] === ns[2] ? 'draw' : ns[1] > ns[2] ? 1 : 2);
        }
        // match: same player continues
      }, 500);
    } else {
      setTimeout(() => {
        seenRef.current[a] = deck[a].key;
        seenRef.current[b] = deck[b].key;
        setFlipped([]);
        setLock(false);
        setCurrent(current === 1 ? 2 : 1);
      }, 900);
    }
  }, [lock, matched, flipped, deck, scores, current]);

  const restart = () => {
    setDeck(shuffledDeck());
    setFlipped([]);
    setMatched([]);
    setScores({ 1: 0, 2: 0 });
    setCurrent(1);
    setLock(false);
    setShowModal(false);
    seenRef.current = {};
  };

  // Solo: computer remembers seen cards and hunts pairs
  useEffect(() => {
    if (!isSolo || current !== 2 || lock || matched.length >= 16) {
      if (matched.length < 16) aiBusy.current = false;
      return;
    }
    if (flipped.length >= 2) return;
    aiBusy.current = true;
    const id = setTimeout(() => {
      const seen = seenRef.current;
      const avail = (i) => !matched.includes(i) && !flipped.includes(i);
      const unseen = (i) => avail(i) && !(i in seen);
      const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
      let pick = -1;
      if (flipped.length === 0) {
        const byKey = {};
        for (const [i, k] of Object.entries(seen)) {
          if (avail(+i)) {
            if (!byKey[k]) byKey[k] = [];
            byKey[k].push(+i);
          }
        }
        const pair = Object.values(byKey).find((a) => a.length >= 2);
        if (pair) {
          pick = pair[0];
        } else {
          const fresh = deck.map((_, i) => i).filter(unseen);
          const pool = fresh.length ? fresh : deck.map((_, i) => i).filter(avail);
          if (pool.length) pick = randomOf(pool);
        }
      } else {
        const first = flipped[0];
        const key = deck[first].key;
        const mate = Object.entries(seen).find(([i, k]) => k === key && +i !== first && avail(+i));
        if (mate) {
          pick = +mate[0];
        } else {
          const fresh = deck.map((_, i) => i).filter(unseen);
          const pool = fresh.length ? fresh : deck.map((_, i) => i).filter(avail);
          if (pool.length) pick = randomOf(pool);
        }
      }
      if (pick >= 0) {
        aiBusy.current = false;
        flip(pick);
      }
    }, 750);
    return () => clearTimeout(id);
  });

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><ArtMemory size={20} /></span>
            {t('mmTitle')}
          </h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">
                {t('currentPlayer')}: {label(current)}
              </span>
            ) : winner === 'draw' ? (
              <span className="winner-badge draw">
                <DrawIcon size={16} /> {t('draw')}
              </span>
            ) : (
              <span className="winner-badge">
                <TrophyIcon size={16} /> {t('winner')}: {label(winner)}
              </span>
            )}
          </div>
        </div>

        <div className="db-scoreboard">
          <div className={`db-score p1 ${current === 1 && !winner ? 'active' : ''} ${winner === 1 ? 'winner' : ''}`}>
            <span className="db-score-name">{label(1)}</span>
            <span className="db-score-num">{scores[1]}</span>
          </div>
          <div className="vs-divider">VS</div>
          <div className={`db-score p2 ${current === 2 && !winner ? 'active' : ''} ${winner === 2 ? 'winner' : ''}`}>
            <span className="db-score-name">{label(2)}</span>
            <span className="db-score-num">{scores[2]}</span>
          </div>
        </div>

        <div className="board-container">
          <div className="mm-board" role="grid" aria-label={t('mmTitle')}>
            {deck.map((card, i) => {
              const faceUp = flipped.includes(i) || matched.includes(i);
              const done = matched.includes(i);
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`mm-card ${faceUp ? 'up' : ''} ${done ? 'done' : ''}`}
                  onClick={() => flip(i)}
                  disabled={faceUp || lock || !!winner}
                  role="gridcell"
                  aria-label={`${i + 1}`}
                >
                  <span className="mm-face">
                    {faceUp ? (
                      <Svg size={34}><card.Glyph /></Svg>
                    ) : (
                      <span className="mm-back" aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}
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
                  <p>{scores[1]} : {scores[2]}</p>
                </>
              ) : (
                <>
                  <div className="modal-medal solid"><TrophyIcon size={28} /></div>
                  <h2>{t('congratulations')}</h2>
                  <p>{label(winner)} {t('wins')}（{scores[1]} : {scores[2]}）</p>
                </>
              )}
              <div className="modal-buttons">
                <button className="btn btn-primary" onClick={restart}>
                  <RestartIcon size={16} /> {t('playAgain')}
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