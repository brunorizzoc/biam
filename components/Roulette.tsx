import React, { useEffect, useState, useMemo } from 'react';
import { RouletteItem } from '../types';
import { generateSegmentColors } from '../utils/colorUtils';

interface RouletteProps {
  items: RouletteItem[];
  rotation: number; // in degrees
  isSpinning: boolean;
  size?: number; // diameter of the roulette
}

const Roulette: React.FC<RouletteProps> = ({ items, rotation, isSpinning, size = 360 }) => {
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  const colors = useMemo(() => generateSegmentColors(items.length), [items.length]);

  if (items.length === 0) {
    return (
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-500 rounded-full bg-gray-100 dark:bg-gray-700/50">
        <p className="text-center text-gray-500 dark:text-gray-300 p-4">Adicione itens para girar a roleta!</p>
      </div>
    );
  }

  const segmentAngleDegrees = 360 / items.length;

  const getCoordinatesForPercent = (angleDegrees: number) => {
    const angleRadians = (angleDegrees - 90) * Math.PI / 180; // Adjust by -90 to start from top
    return [
      centerX + radius * Math.cos(angleRadians),
      centerY + radius * Math.sin(angleRadians)
    ];
  };

  // Helper to get lightness from HSL string for text contrast
  const getLightnessFromHsl = (hslColor: string): number => {
    const match = hslColor.match(/hsl\(\s*[\d\.]+\s*,\s*[\d\.]+%?\s*,\s*([\d\.]+)%?\s*\)/);
    return match ? parseFloat(match[1]) : 0;
  };

  return (
    <div style={{ width: size, height: size }} className="relative">
      {/* Pointer */}
      <div 
        className="absolute top-[-4px] left-1/2 -translate-x-1/2 z-10"
        style={{
          width: 0,
          height: 0,
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderTop: `25px solid hsl(145, 60%, 45%)`, // Cor secundária (verde) para o ponteiro
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'
        }}
      />

      <svg 
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full rounded-full shadow-2xl"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
        }}
        aria-label="Roleta giratória"
      >
        <defs>
          {items.map((item, index) => (
            <path
              key={`pathDef-${item.id}`}
              id={`textPath-${item.id}`}
              d={`
                M ${getCoordinatesForPercent(index * segmentAngleDegrees)[0]},${getCoordinatesForPercent(index * segmentAngleDegrees)[1]}
                A ${radius * 0.75} ${radius * 0.75} 0 0 1 ${getCoordinatesForPercent((index + 0.95) * segmentAngleDegrees)[0]},${getCoordinatesForPercent((index + 0.95) * segmentAngleDegrees)[1]}
              `}
            />
          ))}
        </defs>
        
        {items.map((item, index) => {
          const startAngle = index * segmentAngleDegrees;
          const endAngle = (index + 1) * segmentAngleDegrees;

          const [startX, startY] = getCoordinatesForPercent(startAngle);
          const [endX, endY] = getCoordinatesForPercent(endAngle);
          
          const largeArcFlag = segmentAngleDegrees > 180 ? 1 : 0;

          const pathData = `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
          
          const textAngleDegrees = startAngle + segmentAngleDegrees / 2 - 90; 
          const textRadius = radius * 0.65;
          const textX = centerX + textRadius * Math.cos(textAngleDegrees * Math.PI / 180);
          const textY = centerY + textRadius * Math.sin(textAngleDegrees * Math.PI / 180);
          
          let fontSize = Math.max(8, Math.min(16, radius / items.length * 0.8));
          if(items.length > 20) fontSize = Math.max(7, radius / items.length * 0.65);
          if(items.length > 35) fontSize = Math.max(6, radius / items.length * 0.5);
          if(items.length > 50) fontSize = Math.max(5, radius / items.length * 0.4);

          const segmentColor = colors[index % colors.length];
          const textColor = getLightnessFromHsl(segmentColor) > 55 ? "#1A202C" : "#FFFFFF"; // Dark for light bg, White for dark bg

          return (
            <g key={item.id} role="listitem" aria-label={item.name}>
              <path d={pathData} fill={segmentColor} stroke="#FFF" strokeWidth={items.length > 1 ? "1.5" : "0"} />
              <text
                x={textX}
                y={textY}
                transform={`rotate(${textAngleDegrees + 90}, ${textX}, ${textY})`} 
                fill={textColor}
                fontSize={`${fontSize.toFixed(1)}px`}
                fontFamily="Poppins, sans-serif"
                fontWeight="500"
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none"
              >
                {item.name.length > 15 && items.length > 10 ? item.name.substring(0,12) + "..." : item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Roulette;