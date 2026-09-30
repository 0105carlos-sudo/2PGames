import { useLanguage } from '../context/LanguageContext';
import Layout from './Layout';
import { SOLO_IDS } from '../games/registry';
import {
  ArtTicTacToe,
  ArtConnectFour,
  ArtGomoku,
  ArtDotsBoxes,
  ArtMemory,
  ArtRace,
  ArtPong,
  ArtGuess,
  ArtClash,
  ArtOthello,
  ArtHangman,
  ArtBlackjack,
  ArtMole,
  ArtMines,
  ArtBattle,
  ArtCheckers,
  ArtMaster,
  ArtSos,
  ArtNim,
  ArtLights,
  ArtMath,
  ArtSimon,
  ArtSnake,
  RockIcon,
  PaperIcon,
  ScissorsIcon,
  DiceFace,
  PlayIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
} from './icons';
import { useState } from 'react';

const GAMES = [
  { id: 'tictactoe', Art: ArtTicTacToe, titleKey: 'ticTacToe', descKey: 'tttDesc', tag: 'CLASSIC' },
  { id: 'connectfour', Art: ArtConnectFour, titleKey: 'connectFour', descKey: 'c4Desc', tag: 'STRATEGY' },
  { id: 'gomoku', Art: ArtGomoku, titleKey: 'gomoku', descKey: 'gomokuDesc', tag: 'STRATEGY' },
  { id: 'dotsboxes', Art: ArtDotsBoxes, titleKey: 'dotsBoxes', descKey: 'dbDesc', tag: 'STRATEGY' },
  { id: 'memory', Art: ArtMemory, titleKey: 'memoryMatch', descKey: 'mmDesc', tag: 'MEMORY' },
  { id: 'race', Art: ArtRace, titleKey: 'raceGame', descKey: 'raceDesc', tag: 'REACTION' },
  { id: 'rps', titleKey: 'rockPaperScissors', descKey: 'rpsDesc', tag: 'PARTY', trio: true },
  { id: 'clash', Art: ArtClash, titleKey: 'clashTitle', descKey: 'clashDesc', tag: 'LUCK' },
  { id: 'guess', Art: ArtGuess, titleKey: 'guessTitle', descKey: 'guessDesc', tag: 'GUESS' },
  { id: 'dice', titleKey: 'diceBattle', descKey: 'diceDesc', tag: 'LUCK', dice: true },
  { id: 'pong', Art: ArtPong, titleKey: 'pong', descKey: 'pongDesc', tag: 'ACTION' },
  { id: 'othello', Art: ArtOthello, titleKey: 'othello', descKey: 'othelloDesc', tag: 'STRATEGY' },
  { id: 'hangman', Art: ArtHangman, titleKey: 'hangman', descKey: 'hangmanDesc', tag: 'WORD' },
  { id: 'blackjack', Art: ArtBlackjack, titleKey: 'blackjack', descKey: 'bjDesc', tag: 'CARD' },
  { id: 'mole', Art: ArtMole, titleKey: 'mole', descKey: 'moleDesc', tag: 'ACTION' },
  { id: 'mines', Art: ArtMines, titleKey: 'mines', descKey: 'minesDesc', tag: 'LUCK' },
  { id: 'battle', Art: ArtBattle, titleKey: 'battle', descKey: 'battleDesc', tag: 'STRATEGY' },
  { id: 'checkers', Art: ArtCheckers, titleKey: 'checkers', descKey: 'checkersDesc', tag: 'STRATEGY' },
  { id: 'master', Art: ArtMaster, titleKey: 'master', descKey: 'masterDesc', tag: 'LOGIC' },
  { id: 'sos', Art: ArtSos, titleKey: 'sos', descKey: 'sosDesc', tag: 'WORD' },
  { id: 'nim', Art: ArtNim, titleKey: 'nim', descKey: 'nimDesc', tag: 'LOGIC' },
  { id: 'lights', Art: ArtLights, titleKey: 'lights', descKey: 'lightsDesc', tag: 'PUZZLE' },
  { id: 'math', Art: ArtMath, titleKey: 'math', descKey: 'mathDesc', tag: 'BRAIN' },
  { id: 'simon', Art: ArtSimon, titleKey: 'simon', descKey: 'simonDesc', tag: 'MEMORY' },
  { id: 'snake', Art: ArtSnake, titleKey: 'snake', descKey: 'snakeDesc', tag: 'ACTION' },
];

