import TicTacToe from './TicTacToe';
import ConnectFour from './ConnectFour';
import Gomoku from './Gomoku';
import DotsBoxes from './DotsBoxes';
import MemoryMatch from './MemoryMatch';
import RaceGame from './RaceGame';
import RockPaperScissors from './RockPaperScissors';
import DiceBattle from './DiceBattle';
import NumberClash from './NumberClash';
import GuessNumber from './GuessNumber';
import Pong from './Pong';
import Othello from './Othello';
import Hangman from './Hangman';
import Blackjack from './Blackjack';
import WhackMole from './WhackMole';
import Mines from './Mines';
import Battleship from './Battleship';
import Checkers from './Checkers';
import Mastermind from './Mastermind';
import Sos from './Sos';
import Nim from './Nim';
import LightsOut from './LightsOut';
import MathDuel from './MathDuel';
import Simon from './Simon';
import Snake from './Snake';

export const GAME_COMPONENTS = {
  tictactoe: TicTacToe,
  connectfour: ConnectFour,
  gomoku: Gomoku,
  dotsboxes: DotsBoxes,
  memory: MemoryMatch,
  race: RaceGame,
  rps: RockPaperScissors,
  dice: DiceBattle,
  clash: NumberClash,
  guess: GuessNumber,
  pong: Pong,
  othello: Othello,
  hangman: Hangman,
  blackjack: Blackjack,
  mole: WhackMole,
  mines: Mines,
  battle: Battleship,
  checkers: Checkers,
  master: Mastermind,
  sos: Sos,
  nim: Nim,
  lights: LightsOut,
  math: MathDuel,
  simon: Simon,
  snake: Snake,
};

/* Games playable solo vs computer (dice is pure luck for both sides). */
export const SOLO_IDS = new Set([
  'tictactoe',
  'connectfour',
  'gomoku',
  'dotsboxes',
  'memory',
  'race',
  'rps',
  'clash',
  'guess',
  'pong',
  'othello',
  'hangman',
  'blackjack',
  'mole',
  'mines',
  'battle',
  'checkers',
  'master',
  'sos',
  'nim',
  'lights',
  'math',
  'simon',
  'snake',
]);

export const GAME_TITLE_KEYS = {
  tictactoe: 'tttTitle',
  connectfour: 'c4Title',
  gomoku: 'gomokuTitle',
  dotsboxes: 'dbTitle',
  memory: 'mmTitle',
  race: 'raceTitle',
  rps: 'rpsTitle',
  dice: 'diceTitle',
  clash: 'clashTitle',
  guess: 'guessTitle',
  pong: 'pongTitle',
  othello: 'othelloTitle',
  hangman: 'hangmanTitle',
  blackjack: 'bjTitle',
  mole: 'moleTitle',
  mines: 'minesTitle',
  battle: 'battleTitle',
  checkers: 'checkersTitle',
  master: 'masterTitle',
  sos: 'sosTitle',
  nim: 'nimTitle',
  lights: 'lightsTitle',
  math: 'mathTitle',
  simon: 'simonTitle',
  snake: 'snakeTitle',
};
