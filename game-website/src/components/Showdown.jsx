import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Layout from './Layout';
import { GAME_COMPONENTS, GAME_TITLE_KEYS } from '../games/registry';
import { TrophyIcon, DrawIcon, PlayIcon, RestartIcon, HomeIcon } from './icons';
import './Showdown.css';

function fmtPts(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function ShowdownRun({ config, onExit }) {
  const { t } = useLanguage();
  const { names, picks } = config;
  const total = picks.length;

  const [idx, setIdx] = useState(0);
  const [points, setPoints] = useState([0, 0]);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('play');
  const [lastWinner, setLastWinner] = useState(null);

  const handleEnd = (w) => {
    if (phase !== 'play') return;
    setLastWinner(w);
    setResults((r) => [...r, { id: picks[idx], winner: w }]);
    if (w === 'draw') setPoints(([a, b]) => [a + 0.5, b + 0.5]);
    else if (w === 1) setPoints(([a, b]) => [a + 1, b]);
    else setPoints(([a, b]) => [a, b + 1]);
    // Let the winning moment land before showing the interstitial
    setTimeout(() => setPhase('inter'), 1400);
  };

  const next = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setLastWinner(null);
      setPhase('play');
    } else {
      setPhase('final');
    }
  };

  const restart = () => {
    setIdx(0);
    setPoints([0, 0]);
    setResults([]);
    setPhase('play');
    setLastWinner(null);
  };

  const champion = points[0] === points[1] ? 'draw' : points[0] > points[1] ? 1 : 2;
  const GameComp = GAME_COMPONENTS[picks[idx]];
  const progress = t('matchProgress').replace('{i}', String(idx + 1)).replace('{n}', String(total));
  const interText = lastWinner === 'draw'
    ? t('draw')
    : t('winGameText').replace('{name}', names[lastWinner - 1]).replace('{i}', String(idx + 1));

  return (
    <Layout showBack onBack={onExit}>
      <div className="showdown-bar">
        <div className="sb-side">
          <span className="sb-name">{names[0]}</span>
          <span className="sb-pts">{fmtPts(points[0])}</span>
        </div>
        <div className="sb-mid">
          <span className="sb-progress">{progress}</span>
          <div className="sb-dots">
            {picks.map((id, i) => (
              <span
                key={id}
                title={t(GAME_TITLE_KEYS[id])}
                className={`sb-dot ${results[i] ? `w${results[i].winner === 'draw' ? 'd' : results[i].winner}` : ''} ${i === idx && phase === 'play' ? 'live' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="sb-side right">
          <span className="sb-pts">{fmtPts(points[1])}</span>
          <span className="sb-name">{names[1]}</span>
        </div>
      </div>

      {GameComp && (
        <GameComp
          key={idx}
          names={names}
          hideEndModal
          onGameEnd={handleEnd}
          onBack={onExit}
        />
      )}

      {phase === 'inter' && (
        <div className="showdown-overlay">
          <div className="modal">
            {lastWinner === 'draw' ? (
              <div className="modal-medal draw"><DrawIcon size={30} /></div>
            ) : (
              <div className="modal-medal solid"><TrophyIcon size={30} /></div>
            )}
            <h2>{interText}</h2>
            <p className="showdown-score">
              {names[0]} <strong>{fmtPts(points[0])}</strong>
              <span> : </span>
              <strong>{fmtPts(points[1])}</strong> {names[1]}
            </p>
            <div className="modal-buttons">
              <button className="btn btn-primary" onClick={next}>
                <PlayIcon size={15} />
                {idx + 1 < total ? t('nextGame') : t('seeResults')}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'final' && (
        <div className="showdown-overlay">
          <div className="modal final-modal">
            {champion === 'draw' ? (
              <div className="modal-medal draw"><DrawIcon size={32} /></div>
            ) : (
              <div className="modal-medal solid"><TrophyIcon size={32} /></div>
            )}
            <p className="final-kicker">{t('champion')}</p>
            <h2>{champion === 'draw' ? t('deadHeat') : names[champion - 1]}</h2>
            <p className="showdown-score">
              {names[0]} <strong>{fmtPts(points[0])}</strong>
              <span> : </span>
              <strong>{fmtPts(points[1])}</strong> {names[1]}
            </p>
            <div className="results-list">
              <h3>{t('resultsList')}</h3>
              <ul>
                {results.map((r, i) => (
                  <li key={i}>
                    <span className="rl-game">{t(GAME_TITLE_KEYS[r.id])}</span>
                    <span className={`rl-winner ${r.winner === 'draw' ? 'd' : `p${r.winner}`}`}>
                      {r.winner === 'draw' ? t('draw') : names[r.winner - 1]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={onExit}>
                <HomeIcon size={16} /> {t('backToMenu')}
              </button>
              <button className="btn btn-primary" onClick={restart}>
                <RestartIcon size={16} /> {t('rematch')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
