import { DefaultTheme } from 'styled-components';
import { colors, Colors } from './colors';
import { typography, Typography } from './typography';
import { spacing, Spacing } from './spacing';
import { shadows, Shadows } from './shadows';

// Update the module declaration
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: Colors;
    typography: Typography;
    spacing: Spacing;
    shadows: Shadows;
  }
}

const theme: DefaultTheme = {
  colors,
  typography,
  spacing,
  shadows,
};

export default theme;