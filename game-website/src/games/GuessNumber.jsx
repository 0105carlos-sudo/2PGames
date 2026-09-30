import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  ArtGuess,
  TrophyIcon,
  RestartIcon,
  HomeIcon,
  ChevUpIcon,
  ChevDownIcon,
} from '../components/icons';
import './GuessNumber.css';

const MIN = 1;
const MAX = 100;

const newSecret = () => MIN + Math.floor(Math.random() * (MAX - MIN + 1));

export default function GuessNumber({ onBack, mode = '2p', names = null, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [secret, setSecret] = useState(newSecret);
  const [turn, setTurn] = useState(1);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');
  const boundsRef = useRef([MIN, MAX]);

  const doGuess = (p, n) => {
    if (winner) return;
    let hint;
    if (n === secret) hint = 'hit';
    else if (n > secret) hint = 'high';
    else hint = 'low';
    const [lo, hi] = boundsRef.current;
    if (hint === 'high') boundsRef.current = [lo, Math.min(hi, n - 1)];
    else if (hint === 'low') boundsRef.current = [Math.max(lo, n + 1), hi];
    setHistory((h) => [...h, { p, n, hint }]);
    if (hint === 'hit') {
      setWinner(p);
      onGameEnd?.(p);
    } else {
      setTurn(p === 1 ? 2 : 1);
    }
  };

  const submit = (e) => {
    e?.preventDefault();
    if (winner) return;
    if (isSolo && turn === 2) return;
    const n = parseInt(input, 10);
    if (!Number.isInteger(n) || n < MIN || n > MAX) {
      setError(`${MIN}–${MAX}`);
      return;
    }
    setError('');
    setInput('');
    doGuess(turn, n);
  };

  // Solo: computer closes in on the answer
  useEffect(() => {
    if (!isSolo || turn !== 2 || winner) return;
    const id = setTimeout(() => {
      const [lo, hi] = boundsRef.current;
      let n;
      if (Math.random() < 0.7) {
        n = Math.floor((lo + hi) / 2) + (Math.random() < 0.5 ? 0 : 1);
      } else {
        n = lo + Math.floor(Math.random() * (hi - lo + 1));
      }
      doGuess(2, Math.max(lo, Math.min(hi, n)));
    }, 950);
    return () => clearTimeout(id);
  });

  const restart = () => {
    setSecret(newSecret());
    setTurn(1);
    setInput('');
    setHistory([]);
    setWinner(null);
    setError('');
    boundsRef.current = [MIN, MAX];
  };

  const last = history[history.length - 1];
  const inputLocked = !!winner || (isSolo && turn === 2);

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark"><ArtGuess size={20} /></span>
            {t('guessTitle')}
          </h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">
                {t('currentPlayer')}: {label(turn)}
              </span>
            ) : (
              <span className="winner-badge">
                <TrophyIcon size={16} /> {t('winner')}: {label(winner)}
              </span>
            )}
          </div>
        </div>

        <div className="guess-banner" aria-live="polite">
          {winner ? (
            <>
              <TrophyIcon size={24} />
              <span>{label(winner)} {t('correctGuess')}</span>
              <strong className="guess-secret">{secret}</strong>
            </>
          ) : last ? (
            <>
              <span className={`guess-hint-icon ${last.hint}`}>
                {last.hint === 'high' ? <ChevDownIcon size={22} /> : <ChevUpIcon size={22} />}
              </span>
              <span className="guess-last-num">{last.n}</span>
              <span>{last.hint === 'high' ? t('tooHigh') : t('tooLow')}</span>
            </>
          ) : (
            <span className="guess-range">{MIN} – {MAX}</span>
          )}
        </div>

        <form className="guess-form" onSubmit={submit}>
          <input
            type="number"
            min={MIN}
            max={MAX}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('guessPlaceholder')}
            disabled={inputLocked}
            aria-label={t('guessPlaceholder')}
          />
          <button type="submit" className="btn btn-primary" disabled={inputLocked}>
            {t('guessAction')}
          </button>
        </form>
        {error && <p className="guess-error">{error}</p>}

        {history.length > 0 && (
          <div className="guess-history">
            <h3>{t('guessHistory')}</h3>
            <ul>
              {[...history].reverse().map((g, i) => (
                <li key={history.length - i} className={`hint-${g.hint}`}>
                  <span className="gh-name">{label(g.p)}</span>
                  <span className="gh-num">{g.n}</span>
                  <span className="gh-hint">
                    {g.hint === 'hit' ? t('correctGuess') : g.hint === 'high' ? t('tooHigh') : t('tooLow')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="game-controls">
          <button className="btn btn-primary" onClick={restart}>
            <RestartIcon size={16} /> {t('restart')}
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            <HomeIcon size={16} /> {t('backToMenu')}
          </button>
        </div>
      </div>
    </Layout>
  );
}