const RULES = {
  tictactoe: { titleKey: 'tttTitle', rules: ['tttRule1', 'tttRule2', 'tttRule3', 'tttRule4'] },
  connectfour: { titleKey: 'c4Title', rules: ['c4Rule1', 'c4Rule2', 'c4Rule3', 'c4Rule4'] },
  gomoku: { titleKey: 'gomokuTitle', rules: ['gomokuRule1', 'gomokuRule2', 'gomokuRule3', 'gomokuRule4'] },
  dotsboxes: { titleKey: 'dbTitle', rules: ['dbRule1', 'dbRule2', 'dbRule3', 'dbRule4'] },
  memory: { titleKey: 'mmTitle', rules: ['mmRule1', 'mmRule2', 'mmRule3', 'mmRule4'] },
  race: { titleKey: 'raceTitle', rules: ['raceRule1', 'raceRule2', 'raceRule3', 'raceRule4'] },
  rps: { titleKey: 'rpsTitle', rules: ['rpsRule1', 'rpsRule2', 'rpsRule3', 'rpsRule4'] },
  clash: { titleKey: 'clashTitle', rules: ['clashRule1', 'clashRule2', 'clashRule3', 'clashRule4'] },
  guess: { titleKey: 'guessTitle', rules: ['guessRule1', 'guessRule2', 'guessRule3', 'guessRule4'] },
  dice: { titleKey: 'diceTitle', rules: ['diceRule1', 'diceRule2', 'diceRule3', 'diceRule4'] },
  pong: { titleKey: 'pongTitle', rules: ['pongRule1', 'pongRule2', 'pongRule3', 'pongRule4', 'pongRule5'] },
  othello: { titleKey: 'othelloTitle', rules: ['otRule1', 'otRule2', 'otRule3', 'otRule4'] },
  hangman: { titleKey: 'hangmanTitle', rules: ['hmRule1', 'hmRule2', 'hmRule3', 'hmRule4'] },
  blackjack: { titleKey: 'bjTitle', rules: ['bjRule1', 'bjRule2', 'bjRule3', 'bjRule4'] },
  mole: { titleKey: 'moleTitle', rules: ['moleRule1', 'moleRule2', 'moleRule3', 'moleRule4'] },
  mines: { titleKey: 'minesTitle', rules: ['minesRule1', 'minesRule2', 'minesRule3', 'minesRule4'] },
  battle: { titleKey: 'battleTitle', rules: ['battleRule1', 'battleRule2', 'battleRule3', 'battleRule4'] },
  checkers: { titleKey: 'checkersTitle', rules: ['checkersRule1', 'checkersRule2', 'checkersRule3', 'checkersRule4'] },
  master: { titleKey: 'masterTitle', rules: ['masterRule1', 'masterRule2', 'masterRule3', 'masterRule4'] },
  sos: { titleKey: 'sosTitle', rules: ['sosRule1', 'sosRule2', 'sosRule3', 'sosRule4'] },
  nim: { titleKey: 'nimTitle', rules: ['nimRule1', 'nimRule2', 'nimRule3', 'nimRule4'] },
  lights: { titleKey: 'lightsTitle', rules: ['lightsRule1', 'lightsRule2', 'lightsRule3', 'lightsRule4'] },
  math: { titleKey: 'mathTitle', rules: ['mathRule1', 'mathRule2', 'mathRule3', 'mathRule4'] },
  simon: { titleKey: 'simonTitle', rules: ['simonRule1', 'simonRule2', 'simonRule3', 'simonRule4'] },
  snake: { titleKey: 'snakeTitle', rules: ['snakeRule1', 'snakeRule2', 'snakeRule3', 'snakeRule4'] },
};

function GameArt({ game, size = 32 }) {
  if (game.trio) {
    return (
      <span className="game-art game-art-row" aria-hidden="true">
        <RockIcon size={19} />
        <PaperIcon size={19} />
        <ScissorsIcon size={19} />
      </span>
    );
  }
  if (game.dice) {
    return (
      <span className="game-art" aria-hidden="true">
        <DiceFace value={5} size={size} />
      </span>
    );
  }
  const Art = game.Art;
  return (
    <span className="game-art" aria-hidden="true">
      <Art size={size} />
    </span>
  );
}

