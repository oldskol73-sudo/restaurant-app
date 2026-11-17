import { useMemo } from 'react';
import { palette } from '../restaurant.config';
import { useStore } from './lib/store';

export const fonts = {
  serif: 'PlayfairDisplay_700Bold',
  serifSemi: 'PlayfairDisplay_600SemiBold',
  sans: 'Inter_400Regular',
  sansMed: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
};

export type Colors = typeof palette & { line: string; accentSoft: string; wineSoft: string; overlay: string };

const alpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export function buildColors(accent: string, wine: string): Colors {
  return {
    ...palette,
    accent,
    wine,
    line: alpha(accent, 0.35),
    accentSoft: alpha(accent, 0.14),
    wineSoft: alpha(wine, 0.35),
    overlay: 'rgba(0,0,0,0.55)',
  };
}

export function useColors(): Colors {
  const {
    state: { settings },
  } = useStore();
  return useMemo(() => buildColors(settings.accent, settings.wine), [settings.accent, settings.wine]);
}

export const radius = { sm: 10, md: 16, lg: 22, xl: 28 };
export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 };

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.35,
  shadowRadius: 18,
  elevation: 8,
};
