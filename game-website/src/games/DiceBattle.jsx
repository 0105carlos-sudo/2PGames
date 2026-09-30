import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  DiceFace,
  TrophyIcon,
  DrawIcon,
  RestartIcon,
  HomeIcon,
} from '../components/icons';
import './DiceBattle.css';

const ROUND_OPTIONS = [3, 5, 7];

export default function DiceBattle({ onBack, names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const label = (p) => (names && names[p - 1]) || t(p === 1 ? 'player1' : 'player2');
  const reportedRef = useRef(false);
  const [totalRounds, setTotalRounds] = useState(5);
  const [played, setPlayed] = useState(0);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [dice, setDice] = useState({ p1: 6, p2: 6 });
  const [rolling, setRolling] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const done = played >= totalRounds;
  const matchWinner = !done ? null : p1Wins === p2Wins ? 'draw' : p1Wins > p2Wins ? 1 : 2;

  // Report result once (for showdown scoring)
  useEffect(() => {
    if (done && matchWinner && !reportedRef.current) {
      reportedRef.current = true;
      onGameEnd?.(matchWinner);
    }
  });

  const roll = () => {
    if (rolling || done) return;
    setRolling(true);
    setRoundResult(null);
    let ticks = 0;
    intervalRef.current = setInterval(() => {
      ticks++;
      setDice({
        p1: 1 + Math.floor(Math.random() * 6),
        p2: 1 + Math.floor(Math.random() * 6),
      });
      if (ticks >= 8) {
        clearInterval(intervalRef.current);
        const d1 = 1 + Math.floor(Math.random() * 6);
        const d2 = 1 + Math.floor(Math.random() * 6);
        setDice({ p1: d1, p2: d2 });
        setRolling(false);
        const np = played + 1;
        setPlayed(np);
        if (d1 > d2) {
          setP1Wins((v) => v + 1);
          setRoundResult(1);
        } else if (d2 > d1) {
          setP2Wins((v) => v + 1);
          setRoundResult(2);
        } else {
          setDraws((v) => v + 1);
          setRoundResult('draw');
        }
        if (np >= totalRounds) {
          setTimeout(() => setShowModal(true), 700);
        }
      }
    }, 80);
  };

  const changeRounds = (n) => {
    if (rolling) return;
    setTotalRounds(n);
    reset(false);
  };

  const reset = (closeModal = true) => {
    clearInterval(intervalRef.current);
    reportedRef.current = false;
    setPlayed(0);
    setP1Wins(0);
    setP2Wins(0);
    setDraws(0);
    setDice({ p1: 6, p2: 6 });
    setRolling(false);
    setRoundResult(null);
    if (closeModal) setShowModal(false);
  };

  const roundLabel = () => `${t('round')} ${Math.min(played + 1, totalRounds)} / ${totalRounds}`;

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><DiceFace value={5} size={20} /></span>
            {t('diceTitle')}
          </h1>
        </div>

        <div className="dice-rounds">
          <span className="dice-rounds-label">{t('round')}:</span>
          {ROUND_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`round-opt ${totalRounds === n ? 'selected' : ''}`}
              onClick={() => changeRounds(n)}
              disabled={rolling}
            >
              {n}
            </button>
          ))}
          <span className="dice-draws" title={t('draw')}><DrawIcon size={15} /> {draws}</span>
        </div>

        <div className="dice-banner" aria-live="polite">
          {roundResult === 1 && (<><TrophyIcon size={22} /> {label(1)} {t('wins')}</>)}
          {roundResult === 2 && (<><TrophyIcon size={22} /> {label(2)} {t('wins')}</>)}
          {roundResult === 'draw' && (<><DrawIcon size={22} /> {t('itsADraw')}</>)}
          {!roundResult && played < totalRounds && roundLabel()}
          {!roundResult && done && (matchWinner === 'draw' ? t('draw') : `${t('winner')}: ${label(matchWinner)}`)}
        </div>

        <div className="dice-arena">
          <div className={`dice-panel ${roundResult === 1 ? 'winner' : ''}`}>
            <h3>{label(1)}</h3>
            <div className={`dice-face ${rolling ? 'shaking' : ''}`}><DiceFace value={dice.p1} size={84} /></div>
            <div className="dice-wins">{t('score')}: {p1Wins}</div>
          </div>
          <div className="vs-divider">VS</div>
          <div className={`dice-panel ${roundResult === 2 ? 'winner' : ''}`}>
            <h3>{label(2)}</h3>
            <div className={`dice-face ${rolling ? 'shaking' : ''}`}><DiceFace value={dice.p2} size={84} /></div>
            <div className="dice-wins">{t('score')}: {p2Wins}</div>
          </div>
        </div>

        <div className="game-controls">
          {!done ? (
            <button className="btn btn-primary" onClick={roll} disabled={rolling}>
              <DiceFace value={6} size={18} /> {rolling ? '...' : t('roll')}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => reset(true)}>
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
                  <p>{p1Wins} : {p2Wins}</p>
                </>
              ) : (
                <>
                  <div className="modal-medal solid"><TrophyIcon size={28} /></div>
                  <h2>{t('congratulations')}</h2>
                  <p>{label(matchWinner)} {t('wins')}（{p1Wins} : {p2Wins}）</p>
                </>
              )}
              <div className="modal-buttons">
                <button className="btn btn-primary" onClick={() => reset(true)}>
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