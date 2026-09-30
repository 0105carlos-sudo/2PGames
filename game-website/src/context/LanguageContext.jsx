import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  zh: {
    // Common
    home: '首頁',
    selectGame: '選擇遊戲',
    language: '語言',
    player1: '玩家 1',
    player2: '玩家 2',
    currentPlayer: '目前回合',
    winner: '獲勝者',
    draw: '平手',
    restart: '重新開始',
    backToMenu: '返回選單',
    startGame: '開始遊戲',
    howToPlay: '遊戲說明',
    close: '關閉',
    
    // Games
    ticTacToe: '井字遊戲',
    connectFour: '連四棋',
    raceGame: '贏在起跑點',
    rockPaperScissors: '石頭剪刀布',
    
    // Tic Tac Toe
    tttTitle: '井字遊戲',
    tttDesc: '經典的圈叉遊戲，雙方輪流在 3x3 格子中放置符號，先連成一線（橫、直、斜）者獲勝。',
    tttRule1: '玩家 1 使用 ○，玩家 2 使用 ×',
    tttRule2: '雙方輪流點擊空白格子放置符號',
    tttRule3: '先連成橫、直或斜一直線者獲勝',
    tttRule4: '若所有格子填滿仍無人獲勝，則為平手',
    
    // Connect Four
    c4Title: '連四棋',
    c4Desc: '雙方輪流將棋子投入垂直棋盤，棋子會下落到最底部。先讓四顆同色棋子連成一直線（橫、直、斜）者獲勝。',
    c4Rule1: '玩家 1 使用紅色棋子，玩家 2 使用黃色棋子',
    c4Rule2: '點擊欄位上方投入棋子，棋子會自動下落',
    c4Rule3: '先連成四顆同色棋子（橫、直、斜）者獲勝',
    c4Rule4: '棋盤填滿仍無人獲勝則為平手',
    
    // Race Game
    raceTitle: '贏在起跑點',
    raceDesc: '反應速度測試遊戲。等待「開始」訊號出現後，雙方搶按各自按鍵，反應越快者獲勝。',
    raceRule1: '玩家 1 按 [Q] 鍵，玩家 2 按 [P] 鍵',
    raceRule2: '等待倒數計時結束，螢幕顯示「GO!」時按鍵',
    raceRule3: '搶跑（GO! 前按鍵）會被判負',
    raceRule4: '反應時間最短者獲勝',
    getReady: '準備好...',
    go: 'GO!',
    falseStart: '搶跑！',
    reactionTime: '反應時間',
    waitingForSignal: '等待訊號...',
    pressKeyToStart: '按任意鍵開始',
    
    // Rock Paper Scissors
    rpsTitle: '石頭剪刀布',
    rpsDesc: '經典猜拳遊戲。雙方同時出拳：石頭贏剪刀、剪刀贏布、布贏石頭。',
    rpsRule1: '玩家 1 按 [Q] 石頭、[W] 剪刀、[E] 布',
    rpsRule2: '玩家 2 按 [U] 石頭、[I] 剪刀、[O] 布',
    rpsRule3: '雙方都選擇後自動判定勝負',
    rpsRule4: '相同手勢為平手，重新遊戲',
    rock: '石頭',
    paper: '布',
    scissors: '剪刀',
    chooseYourMove: '選擇你的出拳',
    player1Choosing: '玩家 1 選擇中...',
    player2Choosing: '玩家 2 選擇中...',
    bothChosen: '雙方已選擇，判定中...',
    player1Wins: '玩家 1 獲勝！',
    player2Wins: '玩家 2 獲勝！',
    itsADraw: '平手！',
    playAgain: '再玩一次',
    
    // Gomoku
    gomoku: '五子棋',
    gomokuTitle: '五子棋',
    gomokuDesc: '雙方在 15x15 棋盤上輪流下子，先連成五子一線（橫、直、斜）者獲勝。',
    gomokuRule1: '玩家 1 執黑子先行，玩家 2 執白子',
    gomokuRule2: '點擊棋盤交叉點放置棋子',
    gomokuRule3: '先連成五子（橫、直、斜）者獲勝',
    gomokuRule4: '棋盤填滿仍無人連五則為平手',
    blackStone: '黑子',
    whiteStone: '白子',

    // Dots and Boxes
    dotsBoxes: '點格棋',
    dbTitle: '點格棋',
    dbDesc: '輪流在點陣之間連線，圍出格子即得分並可再下一手，得分多者獲勝。',
    dbRule1: '雙方輪流點擊兩點之間的虛線來連線',
    dbRule2: '圍出一個格子即得 1 分，並可額外再連一條線',
    dbRule3: '一次圍出多個格子可得相對應分數',
    dbRule4: '所有格子被佔滿時，分數高者獲勝',
    score: '分數',
    boxes: '格子',

    // Memory Match
    memoryMatch: '記憶配對',
    mmTitle: '記憶配對',
    mmDesc: '輪流翻開兩張牌，配對成功得分並可繼續，記住牌的位置是關鍵。',
    mmRule1: '雙方輪流點擊卡片，一次翻兩張',
    mmRule2: '兩張相同即配對成功，得 1 分並可再翻一次',
    mmRule3: '配對失敗則蓋回，換對方回合',
    mmRule4: '所有牌配對完畢時，分數高者獲勝',
    pairs: '配對',

    // Dice Battle
    diceBattle: '骰子對戰',
    diceTitle: '骰子對戰',
    diceDesc: '雙方每回合同時擲骰子比大小，贏得回合多者獲得最終勝利。',
    diceRule1: '選擇回合數（3 / 5 / 7），按下擲骰子開始',
    diceRule2: '每回合雙方各擲一顆骰子，點數大者贏得該回合',
    diceRule3: '點數相同則該回合平手，雙方皆不得分',
    diceRule4: '所有回合結束後，贏得回合多者獲勝',
    roll: '擲骰子',
    round: '回合',

    // Pong
    pong: '乒乓對戰',
    pongTitle: '乒乓對戰',
    pongDesc: '經典乒乓對打，玩家 1 用 W/S，玩家 2 用方向鍵，先拿下 5 分者獲勝。',
    pongRule1: '玩家 1 按 W（上）、S（下）移動擋板',
    pongRule2: '玩家 2 按 ↑（上）、↓（下）移動擋板',
    pongRule3: '將球打進對方球門即得 1 分，先到 5 分者獲勝',
    pongRule4: '球速會隨擊球次數逐漸加快，空格鍵可暫停',
    pongRule5: '瘋狂模式：每次擊打都會分裂成兩粒，每 3 秒由其中一邊邊界發射 1 粒，限時 1–4 分鐘任選',
    pause: '暫停',
    resume: '繼續',
    classicMode: '經典模式',
    crazyMode: '瘋狂模式',
    minutes: '分鐘',
    crazyHint: '每次擊打分裂成兩粒 · 每 3 秒由邊界發射 1 粒 · 限時 1–4 分鐘任選',
    timeUp: '時間到',

    // Modes
    you: '你',
    computer: '電腦',
    modeDuo: '雙人對戰',
    modeSolo: '單人挑戰',
    modeShowdown: '對決模式',
    soloTagline: '與電腦一較高下',
    duoOnly: '雙人限定',
    choosing: '選擇中…',

    // Number Clash
    clash: '數字對決',
    clashTitle: '數字對決',
    clashDesc: '每回合雙方各開一個 1–99 隨機數字，大者贏得該回合，共 5 回合。',
    clashRule1: '按下「開牌」，雙方同時開出 1–99 的隨機數字',
    clashRule2: '數字大者贏得該回合，得 1 分',
    clashRule3: '數字相同則該回合平手，雙方皆不得分',
    clashRule4: '5 回合結束後，總分高者獲勝',
    reveal: '開牌',

    // Guess Number
    guessNumber: '猜數字',
    guessTitle: '猜數字',
    guessDesc: '1–100 之中藏了一個神秘數字，雙方輪流猜，最先猜中者獲勝。',
    guessRule1: '系統隨機選出 1–100 之間的神秘數字',
    guessRule2: '雙方輪流輸入數字，每次猜測後會提示太大或太小',
    guessRule3: '先猜中神秘數字者獲勝',
    guessRule4: '單人模式由你先猜，電腦會逐步逼近答案',
    tooHigh: '太大了',
    tooLow: '太小了',
    guessAction: '猜',
    guessPlaceholder: '輸入 1–100',
    guessHistory: '猜測記錄',
    correctGuess: '猜中了！',

    // Showdown
    p1Name: '玩家一',
    p2Name: '玩家二',
    namePlaceholder: '輸入名字…',
    gameCountLabel: '對決場數',
    pickGamesLabel: '選擇遊戲',
    needGamesText: '請選擇 {n} 款遊戲',
    startShowdown: '開始對決',
    matchProgress: '第 {i} / {n} 場',
    nextGame: '下一場',
    seeResults: '查看結果',
    champion: '總冠軍',
    deadHeat: '不分勝負',
    winGameText: '{name} 贏得第 {i} 場',
    resultsList: '各場戰績',
    rematch: '再對決一次',

    // Winner modal
    congratulations: '恭喜',
    wins: '獲勝！',

    // Othello
    othello: '黑白棋',
    othelloTitle: '黑白棋',
    othelloDesc: '8x8 經典翻轉棋，夾住對方棋子即可翻轉，終局子多者獲勝。',
    otRule1: '玩家 1 執黑子先行，玩家 2 執白子',
    otRule2: '落子必須夾住對方棋子，被夾的棋子會翻轉',
    otRule3: '無子可下時自動跳過回合',
    otRule4: '棋盤下滿或雙方皆無子可下時，子多者獲勝',
    otPass: '跳過',

    // Hangman
    hangman: '猜字遊戲',
    hangmanTitle: '猜字遊戲',
    hangmanDesc: '一個一個字母猜出神秘英文單字，6 次猜錯就會失敗。',
    hmRule1: '單人模式由電腦隨機出題',
    hmRule2: '雙人模式由玩家 1 出題，玩家 2 猜',
    hmRule3: '每次猜一個 A–Z 字母，猜錯累積吊頸進度',
    hmRule4: '6 次猜錯前拼出單字即猜中者獲勝',
    hangmanHint: '提示',
    hangmanWrong: '猜錯',
    hangmanLeft: '剩餘機會',
    hangmanOver: '遊戲結束',
    hangmanAnswer: '答案是',
    hangmanSolo: '電腦已出題',
    hangmanP1Set: '玩家 1 請輸入神秘單字（A–Z）',

    // Blackjack
    blackjack: '廿一點',
    bjTitle: '廿一點',
    bjDesc: '鬥大但唔好爆！最接近 21 點者獲勝，超過 21 點即爆煲。',
    bjRule1: 'J / Q / K 計 10 點，A 可計 1 或 11 點',
    bjRule2: '單人模式你對戰電腦莊家，莊家未夠 17 點必須要牌',
    bjRule3: '雙人模式雙方輪流要牌或停牌，鬥最接近 21 點',
    bjRule4: '超過 21 點即爆煲，直接判負',
    bjHit: '要牌',
    bjStand: '停牌',

    // Whack-a-mole
    mole: '打地鼠',
    moleTitle: '打地鼠',
    moleDesc: '限時 20 秒，睇吓你扑到幾多隻地鼠，手快有手慢冇！',
    moleRule1: '地鼠隨機彈出，點擊即得分',
    moleRule2: '單人模式與電腦分數鬥高低',
    moleRule3: '雙人模式雙方輪流上場 20 秒，分高者獲勝',
    moleRule4: '時間條歸零即結束',
    molePts: '分',

    // Minesweeper
    mines: '踩地雷',
    minesTitle: '踩地雷對戰',
    minesDesc: '8x8 埋咗 10 粒地雷，輪流揭格鬥多安全格，踩中即輸。',
    minesRule1: '雙方輪流點擊未揭開的格子',
    minesRule2: '數字代表周圍 8 格內的地雷數，空白會自動展開',
    minesRule3: '踩中地雷即輸，對方獲勝',
    minesRule4: '揭開所有安全格後，揭得多者獲勝',
    minesNote: '第一下一定安全 · 踩中地雷即輸',

    // Battleship
    battle: '海戰棋',
    battleTitle: '海戰棋',
    battleDesc: '6x6 海域各自藏起 3 艘戰艦，輪流開炮，先擊沉對方全艦隊者勝。',
    battleRule1: '雙方艦隊由電腦隨機部署（3 格、2 格、2 格各一艘）',
    battleRule2: '輪流點擊敵方海域開炮，🔥 命中、· 未中',
    battleRule3: '上方係敵方海域，下方係自己艦隊',
    battleRule4: '先擊沉對方全部 3 艘戰艦者獲勝',
    battleEnemy: '敵方海域',
    battleFleet: '自己艦隊',

    // Checkers
    checkers: '西洋跳棋',
    checkersTitle: '西洋跳棋',
    checkersDesc: '斜行跳食經典棋，食晒對方棋子或者令對方無子可走即勝。',
    checkersRule1: '玩家 1 執黑子在下方先行，玩家 2 執白子',
    checkersRule2: '沿斜線走一格，跳過對方棋子即可食子',
    checkersRule3: '食子後若可繼續跳食，必須連跳；到底線即升王可前後走',
    checkersRule4: '食晒對方棋子或令對方無合法走法者獲勝',
    // Mastermind
    master: '密碼破解',
    masterTitle: '密碼破解',
    masterDesc: '4 粒顏色密碼，10 次機會靠提示破解，鬥智慧同邏輯。',
    masterRule1: '單人由電腦隨機出密碼，雙人由玩家 1 自定密碼',
    masterRule2: '每次猜 4 隻顏色，● 代表顏色位置全中，○ 代表顏色中位置錯',
    masterRule3: '共 10 次機會，破解成功即猜中者獲勝',
    masterRule4: '10 次用完仍未破解即出題者獲勝',
    masterSetCode: '設定 4 粒顏色密碼',
    masterTry: '第',
    masterGuess: '猜！',
    masterAnswer: '密碼是',

    // SOS
    sos: 'SOS 連字',
    sosTitle: 'SOS 連字',
    sosDesc: '輪流填 S 或 O，砌出 SOS 即得分兼再下一手，分高者勝。',
    sosRule1: '每回合先選 S 或 O，再點空格填入',
    sosRule2: '砌出一條 SOS 得 1 分，並可額外再下一手',
    sosRule3: '橫、直、斜皆可，一次砌多條得多分',
    sosRule4: '6x6 填滿時，分數高者獲勝',

    // Nim
    nim: '拿石頭',
    nimTitle: '拿石頭',
    nimDesc: '三堆石頭輪流拿，拎走最後一粒者勝，考驗數學思維。',
    nimRule1: '開局三堆分別有 3、4、5 粒石頭',
    nimRule2: '每回合選一堆，拎走至少 1 粒（可拎晒成堆）',
    nimRule3: '拎走最後一粒石頭者獲勝',
    nimRule4: '單人模式電腦識玩必勝法，小心！',
    nimPile: '堆',
    nimLeft: '剩餘',
    nimTake: '拎走',
    nimConfirm: '確定',

    // Lights Out
    lights: '熄燈',
    lightsTitle: '熄燈',
    lightsDesc: '撳一粒燈連隔籬一齊轉，熄晒全版 5x5 即勝。',
    lightsRule1: '點擊一格，該格及上下左右鄰格會一齊開關',
    lightsRule2: '雙人輪流撳，邊個撳熄最後一盞燈即獲勝',
    lightsRule3: '單人模式熄晒全版即獲勝',
    lightsRule4: '開局保證有解，唔會死局',
    lightsSoloNote: '熄晒全版即過關',
    lightsDuoNote: '撳熄最後一盞燈者勝',

    // Math Duel
    math: '數學對決',
    mathTitle: '數學對決',
    mathDesc: '加減乘快問快答鬥手速，共 5 題，先答中者得分。',
    mathRule1: '每題雙方答同一條數學題，共 5 回合',
    mathRule2: '雙人模式先答中者贏得該回合',
    mathRule3: '單人模式要快過電腦作答',
    mathRule4: '5 回合後總分高者獲勝',
    // Simon
    simon: '霓虹記憶',
    simonTitle: '霓虹記憶',
    simonDesc: '睇住四色燈閃爍次序，逐次跟住撳，愈來愈長，鬥記憶力。',
    simonRule1: '先睇燈閃一次，再按相同次序撳返',
    simonRule2: '每次成功序列會加長一盞',
    simonRule3: '撳錯即結束，單人要完成 6 盞序列先贏電腦',
    simonRule4: '雙人雙方輪流挑戰，記得愈長者獲勝',
    simonLen: '長度',
    simonReady: '撳開始接受挑戰',

    // Snake
    snake: '貪食蛇',
    snakeTitle: '貪食蛇',
    snakeDesc: '經典貪食蛇，食蘋果變長，唔好撞牆撞自己，鬥食得多！',
    snakeRule1: '方向鍵 / WASD 或畫面按鈕控制方向',
    snakeRule2: '食一個蘋果得 1 分並變長，速度不變',
    snakeRule3: '撞牆或撞到自己即結束',
    snakeRule4: '單人食夠 12 個即贏；雙人輪流上場，分高者勝',
    snakeReady: '撳開始出發',
  },
  en: {
    // Common
    home: 'Home',
    selectGame: 'Select Game',
    language: 'Language',
    player1: 'Player 1',
    player2: 'Player 2',
    currentPlayer: 'Current Turn',
    winner: 'Winner',
    draw: 'Draw',
    restart: 'Restart',
    backToMenu: 'Back to Menu',
    startGame: 'Start Game',
    howToPlay: 'How to Play',
    close: 'Close',
    
    // Games
    ticTacToe: 'Tic Tac Toe',
    connectFour: 'Connect Four',
    raceGame: 'Quick Draw',
    rockPaperScissors: 'Rock Paper Scissors',
    
    // Tic Tac Toe
    tttTitle: 'Tic Tac Toe',
    tttDesc: 'Classic X-O game. Players take turns placing symbols on a 3x3 grid. First to connect three in a row (horizontal, vertical, diagonal) wins.',
    tttRule1: 'Player 1 uses ○, Player 2 uses ×',
    tttRule2: 'Take turns clicking empty cells to place symbols',
    tttRule3: 'First to connect three in a row (horizontal, vertical, diagonal) wins',
    tttRule4: 'If all cells are filled with no winner, it\'s a draw',
    
    // Connect Four
    c4Title: 'Connect Four',
    c4Desc: 'Players take turns dropping discs into a vertical board. Discs fall to the bottom. First to connect four of the same color in a row (horizontal, vertical, diagonal) wins.',
    c4Rule1: 'Player 1 uses red discs, Player 2 uses yellow discs',
    c4Rule2: 'Click column top to drop disc, it falls automatically',
    c4Rule3: 'First to connect four discs (horizontal, vertical, diagonal) wins',
    c4Rule4: 'If board fills with no winner, it\'s a draw',
    
    // Race Game
    raceTitle: 'Quick Draw',
    raceDesc: 'Reaction speed test. Wait for the "GO!" signal, then press your key as fast as possible. Fastest reaction wins.',
    raceRule1: 'Player 1 presses [Q], Player 2 presses [P]',
    raceRule2: 'Wait for countdown to finish, press key when "GO!" appears',
    raceRule3: 'False start (pressing before GO!) loses the round',
    raceRule4: 'Shortest reaction time wins',
    getReady: 'Get Ready...',
    go: 'GO!',
    falseStart: 'False Start!',
    reactionTime: 'Reaction Time',
    waitingForSignal: 'Waiting for signal...',
    pressKeyToStart: 'Press any key to start',
    
    // Rock Paper Scissors
    rpsTitle: 'Rock Paper Scissors',
    rpsDesc: 'Classic hand game. Both players choose simultaneously: Rock beats Scissors, Scissors beats Paper, Paper beats Rock.',
    rpsRule1: 'Player 1: [Q] Rock, [W] Scissors, [E] Paper',
    rpsRule2: 'Player 2: [U] Rock, [I] Scissors, [O] Paper',
    rpsRule3: 'Winner determined automatically after both choose',
    rpsRule4: 'Same gesture = draw, play again',
    rock: 'Rock',
    paper: 'Paper',
    scissors: 'Scissors',
    chooseYourMove: 'Choose your move',
    player1Choosing: 'Player 1 choosing...',
    player2Choosing: 'Player 2 choosing...',
    bothChosen: 'Both chosen, deciding...',
    player1Wins: 'Player 1 Wins!',
    player2Wins: 'Player 2 Wins!',
    itsADraw: 'It\'s a Draw!',
    playAgain: 'Play Again',
    
    // Gomoku
    gomoku: 'Gomoku',
    gomokuTitle: 'Gomoku',
    gomokuDesc: 'Take turns placing stones on a 15x15 board. First to connect five in a row (horizontal, vertical, diagonal) wins.',
    gomokuRule1: 'Player 1 plays Black and moves first, Player 2 plays White',
    gomokuRule2: 'Click an intersection to place a stone',
    gomokuRule3: 'First to connect five (horizontal, vertical, diagonal) wins',
    gomokuRule4: 'If the board fills with no five-in-a-row, it\'s a draw',
    blackStone: 'Black',
    whiteStone: 'White',

    // Dots and Boxes
    dotsBoxes: 'Dots and Boxes',
    dbTitle: 'Dots and Boxes',
    dbDesc: 'Take turns drawing lines between dots. Complete a box to score and play again. Most boxes wins.',
    dbRule1: 'Click a dashed line between two dots to draw it',
    dbRule2: 'Completing a box scores 1 point and grants a bonus move',
    dbRule3: 'Completing multiple boxes scores multiple points',
    dbRule4: 'When all boxes are claimed, the highest score wins',
    score: 'Score',
    boxes: 'Boxes',

    // Memory Match
    memoryMatch: 'Memory Match',
    mmTitle: 'Memory Match',
    mmDesc: 'Take turns flipping two cards. Match a pair to score and play again. Remember positions to win.',
    mmRule1: 'Take turns clicking cards to flip two of them',
    mmRule2: 'A matching pair scores 1 point and grants another turn',
    mmRule3: 'A miss flips the cards back and passes the turn',
    mmRule4: 'When all pairs are found, the highest score wins',
    pairs: 'Pairs',

    // Dice Battle
    diceBattle: 'Dice Battle',
    diceTitle: 'Dice Battle',
    diceDesc: 'Both players roll a die each round. Higher roll wins the round. Most rounds wins the match.',
    diceRule1: 'Choose rounds (3 / 5 / 7), then press Roll to play',
    diceRule2: 'Each round both roll one die, higher number wins the round',
    diceRule3: 'Equal numbers = tied round, no points',
    diceRule4: 'After all rounds, most round wins takes the match',
    roll: 'Roll',
    round: 'Round',

    // Pong
    pong: 'Pong Battle',
    pongTitle: 'Pong Battle',
    pongDesc: 'Classic paddle duel. Player 1 uses W/S, Player 2 uses arrow keys. First to 5 points wins.',
    pongRule1: 'Player 1 moves with W (up) and S (down)',
    pongRule2: 'Player 2 moves with ↑ (up) and ↓ (down)',
    pongRule3: 'Score by getting the ball past the opponent. First to 5 wins',
    pongRule4: 'Ball speeds up with every hit. Spacebar pauses',
    pongRule5: 'Crazy mode: every hit splits into two, +1 ball from alternating sides every 3s, 1–4 min timer',
    pause: 'Pause',
    resume: 'Resume',
    classicMode: 'Classic',
    crazyMode: 'Crazy',
    minutes: 'min',
    crazyHint: 'Every hit splits into two · +1 ball from the sides every 3s · 1–4 min timer',
    timeUp: "Time's up",

    // Modes
    you: 'You',
    computer: 'Computer',
    modeDuo: 'Two Players',
    modeSolo: 'Solo',
    modeShowdown: 'Showdown',
    soloTagline: 'Challenge the computer',
    duoOnly: '2P only',
    choosing: 'choosing…',

    // Number Clash
    clash: 'Number Clash',
    clashTitle: 'Number Clash',
    clashDesc: 'Each round both sides reveal a random number from 1–99. Higher wins the round. 5 rounds total.',
    clashRule1: 'Press “Reveal”: both sides open a random number from 1–99',
    clashRule2: 'Higher number wins the round and scores 1 point',
    clashRule3: 'Equal numbers = tied round, no points',
    clashRule4: 'After 5 rounds, the higher total wins',
    reveal: 'Reveal',

    // Guess Number
    guessNumber: 'Guess the Number',
    guessTitle: 'Guess the Number',
    guessDesc: 'A mystery number hides between 1–100. Take turns guessing — first to hit it wins.',
    guessRule1: 'The system picks a mystery number between 1–100',
    guessRule2: 'Take turns entering a number; each guess tells you too high or too low',
    guessRule3: 'First to guess the mystery number wins',
    guessRule4: 'In solo mode you guess first, the computer closes in gradually',
    tooHigh: 'Too high',
    tooLow: 'Too low',
    guessAction: 'Guess',
    guessPlaceholder: 'Enter 1–100',
    guessHistory: 'Guess history',
    correctGuess: 'Correct!',

    // Showdown
    p1Name: 'Player One',
    p2Name: 'Player Two',
    namePlaceholder: 'Enter name…',
    gameCountLabel: 'Games',
    pickGamesLabel: 'Pick games',
    needGamesText: 'Please select {n} games',
    startShowdown: 'Start Showdown',
    matchProgress: 'Game {i} of {n}',
    nextGame: 'Next game',
    seeResults: 'See results',
    champion: 'Champion',
    deadHeat: 'Dead heat',
    winGameText: '{name} wins game {i}',
    resultsList: 'Results by game',
    rematch: 'Rematch',

    // Winner modal
    congratulations: 'Congratulations',
    wins: 'Wins!',

    // Othello
    othello: 'Othello',
    othelloTitle: 'Othello',
    othelloDesc: 'Classic 8x8 flipping duel. Sandwich rival discs to flip them. Most discs at the end wins.',
    otRule1: 'Player 1 plays Black and moves first, Player 2 plays White',
    otRule2: 'Each move must sandwich rival discs, which then flip',
    otRule3: 'Turn is skipped automatically when no legal move exists',
    otRule4: 'When the board fills or neither side can move, most discs wins',
    otPass: 'pass',

    // Hangman
    hangman: 'Hangman',
    hangmanTitle: 'Hangman',
    hangmanDesc: 'Guess the secret English word letter by letter. Six wrong guesses and it is over.',
    hmRule1: 'Solo mode: the computer picks a random word',
    hmRule2: '2P mode: Player 1 sets the word, Player 2 guesses',
    hmRule3: 'Guess one letter A–Z at a time; misses build the gallows',
    hmRule4: 'Spell the word before 6 misses and the guesser wins',
    hangmanHint: 'Hint',
    hangmanWrong: 'Misses',
    hangmanLeft: 'lives left',
    hangmanOver: 'Game over',
    hangmanAnswer: 'Answer',
    hangmanSolo: 'Computer has set the word',
    hangmanP1Set: 'Player 1, enter a secret word (A–Z)',

    // Blackjack
    blackjack: 'Blackjack',
    bjTitle: 'Blackjack',
    bjDesc: 'Get closest to 21 without going bust. Over 21 loses instantly.',
    bjRule1: 'J / Q / K count as 10, A counts as 1 or 11',
    bjRule2: 'Solo: you face the dealer, who must hit below 17',
    bjRule3: '2P: take turns to hit or stand, closest to 21 wins',
    bjRule4: 'Going over 21 is bust and loses immediately',
    bjHit: 'Hit',
    bjStand: 'Stand',

    // Whack-a-mole
    mole: 'Whack-a-Mole',
    moleTitle: 'Whack-a-Mole',
    moleDesc: '20 seconds on the clock. Whack as many moles as you can!',
    moleRule1: 'Moles pop up at random, click one to score',
    moleRule2: 'Solo: beat the computer score',
    moleRule3: '2P: take turns playing 20 seconds each, higher score wins',
    moleRule4: 'Game ends when the time bar runs out',
    molePts: 'pts',

    // Minesweeper
    mines: 'Minesweeper',
    minesTitle: 'Minesweeper Duel',
    minesDesc: '8x8 field hiding 10 mines. Take turns revealing cells — hit a mine and you lose.',
    minesRule1: 'Take turns clicking an unrevealed cell',
    minesRule2: 'Numbers show mines in the 8 surrounding cells; blanks auto-expand',
    minesRule3: 'Hitting a mine loses immediately',
    minesRule4: 'If all safe cells open, the higher revealer wins',
    minesNote: 'First click is always safe · a mine ends the game',

    // Battleship
    battle: 'Battleship',
    battleTitle: 'Battleship',
    battleDesc: '6x6 seas hiding 3 ships each. Take turns firing — sink the whole fleet first.',
    battleRule1: 'Both fleets deploy randomly (ships of 3, 2 and 2 cells)',
    battleRule2: 'Click enemy waters to fire: 🔥 hit, · miss',
    battleRule3: 'Top board is the enemy sea, bottom is your fleet',
    battleRule4: 'First to sink all 3 enemy ships wins',
    battleEnemy: 'Enemy waters',
    battleFleet: 'Your fleet',

    // Checkers
    checkers: 'Checkers',
    checkersTitle: 'Checkers',
    checkersDesc: 'Classic diagonal jump-and-capture duel. Take every piece or block all moves.',
    checkersRule1: 'Player 1 (black, bottom) moves first, Player 2 is white',
    checkersRule2: 'Move one diagonal step; jump over a rival piece to capture it',
    checkersRule3: 'Chain jumps continue automatically; reaching the far row crowns a king',
    checkersRule4: 'Capturing every piece or leaving the rival with no move wins',
    // Mastermind
    master: 'Mastermind',
    masterTitle: 'Mastermind',
    masterDesc: 'Crack a 4-color secret code in 10 tries using black/white peg clues.',
    masterRule1: 'Solo: computer sets the code; 2P: Player 1 sets it',
    masterRule2: 'Each guess uses 4 colors. ● = right color and spot, ○ = right color wrong spot',
    masterRule3: '10 attempts total — cracking it wins the guesser the game',
    masterRule4: 'Surviving all 10 attempts wins the setter the game',
    masterSetCode: 'Set a 4-color secret code',
    masterTry: 'Try',
    masterGuess: 'Guess!',
    masterAnswer: 'Code',

    // SOS
    sos: 'SOS',
    sosTitle: 'SOS',
    sosDesc: 'Place S or O each turn. Every SOS scores and grants a bonus move.',
    sosRule1: 'Pick S or O, then tap an empty cell',
    sosRule2: 'Each SOS scores 1 point plus a bonus move',
    sosRule3: 'Horizontal, vertical and diagonal all count; multiple lines score more',
    sosRule4: 'When the 6x6 fills up, the higher score wins',

    // Nim
    nim: 'Nim Stones',
    nimTitle: 'Nim Stones',
    nimDesc: 'Three piles, take turns removing stones. Taking the last one wins.',
    nimRule1: 'Three piles start with 3, 4 and 5 stones',
    nimRule2: 'Each turn pick one pile and take at least 1 stone (up to the whole pile)',
    nimRule3: 'Whoever takes the last stone wins',
    nimRule4: 'Solo computer plays the winning strategy — beware!',
    nimPile: 'Pile',
    nimLeft: 'left',
    nimTake: 'Take',
    nimConfirm: 'Confirm',

    // Lights Out
    lights: 'Lights Out',
    lightsTitle: 'Lights Out',
    lightsDesc: 'Tap a light to toggle it plus its neighbours. Turn the 5x5 dark to win.',
    lightsRule1: 'Clicking a cell toggles it plus its up/down/left/right neighbours',
    lightsRule2: '2P: alternate taps — whoever turns off the last light wins',
    lightsRule3: 'Solo: darken the whole board to win',
    lightsRule4: 'Every puzzle is guaranteed solvable',
    lightsSoloNote: 'Turn every light off to win',
    lightsDuoNote: 'Last light out wins',

    // Math Duel
    math: 'Math Duel',
    mathTitle: 'Math Duel',
    mathDesc: 'Fast-fire arithmetic over 5 rounds. First correct answer scores.',
    mathRule1: 'Both sides answer the same question each round, 5 rounds total',
    mathRule2: '2P: first correct answer wins the round',
    mathRule3: 'Solo: answer before the computer does',
    mathRule4: 'Highest total after 5 rounds wins',
    // Simon
    simon: 'Neon Memory',
    simonTitle: 'Neon Memory',
    simonDesc: 'Watch the four pads flash, then repeat the sequence as it grows.',
    simonRule1: 'Watch the lights, then tap the pads in the same order',
    simonRule2: 'The sequence grows by one light after every success',
    simonRule3: 'A mistake ends the run; solo must clear length 6 to win',
    simonRule4: '2P: take turns, the longer memory wins',
    simonLen: 'Length',
    simonReady: 'Press start to take the challenge',

    // Snake
    snake: 'Snake',
    snakeTitle: 'Snake',
    snakeDesc: 'Classic snake. Eat apples to grow — avoid walls and yourself!',
    snakeRule1: 'Steer with arrow keys / WASD or the on-screen pad',
    snakeRule2: 'Each apple scores 1 point and grows the snake',
    snakeRule3: 'Hitting a wall or yourself ends the run',
    snakeRule4: 'Solo: eat 12 to win; 2P: take turns, higher score wins',
    snakeReady: 'Press start to play',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('game-language');
    if (saved) return saved;
    // Auto-detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('zh') ? 'zh' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('game-language', language);
    document.documentElement.lang = language === 'zh' ? 'zh-TW' : 'en';
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        return key;
      }
    }
    return result;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}