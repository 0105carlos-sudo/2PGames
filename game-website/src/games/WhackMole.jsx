import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtMole, TrophyIcon, DrawIcon, RestartIcon, HomeIcon, PlayIcon } from '../components/icons';
import './WhackMole.css';

const CELLS = 9;
const ROUND_MS = 20000;

export default function WhackMole({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [phase, setPhase] = useState('ready'); // ready | p1 | p2 | over
  const [mole, setMole] = useState(-1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [timeLeft, setTimeLeft] = useState(ROUND_MS / 1000);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);
  const activePlayer = useRef(1);

  const finish = (s) => {
    let w;
    if (isSolo) {
      const cpu = 8 + Math.floor(Math.random() * 11); // 8–18
      s = { ...s, 2: cpu };
      setScores(s);
      w = s[1] === cpu ? 'draw' : s[1] > cpu ? 1 : 2;
    } else {
      w = s[1] === s[2] ? 'draw' : s[1] > s[2] ? 1 : 2;
    }
    setWinner(w); setPhase('over'); setShowModal(true); setMole(-1);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  // Mole pop loop + countdown
  useEffect(() => {
    if (phase !== 'p1' && phase !== 'p2') return;
    activePlayer.current = phase === 'p1' ? 1 : 2;
    setTimeLeft(ROUND_MS / 1000);
    let msLeft = ROUND_MS;
    const pop = () => setMole(Math.floor(Math.random() * CELLS));
    pop();
    const popId = setInterval(pop, 750);
    const tickId = setInterval(() => {
      msLeft -= 100;
      setTimeLeft(Math.max(0, msLeft / 1000));
      if (msLeft <= 0) {
        clearInterval(popId); clearInterval(tickId);
        setScores((prev) => {
          if (!isSolo && phase === 'p1') {
            setPhase('p2');
            return prev;
          }
          finish(prev);
          return prev;
        });
      }
    }, 100);
    return () => { clearInterval(popId); clearInterval(tickId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const whack = (i) => {
    if ((phase !== 'p1' && phase !== 'p2') || i !== mole) return;
    const p = activePlayer.current;
    setScores((s) => ({ ...s, [p]: s[p] + 1 }));
    setMole(-1);
    setTimeout(() => setMole(Math.floor(Math.random() * CELLS)), 120);
  };

  const start = () => {
    reported.current = false;
    setScores({ 1: 0, 2: 0 }); setWinner(null); setShowModal(false);
    setPhase('p1');
  };

  const currentScore = phase === 'p2' ? scores[2] : scores[1];

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtMole size={20} /></span>{t('moleTitle')}</h1>
          <div className="game-status">
            {phase === 'ready' ? (
              <span className="status-item">{isSolo ? label(1) : `${label(1)} vs ${label(2)}`} · 20s</span>
            ) : phase === 'over' ? (
              winner === 'draw'
                ? <span className="winner-badge draw"><DrawIcon size={16} /> {t('draw')}</span>
                : <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            ) : (
              <span className="status-item current-player">
                {label(activePlayer.current)} · {currentScore} {t('molePts')} · {timeLeft.toFixed(1)}s
              </span>
            )}
          </div>
        </div>

        {!isSolo && (phase === 'p1' || phase === 'p2') && (
          <div className="mole-duelbar">
            <span className={phase === 'p1' ? 'live' : ''}>{label(1)} · {scores[1]}</span>
            <span className={phase === 'p2' ? 'live' : ''}>{label(2)} · {scores[2]}</span>
          </div>
        )}

        <div className="mole-board">
          {Array.from({ length: CELLS }).map((_, i) => (
            <button key={i} className={`mole-hole ${i === mole ? 'up' : ''}`} onClick={() => whack(i)} disabled={phase !== 'p1' && phase !== 'p2'} aria-label={`${i + 1}`}>
              <span className="mole-dirt" />
              {i === mole && <span className="mole-face">🐹</span>}
            </button>
          ))}
        </div>

        <div className="mole-bar">
          <div className="mole-time" style={{ width: `${(timeLeft / (ROUND_MS / 1000)) * 100}%` }} />
        </div>

        <div className="game-controls">
          {(phase === 'ready' || phase === 'over') && (
            <button className="btn btn-primary" onClick={start}><PlayIcon size={15} /> {t('startGame')}</button>
          )}
          <button className="btn btn-secondary" onClick={restart2}><RestartIcon size={16} /> {t('restart')}</button>
          <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
        </div>

        {showModal && !hideEndModal && phase === 'over' && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              {winner === 'draw' ? (
                <><div className="modal-medal draw"><DrawIcon size={28} /></div><h2>{t('draw')}</h2><p>{scores[1]} : {scores[2]}</p></>
              ) : (
                <><div className="modal-medal solid"><TrophyIcon size={28} /></div><h2>{t('congratulations')}</h2><p>{label(winner)} {t('wins')}（{scores[1]} : {scores[2]}）</p></>
              )}
              <div className="modal-buttons">
                <button className="btn btn-primary" onClick={() => { setShowModal(false); start(); }}><RestartIcon size={16} /> {t('restart')}</button>
                <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );

  function restart2() {
    reported.current = false;
    setScores({ 1: 0, 2: 0 }); setWinner(null); setShowModal(false); setMole(-1);
    setPhase('ready');
  }
}