export default function Menu({ onStartGame, onStartShowdown, initialTab = 'duo' }) {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState(initialTab);
  const [showInstructions, setShowInstructions] = useState(null);

  // Showdown setup
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [count, setCount] = useState(3);
  const [selected, setSelected] = useState(['tictactoe', 'rps', 'pong']);

  const isSolo = tab === 'solo';

  const handleCardInfo = (id) => setShowInstructions(id);

  const handleCardStart = (id) => {
    setShowInstructions(null);
    onStartGame(id, isSolo ? 'solo' : '2p');
  };

  const togglePick = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= count) return prev;
      return [...prev, id];
    });
  };

  const changeCount = (n) => {
    const c = Math.max(1, Math.min(GAMES.length, n));
    setCount(c);
    setSelected((prev) => prev.slice(0, c));
  };

  const readyToFight = selected.length === count;
  const startShowdown = () => {
    if (!readyToFight) return;
    onStartShowdown({
      names: [nameA.trim() || t('player1'), nameB.trim() || t('player2')],
      picks: selected,
    });
  };

  return (
    <Layout>
      <div className="menu-container">
        <section className="hero">
          <span className="hero-eyebrow">
            <span className="pulse-dot" />
            {tab === 'solo'
              ? t('soloTagline')
              : tab === 'showdown'
                ? t('modeShowdown')
                : (language === 'zh' ? '同機雙人對戰' : 'SAME-SCREEN 2P')}
          </span>
          <h1 className="hero-title">
            {language === 'zh' ? (
              <>同一個畫面，<br />兩個人嘅戰場</>
            ) : (
              <>One screen.<br />Two players.</>
            )}
          </h1>
          <p className="hero-subtitle">
            {language === 'zh'
              ? '廿五款遊戲，隨開即玩。唔使安裝，唔使登入。'
              : 'Twenty-five games, ready instantly. No installs, no sign-ups.'}
          </p>
          <div className="mode-tabs" role="tablist">
            {['duo', 'solo', 'showdown'].map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={tab === m}
                className={`mode-tab ${tab === m ? 'selected' : ''}`}
                onClick={() => { setTab(m); setShowInstructions(null); }}
              >
                {t(m === 'duo' ? 'modeDuo' : m === 'solo' ? 'modeSolo' : 'modeShowdown')}
              </button>
            ))}
          </div>
          <div className="hero-stats">
            <span className="hero-stat"><b>25</b> {language === 'zh' ? '款遊戲' : 'games'}</span>
            <span className="hero-stat"><b>2P</b> {language === 'zh' ? '同機對戰' : 'same screen'}</span>
          </div>
        </section>

        {tab !== 'showdown' ? (
          <div className="game-grid">
            {GAMES.map((game) => {
              const soloDisabled = isSolo && !SOLO_IDS.has(game.id);
              return (
                <article key={game.id} className={`game-card ${soloDisabled ? 'disabled' : ''}`}>
                  <div className="game-card-top">
                    <GameArt game={game} />
                    <span className="game-tag">{soloDisabled ? t('duoOnly') : game.tag}</span>
                  </div>
                  <h2>{t(game.titleKey)}</h2>
                  <p>{t(game.descKey)}</p>
                  <div className="game-card-foot">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleCardInfo(game.id)}
                      disabled={soloDisabled}
                    >
                      {t('howToPlay')}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCardStart(game.id)}
                      disabled={soloDisabled}
                    >
                      <PlayIcon size={15} />
                      {t('startGame')}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="showdown-setup">
            <div className="setup-names">
              <label>
                <span>{t('p1Name')}</span>
                <input
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  maxLength={12}
                />
              </label>
              <span className="setup-vs">VS</span>
              <label>
                <span>{t('p2Name')}</span>
                <input
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  maxLength={12}
                />
              </label>
            </div>

            <div className="setup-row">
              <span className="setup-label">{t('gameCountLabel')}</span>
              <div className="count-stepper">
                <button
                  className="seg-btn step"
                  onClick={() => changeCount(count - 1)}
                  disabled={count <= 1}
                  aria-label={language === 'zh' ? '減少場數' : 'Fewer games'}
                >
                  <MinusIcon size={16} />
                </button>
                <span className="step-num" aria-live="polite">{count}</span>
                <button
                  className="seg-btn step"
                  onClick={() => changeCount(count + 1)}
                  disabled={count >= GAMES.length}
                  aria-label={language === 'zh' ? '增加場數' : 'More games'}
                >
                  <PlusIcon size={16} />
                </button>
              </div>
            </div>

            <div className="setup-row column">
              <span className="setup-label">
                {t('pickGamesLabel')} · {selected.length}/{count}
              </span>
              <div className="pick-grid">
                {GAMES.map((game) => {
                  const on = selected.includes(game.id);
                  return (
                    <button
                      key={game.id}
                      className={`pick-tile ${on ? 'selected' : ''}`}
                      onClick={() => togglePick(game.id)}
                      title={t(game.titleKey)}
                    >
                      <GameArt game={game} size={26} />
                      <span>{t(game.titleKey)}</span>
                      {on && <span className="pick-check"><CheckIcon size={13} /></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {!readyToFight && (
              <p className="setup-hint">{t('needGamesText').replace('{n}', String(count))}</p>
            )}
            <button className="btn btn-primary setup-start" onClick={startShowdown} disabled={!readyToFight}>
              <PlayIcon size={15} />
              {t('startShowdown')}
            </button>
          </div>
        )}

        {showInstructions && RULES[showInstructions] && (
          <div className="modal-overlay instructions-modal" onClick={() => setShowInstructions(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>{t(RULES[showInstructions].titleKey)}</h2>
              <div className="modal-content">
                <h3>{language === 'zh' ? '遊戲規則' : 'Game Rules'}</h3>
                <ul>
                  {RULES[showInstructions].rules.map((rule, index) => (
                    <li key={index}>{t(rule)}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-buttons">
                <button className="btn btn-secondary" onClick={() => setShowInstructions(null)}>
                  {t('close')}
                </button>
                <button className="btn btn-primary" onClick={() => handleCardStart(showInstructions)}>
                  <PlayIcon size={15} />
                  {t('startGame')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
