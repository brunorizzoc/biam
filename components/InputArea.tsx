import React, { useState, useCallback, useRef } from 'react';
import { RouletteItem } from '../types';
import { parseEntriesFromString, parseFileContent } from '../utils/fileParser';
import { MAX_ENTRIES, MAX_ITEM_LENGTH, IconUpload, IconTrash } from '../constants'; // IconSparkles e SAMPLE_NAMES removidos
import Button from './common/Button';

interface InputAreaProps {
  setEntries: React.Dispatch<React.SetStateAction<RouletteItem[]>>;
  entries: RouletteItem[];
}

const InputArea: React.FC<InputAreaProps> = ({ setEntries, entries }) => {
  const [textValue, setTextValue] = useState<string>(entries.map(e => e.name).join('\n'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newText = event.target.value;
    const lines = newText.split('\n');
    if (lines.length > MAX_ENTRIES) {
      newText = lines.slice(0, MAX_ENTRIES).join('\n');
    }
    const validatedLines = lines.map(line => line.substring(0, MAX_ITEM_LENGTH));
    newText = validatedLines.join('\n');

    setTextValue(newText);
    setEntries(parseEntriesFromString(newText));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const parsedEntries = await parseFileContent(file);
        setEntries(parsedEntries);
        setTextValue(parsedEntries.map(e => e.name).join('\n'));
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearAllEntries = () => {
    setTextValue('');
    setEntries([]);
  };

  // addSampleNames removido

  return (
    <div className="p-6 bg-white dark:bg-dark-background/60 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-5 text-center text-primary dark:text-primary-light">Adicionar Itens</h2>
      <textarea
        className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-light bg-gray-50 dark:bg-gray-700/50 dark:text-dark-foreground resize-none placeholder-gray-400 dark:placeholder-gray-500"
        placeholder={`Digite cada item em uma nova linha (máx ${MAX_ENTRIES} itens, ${MAX_ITEM_LENGTH} chars/item)`}
        value={textValue}
        onChange={handleTextChange}
        aria-label="Área de entrada de itens para a roleta"
      />
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
        {entries.length}/{MAX_ENTRIES} itens
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full">
          <IconUpload className="w-5 h-5" /> Importar
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.csv" className="hidden" />
        
        <Button onClick={clearAllEntries} variant="danger" className="w-full">
         <IconTrash className="w-5 h-5" /> Limpar Tudo
        </Button>
        {/* Botão de Usar Nomes de Exemplo removido */}
      </div>
    </div>
  );
};

export default InputArea;