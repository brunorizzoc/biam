
import { MAX_ENTRIES, MAX_ITEM_LENGTH } from '../constants';
import { RouletteItem } from '../types';

export const parseEntriesFromString = (text: string): RouletteItem[] => {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.length <= MAX_ITEM_LENGTH)
    .slice(0, MAX_ENTRIES)
    .map((name, index) => ({ id: `${Date.now()}-${index}`, name }));
};

export const parseFileContent = async (file: File): Promise<RouletteItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (file.type === 'text/csv') {
        // Basic CSV parsing: assumes items are comma-separated or one per line.
        // More robust CSV parsing would require a library.
        const lines = text.split('\n');
        const items = lines.reduce((acc, line) => {
          const values = line.split(',').map(v => v.trim()).filter(v => v.length > 0);
          return [...acc, ...values];
        }, [] as string[]);
        
        resolve(items
          .filter(item => item.length <= MAX_ITEM_LENGTH)
          .slice(0, MAX_ENTRIES)
          .map((name, index) => ({ id: `csv-${Date.now()}-${index}`, name }))
        );

      } else { // Assuming text/plain
        resolve(parseEntriesFromString(text));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
