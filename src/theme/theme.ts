import { DefaultTheme } from 'styled-components';

// Add this at the top of the file
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      success: string;
      error: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        small: number;
        medium: number;
        large: number;
        extraLarge: number;
      };
      fontWeight: {
        normal: string;
        bold: string;
      };
    };
    spacing: {
      small: number;
      medium: number;
      large: number;
    };
    shadows: {
      small: { boxShadow: string };
      medium: { boxShadow: string };
      large: { boxShadow: string };
    };
  }
}

const theme: DefaultTheme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: '#000000',
    success: '#4CAF50',
    error: '#F44336',
  },
  typography: {
    fontFamily: 'System',
    fontSize: {
      small: 12,
      medium: 16,
      large: 20,
      extraLarge: 24,
    },
    fontWeight: {
      normal: '400',
      bold: '700',
    },
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  shadows: {
    small: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    medium: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    large: {
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)'
    }
  }
};

export default theme;