import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  ArtRace,
  ListIcon,
  TapIcon,
  PlayIcon,
  RestartIcon,
  HomeIcon,
} from '../components/icons';
import './RaceGame.css';

export default function RaceGame({ onBack, mode = '2p', names = null, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));
  const [gameState, setGameState] = useState('idle'); // idle | countdown | ready | active | result
  const [countdown, setCountdown] = useState(3);
  const [player1Time, setPlayer1Time] = useState(null);
  const [player2Time, setPlayer2Time] = useState(null);
  const [winner, setWinner] = useState(null);
  const [falseStartPlayer, setFalseStartPlayer] = useState(null);

  const stateRef = useRef(gameState);
  const startTimeRef = useRef(0);
  const timersRef = useRef([]);
  const p1Ref = useRef(null);
  const p2Ref = useRef(null);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const finishWith = useCallback((p1, p2, fsPlayer) => {
    clearTimers();
    setGameState('result');
    let w;
    if (fsPlayer) {
      setFalseStartPlayer(fsPlayer);
      w = fsPlayer === 1 ? 2 : 1;
      setWinner(w);
      onGameEnd?.(w);
      return;
    }
    if (p1 != null && p2 != null) {
      w = p1 < p2 ? 1 : 2;
      setWinner(w);
    } else if (p1 != null) {
      w = 1;
      setWinner(1);
    } else if (p2 != null) {
      w = 2;
      setWinner(2);
    } else {
      w = 'draw';
      setWinner('draw');
    }
    onGameEnd?.(w);
  }, [onGameEnd]);

  // when both reacted, finish
  useEffect(() => {
    if (stateRef.current === 'active' && player1Time != null && player2Time != null) {
      finishWith(player1Time, player2Time, null);
    }
  }, [player1Time, player2Time, finishWith]);

  // safety timeout: if nobody presses in 5s after GO
  useEffect(() => {
    if (gameState === 'active') {
      const id = setTimeout(() => {
        finishWith(p1Ref.current, p2Ref.current, null);
      }, 5000);
      timersRef.current.push(id);
      return () => clearTimeout(id);
    }
  }, [gameState, finishWith]);

  // Solo: computer reacts with a human-like delay
  useEffect(() => {
    if (!isSolo || gameState !== 'active') return;
    const id = setTimeout(() => press(2), 200 + Math.random() * 280);
    timersRef.current.push(id);
    return () => clearTimeout(id);
  }, [gameState, isSolo, press]);

  const press = useCallback((player) => {
    const s = stateRef.current;
    if (s === 'countdown' || s === 'ready') {
      // false start
      setPlayer1Time(null);
      setPlayer2Time(null);
      p1Ref.current = null;
      p2Ref.current = null;
      finishWith(null, null, player);
      return;
    }
    if (s === 'active') {
      const now = performance.now();
      const rt = now - startTimeRef.current;
      if (player === 1 && p1Ref.current == null) {
        p1Ref.current = rt;
        setPlayer1Time(rt);
      }
      if (player === 2 && p2Ref.current == null) {
        p2Ref.current = rt;
        setPlayer2Time(rt);
      }
    }
  }, [finishWith]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'q' || key === 'q'.toUpperCase()) press(1);
      else if (key === 'p' && !isSolo) press(2);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press, isSolo]);

  const startGame = () => {
    clearTimers();
    setPlayer1Time(null);
    setPlayer2Time(null);
    p1Ref.current = null;
    p2Ref.current = null;
    setWinner(null);
    setFalseStartPlayer(null);
    setCountdown(3);
    setGameState('countdown');

    // 3 -> 2 -> 1, each 800ms
    [2, 1].forEach((val, idx) => {
      const id = setTimeout(() => setCountdown(val), 800 * (idx + 1));
      timersRef.current.push(id);
    });

    // after countdown, enter random waiting phase (red light)
    const readyId = setTimeout(() => {
      setGameState('ready');
      const randomDelay = 600 + Math.random() * 1800;
      const goId = setTimeout(() => {
        startTimeRef.current = performance.now();
        setGameState('active');
      }, randomDelay);
      timersRef.current.push(goId);
    }, 800 * 3);
    timersRef.current.push(readyId);
  };

  const handleBack = () => {
    clearTimers();
    onBack();
  };

  const getStatusText = () => {
    if (gameState === 'idle') return t('getReady');
    if (gameState === 'countdown') return String(countdown);
    if (gameState === 'ready') return '...';
    if (gameState === 'active') return t('go');
    if (gameState === 'result') {
      if (falseStartPlayer) return `${t('falseStart')}`;
      if (winner === 'draw') return t('draw');
      if (winner) return `${t('winner')}: ${label(winner)}`;
    }
    return '';
  };

  const getStatusClass = () => {
    if (gameState === 'countdown') return 'status-countdown';
    if (gameState === 'ready') return 'status-waiting';
    if (gameState === 'active') return 'status-go';
    if (gameState === 'result') {
      if (falseStartPlayer) return 'status-false-start';
      if (winner === 'draw') return 'status-draw';
      return 'status-winner';
    }
    return 'status-waiting';
  };

  return (
    <Layout showBack onBack={handleBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><ArtRace size={20} /></span>
            {t('raceTitle')}
          </h1>
        </div>

        {(gameState === 'idle') && (
          <div className="instructions-banner">
            <h3><ListIcon size={18} /> {t('howToPlay')}</h3>
            <ul>
              <li>{t('raceRule1')}</li>
              <li>{t('raceRule2')}</li>
              <li>{t('raceRule3')}</li>
              <li>{t('raceRule4')}</li>
            </ul>
            <button className="btn btn-primary" onClick={startGame}>
              <PlayIcon size={15} /> {t('startGame')}
            </button>
          </div>
        )}

        {gameState !== 'idle' && (
          <div className="race-arena">
            <div className={`status-display ${getStatusClass()}`} aria-live="polite">
              {gameState === 'countdown' ? (
                <span className="countdown-number" key={countdown}>{countdown}</span>
              ) : (
                <span>{getStatusText()}</span>
              )}
            </div>
            {falseStartPlayer && (
              <p className="false-start-note">
                {label(falseStartPlayer)} {t('falseStart')}
              </p>
            )}

            <div className="players-times">
              <button
                type="button"
                className={`player-time pressable ${player1Time !== null ? 'finished' : ''} ${winner === 1 ? 'winner' : ''} ${falseStartPlayer === 1 ? 'false-start' : ''}`}
                onClick={() => press(1)}
                disabled={gameState === 'result'}
              >
                <span className="player-label">{label(1)} [Q]</span>
                <span className="time-value">
                  {player1Time !== null ? `${(player1Time / 1000).toFixed(3)}s` : t('waitingForSignal')}
                </span>
                <span className="tap-hint"><TapIcon size={14} /> TAP</span>
              </button>

              <div className="vs-divider">VS</div>

              <button
                type="button"
                className={`player-time ${isSolo ? '' : 'pressable'} ${player2Time !== null ? 'finished' : ''} ${winner === 2 ? 'winner' : ''} ${falseStartPlayer === 2 ? 'false-start' : ''}`}
                onClick={() => { if (!isSolo) press(2); }}
                disabled={gameState === 'result' || isSolo}
              >
                <span className="player-label">{label(2)} [P]</span>
                <span className="time-value">
                  {player2Time !== null ? `${(player2Time / 1000).toFixed(3)}s` : t('waitingForSignal')}
                </span>
                <span className="tap-hint"><TapIcon size={14} /> TAP</span>
              </button>
            </div>

            <div className="key-hints">
              <kbd>Q</kbd>
              <span>{label(1)}</span>
              <kbd>P</kbd>
              <span>{label(2)}</span>
            </div>

            {gameState === 'result' && (
              <button className="btn btn-primary" onClick={startGame} style={{ maxWidth: 300 }}>
                <RestartIcon size={16} /> {t('playAgain')}
              </button>
            )}
          </div>
        )}

        <div className="game-controls">
          {gameState !== 'idle' && (
            <button className="btn btn-primary" onClick={startGame}>
              <RestartIcon size={16} /> {t('restart')}
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleBack}>
            <HomeIcon size={16} /> {t('backToMenu')}
          </button>
        </div>
      </div>
    </Layout>
  );
}