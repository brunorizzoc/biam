import React, { useState, useEffect, useCallback, useRef } from 'react';
import InputArea from './components/InputArea';
import Roulette from './components/Roulette';
import WinnerModal from './components/WinnerModal';
import SettingsBar from './components/SettingsBar';
import HistoryDisplay from './components/HistoryDisplay';
import Button from './components/common/Button';
import { RouletteItem, Theme, HistoryEntry } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { IconPlay } from './constants';
import ColorPaletteSelector from './components/ColorPaletteSelector';
import { colorPalettes } from './utils/colorPalettes';

const App: React.FC = () => {
  const [entries, setEntries] = useLocalStorage<RouletteItem[]>('rouletteEntries_v2', []); // Chave alterada para evitar conflitos com versões antigas
  const [currentWinner, setCurrentWinner] = useState<RouletteItem | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState<boolean>(false);
  
  const [theme, setTheme] = useLocalStorage<Theme>('rouletteTheme_v2', 'light');
  const [removeWinnerAfterSpin, setRemoveWinnerAfterSpin] = useLocalStorage<boolean>('rouletteRemoveWinner_v2', true);
  // soundEnabled e refs de áudio removidos
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('rouletteHistory_v2', []);
  const [paletteIndex, setPaletteIndex] = useLocalStorage<number>('colorPaletteIndex', 0);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Aplica as cores da paleta escolhida como variáveis CSS
  useEffect(() => {
    const palette = colorPalettes[paletteIndex];
    if (palette) {
      palette.colors.forEach((color, idx) => {
        document.documentElement.style.setProperty(`--theme-color-${idx+1}`, color);
      });
    }
  }, [paletteIndex]);

  // useEffect para áudio removido

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSpin = useCallback(() => {
    if (entries.length === 0 || isSpinning) return;

    // Lógica de som removida

    if (entries.length === 1) { // Caso especial para um único item
      const winner = entries[0];
      setCurrentWinner(winner);
      setIsWinnerModalOpen(true);
      const newHistoryEntry: HistoryEntry = { id: winner.id, name: winner.name, date: new Date().toLocaleString() };
      setHistory(prev => [newHistoryEntry, ...prev].slice(0, 50));
      if (removeWinnerAfterSpin) {
        setEntries([]);
      }
      // Lógica de som de vitória removida
      return;
    }

    setIsSpinning(true);
    setCurrentWinner(null); 

    const winnerIndex = Math.floor(Math.random() * entries.length);
    const winner = entries[winnerIndex];

    const segmentAngle = 360 / entries.length;
    const winnerSegmentMidPointAngle = (winnerIndex * segmentAngle) + (segmentAngle / 2);
    const targetFinalCssAngle = -winnerSegmentMidPointAngle;
    const desiredFinalOrientation = (targetFinalCssAngle % 360 + 360) % 360;
    const currentWheelOrientation = (rotation % 360 + 360) % 360;
    let adjustmentSpin = desiredFinalOrientation - currentWheelOrientation;
    if (adjustmentSpin < 0) {
      adjustmentSpin += 360;
    }
    const fullSpinsForEffect = 5 + Math.floor(Math.random() * 3); // Reduzido um pouco para ser mais rápido
    const newRotationValue = rotation + (fullSpinsForEffect * 360) + adjustmentSpin;
    
    setRotation(newRotationValue);

    setTimeout(() => {
      // Lógica de som removida
      setCurrentWinner(winner);
      setIsWinnerModalOpen(true);
      setIsSpinning(false);
      
      const newHistoryEntry: HistoryEntry = { id: winner.id, name: winner.name, date: new Date().toLocaleString() };
      setHistory(prev => [newHistoryEntry, ...prev].slice(0,50));

      if (removeWinnerAfterSpin) {
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== winner.id));
      }
    }, 5100); 

  }, [entries, isSpinning, removeWinnerAfterSpin, setEntries, setHistory, rotation]);

  const closeWinnerModal = () => {
    setIsWinnerModalOpen(false);
  };
  
  const spinAgain = () => {
    closeWinnerModal();
    // Pequeno delay para garantir que o modal fechou antes de girar, se necessário
    setTimeout(() => {
        handleSpin();
    }, 100); 
  };

  const clearHistory = () => {
    setHistory([]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-secondary-light/20 dark:from-primary-dark/30 dark:via-dark-background dark:to-secondary-dark/30 transition-colors duration-300 flex flex-col">
      {/* Header fixo */}
      <header className="w-full h-16 flex items-center px-4 sm:px-8 bg-white/80 dark:bg-dark-background/80 shadow-md z-20 sticky top-0 justify-between">
        <img
          src="https://brunorizzoc.github.io/roleta/logo.png"
          alt="Roleta Logo"
          className="h-14 w-auto object-contain select-none"
          draggable="false"
          style={{ maxHeight: '3.5rem' }}
        />
        <button
          onClick={toggleTheme}
          className="ml-2 flex items-center justify-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition text-xl"
          aria-label="Alternar modo claro/escuro"
          type="button"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      <div className="flex flex-1 w-full max-w-full overflow-hidden flex-col md:flex-row">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex flex-col gap-6 w-72 min-w-[220px] max-w-xs bg-white/80 dark:bg-dark-background/80 border-r border-gray-200 dark:border-gray-700 px-2 py-6 shadow-md z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <ColorPaletteSelector selectedPalette={paletteIndex} onSelect={setPaletteIndex} />
            </div>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition text-lg font-medium mb-4"
              aria-label="Alternar modo claro/escuro (menu)"
              type="button"
            >
              {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
            </button>
            <div className="w-full max-w-md mx-auto">
              <HistoryDisplay history={history} clearHistory={clearHistory} />
            </div>
          </div>
        </aside>
        {/* Área principal desktop: adicionar itens | roleta */}
        <main className="hidden md:flex flex-1 flex-row items-start justify-center gap-6 sm:gap-8 px-2 py-6 overflow-x-auto w-full">
          <div className="w-full md:w-[340px] max-w-md mx-auto md:mx-0 mb-6 md:mb-0">
            <InputArea setEntries={setEntries} entries={entries} />
          </div>
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
            <Roulette 
              items={entries} 
              rotation={rotation} 
              isSpinning={isSpinning} 
              size={Math.max(220, Math.min(420, typeof window !== 'undefined' ? window.innerWidth * 0.95 : 320, typeof window !== 'undefined' ? window.innerHeight * 0.45 : 320))}
              palette={colorPalettes[paletteIndex]}
            />
            <Button 
              onClick={handleSpin} 
              disabled={isSpinning || entries.length === 0}
              size="lg"
              variant="primary"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md px-6 py-3 sm:px-12 sm:py-4 text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
              aria-label={isSpinning ? 'Girando a roleta' : (entries.length === 1 ? 'Selecionar o ganhador único' : 'Girar a roleta')}
            >
              <IconPlay className="w-6 h-6 sm:w-7 sm:h-7" /> {isSpinning ? 'Girando...' : (entries.length === 1 ? 'Selecionar Ganhador!' : 'Girar Roleta!')}
            </Button>
          </div>
        </main>
        {/* Mobile: menu, adicionar itens, roleta, botão, cada um em sua seção */}
        <main className="flex md:hidden flex-col gap-4 w-full px-2 pt-4">
          <ColorPaletteSelector selectedPalette={paletteIndex} onSelect={setPaletteIndex} />
          <div className="w-full max-w-md mx-auto">
            <HistoryDisplay history={history} clearHistory={clearHistory} />
          </div>
          <div className="w-full max-w-md mx-auto">
            <InputArea setEntries={setEntries} entries={entries} />
          </div>
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
            <Roulette 
              items={entries} 
              rotation={rotation} 
              isSpinning={isSpinning} 
              size={Math.max(220, Math.min(420, typeof window !== 'undefined' ? window.innerWidth * 0.95 : 320, typeof window !== 'undefined' ? window.innerHeight * 0.45 : 320))}
              palette={colorPalettes[paletteIndex]}
            />
            <Button 
              onClick={handleSpin} 
              disabled={isSpinning || entries.length === 0}
              size="lg"
              variant="primary"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md px-6 py-3 sm:px-12 sm:py-4 text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
              aria-label={isSpinning ? 'Girando a roleta' : (entries.length === 1 ? 'Selecionar o ganhador único' : 'Girar a roleta')}
            >
              <IconPlay className="w-6 h-6 sm:w-7 sm:h-7" /> {isSpinning ? 'Girando...' : (entries.length === 1 ? 'Selecionar Ganhador!' : 'Girar Roleta!')}
            </Button>
          </div>
        </main>
      </div>
      <WinnerModal 
        winner={currentWinner} 
        isOpen={isWinnerModalOpen} 
        onClose={closeWinnerModal}
        onSpinAgain={spinAgain}
      />
      <footer className="w-full pt-8 pb-4 text-center text-xs text-gray-500 dark:text-gray-400 bg-transparent">
        <p>&copy; {new Date().getFullYear()} Roleta. Feito com paixão.</p>
      </footer>
    </div>
  );
};

export default App;