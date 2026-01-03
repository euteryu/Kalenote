import type { Theme } from './types';

export const themes: Theme[] = [
  {
    id: 'cool-blues',
    name: 'Cool Blues',
    orbs: [
      {
        colors: ['#60A5FA', '#3B82F6', '#2563EB'],
        size: 500,
        initialX: 20,
        initialY: 30,
        duration: 20,
      },
      {
        colors: ['#A5B4FC', '#818CF8', '#6366F1'],
        size: 400,
        initialX: 70,
        initialY: 60,
        duration: 25,
      },
      {
        colors: ['#93C5FD', '#60A5FA', '#3B82F6'],
        size: 350,
        initialX: 50,
        initialY: 20,
        duration: 30,
      },
    ],
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    orbs: [
      {
        colors: ['#FCA5A5', '#F87171', '#EF4444'],
        size: 450,
        initialX: 15,
        initialY: 40,
        duration: 22,
      },
      {
        colors: ['#FCD34D', '#FBBF24', '#F59E0B'],
        size: 420,
        initialX: 65,
        initialY: 25,
        duration: 27,
      },
      {
        colors: ['#FDA4AF', '#FB7185', '#F43F5E'],
        size: 380,
        initialX: 45,
        initialY: 70,
        duration: 24,
      },
    ],
  },
  {
    id: 'pastel-rainbow',
    name: 'Pastel Rainbow',
    orbs: [
      {
        colors: ['#A5F3FC', '#67E8F9', '#22D3EE'],
        size: 460,
        initialX: 25,
        initialY: 35,
        duration: 23,
      },
      {
        colors: ['#D8B4FE', '#C084FC', '#A855F7'],
        size: 400,
        initialX: 60,
        initialY: 55,
        duration: 26,
      },
      {
        colors: ['#FDE68A', '#FCD34D', '#FBBF24'],
        size: 390,
        initialX: 80,
        initialY: 20,
        duration: 28,
      },
      {
        colors: ['#BBF7D0', '#86EFAC', '#4ADE80'],
        size: 370,
        initialX: 40,
        initialY: 75,
        duration: 25,
      },
    ],
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    orbs: [
      {
        colors: ['#C084FC', '#A855F7', '#9333EA'],
        size: 480,
        initialX: 30,
        initialY: 45,
        duration: 21,
      },
      {
        colors: ['#6366F1', '#4F46E5', '#4338CA'],
        size: 420,
        initialX: 70,
        initialY: 30,
        duration: 26,
      },
      {
        colors: ['#E879F9', '#D946EF', '#C026D3'],
        size: 360,
        initialX: 50,
        initialY: 65,
        duration: 29,
      },
    ],
  },
];

export const getTheme = (id: string): Theme => {
  return themes.find((t) => t.id === id) || themes[0];
};