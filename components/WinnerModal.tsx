import React, { useEffect, useState } from 'react';
import { RouletteItem } from '../types';
import Button from './common/Button';
import { IconPlay } from '../constants';

interface WinnerModalProps {
  winner: RouletteItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
}

const ConfettiPiece: React.FC<{ initialX: number, initialDelay: number, color: string }> = ({ initialX, initialDelay, color }) => {
  return (
    <div
      className="absolute rounded-sm"
      style={{
        width: `${Math.random() * 8 + 4}px`, // 4px to 12px
        height: `${Math.random() * 8 + 4}px`,
        backgroundColor: color,
        left: `${initialX}%`,
        animation: `confetti-fall ${2 + Math.random() * 2}s ease-out ${initialDelay}s forwards`,
        opacity: 0, 
      }}
    />
  );
};


const WinnerModal: React.FC<WinnerModalProps> = ({ winner, isOpen, onClose, onSpinAgain }) => {
  const [confetti, setConfetti] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (isOpen && winner) {
      const newConfetti = Array.from({ length: 100 }).map((_, i) => (
        <ConfettiPiece
          key={i}
          initialX={Math.random() * 100}
          initialDelay={Math.random() * 0.5} 
          color={`hsl(${120 + Math.random() * 120}, 70%, 65%)`} // Tons de azul, ciano e verde
        />
      ));
      setConfetti(newConfetti);

      const timer = setTimeout(() => setConfetti([]), 5000);
      return () => clearTimeout(timer);
    } else {
      setConfetti([]);
    }
  }, [isOpen, winner]);


  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="winnerModalTitle">
      <div 
        className="relative bg-white dark:bg-dark-background p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-md w-full transform transition-all duration-300 ease-out scale-100"
        onClick={(e) => e.stopPropagation()} // Impede o fechamento ao clicar dentro do modal
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
          {confetti}
        </div>
        
        <h2 id="winnerModalTitle" className="text-4xl font-semibold text-secondary dark:text-secondary-light mb-4">Parabéns!</h2> {/* Removido font-lobster */}
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">O item sorteado é:</p>
        <p className="text-3xl font-bold text-primary dark:text-primary-light mb-8 px-4 py-3 bg-primary-light/10 dark:bg-primary-dark/20 rounded-lg break-words shadow-inner">
          {winner.name}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onSpinAgain} size="lg" variant="primary" className="w-full sm:w-auto">
            <IconPlay className="w-5 h-5" /> Girar Novamente
          </Button>
          <Button onClick={onClose} size="lg" variant="ghost" className="w-full sm:w-auto">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;