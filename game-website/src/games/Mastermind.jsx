import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtMaster, TrophyIcon, RestartIcon, HomeIcon } from '../components/icons';
import './Mastermind.css';

const COLORS = ['#e74c3c', '#f39c12', '#f1c40f', '#27ae60', '#2980b9', '#8e44ad'];
const SLOTS = 4;
const TRIES = 10;

const randomCode = () => Array.from({ length: SLOTS }, () => Math.floor(Math.random() * COLORS.length));

function scoreGuess(code, g) {
  let b = 0;
  const cc = [...code], gg = [...g];
  for (let i = 0; i < SLOTS; i++) if (gg[i] === cc[i]) { b++; cc[i] = gg[i] = -1; }
  let w = 0;
  for (let i = 0; i < SLOTS; i++) {
    if (gg[i] === -1) continue;
    const j = cc.indexOf(gg[i]);
    if (j >= 0) { w++; cc[j] = -1; }
  }
  return { b, w };
}

export default function Mastermind({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const guesser = isSolo ? 1 : 2;
  const setter = isSolo ? 2 : 1;
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [code, setCode] = useState(isSolo ? randomCode() : null);
  const [setup, setSetup] = useState([]);
  const [rows, setRows] = useState([]);
  const [cur, setCur] = useState([]);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);

  const end = (w) => {
    setWinner(w); setShowModal(true);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const commitSetup = () => {
    if (setup.length !== SLOTS) return;
    setCode([...setup]); setSetup([]);
  };

  const submit = () => {
    if (!code || winner || cur.length !== SLOTS || cur.some((x) => x === undefined)) return;
    const g = [...cur];
    const { b, w } = scoreGuess(code, g);
    const nr = [...rows, { g, b, w }];
    setRows(nr); setCur([]);
    if (b === SLOTS) end(guesser);
    else if (nr.length >= TRIES) end(setter);
  };

  const restart = () => {
    setCode(isSolo ? randomCode() : null);
    setSetup([]); setRows([]); setCur([]);
    setWinner(null); setShowModal(false); reported.current = false;
  };

  const Dot = ({ v, small }) => (
    <span className={`mm-dot ${small ? 'sm' : ''}`} style={v === undefined ? {} : { background: COLORS[v], borderColor: 'transparent' }} />
  );

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtMaster size={20} /></span>{t('masterTitle')}</h1>
          <div className="game-status">
            {!code ? (
              <span className="status-item">{label(1)} · {t('masterSetCode')}</span>
            ) : !winner ? (
              <span className="status-item current-player">{label(guesser)} · {t('masterTry')} {rows.length + 1}/{TRIES}</span>
            ) : (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            )}
          </div>
        </div>

        {!code ? (
          <div className="mm-box">
            <p>{t('masterSetCode')}</p>
            <div className="mm-slots">
              {Array.from({ length: SLOTS }).map((_, i) => <Dot key={i} v={setup[i]} />)}
            </div>
            <div className="mm-palette">
              {COLORS.map((c, i) => (
                <button key={i} className="mm-pal" style={{ background: c }} onClick={() => setup.length < SLOTS && setSetup([...setup, i])} aria-label={`color ${i + 1}`} />
              ))}
              <button className="btn btn-secondary" onClick={() => setSetup(setup.slice(0, -1))}>⌫</button>
            </div>
            <button className="btn btn-primary" onClick={commitSetup} disabled={setup.length !== SLOTS}>{t('startGame')}</button>
          </div>
        ) : (
          <div className="mm-box">
            {(winner || rows.length >= TRIES) && (
              <div className="mm-answer">
                {t('masterAnswer')}: {code.map((v, i) => <Dot key={i} v={v} small />)}
              </div>
            )}
            <div className="mm-rows">
              {rows.map((r, i) => (
                <div key={i} className="mm-row">
                  <span className="mm-n">{i + 1}</span>
                  {r.g.map((v, j) => <Dot key={j} v={v} small />)}
                  <span className="mm-fb">●{r.b} ○{r.w}</span>
                </div>
              ))}
              {!winner && (
                <div className="mm-row live">
                  <span className="mm-n">{rows.length + 1}</span>
                  {Array.from({ length: SLOTS }).map((_, i) => <Dot key={i} v={cur[i]} small />)}
                </div>
              )}
            </div>
            {!winner && (
              <>
                <div className="mm-palette">
                  {COLORS.map((c, i) => (
                    <button key={i} className="mm-pal" style={{ background: c }} onClick={() => cur.length < SLOTS && setCur([...cur, i])} aria-label={`color ${i + 1}`} />
                  ))}
                  <button className="btn btn-secondary" onClick={() => setCur(cur.slice(0, -1))}>⌫</button>
                </div>
                <button className="btn btn-primary" onClick={submit} disabled={cur.length !== SLOTS}>{t('masterGuess')}</button>
              </>
            )}
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
