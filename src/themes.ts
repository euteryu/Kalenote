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
  {
    id: 'heatmap',
    name: 'Heatmap',
    orbs: [
      {
        colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
        size: 600,
        initialX: 50,
        initialY: 50,
        duration: 35,
      },
      {
        colors: ['#9400D3', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000'],
        size: 350,
        initialX: 25,
        initialY: 25,
        duration: 40,
      },
      {
        colors: ['#FFFF00', '#00FF00', '#0000FF', '#9400D3'],
        size: 280,
        initialX: 75,
        initialY: 70,
        duration: 45,
      },
    ],
  },
  {
    id: 'blackeye',
    name: 'Blackeye',
    orbs: [
      {
        colors: [
          '#5FEDD8',
          '#40E0D0',
          '#20B2AA',
          '#2F4F4F',
          '#1a1a1a',
          '#000000',
          '#1a0a0a',
          '#4a1010',
          '#8B0000',
          '#FF4500',
          '#FF6347',
          '#FF7F50',
          '#FFA07A',
        ],
        size: 700,
        initialX: 50,
        initialY: 50,
        duration: 40,
      },
    ],
  },
  {
    id: 'neon-city',
    name: 'Neon City',
    orbs: [
      {
        // Hot pink to cyan gradient
        colors: ['#FF10F0', '#FF1493', '#FF69B4', '#00FFFF', '#00CED1', '#1E90FF'],
        size: 650,
        initialX: 40,
        initialY: 50,
        duration: 30,
      },
      {
        // Electric purple
        colors: ['#9D00FF', '#7B2CBF', '#5A189A', '#240046'],
        size: 450,
        initialX: 65,
        initialY: 25,
        duration: 35,
      },
      {
        // Neon green to yellow
        colors: ['#39FF14', '#ADFF2F', '#FFFF00', '#FFD700'],
        size: 380,
        initialX: 20,
        initialY: 70,
        duration: 38,
      },
      {
        // Electric blue
        colors: ['#00D9FF', '#00B4D8', '#0096C7', '#0077B6'],
        size: 420,
        initialX: 75,
        initialY: 60,
        duration: 33,
      },
    ],
  },
  {
    id: 'candy-rush',
    name: 'Candy Rush',
    orbs: [
      {
        // Pink lemonade
        colors: ['#FFB3D9', '#FF80BF', '#FF4D94', '#FF1A6A', '#FF006E'],
        size: 620,
        initialX: 35,
        initialY: 40,
        duration: 28,
      },
      {
        // Tropical cyan
        colors: ['#00FFFF', '#00E5E5', '#00CCCC', '#00B2B2', '#009999'],
        size: 500,
        initialX: 60,
        initialY: 55,
        duration: 32,
      },
      {
        // Sunny yellow
        colors: ['#FFFF66', '#FFFF33', '#FFFF00', '#FFE600', '#FFCC00'],
        size: 440,
        initialX: 80,
        initialY: 30,
        duration: 36,
      },
      {
        // Lime green
        colors: ['#CCFF00', '#B3FF00', '#99FF00', '#80FF00', '#66FF00'],
        size: 390,
        initialX: 25,
        initialY: 75,
        duration: 34,
      },
    ],
  },
  {
    id: 'miami-vice',
    name: 'Miami Vice',
    orbs: [
      {
        // Hot pink to peach
        colors: ['#FF006E', '#FF4D8F', '#FF80B0', '#FFB3D0', '#FFE6F0'],
        size: 680,
        initialX: 45,
        initialY: 35,
        duration: 32,
      },
      {
        // Turquoise dream
        colors: ['#06FFA5', '#00FFB2', '#00FFBF', '#00FFCC', '#00FFD9'],
        size: 580,
        initialX: 70,
        initialY: 60,
        duration: 36,
      },
      {
        // Electric orange
        colors: ['#FF6B35', '#FF8C42', '#FFAD4F', '#FFCE5C', '#FFEF69'],
        size: 450,
        initialX: 20,
        initialY: 50,
        duration: 34,
      },
      {
        // Sky blue
        colors: ['#4CC9F0', '#4ECFF9', '#50D5FF', '#52DBFF', '#54E1FF'],
        size: 520,
        initialX: 55,
        initialY: 20,
        duration: 38,
      },
    ],
  },
  {
    id: 'acid-trip',
    name: 'Acid Trip',
    orbs: [
      {
        // Full spectrum diagonal
        colors: [
          '#00FFFF', // Cyan
          '#00FF80', // Spring green
          '#80FF00', // Chartreuse
          '#FFFF00', // Yellow
          '#FF8000', // Orange
          '#FF0080', // Pink
          '#FF00FF', // Magenta
          '#8000FF', // Purple
        ],
        size: 700,
        initialX: 50,
        initialY: 45,
        duration: 25,
      },
      {
        // Neon rainbow
        colors: ['#FF1493', '#FF00FF', '#8A2BE2', '#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF8C00'],
        size: 550,
        initialX: 30,
        initialY: 65,
        duration: 28,
      },
      {
        // Electric pastels
        colors: ['#FFB3FF', '#B3FFFF', '#B3FFB3', '#FFFFB3', '#FFB3B3'],
        size: 480,
        initialX: 75,
        initialY: 25,
        duration: 30,
      },
      {
        // Vibrant mix
        colors: ['#FF0099', '#00FF99', '#9900FF', '#FF9900', '#0099FF'],
        size: 420,
        initialX: 60,
        initialY: 50,
        duration: 27,
      },
    ],
  },
  {
    id: 'saint',
    name: 'Saint',
    orbs: [
      {
        // Main diagonal gradient (cyan to orange like the image)
        colors: [
          '#66D9EF', // Bright cyan
          '#5FE8D0', // Cyan-green
          '#58F7B1', // Light green
          '#A8FF8C', // Yellow-green
          '#F4FF6D', // Yellow
          '#FFE54E', // Golden yellow
          '#FFCB2F', // Orange-yellow
          '#FFB110', // Orange
          '#FF9700', // Deep orange
          '#FF7D80', // Coral
          '#FF6BAA', // Pink
        ],
        size: 750,
        initialX: 50,
        initialY: 50,
        duration: 35,
      },
      {
        // Accent band - cyan/blue
        colors: ['#00D9FF', '#00C4FF', '#00AFFF', '#009AFF', '#0085FF'],
        size: 500,
        initialX: 25,
        initialY: 30,
        duration: 40,
      },
      {
        // Accent band - pink/coral
        colors: ['#FF8FA3', '#FF7691', '#FF5D7F', '#FF446D', '#FF2B5B'],
        size: 450,
        initialX: 75,
        initialY: 65,
        duration: 38,
      },
      {
        // Yellow/green accent
        colors: ['#D4FF66', '#C1FF52', '#AEFF3E', '#9BFF2A', '#88FF16'],
        size: 400,
        initialX: 40,
        initialY: 75,
        duration: 42,
      },
    ],
  },
];

export const getTheme = (id: string): Theme => {
  return themes.find((t) => t.id === id) || themes[0];
};
