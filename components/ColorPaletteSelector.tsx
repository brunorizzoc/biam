import React, { useEffect, useState } from 'react';
import { colorPalettes, ColorPalette } from '../utils/colorPalettes';
import { IconChevronDown, IconChevronUp } from '../constants';

interface ColorPaletteSelectorProps {
  selectedPalette: number;
  onSelect: (index: number) => void;
}

const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({ selectedPalette, onSelect }) => {
  const [open, setOpen] = useState(true);

  const handleSelect = (idx: number) => {
    onSelect(idx);
    // Em mobile, fecha após selecionar
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <div className="w-full flex flex-col items-center mb-6">
      <button
        className="w-full flex items-center justify-between px-2 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="color-palette-options"
      >
        <span className="text-lg font-semibold text-primary dark:text-primary-light">Temas de Cores</span>
        {open ? <IconChevronUp className="w-5 h-5 text-primary" /> : <IconChevronDown className="w-5 h-5 text-primary" />}
      </button>
      <div
        id="color-palette-options"
        className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col gap-2 w-full max-w-md mt-2">
          {colorPalettes.map((palette, idx) => (
            <button
              key={palette.name}
              className={`flex items-center gap-2 p-1 rounded-lg border transition-all 
                ${selectedPalette === idx 
                  ? 'border-primary ring-2 ring-primary bg-blue-50 dark:bg-gray-900' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/60 bg-white dark:bg-gray-800'}
              `}
              onClick={() => handleSelect(idx)}
              aria-label={`Selecionar paleta ${palette.name}`}
            >
              <span className="w-20 text-left text-xs font-medium text-gray-700 dark:text-gray-300 mr-2" style={{opacity: selectedPalette === idx ? 1 : 0.7}}>{palette.name}</span>
              {palette.colors.map((color, cidx) => (
                <span
                  key={color}
                  className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ background: color, opacity: selectedPalette === idx ? 1 : 0.7 }}
                />
              ))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteSelector;
