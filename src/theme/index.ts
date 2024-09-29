import { MD3LightTheme } from 'react-native-paper';
import { Theme as NavigationTheme } from '@react-navigation/native';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#600EE6',
    secondary: '#414757',
    error: '#f13a59',
  },
};

export const navigationTheme: NavigationTheme = {
  dark: false,
  colors: {
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.onSurface,
    border: theme.colors.outline,
    notification: theme.colors.error,
  },
};

export default theme;