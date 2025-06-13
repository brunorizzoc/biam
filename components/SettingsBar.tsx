import React from 'react';
import { Theme } from '../types';
import { IconSun, IconMoon } from '../constants'; // IconSpeakerOn, IconSpeakerOff removidos
import Button from './common/Button';

interface SettingsBarProps {
  theme: Theme;
  toggleTheme: () => void;
  removeWinner: boolean;
  setRemoveWinner: (value: boolean) => void;
  // soundEnabled e setSoundEnabled removidos
}

const SettingsBar: React.FC<SettingsBarProps> = ({
  theme,
  toggleTheme,
  removeWinner,
  setRemoveWinner,
  // soundEnabled, setSoundEnabled removidos
}) => {
  return (
    <div className="w-full max-w-md p-4 bg-white dark:bg-dark-background/60 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button 
          onClick={toggleTheme} 
          variant="ghost" 
          size="sm" 
          aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
          className="p-2"
        >
          {theme === 'light' ? <IconMoon className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <IconSun className="w-6 h-6 text-yellow-500" />}
        </Button>
        {/* Botão de som removido */}
      </div>
      
      <label htmlFor="removeWinnerToggle" className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 select-none">
        <input
          type="checkbox"
          id="removeWinnerToggle"
          checked={removeWinner}
          onChange={(e) => setRemoveWinner(e.target.checked)}
          className="form-checkbox h-5 w-5 text-primary dark:text-primary-light rounded focus:ring-primary dark:focus:ring-primary-light border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50"
        />
        Remover vencedor após sorteio
      </label>
    </div>
  );
};

export default SettingsBar;