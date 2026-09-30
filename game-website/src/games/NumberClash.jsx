import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  ArtClash,
  TrophyIcon,
  DrawIcon,
  RestartIcon,
  HomeIcon,
} from '../components/icons';
import './NumberClash.css';

const ROUNDS = 5;
const rand99 = () => 1 + Math.floor(Math.random() * 99);

export default function NumberClash({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [rounds, setRounds] = useState([]);
  const [nums, setNums] = useState({ a: 50, b: 50 });
  const [rolling, setRolling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef(null);
  const reportedRef = useRef(false);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const done = rounds.length >= ROUNDS;
  const s1 = rounds.filter((r) => r.w === 1).length;
  const s2 = rounds.filter((r) => r.w === 2).length;
  const draws = rounds.filter((r) => r.w === 'draw').length;
  const matchWinner = !done ? null : s1 === s2 ? 'draw' : s1 > s2 ? 1 : 2;
  const lastRound = rounds[rounds.length - 1];

  useEffect(() => {
    if (done && matchWinner && !reportedRef.current) {
      reportedRef.current = true;
      onGameEnd?.(matchWinner);
    }
  });

  const reveal = () => {
    if (rolling || done) return;
    setRolling(true);
    let ticks = 0;
    intervalRef.current = setInterval(() => {
      ticks++;
      setNums({ a: rand99(), b: rand99() });
      if (ticks >= 8) {
        clearInterval(intervalRef.current);
        const a = rand99();
        const b = rand99();
        setNums({ a, b });
        setRolling(false);
        const w = a > b ? 1 : b > a ? 2 : 'draw';
        const nr = [...rounds, { a, b, w }];
        setRounds(nr);
        if (nr.length >= ROUNDS) {
          setTimeout(() => setShowModal(true), 700);
        }
      }
    }, 80);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    reportedRef.current = false;
    setRounds([]);
    setNums({ a: 50, b: 50 });
    setRolling(false);
    setShowModal(false);
  };

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><ArtClash size={20} /></span>
            {t('clashTitle')}
          </h1>
        </div>

        <div className="clash-progress" aria-hidden="true">
          {Array.from({ length: ROUNDS }).map((_, i) => {
            const r = rounds[i];
            return (
              <span key={i} className={`cdot ${r ? `w${r.w === 'draw' ? 'd' : r.w}` : ''}`} />
            );
          })}
          <span className="clash-round-label">{t('round')} {Math.min(rounds.length + 1, ROUNDS)} / {ROUNDS}</span>
        </div>

        <div className="dice-banner" aria-live="polite">
          {lastRound && !done && lastRound.w === 1 && (<><TrophyIcon size={22} /> {label(1)} {t('wins')}</>)}
          {lastRound && !done && lastRound.w === 2 && (<><TrophyIcon size={22} /> {label(2)} {t('wins')}</>)}
          {lastRound && !done && lastRound.w === 'draw' && (<><DrawIcon size={22} /> {t('itsADraw')}</>)}
          {!lastRound && !done && (<>{t('round')} 1 / {ROUNDS}</>)}
          {done && (matchWinner === 'draw' ? t('draw') : `${t('winner')}: ${label(matchWinner)}`)}
        </div>

        <div className="dice-arena">
          <div className={`dice-panel ${lastRound?.w === 1 ? 'winner' : ''}`}>
            <h3>{label(1)}</h3>
            <div className={`clash-num ${rolling ? 'shaking' : ''}`}>{nums.a}</div>
            <div className="dice-wins">{t('score')}: {s1}</div>
          </div>
          <div className="vs-divider">VS</div>
          <div className={`dice-panel ${lastRound?.w === 2 ? 'winner' : ''}`}>
            <h3>{label(2)}</h3>
            <div className={`clash-num ${rolling ? 'shaking' : ''}`}>{nums.b}</div>
            <div className="dice-wins">{t('score')}: {s2}</div>
          </div>
        </div>
        {draws > 0 && <p className="clash-draws"><DrawIcon size={14} /> {draws}</p>}

        <div className="game-controls">
          {!done ? (
            <button className="btn btn-primary" onClick={reveal} disabled={rolling}>
              <ArtClash size={18} /> {rolling ? '...' : t('reveal')}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={reset}>
              <RestartIcon size={16} /> {t('playAgain')}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onBack}>
            <HomeIcon size={16} /> {t('backToMenu')}
          </button>
        </div>

        {showModal && !hideEndModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              {matchWinner === 'draw' ? (
                <>
                  <div className="modal-medal draw"><DrawIcon size={28} /></div>
                  <h2>{t('draw')}</h2>
                  <p>{s1} : {s2}</p>
                </>
              ) : (
                <>
                  <div className="modal-medal solid"><TrophyIcon size={28} /></div>
                  <h2>{t('congratulations')}</h2>
                  <p>{label(matchWinner)} {t('wins')}（{s1} : {s2}）</p>
                </>
              )}
              <div className="modal-buttons">
                <button className="btn btn-primary" onClick={reset}>
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
