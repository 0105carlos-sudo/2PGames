import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtHangman, TrophyIcon, DrawIcon, RestartIcon, HomeIcon } from '../components/icons';
import './Hangman.css';

const BANK = [
  { w: 'COMPUTER', zh: '電腦', en: 'A machine that runs programs' },
  { w: 'BASKETBALL', zh: '籃球', en: 'A ball game with a hoop' },
  { w: 'PIANO', zh: '鋼琴', en: 'A keyboard instrument' },
  { w: 'OCTOPUS', zh: '八爪魚', en: 'Sea animal with eight arms' },
  { w: 'RAINBOW', zh: '彩虹', en: 'Colors in the sky after rain' },
  { w: 'DRAGON', zh: '龍', en: 'A legendary fire creature' },
  { w: 'GUITAR', zh: '結他', en: 'A six-string instrument' },
  { w: 'PENGUIN', zh: '企鵝', en: 'A bird that cannot fly' },
  { w: 'VOLCANO', zh: '火山', en: 'A mountain that erupts' },
  { w: 'ROBOT', zh: '機械人', en: 'A programmable machine' },
  { w: 'CASTLE', zh: '城堡', en: 'A king’s fortress' },
  { w: 'BANANA', zh: '香蕉', en: 'A yellow fruit' },
];
const MAX_WRONG = 6;
const pick = () => BANK[Math.floor(Math.random() * BANK.length)];

export default function Hangman({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t, language } = useLanguage();
  const isSolo = mode === 'solo';
  // 2P: guesser is P2; solo: guesser is you (P1)
  const guesser = isSolo ? 1 : 2;
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [entry, setEntry] = useState(isSolo ? pick() : null);
  const [custom, setCustom] = useState('');
  const [guessed, setGuessed] = useState([]);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);

  const word = entry?.w || '';
  const wrong = guessed.filter((l) => !word.includes(l));
  const revealAll = !!winner;
  const won = word && word.split('').every((l) => guessed.includes(l));

  const end = (w) => {
    setWinner(w); setShowModal(true);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const guess = (l) => {
    if (!entry || winner || guessed.includes(l)) return;
    const ng = [...guessed, l];
    setGuessed(ng);
    if (word.split('').every((x) => ng.includes(x))) end(guesser);
    else if (ng.filter((x) => !word.includes(x)).length >= MAX_WRONG) end(isSolo ? 2 : 1);
  };

  const startCustom = (e) => {
    e?.preventDefault();
    const w = custom.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (w.length < 2 || w.length > 14) return;
    setEntry({ w, zh: language === 'zh' ? '玩家自定詞語' : 'Custom word', en: 'Custom word' });
    setCustom(''); setGuessed([]); setWinner(null); setShowModal(false); reported.current = false;
  };

  const restart = () => {
    if (!isSolo) { setEntry(null); }
    else setEntry(pick());
    setCustom(''); setGuessed([]); setWinner(null); setShowModal(false); reported.current = false;
  };

  const hint = entry ? (language === 'zh' ? entry.zh : entry.en) : '';

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtHangman size={20} /></span>{t('hangmanTitle')}</h1>
          <div className="game-status">
            {!entry ? (
              <span className="status-item">{isSolo ? t('hangmanSolo') : t('hangmanP1Set')}</span>
            ) : !winner ? (
              <span className="status-item current-player">{t('currentPlayer')}: {label(guesser)} · {t('hangmanLeft')}: {MAX_WRONG - wrong.length}</span>
            ) : winner === guesser ? (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(guesser)}</span>
            ) : (
              <span className="winner-badge"><DrawIcon size={16} /> {label(isSolo ? 2 : 1)} {t('wins')}</span>
            )}
          </div>
        </div>

        {!entry ? (
          <form className="hm-setup" onSubmit={startCustom}>
            <p>{t('hangmanP1Set')}</p>
            <div className="hm-setup-row">
              <input
                type="password"
                value={custom}
                onChange={(e) => setCustom(e.target.value.toUpperCase())}
                placeholder="A–Z · 2–14"
                maxLength={14}
                autoComplete="off"
              />
              <button type="submit" className="btn btn-primary">{t('startGame')}</button>
            </div>
          </form>
        ) : (
          <>
            <div className="hm-stage">
              <svg viewBox="0 0 120 130" className="hm-svg" aria-hidden="true">
                <line x1="14" y1="122" x2="70" y2="122" />
                <line x1="30" y1="122" x2="30" y2="12" />
                <line x1="30" y1="12" x2="86" y2="12" />
                <line x1="86" y1="12" x2="86" y2="30" />
                {wrong.length > 0 && <circle cx="86" cy="42" r="12" />}
                {wrong.length > 1 && <line x1="86" y1="54" x2="86" y2="86" />}
                {wrong.length > 2 && <line x1="86" y1="60" x2="70" y2="72" />}
                {wrong.length > 3 && <line x1="86" y1="60" x2="102" y2="72" />}
                {wrong.length > 4 && <line x1="86" y1="86" x2="74" y2="106" />}
                {wrong.length > 5 && <line x1="86" y1="86" x2="98" y2="106" />}
              </svg>
              <div className="hm-side">
                <p className="hm-hint">{t('hangmanHint')}: {hint}</p>
                <div className="hm-word">
                  {word.split('').map((l, i) => (
                    <span key={i} className="hm-slot">{guessed.includes(l) || revealAll ? l : ''}</span>
                  ))}
                </div>
                <p className="hm-wrong">{t('hangmanWrong')}: {wrong.join(' · ') || '—'}</p>
              </div>
            </div>

            <div className="hm-keys">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => (
                <button
                  key={l}
                  className={`hm-key ${guessed.includes(l) ? (word.includes(l) ? 'good' : 'bad') : ''}`}
                  onClick={() => guess(l)}
                  disabled={!entry || !!winner || guessed.includes(l)}
                >{l}</button>
              ))}
            </div>
          </>
        )}

        <div className="game-controls">
          <button className="btn btn-primary" onClick={restart}><RestartIcon size={16} /> {t('restart')}</button>
          <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
        </div>

        {showModal && !hideEndModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-medal solid"><TrophyIcon size={28} /></div>
              <h2>{won ? t('congratulations') : t('hangmanOver')}</h2>
              <p>{won ? `${label(guesser)} ${t('wins')}` : `${t('hangmanAnswer')}: ${word}`} </p>
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
