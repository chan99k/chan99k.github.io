import {
  THEME_VARIANTS,
  THEME_CATEGORIES,
  getThemeVariant,
  getThemesByCategory,
  isSystemTheme,
  isAccessibilityTheme,
  isCustomTheme,
} from '../theme-config';

describe('theme-config', () => {
  describe('THEME_VARIANTS', () => {
    it('should contain all required theme variants', () => {
      expect(THEME_VARIANTS).toBeDefined();
      expect(THEME_VARIANTS.length).toBeGreaterThan(0);

      // Check that all required themes exist
      const themeIds = THEME_VARIANTS.map(theme => theme.id);
      expect(themeIds).toContain('light');
      expect(themeIds).toContain('dark');
      expect(themeIds).toContain('system');
      expect(themeIds).toContain('high-contrast-light');
      expect(themeIds).toContain('high-contrast-dark');
      expect(themeIds).toContain('sepia');
    });

    it('should have valid structure for each theme variant', () => {
      THEME_VARIANTS.forEach(theme => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('category');
        expect(theme).toHaveProperty('icon');
        expect(theme).toHaveProperty('cssClass');
        expect(theme).toHaveProperty('preview');
        
        expect(theme.preview).toHaveProperty('background');
        expect(theme.preview).toHaveProperty('foreground');
        expect(theme.preview).toHaveProperty('accent');
        
        expect(['standard', 'accessibility', 'custom']).toContain(theme.category);
      });
    });
  });

  describe('getThemeVariant', () => {
    it('should return correct theme variant for valid id', () => {
      const lightTheme = getThemeVariant('light');
      expect(lightTheme).toBeDefined();
      expect(lightTheme?.id).toBe('light');
      expect(lightTheme?.name).toBe('Light');
    });

    it('should return undefined for invalid id', () => {
      const invalidTheme = getThemeVariant('invalid-theme');
      expect(invalidTheme).toBeUndefined();
    });
  });

  describe('getThemesByCategory', () => {
    it('should return standard themes', () => {
      const standardThemes = getThemesByCategory('standard');
      expect(standardThemes.length).toBeGreaterThan(0);
      expect(standardThemes.every(theme => theme.category === 'standard')).toBe(true);
      
      const themeIds = standardThemes.map(theme => theme.id);
      expect(themeIds).toContain('light');
      expect(themeIds).toContain('dark');
      expect(themeIds).toContain('system');
    });

    it('should return accessibility themes', () => {
      const accessibilityThemes = getThemesByCategory('accessibility');
      expect(accessibilityThemes.length).toBeGreaterThan(0);
      expect(accessibilityThemes.every(theme => theme.category === 'accessibility')).toBe(true);
      
      const themeIds = accessibilityThemes.map(theme => theme.id);
      expect(themeIds).toContain('high-contrast-light');
      expect(themeIds).toContain('high-contrast-dark');
      expect(themeIds).toContain('sepia');
    });

    it('should return custom themes', () => {
      const customThemes = getThemesByCategory('custom');
      expect(customThemes.length).toBeGreaterThan(0);
      expect(customThemes.every(theme => theme.category === 'custom')).toBe(true);
    });
  });

  describe('isSystemTheme', () => {
    it('should return true for system theme', () => {
      expect(isSystemTheme('system')).toBe(true);
    });

    it('should return false for non-system themes', () => {
      expect(isSystemTheme('light')).toBe(false);
      expect(isSystemTheme('dark')).toBe(false);
      expect(isSystemTheme('high-contrast-light')).toBe(false);
    });
  });

  describe('isAccessibilityTheme', () => {
    it('should return true for accessibility themes', () => {
      expect(isAccessibilityTheme('high-contrast-light')).toBe(true);
      expect(isAccessibilityTheme('high-contrast-dark')).toBe(true);
      expect(isAccessibilityTheme('sepia')).toBe(true);
    });

    it('should return false for non-accessibility themes', () => {
      expect(isAccessibilityTheme('light')).toBe(false);
      expect(isAccessibilityTheme('dark')).toBe(false);
      expect(isAccessibilityTheme('system')).toBe(false);
    });
  });

  describe('isCustomTheme', () => {
    it('should return true for custom themes', () => {
      expect(isCustomTheme('custom-blue')).toBe(true);
      expect(isCustomTheme('custom-green')).toBe(true);
      expect(isCustomTheme('custom-purple')).toBe(true);
    });

    it('should return false for non-custom themes', () => {
      expect(isCustomTheme('light')).toBe(false);
      expect(isCustomTheme('dark')).toBe(false);
      expect(isCustomTheme('high-contrast-light')).toBe(false);
    });
  });

  describe('THEME_CATEGORIES', () => {
    it('should contain all category labels', () => {
      expect(THEME_CATEGORIES).toHaveProperty('standard');
      expect(THEME_CATEGORIES).toHaveProperty('accessibility');
      expect(THEME_CATEGORIES).toHaveProperty('custom');
      
      expect(THEME_CATEGORIES.standard).toBe('Standard Themes');
      expect(THEME_CATEGORIES.accessibility).toBe('Accessibility Themes');
      expect(THEME_CATEGORIES.custom).toBe('Custom Themes');
    });
  });
});