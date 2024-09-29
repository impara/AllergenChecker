import { DefaultTheme as NavigationDefaultTheme } from 'react-native-paper';
import { DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { CustomTheme, CustomNavigationTheme } from '../types/theme';

// Your custom theme
const customTheme: CustomTheme = {
  ...PaperDefaultTheme,
  colors,
  typography,
  spacing,
  shadows,
};

// Create a custom navigation theme
export const navigationTheme: CustomNavigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.secondary, // Changed from colors.surface to colors.secondary
    text: colors.text,
    // Removed the border property
  },
};

// Create a combined theme
export const theme: CustomTheme = {
  ...customTheme,
  colors: {
    ...customTheme.colors,
    ...PaperDefaultTheme.colors,
  },
};

// Export individual theme components
export { colors, typography, spacing, shadows };