declare module 'react-native-paper';
declare module 'styled-components/native';
declare module 'lottie-react-native';
declare module 'expo-web-browser';
declare module '*.png';
declare module '*.jpg';
declare module '*.json';

// Add this to resolve the 'require' error
declare function require(path: string): any;

// Add these new declarations
declare module 'react-native-gesture-handler' {
  export const GestureHandlerRootView: React.ComponentType<any>;
}

declare module '@react-navigation/native' {
  export const NavigationContainer: React.ComponentType<any>;
  export function useNavigation<T = any>(): T;
  export type ParamListBase = Record<string, object | undefined>;
}

declare module '@react-navigation/stack' {
  import { ParamListBase, StackNavigationState } from '@react-navigation/native';
  import { StackNavigationOptions } from '@react-navigation/stack';

  export function createStackNavigator<T extends ParamListBase>(): {
    Navigator: React.ComponentType<any>;
    Screen: React.ComponentType<any>;
  };

  export type StackNavigationProp<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = string
  > = {
    navigate<RouteName extends keyof ParamList>(
      ...args: undefined extends ParamList[RouteName]
        ? [RouteName] | [RouteName, ParamList[RouteName]]
        : [RouteName, ParamList[RouteName]]
    ): void;
    // ... other navigation methods ...
  };
}

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