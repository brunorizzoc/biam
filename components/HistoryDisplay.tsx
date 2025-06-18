import React, { useState } from 'react';
import { HistoryEntry } from '../types';
import Button from './common/Button';
import { IconDownload, IconTrash, IconChevronDown, IconChevronUp } from '../constants';

interface HistoryDisplayProps {
  history: HistoryEntry[];
  clearHistory: () => void;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, clearHistory }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const exportHistory = (format: 'txt' | 'csv') => {
    if (history.length === 0) return;
    let content = '';
    const filename = `historico_sorteio_${new Date().toISOString().slice(0,10)}.${format}`;

    if (format === 'txt') {
      content = history.map((entry: HistoryEntry) => `${entry.name} (Sorteado em: ${entry.date})`).join('\n');
    } else { // csv
      content = "Nome,Data do Sorteio\n";
      content += history.map((entry: HistoryEntry) => `"${entry.name.replace(/"/g, '""')}","${entry.date}"`).join('\n');
    }

    const blob = new Blob([content], { type: format === 'txt' ? 'text/plain;charset=utf-8;' : 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  if (history.length === 0 && !isOpen) { // Não mostra se vazio e fechado. Mostra se aberto para dar feedback.
    return (
      <div className="w-full max-w-md mt-6">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 text-left flex justify-between items-center text-md font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-background/80 rounded-lg shadow border border-gray-200 dark:border-gray-700/50"
          aria-expanded={isOpen}
        >
          Histórico de Vencedores (0)
          {isOpen ? <IconChevronUp className="w-5 h-5" /> : <IconChevronDown className="w-5 h-5" />}
        </button>
        {isOpen && (
            <div className="p-4 mt-2 bg-white dark:bg-dark-background/60 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700/50">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum vencedor no histórico ainda.</p>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mt-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex justify-between items-center text-lg font-medium text-primary dark:text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-dark/20 rounded-t-lg shadow border-x border-t border-gray-200 dark:border-gray-700/50"
        aria-expanded={isOpen}
        aria-controls="history-content"
      >
        Histórico de Vencedores ({history.length})
        {isOpen ? <IconChevronUp className="w-5 h-5" /> : <IconChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && (
        <div id="history-content" className="p-4 bg-white dark:bg-dark-background/60 shadow-lg rounded-b-lg border-x border-b border-gray-200 dark:border-gray-700/50 max-h-64 overflow-y-auto">
          {history.length > 0 ? (
            <>
              <ul className="space-y-2 mb-4 pr-2">
                {[...history].reverse().map((entry: HistoryEntry, idx: number) => (
                  <li key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm flex items-start shadow-sm">
                    <span className="font-bold text-primary dark:text-primary-light mr-2 min-w-[2.5em] text-center pt-1">{`${idx + 1}º`}</span>
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium text-gray-800 dark:text-gray-200 break-all">{entry.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{entry.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button onClick={() => exportHistory('txt')} variant="secondary" size="sm" className="w-full sm:w-auto">
                  <IconDownload className="w-4 h-4" /> Exportar .txt
                </Button>
                <Button onClick={clearHistory} variant="danger" size="sm" className="w-full sm:w-auto sm:ml-auto">
                  <IconTrash className="w-4 h-4" /> Limpar Histórico
                </Button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum vencedor no histórico ainda.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryDisplay;