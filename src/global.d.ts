declare module 'react-native-paper';
declare module 'styled-components/native';
declare module 'lottie-react-native';
declare module 'expo-web-browser';
declare module '*.png';
declare module '*.jpg';
declare module '*.json';

// Add this to resolve the 'require' error
declare function require(path: string): any;

declare module 'react-native-reanimated' {
  import { ViewStyle, View } from 'react-native';

  export function createAnimatedComponent<T extends React.ComponentType<any>>(
    component: T
  ): React.ComponentType<AnimateProps<React.ComponentPropsWithoutRef<T>>>;

  export interface AnimateProps<T> extends T {
    entering?: any;
    exiting?: any;
  }

  export const FadeIn: any;
  export const FadeInDown: any;
  export const ZoomIn: any;
  export const FadeInRight: any;
  export const FadeInLeft: any;
  export const FadeInUp: any;

  const Animated: {
    View: typeof View;
    createAnimatedComponent: typeof createAnimatedComponent;
  };

  export default Animated;
}