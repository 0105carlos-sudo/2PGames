import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Menu from './components/Menu';
import ShowdownRun from './components/Showdown';
import { GAME_COMPONENTS } from './games/registry';
import './App.css';

function GameRouter() {
  const [route, setRoute] = useState({ screen: 'menu', tab: 'duo' });

  const backToMenu = (tab) => setRoute({ screen: 'menu', tab: tab || 'duo' });

  if (route.screen === 'game') {
    const Comp = GAME_COMPONENTS[route.game];
    if (!Comp) return null;
    return (
      <Comp
        mode={route.mode}
        onBack={() => backToMenu(route.mode === 'solo' ? 'solo' : 'duo')}
      />
    );
  }

  if (route.screen === 'showdown') {
    return (
      <ShowdownRun
        config={route.config}
        onExit={() => backToMenu('showdown')}
      />
    );
  }

  return (
    <Menu
      initialTab={route.tab}
      onStartGame={(game, mode) => setRoute({ screen: 'game', game, mode })}
      onStartShowdown={(config) => setRoute({ screen: 'showdown', config })}
    />
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <GameRouter />
      </ThemeProvider>
    </LanguageProvider>
  );
}
