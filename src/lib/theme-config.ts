export interface ThemeVariant {
  id: string;
  name: string;
  description: string;
  category: 'standard' | 'accessibility' | 'custom';
  icon: string;
  cssClass: string;
  preview: {
    background: string;
    foreground: string;
    accent: string;
  };
}

export const THEME_VARIANTS: ThemeVariant[] = [
  // Standard themes
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright theme for daytime use',
    category: 'standard',
    icon: '☀️',
    cssClass: 'light',
    preview: {
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      accent: 'hsl(210 40% 96%)',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes for low-light environments',
    category: 'standard',
    icon: '🌙',
    cssClass: 'dark',
    preview: {
      background: 'hsl(222.2 84% 4.9%)',
      foreground: 'hsl(210 40% 98%)',
      accent: 'hsl(217.2 32.6% 17.5%)',
    },
  },
  {
    id: 'system',
    name: 'System',
    description: 'Follows your device settings',
    category: 'standard',
    icon: '🖥️',
    cssClass: 'system',
    preview: {
      background: 'linear-gradient(45deg, hsl(0 0% 100%) 50%, hsl(222.2 84% 4.9%) 50%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      accent: 'hsl(210 40% 96%)',
    },
  },
  
  // Accessibility themes
  {
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    description: 'Maximum contrast for better readability',
    category: 'accessibility',
    icon: '🔆',
    cssClass: 'high-contrast-light',
    preview: {
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(0 0% 0%)',
      accent: 'hsl(0 0% 90%)',
    },
  },
  {
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    description: 'High contrast dark theme for accessibility',
    category: 'accessibility',
    icon: '🌑',
    cssClass: 'high-contrast-dark',
    preview: {
      background: 'hsl(0 0% 0%)',
      foreground: 'hsl(0 0% 100%)',
      accent: 'hsl(0 0% 10%)',
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    description: 'Warm, paper-like theme that reduces eye strain',
    category: 'accessibility',
    icon: '📜',
    cssClass: 'sepia',
    preview: {
      background: 'hsl(48 100% 96%)',
      foreground: 'hsl(25 25% 15%)',
      accent: 'hsl(48 50% 90%)',
    },
  },
  
  // Custom color themes
  {
    id: 'custom-blue',
    name: 'Ocean Blue',
    description: 'Cool blue tones inspired by the ocean',
    category: 'custom',
    icon: '🌊',
    cssClass: 'custom-blue',
    preview: {
      background: 'hsl(210 100% 97%)',
      foreground: 'hsl(210 100% 15%)',
      accent: 'hsl(210 100% 92%)',
    },
  },
  {
    id: 'custom-green',
    name: 'Forest Green',
    description: 'Natural green tones for a calming experience',
    category: 'custom',
    icon: '🌲',
    cssClass: 'custom-green',
    preview: {
      background: 'hsl(120 60% 97%)',
      foreground: 'hsl(120 100% 15%)',
      accent: 'hsl(120 60% 92%)',
    },
  },
  {
    id: 'custom-purple',
    name: 'Royal Purple',
    description: 'Rich purple tones for a premium feel',
    category: 'custom',
    icon: '👑',
    cssClass: 'custom-purple',
    preview: {
      background: 'hsl(270 60% 97%)',
      foreground: 'hsl(270 100% 15%)',
      accent: 'hsl(270 60% 92%)',
    },
  },
];

export const THEME_CATEGORIES = {
  standard: 'Standard Themes',
  accessibility: 'Accessibility Themes',
  custom: 'Custom Themes',
} as const;

export function getThemeVariant(themeId: string): ThemeVariant | undefined {
  return THEME_VARIANTS.find(variant => variant.id === themeId);
}

export function getThemesByCategory(category: keyof typeof THEME_CATEGORIES): ThemeVariant[] {
  return THEME_VARIANTS.filter(variant => variant.category === category);
}

export function isSystemTheme(themeId: string): boolean {
  return themeId === 'system';
}

export function isAccessibilityTheme(themeId: string): boolean {
  const variant = getThemeVariant(themeId);
  return variant?.category === 'accessibility';
}

export function isCustomTheme(themeId: string): boolean {
  const variant = getThemeVariant(themeId);
  return variant?.category === 'custom';
}