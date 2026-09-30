import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LogoMark, SunIcon, MoonIcon, GlobeIcon } from './icons';
import Background from './Background';
import './Layout.css';

export default function Layout({ children, showBack = false, onBack }) {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="layout">
      <Background />
      <header className="header">
        <div
          className="logo"
          onClick={showBack ? onBack : undefined}
          style={showBack ? { cursor: 'pointer' } : {}}
          title={showBack ? t('backToMenu') : ''}
        >
          <span className="logo-mark"><LogoMark size={22} /></span>
          <span className="logo-text">
            <strong>{language === 'zh' ? '雙人遊戲' : 'Two Player Games'}</strong>
          </span>
        </div>
        <div className="header-right">
          <button
            className="theme-switch"
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label={language === 'zh' ? (theme === 'dark' ? '切換日間模式' : '切換夜間模式') : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}
            title={language === 'zh' ? '日夜模式' : 'Day / Night'}
          >
            <SunIcon size={15} />
            <MoonIcon size={15} />
            <span className="theme-knob">
              <span className={`tk-icon ${theme === 'dark' ? 'tk-off' : 'tk-on'}`} aria-hidden="true">
                <SunIcon size={16} />
              </span>
              <span className={`tk-icon ${theme === 'dark' ? 'tk-on' : 'tk-off'}`} aria-hidden="true">
                <MoonIcon size={16} />
              </span>
            </span>
          </button>
          <button
            className="lang-btn"
            onClick={toggleLanguage}
            aria-label={t('language')}
          >
            <GlobeIcon size={16} />
            {language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>© 2026 Two Player Games · {language === 'zh' ? '雙人遊戲' : 'Two Player Games'}</p>
      </footer>
    </div>
  );
}
