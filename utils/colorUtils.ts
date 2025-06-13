export const generateSegmentColors = (count: number): string[] => {
  if (count <= 0) return [];
  if (count === 1) return ['hsl(205, 70%, 55%)']; // Cor primária para item único

  const colors: string[] = [];
  // Hues baseados em azul (200-240), ciano/teal (170-190), verde (120-160)
  // Vamos criar uma transição suave entre eles
  const baseHueStart = 140; // Começa em um verde azulado
  const hueRange = 100; // Amplitude para cobrir de verdes a azuis (e.g., 140 a 240)
  
  const saturation = 65; // Saturação moderna, não excessivamente vibrante
  const lightness = 60;  // Boa luminosidade

  for (let i = 0; i < count; i++) {
    // Distribui as cores ao longo do range de matizes
    const hue = (baseHueStart + (i / count) * hueRange) % 360;
    colors.push(`hsl(${hue.toFixed(0)}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};