import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  Svg,
  RockGlyph,
  PaperGlyph,
  ScissorsGlyph,
  CheckIcon,
  TrophyIcon,
  DrawIcon,
  RestartIcon,
  HomeIcon,
} from '../components/icons';
import './RockPaperScissors.css';

const CHOICES = ['rock', 'paper', 'scissors'];
const GLYPHS = { rock: RockGlyph, paper: PaperGlyph, scissors: ScissorsGlyph };

function decideWinner(p1, p2) {
  if (p1 === p2) return 'draw';
  if (
    (p1 === 'rock' && p2 === 'scissors') ||
    (p1 === 'scissors' && p2 === 'paper') ||
    (p1 === 'paper' && p2 === 'rock')
  ) {
    return 1;
  }
  return 2;
}

export default function RockPaperScissors({ onBack, mode = '2p', names = null, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));
  const reportedRef = useRef(false);
  const [p1Choice, setP1Choice] = useState(null);
  const [p2Choice, setP2Choice] = useState(null);
  const [result, setResult] = useState(null);
  const [revealing, setRevealing] = useState(false);

  const choose = useCallback((player, choice) => {
    if (result || revealing) return;
    if (isSolo && player === 2) return;
    if (player === 1 && !p1Choice) setP1Choice(choice);
    if (player === 2 && !p2Choice) setP2Choice(choice);
  }, [p1Choice, p2Choice, result, revealing, isSolo]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 'q') choose(1, 'rock');
      else if (k === 'w') choose(1, 'scissors');
      else if (k === 'e') choose(1, 'paper');
      else if (k === 'u') choose(2, 'rock');
      else if (k === 'i') choose(2, 'scissors');
      else if (k === 'o') choose(2, 'paper');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose]);

  useEffect(() => {
    if (p1Choice && p2Choice && !result && !revealing) {
      setRevealing(true);
      const id = setTimeout(() => {
        setResult(decideWinner(p1Choice, p2Choice));
        setRevealing(false);
      }, 600);
      return () => clearTimeout(id);
    }
  }, [p1Choice, p2Choice, result, revealing]);

  const handleRestart = () => {
    setP1Choice(null);
    setP2Choice(null);
    setResult(null);
    setRevealing(false);
    reportedRef.current = false;
  };

  // Report result once (for showdown scoring)
  useEffect(() => {
    if (result && !reportedRef.current) {
      reportedRef.current = true;
      onGameEnd?.(result);
    }
  });

  // Solo: computer answers after the player locks in
  useEffect(() => {
    if (!isSolo || !p1Choice || p2Choice || result || revealing) return;
    const id = setTimeout(() => {
      const counters = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
      // 55% counter the player's most frequent pick, else random
      const pick = Math.random() < 0.55 && p1Choice ? counters[p1Choice] : CHOICES[Math.floor(Math.random() * 3)];
      setP2Choice(pick);
    }, 700);
    return () => clearTimeout(id);
  });

  const renderPanel = (player) => {
    const choice = player === 1 ? p1Choice : p2Choice;
    const isLocked = !!choice;
    const Glyph = choice ? GLYPHS[choice] : null;
    return (
      <div className={`rps-panel ${result === player ? 'winner' : ''} ${result && result !== player && result !== 'draw' ? 'loser' : ''}`}>
        <h3>{label(player)}</h3>
        <div className="rps-display">
          {!choice && <span className="rps-waiting"><span className="pulse-dot" /></span>}
          {choice && !result && <span className="rps-waiting rps-locked"><CheckIcon size={30} /></span>}
          {choice && result && <span className="rps-emoji"><Svg size={58}><Glyph /></Svg></span>}
        </div>
        <p className="rps-status">
          {!choice && `${label(player)} ${t('choosing')}`}
          {choice && t(choice)}
        </p>
        <div className="rps-buttons">
          {CHOICES.map((c) => {
            const BtnGlyph = GLYPHS[c];
            return (
              <button
                key={c}
                type="button"
                className={`rps-btn ${choice === c ? 'selected' : ''}`}
                onClick={() => choose(player, c)}
                disabled={isLocked || !!result || revealing}
                title={t(c)}
              >
                <span className="rps-btn-emoji"><Svg size={22}><BtnGlyph /></Svg></span>
                <span className="rps-btn-label">{t(c)}</span>
                <kbd>{player === 1 ? (c === 'rock' ? 'Q' : c === 'scissors' ? 'W' : 'E') : (c === 'rock' ? 'U' : c === 'scissors' ? 'I' : 'O')}</kbd>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-mark title-mark-row">
              <Svg size={13}><RockGlyph /></Svg>
              <Svg size={13}><PaperGlyph /></Svg>
              <Svg size={13}><ScissorsGlyph /></Svg>
            </span>
            {t('rpsTitle')}
          </h1>
        </div>

        <div className="rps-result-banner" aria-live="polite">
          {!p1Choice || !p2Choice ? (
            <span>{t('chooseYourMove')}</span>
          ) : revealing ? (
            <span>{t('bothChosen')}</span>
          ) : result === 'draw' ? (
            <span className="result-draw"><DrawIcon size={20} /> {t('itsADraw')}</span>
          ) : result === 1 ? (
            <span className="result-win"><TrophyIcon size={20} /> {label(1)} {t('wins')}</span>
          ) : result === 2 ? (
            <span className="result-win"><TrophyIcon size={20} /> {label(2)} {t('wins')}</span>
          ) : null}
        </div>

        <div className="rps-arena">
          {renderPanel(1)}
          <div className="vs-divider">VS</div>
          {renderPanel(2)}
        </div>

        <div className="game-controls">
          <button className="btn btn-primary" onClick={handleRestart}>
            <RestartIcon size={16} /> {result ? t('playAgain') : t('restart')}
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            <HomeIcon size={16} /> {t('backToMenu')}
          </button>
        </div>
      </div>
    </Layout>
  );
}