import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtSimon, TrophyIcon, DrawIcon, RestartIcon, HomeIcon, PlayIcon } from '../components/icons';
import './Simon.css';

const PADS = [
  { c: '#27ae60', tone: 261.6 },
  { c: '#e74c3c', tone: 329.6 },
  { c: '#f1c40f', tone: 392.0 },
  { c: '#2980b9', tone: 523.25 },
];
const SOLO_TARGET = 6;

export default function Simon({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [stage, setStage] = useState('ready'); // ready | show | input | over
  const [seq, setSeq] = useState([]);
  const [prog, setProg] = useState(0);
  const [lit, setLit] = useState(-1);
  const [player, setPlayer] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const reported = useRef(false);
  const timers = useRef([]);
  const audio = useRef(null);

  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const beep = (pad) => {
    try {
      if (!audio.current) audio.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audio.current;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = PADS[pad].tone;
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.35);
    } catch { /* audio unavailable */ }
  };

  const end = (w) => {
    setStage('over'); setWinner(w); setShowModal(true); setLit(-1);
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  const beginRun = (p) => {
    clearTimers();
    setPlayer(p); setSeq([Math.floor(Math.random() * 4)]);
    setProg(0); setLit(-1); setStage('show');
  };

  const start = () => {
    reported.current = false;
    setScores({ 1: 0, 2: 0 }); setWinner(null); setShowModal(false);
    beginRun(1);
  };

  // playback
  useEffect(() => {
    if (stage !== 'show') return;
    let dead = false;
    setLit(-1);
    seq.forEach((pad, k) => {
      later(() => {
        if (dead) return;
        beep(pad); setLit(pad);
        later(() => { if (!dead) setLit(-1); }, 380);
      }, 500 + 620 * k);
    });
    later(() => { if (!dead) { setStage('input'); setProg(0); } }, 500 + 620 * seq.length);
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, seq]);

  const failRun = () => {
    const got = seq.length - 1;
    const ns = { ...scores, [player]: got };
    setScores(ns);
    if (!isSolo && player === 1) beginRun(2);
    else if (isSolo) end(2);
    else end(ns[1] === ns[2] ? 'draw' : ns[1] > ns[2] ? 1 : 2);
  };

  const press = (i) => {
    if (stage !== 'input' || winner) return;
    beep(i); setLit(i);
    later(() => setLit(-1), 220);
    if (i === seq[prog]) {
      const np = prog + 1;
      setProg(np);
      if (np >= seq.length) {
        if (isSolo && seq.length >= SOLO_TARGET) { end(1); return; }
        setStage('show');
        later(() => setSeq((s) => [...s, Math.floor(Math.random() * 4)]), 500);
      }
    } else {
      failRun();
    }
  };

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtSimon size={20} /></span>{t('simonTitle')}</h1>
          <div className="game-status">
            {stage === 'ready' ? (
              <span className="status-item">{t('simonReady')}</span>
            ) : stage === 'over' ? (
              winner === 'draw'
                ? <span className="winner-badge draw"><DrawIcon size={16} /> {t('draw')}</span>
                : <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            ) : (
              <span className="status-item current-player">
                {label(player)} · {t('simonLen')}: {seq.length}
                {stage === 'show' ? ` · 👀` : ` · ${prog}/${seq.length}`}
                {!isSolo && ` · ${scores[1]} : ${scores[2]}`}
              </span>
            )}
          </div>
        </div>

        <div className="sm-pads">
          {PADS.map((p, i) => (
            <button
              key={i}
              className={`sm-pad ${lit === i ? 'lit' : ''}`}
              style={{ '--pad': p.c }}
              onClick={() => press(i)}
              disabled={stage !== 'input'}
              aria-label={`pad ${i + 1}`}
            />
          ))}
        </div>

        <div className="game-controls">
          {(stage === 'ready' || stage === 'over') && (
            <button className="btn btn-primary" onClick={start}><PlayIcon size={15} /> {t('startGame')}</button>
          )}
          <button className="btn btn-secondary" onClick={start2}><RestartIcon size={16} /> {t('restart')}</button>
          <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
        </div>

        {showModal && !hideEndModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              {winner === 'draw' ? (
                <><div className="modal-medal draw"><DrawIcon size={28} /></div><h2>{t('draw')}</h2><p>{scores[1]} : {scores[2]}</p></>
              ) : (
                <><div className="modal-medal solid"><TrophyIcon size={28} /></div><h2>{t('congratulations')}</h2><p>{label(winner)} {t('wins')}（{isSolo ? `${t('simonLen')} ${SOLO_TARGET}` : `${scores[1]} : ${scores[2]}`}）</p></>
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

  function start2() {
    clearTimers();
    reported.current = false;
    setScores({ 1: 0, 2: 0 }); setWinner(null); setShowModal(false);
    setSeq([]); setLit(-1); setStage('ready');
  }
}
