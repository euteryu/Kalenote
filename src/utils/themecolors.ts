// Theme-based hover colors for task cards
export const getThemeHoverColor = (themeId: string, priority: number): string => {
  const priorityColors: Record<string, string[]> = {
    'cool-blues': [
      'rgba(34, 197, 94, 0.6)',   // Normal: Green
      'rgba(234, 179, 8, 0.6)',   // Medium: Yellow
      'rgba(239, 68, 68, 0.6)',   // High: Red
    ],
    'warm-sunset': [
      'rgba(251, 146, 60, 0.6)',  // Normal: Orange
      'rgba(251, 191, 36, 0.6)',  // Medium: Yellow
      'rgba(239, 68, 68, 0.6)',   // High: Red
    ],
    'pastel-rainbow': [
      'rgba(103, 232, 249, 0.6)', // Normal: Cyan
      'rgba(192, 132, 252, 0.6)', // Medium: Purple
      'rgba(251, 113, 133, 0.6)', // High: Pink
    ],
    'midnight-purple': [
      'rgba(168, 85, 247, 0.6)',  // Normal: Purple
      'rgba(147, 51, 234, 0.6)',  // Medium: Deep purple
      'rgba(239, 68, 68, 0.6)',   // High: Red
    ],
    'heatmap': [
      'rgba(0, 255, 0, 0.6)',     // Normal: Green
      'rgba(255, 255, 0, 0.6)',   // Medium: Yellow
      'rgba(255, 0, 0, 0.6)',     // High: Red
    ],
    'blackeye': [
      'rgba(95, 237, 216, 0.6)',  // Normal: Cyan
      'rgba(255, 127, 80, 0.6)',  // Medium: Coral
      'rgba(255, 69, 0, 0.6)',    // High: Orange-red
    ],
    'neon-city': [
      'rgba(0, 255, 255, 0.6)',   // Normal: Cyan
      'rgba(157, 0, 255, 0.6)',   // Medium: Purple
      'rgba(255, 16, 240, 0.6)',  // High: Hot pink
    ],
    'candy-rush': [
      'rgba(0, 255, 255, 0.6)',   // Normal: Cyan
      'rgba(255, 255, 102, 0.6)', // Medium: Yellow
      'rgba(255, 0, 110, 0.6)',   // High: Pink
    ],
    'miami-vice': [
      'rgba(6, 255, 165, 0.6)',   // Normal: Turquoise
      'rgba(255, 140, 66, 0.6)',  // Medium: Orange
      'rgba(255, 0, 110, 0.6)',   // High: Pink
    ],
    'acid-trip': [
      'rgba(0, 255, 255, 0.6)',   // Normal: Cyan
      'rgba(255, 255, 0, 0.6)',   // Medium: Yellow
      'rgba(255, 0, 255, 0.6)',   // High: Magenta
    ],
    'saint': [
      'rgba(102, 217, 239, 0.6)', // Normal: Cyan
      'rgba(255, 229, 78, 0.6)',  // Medium: Yellow
      'rgba(255, 107, 170, 0.6)', // High: Pink
    ],
  };
  
  const colors = priorityColors[themeId] || priorityColors['cool-blues'];
  return colors[priority] || colors[0];
};
