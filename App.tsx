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

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
    <div className="min-h-screen flex flex-col items-center justify-start gap-8 p-4 pt-6 sm:p-6 sm:pt-10 bg-gradient-to-br from-primary-light/20 via-background to-secondary-light/20 dark:from-primary-dark/30 dark:via-dark-background dark:to-secondary-dark/30 transition-colors duration-300">
      <header className="text-center w-full max-w-3xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl sm:text-6xl font-semibold text-primary dark:text-primary-light tracking-tight"> {/* Removido font-lobster, usando Poppins com peso maior */}
          Roleta
        </h1>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
          Gire a roleta e descubra o vencedor!
        </p>
      </header>

      <main className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-10 xl:gap-12 px-2">
        <div className="w-full lg:w-auto flex flex-col items-center gap-6">
          <InputArea setEntries={setEntries} entries={entries} />
          <SettingsBar 
            theme={theme} 
            toggleTheme={toggleTheme}
            removeWinner={removeWinnerAfterSpin}
            setRemoveWinner={setRemoveWinnerAfterSpin}
            // Props de som removidas
          />
        </div>
        
        <div className="flex flex-col items-center gap-6">
          <Roulette 
            items={entries} 
            rotation={rotation} 
            isSpinning={isSpinning} 
            size={Math.max(300, Math.min(460, typeof window !== 'undefined' ? window.innerWidth * 0.8 : 420, typeof window !== 'undefined' ? window.innerHeight * 0.5 : 420))} 
          />
          <Button 
            onClick={handleSpin} 
            disabled={isSpinning || entries.length === 0}
            size="lg"
            variant="primary"
            className="px-10 py-3 sm:px-12 sm:py-4 text-lg sm:text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
            aria-label={isSpinning ? 'Girando a roleta' : (entries.length === 1 ? 'Selecionar o ganhador único' : 'Girar a roleta')}
          >
            <IconPlay className="w-6 h-6 sm:w-7 sm:h-7" /> {isSpinning ? 'Girando...' : (entries.length === 1 ? 'Selecionar Ganhador!' : 'Girar Roleta!')}
          </Button>
        </div>
      </main>
      
      <HistoryDisplay history={history} clearHistory={clearHistory} />

      <WinnerModal 
        winner={currentWinner} 
        isOpen={isWinnerModalOpen} 
        onClose={closeWinnerModal}
        onSpinAgain={spinAgain}
      />
      
      <footer className="mt-auto pt-8 pb-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Roleta. Feito com paixão.</p>
      </footer>
    </div>
  );
};

export default App;