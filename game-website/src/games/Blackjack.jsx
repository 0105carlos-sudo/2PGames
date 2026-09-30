import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { ArtBlackjack, TrophyIcon, DrawIcon, RestartIcon, HomeIcon } from '../components/icons';
import './Blackjack.css';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const newDeck = () => {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ s, r });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[d[i], d[j]] = [d[j], d[i]]; }
  return d;
};
const val = (hand) => {
  let t = 0, aces = 0;
  for (const c of hand) {
    if (c.r === 'A') { t += 11; aces++; }
    else if (['J', 'Q', 'K'].includes(c.r)) t += 10;
    else t += parseInt(c.r, 10);
  }
  while (t > 21 && aces > 0) { t -= 10; aces--; }
  return t;
};
const isRed = (c) => c.s === '♥' || c.s === '♦';

function judge(h1, h2) {
  const v1 = val(h1), v2 = val(h2);
  const b1 = v1 > 21, b2 = v2 > 21;
  if (b1 && b2) return 'draw';
  if (b1) return 2;
  if (b2) return 1;
  if (v1 === v2) return 'draw';
  return v1 > v2 ? 1 : 2;
}

export default function Blackjack({ onBack, mode = '2p', names = null, hideEndModal = false, onGameEnd = null }) {
  const { t } = useLanguage();
  const isSolo = mode === 'solo';
  const label = (p) => (names && names[p - 1]) || t(isSolo ? (p === 1 ? 'you' : 'computer') : (p === 1 ? 'player1' : 'player2'));

  const [deck, setDeck] = useState(newDeck);
  const [hands, setHands] = useState({ 1: [deck[0], deck[2]], 2: [deck[1], deck[3]] });
  const [di, setDi] = useState(4);
  const [stood, setStood] = useState({ 1: false, 2: false });
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [turn, setTurn] = useState(1); // 2p ordering
  const reported = useRef(false);

  const draw = (hand, d, idx) => {
    const c = d[idx];
    return { hand: [...hand, c], idx: idx + 1 };
  };

  const end = (w) => {
    setWinner(w); setShowModal(true); setStood({ 1: true, 2: true });
    if (!reported.current) { reported.current = true; onGameEnd?.(w); }
  };

  // Solo: player hits/stands, then dealer auto-plays to 17
  const soloAfter = (nh, nd, ni, pStood) => {
    if (val(nh) > 21) { setHands({ 1: nh, 2: hands[2] }); end(2); return; }
    if (!pStood) { setHands({ 1: nh, 2: hands[2] }); setDeck(nd); setDi(ni); return; }
    // dealer plays
    let dh = [...hands[2]]; let i = ni;
    while (val(dh) < 17 && i < nd.length) { dh = [...dh, nd[i]]; i++; }
    setHands({ 1: nh, 2: dh }); setDeck(nd); setDi(i);
    end(judge(nh, dh));
  };

  const hit = () => {
    if (winner) return;
    if (isSolo) {
      const r = draw(hands[1], deck, di);
      soloAfter(r.hand, deck, r.idx, false);
    } else {
      if (stood[turn]) return;
      const r = draw(hands[turn], deck, di);
      const nh = { ...hands, [turn]: r.hand };
      setHands(nh); setDi(r.idx);
      if (val(r.hand) > 21) {
        const ns = { ...stood, [turn]: true };
        setStood(ns);
        const other = turn === 1 ? 2 : 1;
        if (ns[other]) end(judge(nh[1], nh[2]));
        else setTurn(other);
      }
    }
  };

  const stand = () => {
    if (winner) return;
    if (isSolo) {
      soloAfter(hands[1], deck, di, true);
    } else {
      const ns = { ...stood, [turn]: true };
      setStood(ns);
      const other = turn === 1 ? 2 : 1;
      if (ns[other]) end(judge(hands[1], hands[2]));
      else setTurn(other);
    }
  };

  const restart = () => {
    const d = newDeck();
    setDeck(d); setDi(4);
    setHands({ 1: [d[0], d[2]], 2: [d[1], d[3]] });
    setStood({ 1: false, 2: false }); setWinner(null); setShowModal(false); setTurn(1);
    reported.current = false;
  };

  const Card = ({ c, hidden }) => (
    <span className={`bj-card ${hidden ? 'back' : isRed(c) ? 'red' : ''}`}>
      {hidden ? '🂠' : <><b>{c.r}</b><i>{c.s}</i></>}
    </span>
  );

  const row = (p) => {
    const h = hands[p]; const v = val(h);
    const active = !isSolo && !winner && turn === p && !stood[p];
    const bust = v > 21;
    return (
      <div className={`bj-hand ${active ? 'live' : ''}`}>
        <div className="bj-hand-head">
          <span>{label(p)}</span>
          <strong className={bust ? 'bust' : v === 21 ? 'bj' : ''}>{v}</strong>
          {!isSolo && stood[p] && <em>STAND</em>}
        </div>
        <div className="bj-cards">{h.map((c, i) => <Card key={i} c={c} />)}</div>
      </div>
    );
  };

  return (
    <Layout showBack onBack={onBack}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title"><span className="title-mark"><ArtBlackjack size={20} /></span>{t('bjTitle')}</h1>
          <div className="game-status">
            {!winner ? (
              <span className="status-item current-player">
                {isSolo ? `${label(1)} · ${val(hands[1])}` : `${t('currentPlayer')}: ${label(turn)}`}
              </span>
            ) : winner === 'draw' ? (
              <span className="winner-badge draw"><DrawIcon size={16} /> {t('draw')}</span>
            ) : (
              <span className="winner-badge"><TrophyIcon size={16} /> {t('winner')}: {label(winner)}</span>
            )}
          </div>
        </div>

        <div className="bj-table">
          {isSolo ? (
            <>
              <div className="bj-hand dealer">
                <div className="bj-hand-head"><span>{label(2)}</span><strong>{winner ? val(hands[2]) : '?'}</strong></div>
                <div className="bj-cards">
                  {hands[2].map((c, i) => <Card key={i} c={c} hidden={!winner && i === 1} />)}
                </div>
              </div>
              {row(1)}
            </>
          ) : (<>{row(1)}{row(2)}</>)}
        </div>

        {!winner && (
          <div className="bj-actions">
            <button className="btn btn-primary" onClick={hit} disabled={!isSolo && stood[turn]}>{t('bjHit')}</button>
            <button className="btn btn-secondary" onClick={stand} disabled={!isSolo && stood[turn]}>{t('bjStand')}</button>
          </div>
        )}

        <div className="game-controls">
          <button className="btn btn-primary" onClick={restart}><RestartIcon size={16} /> {t('restart')}</button>
          <button className="btn btn-secondary" onClick={onBack}><HomeIcon size={16} /> {t('backToMenu')}</button>
        </div>

        {showModal && !hideEndModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              {winner === 'draw' ? (
                <><div className="modal-medal draw"><DrawIcon size={28} /></div><h2>{t('draw')}</h2><p>{val(hands[1])} : {val(hands[2])}</p></>
              ) : (
                <><div className="modal-medal solid"><TrophyIcon size={28} /></div><h2>{t('congratulations')}</h2><p>{label(winner)} {t('wins')}（{val(hands[1])} : {val(hands[2])}）</p></>
              )}
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
