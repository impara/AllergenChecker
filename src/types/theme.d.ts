import { Theme as NavigationTheme } from '@react-navigation/native';
import { Theme as PaperTheme } from 'react-native-paper';

declare global {
  type Theme = PaperTheme & {
    colors: PaperTheme['colors'] & {
      secondary: string;
      error: string;
    };
  };

  type NavigationThemeExtended = NavigationTheme;
}