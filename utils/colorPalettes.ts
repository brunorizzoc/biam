// 10 paletas de cores para o tema da aplicação
export interface ColorPalette {
  name: string;
  colors: string[]; // hex ou hsl
}

export const colorPalettes: ColorPalette[] = [
  { name: 'Azul', colors: ['#1976D2', '#2196F3', '#64B5F6', '#90CAF9', '#E3F2FD'] },
  { name: 'Verde', colors: ['#388E3C', '#4CAF50', '#81C784', '#A5D6A7', '#E8F5E9'] },
  { name: 'Rosa', colors: ['#D81B60', '#E91E63', '#F06292', '#F8BBD0', '#FCE4EC'] },
  { name: 'Laranja', colors: ['#F57C00', '#FF9800', '#FFB74D', '#FFE0B2', '#FFF3E0'] },
  { name: 'Roxo', colors: ['#6A1B9A', '#8E24AA', '#BA68C8', '#E1BEE7', '#F3E5F5'] },
  { name: 'Vermelho', colors: ['#C62828', '#E53935', '#EF5350', '#FFCDD2', '#FFEBEE'] },
  { name: 'Amarelo', colors: ['#FBC02D', '#FFEB3B', '#FFF176', '#FFF9C4', '#FFFDE7'] },
  { name: 'Ciano', colors: ['#00838F', '#00ACC1', '#4DD0E1', '#B2EBF2', '#E0F7FA'] },
  { name: 'Cinza', colors: ['#424242', '#757575', '#BDBDBD', '#E0E0E0', '#F5F5F5'] },
  { name: 'Colorido', colors: ['#1976D2', '#388E3C', '#D81B60', '#F57C00', '#6A1B9A'] },
];
